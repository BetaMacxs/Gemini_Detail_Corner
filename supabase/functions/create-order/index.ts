import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { generatePayfastSignature, corsHeaders } from "../_shared/payfast.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    const { items, customerData } = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
       const { data: product } = await supabaseAdmin.from('products').select('*').eq('id', item.product.id).single();
       if (!product) throw new Error(`Product not found: ${item.product.id}`);
       
       const price = item.variant ? item.variant.price : product.price;
       const quantity = item.quantity;
       subtotal += (price * quantity);
       
       orderItems.push({
         product_id: product.id,
         variant_id: item.variant?.id || null,
         product_name_snapshot: product.name,
         sku_snapshot: item.variant ? item.variant.sku : product.sku,
         variant_snapshot: item.variant ? item.variant.name : null,
         quantity,
         unit_price: price,
         total: price * quantity
       });
    }

    const shippingAmount = 100;
    const total = subtotal + shippingAmount;
    
    const orderNumber = `ORD-${Math.floor(Date.now() / 1000).toString()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    const { data: order, error: orderInsertError } = await supabaseAdmin.from('orders').insert({
      order_number: orderNumber,
      customer_id: user.id,
      email: customerData.email,
      customer_name: `${customerData.firstName} ${customerData.lastName}`,
      phone: customerData.phone,
      billing_information: customerData,
      shipping_information: customerData,
      subtotal,
      shipping_amount: shippingAmount,
      total,
      status: 'PENDING_PAYMENT'
    }).select().single();

    if (orderInsertError) throw orderInsertError;

    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(
      orderItems.map(item => ({ ...item, order_id: order.id }))
    );
    if (itemsError) throw itemsError;

    const { data: payment, error: paymentError } = await supabaseAdmin.from('payments').insert({
      order_id: order.id,
      provider: 'PayFast',
      amount: total,
      status: 'PENDING'
    }).select().single();
    if (paymentError) throw paymentError;

    const payfastData: Record<string, string> = {
      merchant_id: Deno.env.get('PAYFAST_MERCHANT_ID') || '',
      merchant_key: Deno.env.get('PAYFAST_MERCHANT_KEY') || '',
      return_url: Deno.env.get('PAYFAST_RETURN_URL') || '',
      cancel_url: Deno.env.get('PAYFAST_CANCEL_URL') || '',
      notify_url: Deno.env.get('PAYFAST_NOTIFY_URL') || '',
      name_first: customerData.firstName,
      name_last: customerData.lastName,
      email_address: customerData.email,
      m_payment_id: payment.id,
      amount: total.toFixed(2),
      item_name: `Order ${orderNumber}`,
    };

    const signature = generatePayfastSignature(payfastData, Deno.env.get('PAYFAST_PASSPHRASE'));
    payfastData.signature = signature;

    const isSandbox = Deno.env.get('PAYFAST_SANDBOX') !== 'false';
    const payfastUrl = isSandbox ? "https://sandbox.payfast.co.za/eng/process" : "https://www.payfast.co.za/eng/process";

    return new Response(
      JSON.stringify({ order, payfastData, payfastUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
