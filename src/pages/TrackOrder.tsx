import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PackageSearch, Package, Clock, CheckCircle, Truck, XCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [order, setOrder] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(price);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'PENDING_PAYMENT':
        return <Clock style={{ height: '1.5rem', width: '1.5rem', color: '#eab308' }} />;
      case 'PAID':
      case 'PROCESSING':
        return <Package style={{ height: '1.5rem', width: '1.5rem', color: '#3b82f6' }} />;
      case 'PACKED':
      case 'SHIPPED':
        return <Truck style={{ height: '1.5rem', width: '1.5rem', color: '#6366f1' }} />;
      case 'DELIVERED':
        return <CheckCircle style={{ height: '1.5rem', width: '1.5rem', color: '#22c55e' }} />;
      case 'CANCELLED':
      case 'FAILED':
        return <XCircle style={{ height: '1.5rem', width: '1.5rem', color: '#ef4444' }} />;
      default:
        return <Clock style={{ height: '1.5rem', width: '1.5rem', color: '#6b7280' }} />;
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);
    setHistory([]);

    try {
      // Try to use the track_order RPC first (if it exists)
      const { data: rpcData, error: rpcError } = await supabase.rpc('track_order', {
        p_order_number: orderNumber.trim(),
        p_email: email.trim().toLowerCase()
      });

      if (!rpcError && rpcData) {
        setOrder(rpcData.order);
        setHistory(rpcData.history || []);
        setLoading(false);
        return;
      }

      // Fallback: direct table queries (will only work for guest orders without RLS update, or if RLS is bypassed)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('order_number', orderNumber.trim())
        .ilike('email', email.trim())
        .single();

      if (orderError || !orderData) {
        throw new Error('Order not found. Please check your order number and email address.');
      }

      setOrder(orderData);

      const { data: historyData, error: historyError } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderData.id)
        .order('created_at', { ascending: false });

      if (!historyError && historyData) {
        setHistory(historyData);
      }
    } catch (err: any) {
      console.error('Tracking error:', err);
      setError(err.message || 'Could not find tracking information for that order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <PackageSearch style={{ height: '3rem', width: '3rem', color: 'var(--accent)', margin: '0 auto 1rem auto' }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>Track Your Order</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
          Enter your order number and email address to see your order status.
        </p>
      </div>

      <div className="brand-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', ...(window.innerWidth >= 640 && { gridTemplateColumns: '1fr 1fr' }) }}>
            <div className="form-group">
              <label htmlFor="orderNumber" className="form-label" style={{ fontWeight: 600 }}>Order Number</label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. ORD-123456"
                className="input-field"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email used for order"
                className="input-field"
                required
              />
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle style={{ flexShrink: 0, height: '1.25rem', width: '1.25rem' }} />
              <p style={{ margin: 0, fontWeight: 500 }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}
          >
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>
      </div>

      {order && (
        <div className="brand-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 2rem', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                Order #{order.order_number}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Placed on {new Date(order.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current Status:</span>
              <span style={{
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: 700,
                backgroundColor: order.status === 'DELIVERED' ? '#dcfce7' : order.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7',
                color: order.status === 'DELIVERED' ? '#166534' : order.status === 'CANCELLED' ? '#991b1b' : '#854d0e'
              }}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Tracking History</h3>
            
            {history.length > 0 ? (
              <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border)', marginLeft: '1rem' }}>
                {history.map((event, index) => (
                  <div key={event.id} style={{ position: 'relative', marginBottom: index === history.length - 1 ? 0 : '2rem' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '-2.2rem', 
                      top: '0', 
                      backgroundColor: 'var(--bg)', 
                      borderRadius: '50%', 
                      padding: '0.25rem',
                      border: `2px solid ${index === 0 ? 'var(--accent)' : 'var(--border)'}`
                    }}>
                      {getStatusIcon(event.new_status)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: index === 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {event.new_status.replace('_', ' ')}
                        </h4>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {new Date(event.created_at).toLocaleString('en-ZA', { 
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      {event.reason && (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                          {event.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
                <Clock style={{ height: '2rem', width: '2rem', color: 'var(--text-secondary)', margin: '0 auto 0.75rem auto' }} />
                <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No tracking history available yet.</p>
              </div>
            )}
          </div>
          
          <div style={{ padding: '2rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Order Total</h3>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatPrice(order.total || 0)}</p>
            </div>
            {order.tracking_number && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Courier Tracking Number</h3>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>{order.tracking_number}</p>
              </div>
            )}
            
            {order.order_items && order.order_items.length > 0 && (
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Items in this order</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {order.order_items.map((item: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{item.quantity}x</span>
                        <span style={{ color: 'var(--text-primary)' }}>{item.product_name_snapshot} {item.variant_snapshot && `(${item.variant_snapshot})`}</span>
                      </div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{formatPrice(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <Link to="/contact" className="text-brand-accent hover:underline text-sm font-medium">
                Need help with this order? Contact Support
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
