import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { generatePayfastSignature, corsHeaders } from "../_shared/payfast.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    let userId: string | null = null

    // Optional user authentication (allows guest checkout)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim()
      const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      if (token && token !== anonKey) {
        try {
          const supabaseAuthClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            anonKey,
            { global: { headers: { Authorization: authHeader } } }
          )
          const { data: { user } } = await supabaseAuthClient.auth.getUser(token)
          if (user) {
            userId = user.id
          }
        } catch (authErr) {
          console.warn('Guest checkout or invalid auth token:', authErr)
        }
      }
    }

    const { items, customerData, couponCode } = await req.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Cart items cannot be empty')
    }

    if (!customerData || !customerData.email || !customerData.firstName || !customerData.lastName) {
      throw new Error('Customer contact and delivery information are required')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let subtotal = 0
    const orderItems = []

    // Authoritative pricing check against DB
    for (const item of items) {
      const productId = item.product?.id || item.productId
      const { data: product } = await supabaseAdmin.from('products').select('*').eq('id', productId).single()
      if (!product) throw new Error(`Product not found: ${productId}`)

      let price = Number(product.price)
      let sku = product.sku
      let variantName: string | null = null
      const variantId = item.variant?.id || item.variantId || null

      if (variantId) {
        const { data: variant } = await supabaseAdmin.from('product_variants').select('*').eq('id', variantId).single()
        if (variant) {
          price = Number(variant.price)
          sku = variant.sku || sku
          variantName = variant.name || variant.size || null
        }
      }

      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1)
      const lineTotal = price * quantity
      subtotal += lineTotal

      orderItems.push({
        product_id: product.id,
        variant_id: variantId,
        product_name_snapshot: product.name,
        sku_snapshot: sku,
        variant_snapshot: variantName,
        quantity,
        unit_price: price,
        total: lineTotal
      })
    }

    // Coupon discount calculation
    let discountAmount = 0
    let validatedCouponId: string | null = null

    if (couponCode && typeof couponCode === 'string' && couponCode.trim().length > 0) {
      const cleanCode = couponCode.trim()
      const { data: coupon } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .ilike('code', cleanCode)
        .eq('active', true)
        .maybeSingle()

      if (coupon) {
        const now = new Date()
        const isStarted = !coupon.start_date || new Date(coupon.start_date) <= now
        const isNotExpired = !coupon.expiry_date || new Date(coupon.expiry_date) >= now
        const hasUsageLeft = coupon.usage_limit == null || (coupon.usage_count || 0) < coupon.usage_limit

        if (isStarted && isNotExpired && hasUsageLeft) {
          const discountVal = Number(coupon.discount_value) || 0
          const discountType = (coupon.discount_type || '').toLowerCase()
          if (discountType === 'percentage') {
            discountAmount = Math.round(((subtotal * discountVal) / 100) * 100) / 100
          } else {
            discountAmount = Math.min(subtotal, discountVal)
          }
          validatedCouponId = coupon.id
        }
      }
    }

    // Shipping calculation: Free over R500
    const shippingAmount = (subtotal - discountAmount) >= 500 ? 0 : 100
    const total = Math.max(0, subtotal - discountAmount + shippingAmount)
    const taxAmount = Math.round(((total * 15) / 115) * 100) / 100 // 15% South African VAT

    let orderNumber = ''
    try {
      const { data: genNumber, error: genError } = await supabaseAdmin.rpc('generate_order_number')
      if (!genError && genNumber) {
        orderNumber = genNumber
      } else {
        throw genError || new Error('No order number returned from database function')
      }
    } catch (_e) {
      const today = new Date()
      const dateStr = today.getFullYear().toString() +
                      (today.getMonth() + 1).toString().padStart(2, '0') +
                      today.getDate().toString().padStart(2, '0')
      const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      orderNumber = `DC-${dateStr}-${randomSuffix}`
    }

    const { data: order, error: orderInsertError } = await supabaseAdmin.from('orders').insert({
      order_number: orderNumber,
      customer_id: userId,
      email: customerData.email.toLowerCase().trim(),
      customer_name: `${customerData.firstName} ${customerData.lastName}`.trim(),
      phone: customerData.phone || '',
      billing_information: customerData,
      shipping_information: customerData,
      subtotal,
      discount_amount: discountAmount,
      shipping_amount: shippingAmount,
      tax_amount: taxAmount,
      total,
      currency: 'ZAR',
      status: 'PENDING_PAYMENT',
      payment_status: 'PENDING'
    }).select().single()

    if (orderInsertError) throw orderInsertError

    // Insert order line items
    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(
      orderItems.map(item => ({ ...item, order_id: order.id }))
    )
    if (itemsError) throw itemsError

    // Insert status history
    await supabaseAdmin.from('order_status_history').insert({
      order_id: order.id,
      status: 'PENDING_PAYMENT',
      notes: 'Order initiated via PayFast checkout'
    })

    // If coupon was validated, increment usage
    if (validatedCouponId) {
      await supabaseAdmin.rpc('increment_coupon_usage', { coupon_id: validatedCouponId }).catch(async () => {
        const { data: c } = await supabaseAdmin.from('coupons').select('usage_count').eq('id', validatedCouponId).single()
        if (c) {
          await supabaseAdmin.from('coupons').update({ usage_count: (c.usage_count || 0) + 1 }).eq('id', validatedCouponId)
        }
      })
    }

    // Insert payment record
    const { data: payment, error: paymentError } = await supabaseAdmin.from('payments').insert({
      order_id: order.id,
      provider: 'PayFast',
      amount: total,
      currency: 'ZAR',
      status: 'PENDING'
    }).select().single()
    if (paymentError) throw paymentError

    const frontendBaseUrl = customerData.origin || Deno.env.get('FRONTEND_URL') || 'https://detailcorner.co.za'

    const payfastData: Record<string, string> = {
      merchant_id: Deno.env.get('PAYFAST_MERCHANT_ID') || '10046865',
      merchant_key: Deno.env.get('PAYFAST_MERCHANT_KEY') || 'vpnx7bcoh2xa9',
      return_url: customerData.return_url || `${frontendBaseUrl}/checkout/success/${order.id}`,
      cancel_url: customerData.cancel_url || `${frontendBaseUrl}/checkout/cancel`,
      notify_url: Deno.env.get('PAYFAST_NOTIFY_URL') || 'https://gllpmefitusfsuzrjgtf.supabase.co/functions/v1/payfast-itn',
      name_first: customerData.firstName || 'Customer',
      name_last: customerData.lastName || 'User',
      email_address: customerData.email,
      m_payment_id: payment.id,
      amount: total.toFixed(2),
      item_name: (items.map(item => `${item.product.name} x${item.quantity}`).join(', ') || `Order ${order.order_number}`).substring(0, 100),
      custom_str1: order.order_number,
      custom_str2: payment.id,
    }

    const signature = generatePayfastSignature(payfastData, Deno.env.get('PAYFAST_PASSPHRASE'))
    payfastData.signature = signature

    const isSandbox = Deno.env.get('PAYFAST_SANDBOX') !== 'false'
    const payfastUrl = isSandbox ? "https://sandbox.payfast.co.za/eng/process" : "https://www.payfast.co.za/eng/process"

    return new Response(
      JSON.stringify({ order, payfastData, payfastUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    console.error('create-order error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
