import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { 
  generatePayfastSignature, 
  parsePayfastBody, 
  payfastUrlEncode,
  corsHeaders 
} from "../_shared/payfast.ts"
import md5 from "https://esm.sh/js-md5@0.8.3"
import { sendBrevoEmail } from "../_shared/email.ts"
import { 
  getOrderConfirmationTemplate, 
  getPaymentFailureTemplate, 
  getAdminNewOrderTemplate 
} from "../_shared/email-templates.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const text = await req.text()
    if (!text || text.trim().length === 0) {
      console.warn('PayFast ITN received empty payload')
      return new Response('Empty body', { status: 400, headers: corsHeaders })
    }

    const { data, orderedPairs, signature: receivedSignature, rawStringWithoutSignature } = parsePayfastBody(text)

    console.log('PayFast ITN received payload:', JSON.stringify(data))
    console.log('PayFast ITN received signature:', receivedSignature)

    if (!receivedSignature) {
      console.error('PayFast ITN missing signature in payload')
      return new Response('Missing signature', { status: 400, headers: corsHeaders })
    }

    // 1. Signature Verification
    const passphrase = Deno.env.get('PAYFAST_PASSPHRASE') || null

    // Check multiple valid PayFast signature construction methods
    const sigOrderedWithPass = generatePayfastSignature(orderedPairs, passphrase)
    const sigOrderedNoPass = generatePayfastSignature(orderedPairs, null)
    const sigDataWithPass = generatePayfastSignature(data, passphrase)
    const sigDataNoPass = generatePayfastSignature(data, null)

    // Also check raw parameter string from original payload
    let sigRawWithPass = ''
    let sigRawNoPass = ''
    if (rawStringWithoutSignature) {
      const rawWithPassStr = passphrase && passphrase.trim() !== ''
        ? `${rawStringWithoutSignature}&passphrase=${payfastUrlEncode(passphrase.trim())}`
        : rawStringWithoutSignature
      sigRawWithPass = md5(rawWithPassStr)
      sigRawNoPass = md5(rawStringWithoutSignature)
    }

    const isSignatureValid = 
      receivedSignature === sigOrderedWithPass ||
      receivedSignature === sigOrderedNoPass ||
      receivedSignature === sigDataWithPass ||
      receivedSignature === sigDataNoPass ||
      receivedSignature === sigRawWithPass ||
      receivedSignature === sigRawNoPass

    if (!isSignatureValid) {
      console.error('Invalid PayFast ITN signature. Received:', receivedSignature, 'Candidates:', {
        sigOrderedWithPass,
        sigOrderedNoPass,
        sigDataWithPass,
        sigDataNoPass,
        sigRawWithPass,
        sigRawNoPass
      })
      return new Response('Invalid signature', { status: 400, headers: corsHeaders })
    }

    console.log('PayFast ITN signature verified successfully.')

    // 2. Server Confirmation with PayFast (/eng/query/validate)
    const isSandboxEnv = Deno.env.get('PAYFAST_SANDBOX') !== 'false'
    const isSandboxMerchant = data.merchant_id === '10000100' || data.merchant_id === '10046865'
    const isSandbox = isSandboxEnv || isSandboxMerchant

    const primaryUrl = isSandbox 
      ? "https://sandbox.payfast.co.za/eng/query/validate" 
      : "https://www.payfast.co.za/eng/query/validate"
    const fallbackUrl = isSandbox
      ? "https://www.payfast.co.za/eng/query/validate"
      : "https://sandbox.payfast.co.za/eng/query/validate"

    let isServerValid = false
    let verifyResponseText = ''

    try {
      const verifyResponse = await fetch(primaryUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'PayFast-Integration/1.0 (DetailCorner; Deno)',
          'Accept': '*/*'
        },
        body: text.trim()
      })

      verifyResponseText = (await verifyResponse.text()).trim()
      console.log(`PayFast validate response from ${primaryUrl}: status=${verifyResponse.status} body="${verifyResponseText}"`)

      if (verifyResponseText.includes('VALID')) {
        isServerValid = true
      } else if (isSandboxMerchant && !isServerValid) {
        // Retry with alternate endpoint in sandbox/test environments
        const fallbackResponse = await fetch(fallbackUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'PayFast-Integration/1.0 (DetailCorner; Deno)',
            'Accept': '*/*'
          },
          body: text.trim()
        })
        const fallbackText = (await fallbackResponse.text()).trim()
        console.log(`PayFast validate retry from ${fallbackUrl}: status=${fallbackResponse.status} body="${fallbackText}"`)
        if (fallbackText.includes('VALID')) {
          isServerValid = true
        }
      }
    } catch (fetchErr) {
      console.error('Error contacting PayFast validation server:', fetchErr)
    }

    if (!isServerValid) {
      console.error('PayFast ITN server validation failed. Response was:', verifyResponseText)
      return new Response('Invalid ITN server validation', { status: 400, headers: corsHeaders })
    }

    console.log('PayFast ITN server validation passed.')

    // 3. Locate Payment and Order in Supabase
    const paymentId = data.m_payment_id || data.custom_str2 || ''
    const paymentStatus = (data.payment_status || '').toUpperCase()
    const pfPaymentId = data.pf_payment_id || ''
    
    if (!paymentId) {
      console.error('PayFast ITN missing m_payment_id')
      return new Response('Missing m_payment_id', { status: 400, headers: corsHeaders })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Lookup payment record by ID or order_id
    let payment: any = null

    const { data: directPayment, error: directPaymentErr } = await supabaseAdmin
      .from('payments')
      .select('*, orders(*)')
      .eq('id', paymentId)
      .maybeSingle()

    if (directPayment) {
      payment = directPayment
    } else {
      // Fallback 1: Lookup by order_id
      const { data: orderByPaymentId } = await supabaseAdmin
        .from('payments')
        .select('*, orders(*)')
        .eq('order_id', paymentId)
        .maybeSingle()

      if (orderByPaymentId) {
        payment = orderByPaymentId
      } else if (data.custom_str1) {
        // Fallback 2: Lookup by order_number
        const { data: orderRec } = await supabaseAdmin
          .from('orders')
          .select('id, payments(*)')
          .eq('order_number', data.custom_str1)
          .maybeSingle()

        if (orderRec && orderRec.payments && orderRec.payments.length > 0) {
          payment = {
            ...orderRec.payments[0],
            orders: orderRec
          }
        }
      }
    }

    if (!payment) {
      console.error(`Payment record not found for reference: ${paymentId}`)
      // Return 200 to prevent PayFast from continuously spamming retries if order cannot be found
      return new Response(`Payment not found for ID ${paymentId}`, { status: 200, headers: corsHeaders })
    }

    const orderId = payment.order_id || payment.orders?.id
    const currentOrderStatus = payment.orders?.status || 'PENDING_PAYMENT'

    // Idempotency: If payment is already marked as PAID, acknowledge with 200
    if (payment.status === 'PAID' && paymentStatus === 'COMPLETE') {
      console.log('Payment already marked as PAID:', payment.id)
      return new Response('Already processed', { status: 200, headers: corsHeaders })
    }

    // 4. Map PayFast status to database schema constraints
    // Allowed orders.status: 'PENDING_PAYMENT', 'PAYMENT_FAILED', 'PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
    // Allowed orders.payment_status: 'PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'
    // Allowed payments.status: 'PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'
    let newPaymentStatus = payment.status
    let newOrderStatus = currentOrderStatus
    let newOrderPaymentStatus = payment.orders?.payment_status || 'PENDING'

    if (paymentStatus === 'COMPLETE') {
      newPaymentStatus = 'PAID'
      newOrderStatus = 'PROCESSING'
      newOrderPaymentStatus = 'PAID'
    } else if (paymentStatus === 'FAILED') {
      newPaymentStatus = 'FAILED'
      newOrderStatus = 'PAYMENT_FAILED'
      newOrderPaymentStatus = 'FAILED'
    } else if (paymentStatus === 'CANCELLED') {
      newPaymentStatus = 'CANCELLED'
      newOrderStatus = 'CANCELLED'
      newOrderPaymentStatus = 'CANCELLED'
    } else if (paymentStatus === 'PENDING') {
      newPaymentStatus = 'PENDING'
      newOrderStatus = 'PENDING_PAYMENT'
      newOrderPaymentStatus = 'PENDING'
    }

    // 5. Update Payment Record
    const { error: paymentUpdateError } = await supabaseAdmin
      .from('payments')
      .update({
        status: newPaymentStatus,
        provider_reference: pfPaymentId || payment.provider_reference,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id)
    
    if (paymentUpdateError) {
      console.error('Payment update error:', paymentUpdateError)
      throw paymentUpdateError
    }

    // 6. Update Order Record
    if (orderId) {
      const { error: orderUpdateError } = await supabaseAdmin
        .from('orders')
        .update({
          status: newOrderStatus,
          payment_status: newOrderPaymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
      
      if (orderUpdateError) {
        console.error('Order update error:', orderUpdateError)
        throw orderUpdateError
      }

      // 7. Record Order Status History (matching exact schema columns)
      try {
        await supabaseAdmin.from('order_status_history').insert({
          order_id: orderId,
          previous_status: currentOrderStatus,
          new_status: newOrderStatus,
          reason: `PayFast ITN status: ${paymentStatus} (Reference: ${pfPaymentId || 'N/A'}, Gross: ${data.amount_gross || data.amount || 'N/A'})`
        })
      } catch (historyErr) {
        console.warn('Order status history insertion error:', historyErr)
      }
    }

    // 8. Log Payment Event
    try {
      await supabaseAdmin.from('payment_events').insert({
        payment_id: payment.id,
        event_type: `ITN_${paymentStatus}`,
        payload: data
      })
    } catch (eventErr) {
      console.warn('Payment event insertion error:', eventErr)
    }

    // 9. Fetch Full Order Details for Customer & Admin Notifications
    let orderDetails = payment.orders
    if (orderId) {
      const { data: orderWithItems } = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .maybeSingle()

      if (orderWithItems) {
        orderDetails = orderWithItems
      }
    }

    // 10. Send Transactional Emails
    if (newPaymentStatus === 'PAID' && orderDetails) {
      // Inventory Deduction is handled atomically by PostgreSQL trigger on_order_paid_deduct_stock
      // when orders.status transitions to PROCESSING / PAID.

      // Customer Confirmation Email
      try {
        await sendBrevoEmail({
          to: [{ email: orderDetails.email, name: orderDetails.customer_name }],
          subject: `Order Confirmed - ${orderDetails.order_number}`,
          htmlContent: getOrderConfirmationTemplate(orderDetails)
        })
        console.log(`Order confirmation email sent to ${orderDetails.email}`)
      } catch (emailErr) {
        console.error('Failed to send customer confirmation email:', emailErr)
      }

      // Admin Notification Email
      try {
        const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'andrews.ashley@outlook.com'
        await sendBrevoEmail({
          to: [{ email: adminEmail, name: 'DetailCorner Admin' }],
          subject: `New Order Received - ${orderDetails.order_number}`,
          htmlContent: getAdminNewOrderTemplate(orderDetails)
        })
        console.log(`Admin order notification email sent to ${adminEmail}`)
      } catch (adminEmailErr) {
        console.error('Failed to send admin order notification email:', adminEmailErr)
      }

    } else if (newPaymentStatus === 'FAILED' && orderDetails) {
      // Payment Failure Notice
      try {
        await sendBrevoEmail({
          to: [{ email: orderDetails.email, name: orderDetails.customer_name }],
          subject: `Payment Failed - ${orderDetails.order_number}`,
          htmlContent: getPaymentFailureTemplate(orderDetails)
        })
        console.log(`Payment failure notice sent to ${orderDetails.email}`)
      } catch (emailErr) {
        console.error('Failed to send payment failure email:', emailErr)
      }
    }

    // Return standard HTTP 200 OK expected by PayFast
    return new Response('OK', { status: 200, headers: corsHeaders })
  } catch (error: any) {
    console.error('PayFast ITN processing unhandled error:', error)
    return new Response(error.message || 'Internal error', { status: 500, headers: corsHeaders })
  }
})
