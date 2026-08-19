import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { generatePayfastSignature, corsHeaders } from "../_shared/payfast.ts"
import { sendBrevoEmail } from "../_shared/email.ts"
import { getOrderConfirmationTemplate, getPaymentFailureTemplate, getAdminNewOrderTemplate } from "../_shared/email-templates.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const text = await req.text()
    const params = new URLSearchParams(text)
    const data: Record<string, string> = {}
    params.forEach((value, key) => {
      data[key] = value
    })

    console.log('PayFast ITN received payload:', JSON.stringify(data))

    const signature = data.signature
    delete data.signature

    const expectedSignature = generatePayfastSignature(data, Deno.env.get('PAYFAST_PASSPHRASE'))

    if (signature !== expectedSignature) {
      console.error('Invalid signature: received', signature, 'expected', expectedSignature)
      return new Response('Invalid signature', { status: 400 })
    }

    const isSandbox = Deno.env.get('PAYFAST_SANDBOX') !== 'false'
    const itnVerifyUrl = isSandbox 
      ? "https://sandbox.payfast.co.za/eng/query/validate" 
      : "https://www.payfast.co.za/eng/query/validate"

    const verifyResponse = await fetch(itnVerifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: text
    })

    const verifyText = await verifyResponse.text()
    if (verifyText !== 'VALID') {
      console.error('Invalid ITN verification response:', verifyText)
      return new Response('Invalid ITN', { status: 400 })
    }

    const paymentId = data.m_payment_id
    const paymentStatus = data.payment_status
    const pfPaymentId = data.pf_payment_id
    
    if (!paymentId) throw new Error('Missing payment ID')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: payment, error: paymentFetchError } = await supabaseAdmin
      .from('payments')
      .select('*, orders(*)')
      .eq('id', paymentId)
      .single()

    if (paymentFetchError || !payment) throw new Error(`Payment not found: ${paymentId}`)

    if (payment.status === 'COMPLETED') {
      console.log('Payment already processed as COMPLETED:', paymentId)
      return new Response('Already processed', { status: 200 })
    }

    let newOrderStatus = 'PENDING_PAYMENT'
    let newPaymentStatus = payment.status

    if (paymentStatus === 'COMPLETE') {
      newOrderStatus = 'PROCESSING'
      newPaymentStatus = 'COMPLETED'
    } else if (paymentStatus === 'FAILED') {
      newOrderStatus = 'CANCELLED'
      newPaymentStatus = 'FAILED'
    } else if (paymentStatus === 'PENDING') {
      newPaymentStatus = 'PENDING'
    } else {
      newPaymentStatus = 'FAILED'
      newOrderStatus = 'CANCELLED'
    }

    // Update payment record
    const { error: paymentUpdateError } = await supabaseAdmin.from('payments').update({
      status: newPaymentStatus,
      provider_reference: pfPaymentId,
      updated_at: new Date().toISOString()
    }).eq('id', paymentId)
    
    if (paymentUpdateError) throw paymentUpdateError

    // Update order record
    const { error: orderUpdateError } = await supabaseAdmin.from('orders').update({
      status: newOrderStatus,
      payment_status: newPaymentStatus === 'COMPLETED' ? 'PAID' : (newPaymentStatus === 'FAILED' ? 'FAILED' : 'PENDING'),
      updated_at: new Date().toISOString()
    }).eq('id', payment.order_id)
    
    if (orderUpdateError) throw orderUpdateError

    // Insert order status history
    await supabaseAdmin.from('order_status_history').insert({
      order_id: payment.order_id,
      status: newOrderStatus,
      notes: `PayFast ITN status: ${paymentStatus} (Reference: ${pfPaymentId || 'N/A'})`
    })

    // Fetch order with line items
    const { data: orderWithItems } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', payment.order_id)
      .single()

    const order = orderWithItems || payment.orders

    if (newPaymentStatus === 'COMPLETED') {
      // 1. Server-Side Atomic Inventory Deduction
      if (orderWithItems && Array.isArray(orderWithItems.order_items)) {
        for (const item of orderWithItems.order_items) {
          const qty = Number(item.quantity) || 1

          // Deduct from variant if present
          if (item.variant_id) {
            const { data: v } = await supabaseAdmin.from('product_variants').select('stock_quantity').eq('id', item.variant_id).single()
            if (v) {
              const newQty = Math.max(0, (v.stock_quantity || 0) - qty)
              await supabaseAdmin.from('product_variants').update({ stock_quantity: newQty }).eq('id', item.variant_id)
            }
          }

          // Deduct from main product
          if (item.product_id) {
            const { data: p } = await supabaseAdmin.from('products').select('stock_quantity').eq('id', item.product_id).single()
            if (p) {
              const newQty = Math.max(0, (p.stock_quantity || 0) - qty)
              await supabaseAdmin.from('products').update({ stock_quantity: newQty }).eq('id', item.product_id)
            }
          }

          // Log inventory adjustment
          await supabaseAdmin.from('inventory_logs').insert({
            product_id: item.product_id,
            variant_id: item.variant_id || null,
            change_amount: -qty,
            reason: `Order ${order.order_number} payment completed`,
            reference_id: order.id
          }).catch((err) => console.warn('Could not insert inventory log:', err))
        }
      }

      // 2. Customer Confirmation Email
      try {
        await sendBrevoEmail({
          to: [{ email: order.email, name: order.customer_name }],
          subject: `Order Confirmed - ${order.order_number}`,
          htmlContent: getOrderConfirmationTemplate(order)
        })
      } catch (emailErr) {
        console.error('Failed to send customer confirmation email:', emailErr)
      }

      // 3. Admin Notification Email
      try {
        const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'andrews.ashley@outlook.com'
        await sendBrevoEmail({
          to: [{ email: adminEmail, name: 'DetailCorner Admin' }],
          subject: `New Order Received - ${order.order_number}`,
          htmlContent: getAdminNewOrderTemplate(order)
        })
      } catch (adminEmailErr) {
        console.error('Failed to send admin order notification email:', adminEmailErr)
      }

    } else if (newPaymentStatus === 'FAILED') {
      // Customer Failure Notice
      try {
        await sendBrevoEmail({
          to: [{ email: order.email, name: order.customer_name }],
          subject: `Payment Failed - ${order.order_number}`,
          htmlContent: getPaymentFailureTemplate(order)
        })
      } catch (emailErr) {
        console.error('Failed to send payment failure email:', emailErr)
      }
    }

    return new Response('ok', { status: 200 })
  } catch (error: any) {
    console.error('PayFast ITN processing error:', error)
    return new Response(error.message, { status: 500 })
  }
})
