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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full mb-4"
        />
        <h2 className="text-xl font-bold text-text-primary">Verifying Payment...</h2>
        <p className="text-text-secondary mt-2">Please wait while we confirm your order.</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 mb-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-text-secondary">{error}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/products" className="btn btn-primary">Return to Shop</Link>
          <Link to="/contact" className="btn btn-outline">Contact Support</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">
          Thank you for your order!
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          Your payment was successful and your order <span className="font-bold text-accent">#{order?.order_number}</span> is now confirmed.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Details */}
          <div className="bg-card-bg border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-bottom border-white/5 bg-white/5">
              <h2 className="text-lg font-bold text-text-primary">Order Summary</h2>
            </div>
            <div className="p-6">
              <ul className="divide-y divide-white/5">
                {items.map((item) => (
                  <li key={item.id} className="py-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-text-primary font-medium">{item.product_name_snapshot}</span>
                      {item.variant_snapshot && (
                        <span className="text-xs text-text-secondary mt-0.5">{item.variant_snapshot}</span>
                      )}
                      <span className="text-sm text-text-secondary mt-1">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-text-primary">{formatPrice(item.total)}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Subtotal</span>
                  <span>{formatPrice(order?.subtotal)}</span>
                </div>
                {order?.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-500">
                    <span>Discount</span>
                    <span>-{formatPrice(order?.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Shipping</span>
                  <span>{formatPrice(order?.shipping_amount)}</span>
                </div>
                <div className="flex justify-between text-lg font-extrabold text-text-primary pt-3 border-t border-white/5">
                  <span>Total Paid</span>
                  <span>{formatPrice(order?.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-white/5 rounded-xl border border-white/5">
              <Package className="h-6 w-6 text-accent mb-3" />
              <h3 className="font-bold text-text-primary mb-2">Processing</h3>
              <p className="text-sm text-text-secondary">We're getting your items ready. You'll receive an email as soon as your order is packed.</p>
            </div>
            <div className="p-5 bg-white/5 rounded-xl border border-white/5">
              <Truck className="h-6 w-6 text-accent mb-3" />
              <h3 className="font-bold text-text-primary mb-2">Shipping</h3>
              <p className="text-sm text-text-secondary">Once shipped, we'll send you a tracking number so you can follow your parcel's journey.</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card-bg border border-white/5 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-text-primary mb-4">What's Next?</h3>
            <div className="space-y-4">
              <Link to="/products" className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium text-text-primary">Continue Shopping</span>
                </div>
                <ChevronRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link to="/contact" className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium text-text-primary">Need Help?</span>
                </div>
                <ChevronRight className="h-4 w-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6">
            <h3 className="text-sm font-black uppercase tracking-tighter text-accent mb-2">Order Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-secondary uppercase font-bold tracking-widest">Date</p>
                <p className="text-sm font-medium text-text-primary">{new Date(order?.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase font-bold tracking-widest">Email</p>
                <p className="text-sm font-medium text-text-primary truncate">{order?.email}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase font-bold tracking-widest">Shipping To</p>
                <p className="text-sm font-medium text-text-primary">
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
