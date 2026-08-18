
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { sendBrevoEmail } from "../_shared/email.ts"
import { getShippingUpdateTemplate, getLowStockTemplate } from "../_shared/email-templates.ts"
import { corsHeaders } from "../_shared/payfast.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json();
    const { table, type, record, old_record } = payload;

    console.log(`Webhook received: ${table} ${type}`);

    if (table === 'orders' && type === 'UPDATE') {
      // Handle Order Shipped
      if (old_record.status !== 'SHIPPED' && record.status === 'SHIPPED') {
        console.log(`Sending shipping update for order ${record.order_number}`);
        await sendBrevoEmail({
          to: [{ email: record.email, name: record.customer_name }],
          subject: `Your order ${record.order_number} has been shipped!`,
          htmlContent: getShippingUpdateTemplate(record)
        });
      }
    }

    if (table === 'products' && type === 'UPDATE') {
      // Handle Low Stock
      if (record.stock_quantity <= record.low_stock_threshold && old_record.stock_quantity > record.low_stock_threshold) {
        console.log(`Sending low stock alert for ${record.name}`);
        const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'khangadijah87@gmail.com';
        await sendBrevoEmail({
          to: [{ email: adminEmail, name: 'Store Admin' }],
          subject: `Low Stock Alert: ${record.name}`,
          htmlContent: getLowStockTemplate(record)
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
