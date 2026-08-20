
export const getEmailLayout = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .header { background-color: #1a1a1a; padding: 30px; text-align: center; }
    .header h1 { color: #c41e3a; margin: 0; font-size: 28px; font-weight: 800; text-transform: uppercase; font-style: italic; letter-spacing: -1px; }
    .header h1 span { color: #ffffff; }
    .content { padding: 40px 30px; }
    .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eeeeee; }
    .btn { display: inline-block; padding: 12px 25px; background-color: #c41e3a; color: #ffffff !important; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; text-transform: uppercase; font-size: 14px; }
    .order-details { margin: 25px 0; border: 1px solid #eeeeee; border-radius: 4px; }
    .order-row { display: flex; justify-content: space-between; padding: 10px 15px; border-bottom: 1px solid #eeeeee; }
    .order-row:last-child { border-bottom: none; }
    .label { font-weight: bold; color: #555; }
    .price { font-weight: bold; color: #1a1a1a; }
    .accent { color: #c41e3a; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DETAIL<span>CORNER</span></h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Detail Corner SA. All rights reserved.<br>
      Pacific Business Park, Mitchell's Plain, Cape Town<br>
      <a href="https://detailcorner.co.za" style="color: #c41e3a; text-decoration: none;">Visit Store</a>
    </div>
  </div>
</body>
</html>
`;

export const getOrderConfirmationTemplate = (order: any) => getEmailLayout(`
  <h2 style="margin-top: 0;">Order Confirmed!</h2>
  <p>Hi ${order.customer_name},</p>
  <p>Thank you for your order! We've received your payment and our team is now preparing your items for dispatch.</p>
  
  <div class="order-details">
    <div class="order-row">
      <span class="label">Order Number:</span>
      <span class="accent">${order.order_number}</span>
    </div>
    <div class="order-row">
      <span class="label">Status:</span>
      <span>${order.status}</span>
    </div>
    <div class="order-row">
      <span class="label">Total Amount:</span>
      <span class="price">R ${order.total.toFixed(2)}</span>
    </div>
  </div>
  
  <p>You can track your order status anytime using the link below:</p>
  <a href="${Deno.env.get('FRONTEND_URL') || 'https://detailcorner.co.za'}/track?order=${order.order_number}&email=${order.email}" class="btn">Track Order</a>
`);

export const getPaymentFailureTemplate = (order: any) => getEmailLayout(`
  <h2 style="margin-top: 0; color: #ef4444;">Payment Failed</h2>
  <p>Hi ${order.customer_name},</p>
  <p>We're sorry, but your payment for order <span class="accent">${order.order_number}</span> was unsuccessful.</p>
  <p>No funds were charged from your account. If you'd like to try again, you can return to the store and place a new order.</p>
  
  <a href="${Deno.env.get('FRONTEND_URL') || 'https://detailcorner.co.za'}/cart" class="btn">Return to Shop</a>
`);

export const getShippingUpdateTemplate = (order: any) => getEmailLayout(`
  <h2 style="margin-top: 0;">Your Order is Shipped!</h2>
  <p>Hi ${order.customer_name},</p>
  <p>Great news! Your order <span class="accent">${order.order_number}</span> has been dispatched and is on its way to you.</p>
  
  ${order.tracking_number ? `
    <div style="background: #f0fdf4; padding: 15px; border-radius: 4px; margin: 20px 0; border: 1px solid #bbf7d0;">
      <p style="margin: 0; font-weight: bold; color: #166534;">Tracking Number:</p>
      <p style="margin: 5px 0 0 0; font-size: 18px; color: #166534; font-weight: 800;">${order.tracking_number}</p>
    </div>
  ` : ''}
  
  <p>Thank you for choosing Detail Corner!</p>
  <a href="${Deno.env.get('FRONTEND_URL') || 'https://detailcorner.co.za'}/track?order=${order.order_number}&email=${order.email}" class="btn">Track Package</a>
`);

export const getAdminNewOrderTemplate = (order: any) => getEmailLayout(`
  <h2 style="margin-top: 0;">New Order Received</h2>
  <p>An order has been placed on Detail Corner:</p>
  
  <div class="order-details">
    <div class="order-row">
      <span class="label">Order:</span>
      <span class="accent">${order.order_number}</span>
    </div>
    <div class="order-row">
      <span class="label">Customer:</span>
      <span>${order.customer_name}</span>
    </div>
    <div class="order-row">
      <span class="label">Total:</span>
      <span class="price">R ${order.total.toFixed(2)}</span>
    </div>
  </div>
  
  <a href="${Deno.env.get('FRONTEND_URL') || 'https://detailcorner.co.za'}/admin/orders" class="btn">Manage Order</a>
`);

export const getAbandonedCartTemplate = (order: any) => getEmailLayout(`
  <h2 style="margin-top: 0;">Did you forget something?</h2>
  <p>Hi ${order.customer_name},</p>
  <p>We noticed you left some premium detailing products in your cart. We've saved them for you, but they might sell out soon!</p>
  
  <p>You can complete your order securely using the link below:</p>
  <br>
  <a href="${Deno.env.get('FRONTEND_URL') || 'https://detailcorner.co.za'}/checkout" class="btn">Return to Checkout</a>
`);

export const getReviewRequestTemplate = (order: any) => getEmailLayout(`
  <h2 style="margin-top: 0;">How was your experience?</h2>
  <p>Hi ${order.customer_name},</p>
  <p>It's been a few days since your order <strong>${order.order_number}</strong> arrived! We hope you're loving the products.</p>
  <p>Would you mind taking a quick minute to review your items? Your feedback helps us maintain the highest quality for the detailing community.</p>
  
  <br>
  <a href="${Deno.env.get('FRONTEND_URL') || 'https://detailcorner.co.za'}/account/orders/${order.id}" class="btn">Leave a Review</a>
`);

export const getLowStockTemplate = (product: any) => getEmailLayout(`
  <h2 style="margin-top: 0; color: #f59e0b;">Low Stock Alert</h2>
  <p>The following product is running low on inventory:</p>
  
  <div class="order-details">
    <div class="order-row">
      <span class="label">Product:</span>
      <span class="accent">${product.name}</span>
    </div>
    <div class="order-row">
      <span class="label">SKU:</span>
      <span>${product.sku}</span>
    </div>
    <div class="order-row">
      <span class="label">Remaining:</span>
      <span style="color: #ef4444; font-weight: bold;">${product.stock_quantity}</span>
    </div>
  </div>
  
  <a href="${Deno.env.get('FRONTEND_URL') || 'https://detailcorner.co.za'}/admin/products" class="btn">Update Inventory</a>
`);
