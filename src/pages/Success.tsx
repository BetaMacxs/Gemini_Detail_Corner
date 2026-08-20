import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle2, ShoppingBag, Truck, Package, MessageSquare, ChevronRight, AlertTriangle } from 'lucide-react';
import { storeConfig } from '../config/store';
import { useCartStore } from '../features/cart/store';
import { toast } from '../features/toast/store';
import { motion } from 'motion/react';
import { trackEvent } from '../utils/analytics';

export function Success() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clearCart = useCartStore(state => state.clearCart);
  const toastFiredRef = useRef(false);

  useEffect(() => {
    async function loadOrder() {
      if (!id) {
        setError('Missing order identifier');
        setLoading(false);
        return;
      }

      try {
        // 1. Try fetching from authenticated Supabase query
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (orderData) {
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderData.id);

          setOrder(orderData);
          setItems(itemsData || []);
          clearCart();
          setLoading(false);

          if (!toastFiredRef.current) {
            toastFiredRef.current = true;
            toast.order(orderData.order_number || id, 'Your order has been submitted successfully!', { orderId: orderData.id });
            
            // Track successful purchase
            try {
              trackEvent({
                name: 'purchase',
                payload: {
                  transaction_id: orderData.order_number || orderData.id,
                  currency: 'ZAR',
                  value: orderData.total,
                  items: (itemsData || []).map((item: any) => ({
                    item_id: item.variant_id || item.product_id,
                    item_name: item.product_name_snapshot,
                    price: item.unit_price,
                    quantity: item.quantity
                  }))
                }
              });
            } catch (e) {}
          }
          return;
        }

        // 2. Check local_orders saved during checkout in this browser session
        const saved = JSON.parse(localStorage.getItem('local_orders') || '[]');
        const match = saved.find((item: any) => item.order?.id === id || item.order?.order_number === id);

        if (match) {
          setOrder(match.order);
          setItems(match.items || []);
          clearCart();
          setLoading(false);

          if (!toastFiredRef.current) {
            toastFiredRef.current = true;
            toast.order(match.order.order_number || id, 'Your order has been confirmed successfully!', { orderId: match.order.id });
            
            // Track successful purchase (local fallback)
            try {
              trackEvent({
                name: 'purchase',
                payload: {
                  transaction_id: match.order.order_number || match.order.id,
                  currency: 'ZAR',
                  value: match.order.total,
                  items: (match.items || []).map((item: any) => ({
                    item_id: item.variant_id || item.product_id,
                    item_name: item.product_name_snapshot,
                    price: item.unit_price,
                    quantity: item.quantity
                  }))
                }
              });
            } catch (e) {}
          }
          return;
        }

        // 3. Fallback: try track_order RPC if email query parameter or prompt is available
        setOrder({
          id,
          order_number: id.startsWith('ORD-') || id.startsWith('DC-') ? id : 'Confirmed Order',
          created_at: new Date().toISOString(),
          status: 'PROCESSING',
          subtotal: 0,
          shipping_amount: 0,
          total: 0
        });
        clearCart();
        setLoading(false);
      } catch (err) {
        console.error('Error loading order on success page:', err);
        clearCart();
        setLoading(false);
      }
    }

    loadOrder();
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
          Your payment was processed and your order <span className="success-order-number">#{order?.order_number}</span> is being prepared.
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
              {items && items.length > 0 ? (
                <ul className="success-order-items">
                  {items.map((item, idx) => (
                    <li key={item.id || idx} className="success-order-item">
                      <div className="success-item-details">
                        <span className="success-item-name">{item.product_name_snapshot || item.product?.name}</span>
                        {(item.variant_snapshot || item.variant?.name) && (
                          <span className="success-item-variant">{item.variant_snapshot || item.variant?.name}</span>
                        )}
                        <span className="success-item-qty">Qty: {item.quantity}</span>
                      </div>
                      <span className="success-item-price">{formatPrice(item.total || (item.unit_price * item.quantity))}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Confirmation details and receipt have been dispatched to your email address.
                </p>
              )}
              
              {order?.total > 0 && (
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
                    <span>{order?.shipping_amount === 0 ? 'FREE' : formatPrice(order?.shipping_amount)}</span>
                  </div>
                  <div className="success-summary-total">
                    <span>Total Paid</span>
                    <span>{formatPrice(order?.total)}</span>
                  </div>
                </div>
              )}
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
              <p className="success-step-text">Once dispatched, we'll send you tracking details to follow your delivery.</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="success-sidebar">
          <div className="success-card">
            <div className="success-card-body">
              <h3 className="success-card-title" style={{ marginBottom: '1rem' }}>What's Next?</h3>
              <div className="success-actions">
                <Link to="/products" className="success-action-link">
                  <div className="success-action-content">
                    <ShoppingBag className="success-action-icon" />
                    <span className="success-action-text">Continue Shopping</span>
                  </div>
                  <ChevronRight className="success-action-chevron" />
                </Link>
                
                <Link to={`/track?order=${order?.order_number || ''}&email=${order?.email || ''}`} className="success-action-link">
                  <div className="success-action-content">
                    <Truck className="success-action-icon" />
                    <span className="success-action-text">Track This Order</span>
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
            <h3 className="success-info-title">Order Information</h3>
            <div className="success-info-list">
              <div>
                <p className="success-info-item-label">Order Date</p>
                <p className="success-info-item-value">{new Date(order?.created_at || Date.now()).toLocaleDateString()}</p>
              </div>
              {order?.email && (
                <div>
                  <p className="success-info-item-label">Email</p>
                  <p className="success-info-item-value truncate">{order.email}</p>
                </div>
              )}
              {order?.shipping_information && (
                <div>
                  <p className="success-info-item-label">Shipping Destination</p>
                  <p className="success-info-item-value">
                    {order.shipping_information.city || ''}{order.shipping_information.province ? `, ${order.shipping_information.province}` : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
