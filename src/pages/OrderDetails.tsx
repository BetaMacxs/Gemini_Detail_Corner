import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronLeft } from 'lucide-react';
import { storeConfig } from '../config/store';
import { useCartStore } from '../features/cart/store';

export function OrderDetails() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!id) return;
      let fetchedOrder: any = null;
      let fetchedItems: any[] = [];

      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();
        
        if (!orderError && orderData) {
          fetchedOrder = orderData;
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', id);

          if (itemsData) {
            fetchedItems = itemsData;
          }
        }
      } catch (err) {
        console.warn('DB order fetch notice:', err);
      }

      if (!fetchedOrder) {
        try {
          const saved = JSON.parse(localStorage.getItem('local_orders') || '[]');
          const match = saved.find((item: any) => item.order?.id === id || item.order?.order_number === id);
          if (match) {
            fetchedOrder = match.order;
            fetchedItems = match.items || [];
          }
        } catch (e) {
          console.error('Error reading local order details:', e);
        }
      } else if (fetchedItems.length === 0) {
        try {
          const saved = JSON.parse(localStorage.getItem('local_orders') || '[]');
          const match = saved.find((item: any) => item.order?.id === id || item.order?.order_number === id);
          if (match && match.items) {
            fetchedItems = match.items;
          }
        } catch (e) {
          // ignore
        }
      }

      setOrder(fetchedOrder);
      setItems(fetchedItems);
      setLoading(false);
    }
    fetchOrderDetails();
  }, [id]);

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

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--spacing-page-y) var(--spacing-container-px)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Order not found.</p>
        <Link to="/account/orders" style={{ color: 'var(--accent)', textDecoration: 'underline', marginTop: '1rem', display: 'inline-block' }}>Back to orders</Link>
      </div>
    );
  }

  return (
    <div className="account-page" style={{ maxWidth: '48rem' }}>
      <Link to="/account/orders" style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textDecoration: 'none' }}>
        <ChevronLeft size={16} style={{ marginRight: "0.25rem" }} /> Back to Orders
      </Link>
      
      <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Order #{order.order_number}
            </h3>
            <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <span style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: order.status === 'DELIVERED' ? '#dcfce7' : order.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7',
            color: order.status === 'DELIVERED' ? '#166534' : order.status === 'CANCELLED' ? '#991b1b' : '#854d0e'
          }}>
            {order.status.replace('_', ' ')}
          </span>
        </div>
        
        <div>
          <dl style={{ margin: 0 }}>
            <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', borderBottom: '1px solid var(--border)' }}>
              <dt style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Payment Status</dt>
              <dd style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>{order.payment_status}</dd>
            </div>
            
            <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', borderBottom: '1px solid var(--border)' }}>
              <dt style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Shipping Address</dt>
              <dd style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
                {order.shipping_information.address}<br />
                {order.shipping_information.city}, {order.shipping_information.province}<br />
                {order.shipping_information.postalCode}, {order.shipping_information.country}
              </dd>
            </div>
            
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <dt style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '1rem' }}>Items</dt>
              <dd style={{ margin: 0 }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {items.map((item) => (
                    <li key={item.id} style={{ padding: '0.75rem 0', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.product_name_snapshot}</span>
                        {item.variant_snapshot && <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.125rem' }}>{item.variant_snapshot}</span>}
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Qty: {item.quantity}</span>
                      </div>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{formatPrice(item.total)}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <dl style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <dt>Subtotal</dt>
                  <dd style={{ fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{formatPrice(order.subtotal)}</dd>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <dt>Shipping</dt>
                  <dd style={{ fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{formatPrice(order.shipping_amount)}</dd>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '1rem' }}>
                  <dt style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total</dt>
                  <dd style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{formatPrice(order.total)}</dd>
                </div>
              </dl>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
