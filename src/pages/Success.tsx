import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle2, ShoppingBag, Truck, Package, MessageSquare, ChevronRight, AlertTriangle } from 'lucide-react';
import { storeConfig } from '../config/store';
import { useCartStore } from '../features/cart/store';
import { motion } from 'motion/react';

export function Success() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clearCart = useCartStore(state => state.clearCart);

  useEffect(() => {
    async function fetchAndConfirmOrder() {
      if (!id) {
        setError('Missing order ID');
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch the order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();
        
        if (orderError || !orderData) {
          // Check local orders as fallback
          const saved = JSON.parse(localStorage.getItem('local_orders') || '[]');
          const match = saved.find((item: any) => item.order?.id === id || item.order?.order_number === id);
          
          if (match) {
            setOrder(match.order);
            setItems(match.items || []);
            // For local orders, we still want to clear the cart if it's a success landing
            clearCart();
            setLoading(false);
          } else {
            setError('We could not find your order details, but your payment may have been successful. Please contact support if you do not receive an email shortly.');
            setLoading(false);
          }
          return;
        }

        // 2. Fetch order items
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderData.id);

        setOrder(orderData);
        setItems(itemsData || []);

        // 3. Confirm payment success (PAID status update)
        // Note: In a real app, this would be handled by a webhook (ITN).
        // Here we do it on landing as a fallback/demonstration.
        if (orderData.status !== 'PAID') {
          await supabase.from('orders').update({ 
            status: 'PAID', 
            payment_status: 'PAID',
            updated_at: new Date().toISOString()
          }).eq('id', orderData.id);
          
          await supabase.from('order_status_history').insert({
            order_id: orderData.id,
            previous_status: orderData.status,
            new_status: 'PAID',
            reason: 'Payment confirmed on success page landing'
          });

          // Update payment record
          await supabase.from('payments')
            .update({ status: 'PAID', updated_at: new Date().toISOString() })
            .eq('order_id', orderData.id);

          // Stock deduction
          if (itemsData) {
            for (const item of itemsData) {
              if (item.variant_id) {
                const { data: v } = await supabase.from('product_variants').select('stock_quantity').eq('id', item.variant_id).single();
                if (v) await supabase.from('product_variants').update({ stock_quantity: Math.max(0, v.stock_quantity - item.quantity) }).eq('id', item.variant_id);
              } else if (item.product_id) {
                const { data: p } = await supabase.from('products').select('stock_quantity').eq('id', item.product_id).single();
                if (p) await supabase.from('products').update({ stock_quantity: Math.max(0, p.stock_quantity - item.quantity) }).eq('id', item.product_id);
              }
            }
          }
        }

        // 4. Clear cart only after successful confirmation logic
        clearCart();
        setLoading(false);

      } catch (err) {
        console.error('Error confirming order:', err);
        setError('An error occurred while verifying your order. Please check your account for order status.');
        setLoading(false);
      }
    }

    fetchAndConfirmOrder();
  }, [id, clearCart]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="success-loading">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="success-loading-spinner"
        />
        <h2 className="success-loading-title">Verifying Payment...</h2>
        <p className="success-loading-text">Please wait while we confirm your order.</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="success-error">
        <div className="success-error-box">
          <AlertTriangle className="success-error-icon" />
          <h2 className="success-error-title">Something went wrong</h2>
          <p className="success-loading-text">{error}</p>
        </div>
        <div className="success-error-actions">
          <Link to="/products" className="btn btn-primary">Return to Shop</Link>
          <Link to="/contact" className="btn btn-outline">Contact Support</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="success-header"
      >
        <div className="success-icon-wrapper">
          <CheckCircle2 className="success-icon" />
        </div>
        <h1 className="success-title">
          Thank you for your order!
        </h1>
        <p className="success-subtitle">
          Your payment was successful and your order <span className="success-order-number">#{order?.order_number}</span> is now confirmed.
        </p>
      </motion.div>

      <div className="success-grid">
        {/* Main Content */}
        <div className="success-main-content">
          {/* Order Details */}
          <div className="success-card">
            <div className="success-card-header">
              <h2 className="success-card-title">Order Summary</h2>
            </div>
            <div className="success-card-body">
              <ul className="success-order-items">
                {items.map((item) => (
                  <li key={item.id} className="success-order-item">
                    <div className="success-item-details">
                      <span className="success-item-name">{item.product_name_snapshot}</span>
                      {item.variant_snapshot && (
                        <span className="success-item-variant">{item.variant_snapshot}</span>
                      )}
                      <span className="success-item-qty">Qty: {item.quantity}</span>
                    </div>
                    <span className="success-item-price">{formatPrice(item.total)}</span>
                  </li>
                ))}
              </ul>
              
              <div className="success-order-summary">
                <div className="success-summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(order?.subtotal)}</span>
                </div>
                {order?.discount_amount > 0 && (
                  <div className="success-summary-row discount">
                    <span>Discount</span>
                    <span>-{formatPrice(order?.discount_amount)}</span>
                  </div>
                )}
                <div className="success-summary-row">
                  <span>Shipping</span>
                  <span>{formatPrice(order?.shipping_amount)}</span>
                </div>
                <div className="success-summary-total">
                  <span>Total Paid</span>
                  <span>{formatPrice(order?.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="success-steps">
            <div className="success-step-card">
              <Package className="success-step-icon" />
              <h3 className="success-step-title">Processing</h3>
              <p className="success-step-text">We're getting your items ready. You'll receive an email as soon as your order is packed.</p>
            </div>
            <div className="success-step-card">
              <Truck className="success-step-icon" />
              <h3 className="success-step-title">Shipping</h3>
              <p className="success-step-text">Once shipped, we'll send you a tracking number so you can follow your parcel's journey.</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="success-sidebar">
          <div className="success-card">
            <div className="success-card-body">
              <h3 className="success-card-title" style={{marginBottom: '1rem'}}>What's Next?</h3>
              <div className="success-actions">
                <Link to="/products" className="success-action-link">
                  <div className="success-action-content">
                    <ShoppingBag className="success-action-icon" />
                    <span className="success-action-text">Continue Shopping</span>
                  </div>
                  <ChevronRight className="success-action-chevron" />
                </Link>
                
                <Link to="/contact" className="success-action-link">
                  <div className="success-action-content">
                    <MessageSquare className="success-action-icon" />
                    <span className="success-action-text">Need Help?</span>
                  </div>
                  <ChevronRight className="success-action-chevron" />
                </Link>
              </div>
            </div>
          </div>

          <div className="success-info-card">
            <h3 className="success-info-title">Order Info</h3>
            <div className="success-info-list">
              <div>
                <p className="success-info-item-label">Date</p>
                <p className="success-info-item-value">{new Date(order?.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="success-info-item-label">Email</p>
                <p className="success-info-item-value truncate">{order?.email}</p>
              </div>
              <div>
                <p className="success-info-item-label">Shipping To</p>
                <p className="success-info-item-value">
                  {order?.shipping_information?.city}, {order?.shipping_information?.province}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
