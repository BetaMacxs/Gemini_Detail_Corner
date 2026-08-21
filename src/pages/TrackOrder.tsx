import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Package, Clock, CheckCircle, Truck, XCircle, AlertCircle, ShoppingBag, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

export function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [order, setOrder] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(price || 0);
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

  const performLookup = async (targetOrderNumber: string, targetEmail: string) => {
    const cleanNum = targetOrderNumber.trim().replace(/^#+/, '');
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanNum || !cleanEmail) return;

    setLoading(true);
    setError(null);
    setOrder(null);
    setHistory([]);

    try {
      // 1. Use secure track_order RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('track_order', {
        p_order_number: cleanNum,
        p_email: cleanEmail
      });

      if (!rpcError && rpcData && rpcData.order) {
        setOrder(rpcData.order);
        setHistory(rpcData.history || []);
        setLoading(false);
        return;
      }

      if (rpcError) {
        console.warn('track_order RPC error:', rpcError);
      }

      // 2. Fallback: Check local_orders in localStorage (useful for offline/session fallback)
      try {
        const saved = JSON.parse(localStorage.getItem('local_orders') || '[]');
        const match = saved.find((item: any) => 
          (item.order?.order_number?.toLowerCase().replace(/^#+/, '') === cleanNum.toLowerCase() || item.order?.id === cleanNum) &&
          item.order?.email?.toLowerCase() === cleanEmail
        );
        if (match && match.order) {
          setOrder(match.order);
          setHistory([
            {
              id: 'local-init',
              status: match.order.status || 'PENDING_PAYMENT',
              created_at: match.order.created_at || new Date().toISOString(),
              notes: 'Order placed'
            }
          ]);
          setLoading(false);
          return;
        }
      } catch (lsErr) {
        console.warn('Local orders search error:', lsErr);
      }

      throw new Error('No matching order found. Please verify your order number and email address.');
    } catch (err: any) {
      console.error('Tracking error:', err);
      setError(err.message || 'Could not find tracking information for that order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlOrder = searchParams.get('order');
    const urlEmail = searchParams.get('email');
    if (urlOrder && urlEmail) {
      performLookup(urlOrder, urlEmail);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(orderNumber, email);
  };

  return (
    <div className="container page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.05em', color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1 }}>
            Track Your <span style={{ color: 'var(--accent)' }}>Order</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
            Enter your order reference number and email address to view real-time status.
          </p>
        </motion.div>
      </div>

      <div className="brand-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="orderNumber" className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Order Number
              </label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. DC-GUEST-20260820-1 or DC-20260820-1"
                className="input-field"
                style={{ width: '100%', fontSize: '0.875rem', padding: '0.75rem' }}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                style={{ width: '100%', fontSize: '0.875rem', padding: '0.75rem' }}
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
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status:</span>
              <span style={{
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: 700,
                backgroundColor: order.status === 'DELIVERED' ? '#dcfce7' : order.status === 'CANCELLED' || order.status === 'FAILED' ? '#fee2e2' : '#fef3c7',
                color: order.status === 'DELIVERED' ? '#166534' : order.status === 'CANCELLED' || order.status === 'FAILED' ? '#991b1b' : '#854d0e'
              }}>
                {(order.status || 'PENDING').replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1rem', left: '0', right: '0', height: '2px', backgroundColor: 'var(--border)', zIndex: 0 }}></div>
              {[
                { label: 'Placed', icon: ShoppingBag, statuses: ['PENDING', 'PENDING_PAYMENT', 'PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'] },
                { label: 'Paid', icon: CreditCard, statuses: ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'] },
                { label: 'Processing', icon: Package, statuses: ['PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'] },
                { label: 'Shipped', icon: Truck, statuses: ['SHIPPED', 'DELIVERED'] },
                { label: 'Delivered', icon: CheckCircle, statuses: ['DELIVERED'] }
              ].map((step, i) => {
                const isActive = step.statuses.includes(order.status);
                
                return (
                  <div key={i} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '20%' }}>
                    <div style={{ 
                      width: '2rem', 
                      height: '2rem', 
                      borderRadius: '50%', 
                      backgroundColor: isActive ? 'var(--accent)' : 'var(--bg)', 
                      border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      boxShadow: isActive ? '0 0 15px var(--accent-glow)' : 'none'
                    }}>
                      <step.icon size={14} />
                    </div>
                    <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'center' }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Tracking Timeline</h3>
            
            {history.length > 0 ? (
              <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border)', marginLeft: '1rem' }}>
                {history.map((event, index) => {
                  const statusName = (event.status || event.new_status || 'STATUS_UPDATE').replace(/_/g, ' ');
                  const note = event.notes || event.reason || '';
                  return (
                    <div key={event.id || index} style={{ position: 'relative', marginBottom: index === history.length - 1 ? 0 : '2rem' }}>
                      <div style={{ 
                        position: 'absolute', 
                        left: '-2.2rem', 
                        top: '0', 
                        backgroundColor: 'var(--bg)', 
                        borderRadius: '50%', 
                        padding: '0.25rem',
                        border: `2px solid ${index === 0 ? 'var(--accent)' : 'var(--border)'}`
                      }}>
                        {getStatusIcon(event.status || event.new_status)}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: index === 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                            {statusName}
                          </h4>
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {new Date(event.created_at).toLocaleString('en-ZA', { 
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        {note && (
                          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                            {note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
                <Clock style={{ height: '2rem', width: '2rem', color: 'var(--text-secondary)', margin: '0 auto 0.75rem auto' }} />
                <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No tracking history events logged yet.</p>
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
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Courier Tracking Reference</h3>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>{order.tracking_number}</p>
              </div>
            )}
            
            {order.order_items && order.order_items.length > 0 && (
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>Items in this order</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {order.order_items.map((item: any, i: number) => (
                    <div key={item.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              <Link to="/contact" style={{ color: "var(--accent)", fontSize: "0.875rem", fontWeight: 500, textDecoration: "underline" }}>
                Need assistance with this order? Contact DetailCorner Team
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
