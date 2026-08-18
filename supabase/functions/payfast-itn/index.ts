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
    const text = await req.text();
    const params = new URLSearchParams(text);
    const data: Record<string, string> = {};
    params.forEach((value, key) => {
      data[key] = value;
    });

    const signature = data.signature;
    delete data.signature;

    const expectedSignature = generatePayfastSignature(data, Deno.env.get('PAYFAST_PASSPHRASE'));

    if (signature !== expectedSignature) {
      console.error('Invalid signature');
      return new Response('Invalid signature', { status: 400 });
    }

    const isSandbox = Deno.env.get('PAYFAST_SANDBOX') !== 'false';
    const itnVerifyUrl = isSandbox ? "https://sandbox.payfast.co.za/eng/query/validate" : "https://www.payfast.co.za/eng/query/validate";

    const verifyResponse = await fetch(itnVerifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: text
    });

    const verifyText = await verifyResponse.text();
    if (verifyText !== 'VALID') {
        console.error('Invalid ITN verification', verifyText);
        return new Response('Invalid ITN', { status: 400 });
    }

    const paymentId = data.m_payment_id;
    const paymentStatus = data.payment_status;
    const pfPaymentId = data.pf_payment_id;
    
    if (!paymentId) throw new Error('Missing payment ID');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: payment, error: paymentFetchError } = await supabaseAdmin.from('payments').select('*, orders(*)').eq('id', paymentId).single();
    if (paymentFetchError || !payment) throw new Error('Payment not found');

    if (payment.status === 'COMPLETED') {
        return new Response('Already processed', { status: 200 });
    }

    let newOrderStatus = 'PENDING_PAYMENT';
    let newPaymentStatus = payment.status;

    if (paymentStatus === 'COMPLETE') {
        newOrderStatus = 'PROCESSING';
        newPaymentStatus = 'COMPLETED';
    } else if (paymentStatus === 'FAILED') {
        newOrderStatus = 'CANCELLED';
        newPaymentStatus = 'FAILED';
    } else if (paymentStatus === 'PENDING') {
        newPaymentStatus = 'PENDING';
    } else {
        newPaymentStatus = 'FAILED'; // Fallback for other statuses like DENIED
        newOrderStatus = 'CANCELLED';
    }

    const { error: paymentUpdateError } = await supabaseAdmin.from('payments').update({
        status: newPaymentStatus,
        transaction_id: pfPaymentId
    }).eq('id', paymentId);
    
    if (paymentUpdateError) throw paymentUpdateError;

    const { error: orderUpdateError } = await supabaseAdmin.from('orders').update({
        status: newOrderStatus
    }).eq('id', payment.order_id);
    
    if (orderUpdateError) throw orderUpdateError;

    // Send Email Notifications
    const order = payment.orders;
    if (newPaymentStatus === 'COMPLETED') {
      // 1. Customer Confirmation
      await sendBrevoEmail({
        to: [{ email: order.email, name: order.customer_name }],
        subject: `Order Confirmed - ${order.order_number}`,
        htmlContent: getOrderConfirmationTemplate(order)
      });

      // 2. Admin Alert
      const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'khangadijah87@gmail.com';
      await sendBrevoEmail({
        to: [{ email: adminEmail, name: 'Store Admin' }],
        subject: `New Order Received - ${order.order_number}`,
        htmlContent: getAdminNewOrderTemplate(order)
      });
    } else if (newPaymentStatus === 'FAILED') {
      // Customer Failure Notice
      await sendBrevoEmail({
        to: [{ email: order.email, name: order.customer_name }],
        subject: `Payment Failed - ${order.order_number}`,
        htmlContent: getPaymentFailureTemplate(order)
      });
    }

    return new Response('ok', { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new Response(error.message, { status: 500 });
  }
});
