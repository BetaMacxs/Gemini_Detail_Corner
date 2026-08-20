import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1"
import { sendBrevoEmail } from "../_shared/email.ts"
import { getReviewRequestTemplate } from "../_shared/email-templates.ts"

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

    // Find orders that were DELIVERED at least 5 days ago
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    
    // We fetch orders where status is COMPLETED or DELIVERED and no REVIEW_REQUEST_SENT exists
    const { data: deliveredOrders, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*, order_status_history!inner(status, created_at)')
      .in('status', ['COMPLETED', 'DELIVERED'])
      .lt('updated_at', fiveDaysAgo)

    if (fetchError) throw fetchError

    // Filter out orders that already have the REVIEW_REQUEST_SENT status
    const targetOrders = deliveredOrders?.filter(order => 
      !order.order_status_history.some((history: any) => history.status === 'REVIEW_REQUEST_SENT')
    ) || []

    console.log(`Found ${targetOrders.length} orders to request reviews for.`)

    const results = []

    for (const order of targetOrders) {
      try {
        // Send review request email
        await sendBrevoEmail({
          to: [{ email: order.email, name: order.customer_name }],
          subject: `How did we do? Review your recent order!`,
          htmlContent: getReviewRequestTemplate(order)
        })

        // Log that we sent the reminder
        await supabaseAdmin.from('order_status_history').insert({
          order_id: order.id,
          status: 'REVIEW_REQUEST_SENT',
          notes: 'Automated review request email sent via Brevo.'
        })

        results.push({ order_id: order.id, status: 'success' })
      } catch (err: any) {
        console.error(`Failed to send review request to order ${order.id}:`, err)
        results.push({ order_id: order.id, status: 'error', error: err.message })
      }
    }

    return new Response(JSON.stringify({ processed: targetOrders.length, results }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('request-reviews error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})