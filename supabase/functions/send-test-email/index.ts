import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { sendBrevoEmail } from "../_shared/email.ts"
import { 
  getOrderConfirmationTemplate, 
  getPaymentFailureTemplate, 
  getShippingUpdateTemplate, 
  getAdminNewOrderTemplate, 
  getLowStockTemplate 
} from "../_shared/email-templates.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('VITE_SUPABASE_ANON_KEY') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Supabase configuration missing in environment' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }

    // Pass the raw token directly to getUser for accurate token verification
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth verification failed:', userError?.message);
      return new Response(JSON.stringify({ error: `Unauthorized: ${userError?.message || 'Invalid session'}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }

    // Verify admin role via profiles table (is_admin column) or ADMIN_EMAIL fallback
    const dbClient = supabaseServiceKey 
      ? createClient(supabaseUrl, supabaseServiceKey) 
      : supabaseClient;

    const { data: profile, error: profileError } = await dbClient
      .from('profiles')
      .select('id, email, is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.warn('Profile fetch warning:', profileError.message);
    }

    const adminEmail = Deno.env.get('ADMIN_EMAIL') || Deno.env.get('VITE_ADMIN_EMAIL');
    const isAdmin = profile?.is_admin === true || (adminEmail && user.email?.toLowerCase() === adminEmail.toLowerCase());

    if (!isAdmin) {
      console.error(`User ${user.email} (${user.id}) is not an administrator`);
      return new Response(JSON.stringify({ error: 'Forbidden: Administrator privileges required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      });
    }

    // Parse and validate payload
    const body = await req.json().catch(() => ({}));
    const { templateType, targetEmail } = body;

    if (!templateType || !targetEmail) {
      return new Response(JSON.stringify({ error: 'Bad Request: Missing templateType or targetEmail' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Generate mock data for template preview
    const mockOrder = {
      order_number: "DC-TEST-20260815-1",
      customer_name: user.user_metadata?.full_name || "Valued Customer",
      email: targetEmail,
      total: 1450.00,
      status: "PROCESSING",
      tracking_number: "TC-ZA-9928172X"
    };

    const mockProduct = {
      name: "Detail Corner Ceramic Coating Pro (50ml)",
      sku: "DC-CER-050",
      stock_quantity: 3,
      low_stock_threshold: 5
    };

    let htmlContent = "";
    let subject = "[Detail Corner] Test Notification";

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
        subject = `[TEST] Your order ${mockOrder.order_number} has shipped!`;
        break;
      case 'ADMIN_NEW_ORDER':
        htmlContent = getAdminNewOrderTemplate(mockOrder);
        subject = `[TEST] Admin Alert: New Order ${mockOrder.order_number}`;
        break;
      case 'LOW_STOCK':
        htmlContent = getLowStockTemplate(mockProduct);
        subject = `[TEST] Low Stock Alert: ${mockProduct.name}`;
        break;
      default:
        return new Response(JSON.stringify({ error: `Invalid template type: ${templateType}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
    }

    // Dispatch email via Brevo
    const emailResult = await sendBrevoEmail({
      to: [{ email: targetEmail, name: mockOrder.customer_name }],
      subject,
      htmlContent
    });

    if (emailResult.error) {
      console.error('Brevo dispatch error:', emailResult.error);
      return new Response(JSON.stringify({ error: `Brevo dispatch error: ${emailResult.error}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Test email (${templateType}) sent successfully to ${targetEmail}`,
      details: emailResult.data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (err: any) {
    console.error('Unhandled edge function exception:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
