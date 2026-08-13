import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../features/auth/store';
import { Package, ChevronRight } from 'lucide-react';
import { storeConfig } from '../config/store';

export function Orders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="account-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '16rem' }}>
        <div style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '50%',
          borderBottom: '2px solid var(--accent)',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div className="account-page">
      <h1 className="account-title" style={{ marginBottom: '2rem' }}>Order History</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 1rem', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <Package className="mx-auto h-12 w-12 text-brand-text-secondary" style={{ margin: '0 auto', display: 'block' }} />
          <h3 style={{ marginTop: '1rem', fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-primary)' }}>No orders found</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>You haven't placed any orders yet.</p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link
              to="/products"
              className="btn btn-primary"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {orders.map((order) => (
              <li key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <Link to={`/account/orders/${order.id}`} style={{ display: 'block', padding: '1.5rem', textDecoration: 'none', transition: 'background-color 0.2s' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                        Order #{order.order_number}
                      </p>
                      <div>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: order.status === 'DELIVERED' ? '#dcfce7' : order.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7',
                          color: order.status === 'DELIVERED' ? '#166534' : order.status === 'CANCELLED' ? '#991b1b' : '#854d0e'
                        }}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatPrice(order.total)}</p>
                        <ChevronRight className="h-5 w-5 text-brand-text-secondary" />
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
