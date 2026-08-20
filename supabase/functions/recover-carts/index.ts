import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1"
import { sendBrevoEmail } from "../_shared/email.ts"
import { getAbandonedCartTemplate } from "../_shared/email-templates.ts"

serve(async (req) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find orders that are PENDING and created more than 2 hours ago
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    
    // We fetch orders where status is PENDING and there is no record of us having sent an ABANDONED_REMINDER_SENT
    const { data: abandonedOrders, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*, order_status_history!inner(status)')
      .eq('status', 'PENDING')
      .eq('payment_status', 'PENDING')
      .lt('created_at', twoHoursAgo)

    if (fetchError) throw fetchError

    // Filter out orders that already have the ABANDONED_REMINDER_SENT status in their history
    const targetOrders = abandonedOrders?.filter(order => 
      !order.order_status_history.some((history: any) => history.status === 'ABANDONED_REMINDER_SENT')
    ) || []

    console.log(`Found ${targetOrders.length} abandoned orders to recover.`)

    const results = []

    for (const order of targetOrders) {
      try {
        // Send recovery email
        await sendBrevoEmail({
          to: [{ email: order.email, name: order.customer_name }],
          subject: `Did you forget something, ${order.customer_name}?`,
          htmlContent: getAbandonedCartTemplate(order)
        })

        // Log that we sent the reminder to prevent spam
        await supabaseAdmin.from('order_status_history').insert({
          order_id: order.id,
          status: 'ABANDONED_REMINDER_SENT',
          notes: 'Automated abandoned checkout reminder sent via Brevo.'
        })

        results.push({ order_id: order.id, status: 'success' })
      } catch (err: any) {
        console.error(`Failed to recover order ${order.id}:`, err)
        results.push({ order_id: order.id, status: 'error', error: err.message })
      }
    }

    return new Response(JSON.stringify({ processed: targetOrders.length, results }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('recover-carts error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})