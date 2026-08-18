
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { sendBrevoEmail } from "../_shared/email.ts"
import { 
  getOrderConfirmationTemplate, 
  getPaymentFailureTemplate, 
  getShippingUpdateTemplate, 
  getAdminNewOrderTemplate, 
  getLowStockTemplate 
} from "../_shared/email-templates.ts"
import { corsHeaders } from "../_shared/payfast.ts"

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

    // Check if user is admin
    const { data: profile } = await supabaseClient.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'ADMIN') throw new Error('Unauthorized: Admin access required');

    const { templateType, targetEmail } = await req.json();

    if (!templateType || !targetEmail) {
      throw new Error('Missing templateType or targetEmail');
    }

    const mockOrder = {
      order_number: "TEST-ORD-12345",
      customer_name: "Test Customer",
      email: targetEmail,
      total: 1250.00,
      status: "PROCESSING",
      tracking_number: "TRACK7890XYZ"
    };

    const mockProduct = {
      name: "Detailing Power Shampoo",
      sku: "DET-SHAM-001",
      stock_quantity: 3
    };

    let htmlContent = "";
    let subject = "Detail Corner - Test Email";

    switch (templateType) {
      case 'ORDER_CONFIRMATION':
        htmlContent = getOrderConfirmationTemplate(mockOrder);
        subject = `[TEST] Order Confirmed - ${mockOrder.order_number}`;
        break;
      case 'PAYMENT_FAILURE':
        htmlContent = getPaymentFailureTemplate(mockOrder);
        subject = `[TEST] Payment Failed - ${mockOrder.order_number}`;
        break;
      case 'SHIPPING_UPDATE':
        htmlContent = getShippingUpdateTemplate(mockOrder);
        subject = `[TEST] Your order ${mockOrder.order_number} has been shipped!`;
        break;
      case 'ADMIN_NEW_ORDER':
        htmlContent = getAdminNewOrderTemplate(mockOrder);
        subject = `[TEST] New Order Received - ${mockOrder.order_number}`;
        break;
      case 'LOW_STOCK':
        htmlContent = getLowStockTemplate(mockProduct);
        subject = `[TEST] Low Stock Alert: ${mockProduct.name}`;
        break;
      default:
        throw new Error('Invalid template type');
    }

    const result = await sendBrevoEmail({
      to: [{ email: targetEmail, name: "Test User" }],
      subject,
      htmlContent
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
