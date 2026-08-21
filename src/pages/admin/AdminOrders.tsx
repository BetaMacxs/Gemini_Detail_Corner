import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { storeConfig } from '../../config/store';
import { ChevronDown, ChevronUp, Search, Mail, CheckCircle2, RefreshCw } from 'lucide-react';
import { AdminNav } from '../../components/AdminNav';
import { toast } from '../../features/toast/store';

const ORDER_STATUSES = [
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED'
];

interface OrderItem {
  id: string;
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  status: string;
  payment_status: string;
  total: number;
  shipping_address: string;
  payment_ref: string;
  tracking_number?: string;
  expanded?: boolean;
  items?: any[];
}

export function AdminOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data: dbOrders, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          created_at,
          customer_name,
          email,
          status,
          payment_status,
          total,
          subtotal,
          shipping_amount,
          shipping_information,
          billing_information,
          tracking_number,
          order_items (
            product_name_snapshot,
            variant_snapshot,
            quantity,
            unit_price
          )
        `)
        .order('created_at', { ascending: false });

      let localOrders: any[] = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');
      } catch (e) {
        console.warn("Could not read local_orders fallback:", e);
      }

      const combined: OrderItem[] = [];

      if (!error && dbOrders) {
        dbOrders.forEach(o => {
          let customerName = o.customer_name || 'Guest User';
          if (!o.customer_name && o.shipping_information) {
            const s = o.shipping_information;
            if (typeof s === 'object' && s.firstName) {
              customerName = `${s.firstName} ${s.lastName || ''}`.trim();
            }
          }

          let shipAddr = 'No shipping address specified';
          if (o.shipping_information) {
            if (typeof o.shipping_information === 'string') {
              shipAddr = o.shipping_information;
            } else {
              const s = o.shipping_information;
              shipAddr = `${s.address || s.address_line_1 || ''}, ${s.city || ''}, ${s.postalCode || s.postal_code || ''}`.replace(/^,\s*|,\s*$/g, '');
            }
          } else if (o.billing_information) {
            const b = o.billing_information;
            shipAddr = typeof b === 'string' ? b : `${b.address || ''}, ${b.city || ''}, ${b.postalCode || ''}`.replace(/^,\s*|,\s*$/g, '');
          }

          const rawItems = Array.isArray(o.order_items) ? o.order_items : ((o as any).items || []);
          const mappedItems = rawItems.map((item: any) => ({
            product_name: item.product_name_snapshot || item.product_name || 'Product Item',
            variant: item.variant_snapshot || item.variant || 'Standard',
            quantity: Number(item.quantity || 1),
            price: Number(item.unit_price || item.price || 0)
          }));

          combined.push({
            id: o.id,
            order_number: o.order_number || o.id,
            created_at: o.created_at,
            customer_name: customerName,
            customer_email: o.email || o.shipping_information?.email || 'N/A',
            status: o.status || 'PENDING_PAYMENT',
            payment_status: o.payment_status || 'PENDING',
            total: Number(o.total || 0),
            shipping_address: shipAddr,
            payment_ref: `ord_${o.id.slice(0, 8)}`,
            tracking_number: o.tracking_number || '',
            expanded: false,
            items: mappedItems
          });
        });
      }

      // Merge locally stored guest orders if present
      localOrders.forEach(l => {
        if (l.order && !combined.some(c => c.id === l.order.id)) {
          combined.push({
            id: l.order.id,
            order_number: l.order.order_number || l.order.id,
            created_at: l.order.created_at || new Date().toISOString(),
            customer_name: l.order.shipping_address?.firstName ? `${l.order.shipping_address.firstName} ${l.order.shipping_address.lastName || ''}` : 'Guest User',
            customer_email: l.order.shipping_address?.email || 'N/A',
            status: l.order.status || 'PENDING',
            payment_status: l.order.payment_status || 'UNPAID',
            total: Number(l.order.total || 0),
            shipping_address: l.order.shipping_address ? `${l.order.shipping_address.address}, ${l.order.shipping_address.city}` : 'N/A',
            payment_ref: `pf_${l.order.id.slice(0, 6)}`,
            expanded: false,
            items: l.items || []
          });
        }
      });

      setOrders(combined);
    } catch (e) {
      console.error("Error loading orders from database:", e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const toggleExpand = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, expanded: !o.expanded } : o));
  };

  const handleTrackingChange = (id: string, newTracking: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, tracking_number: newTracking } : o));
  };

  const saveTrackingNumber = async (id: string, trackingNumber: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ tracking_number: trackingNumber, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Tracking Updated', `Tracking number saved for order.`);
    } catch (e: any) {
      console.warn("Update tracking error:", e);
      toast.error('Failed to update tracking', e.message || 'Could not save tracking number');
    }
  };

  const sendShippingEmail = async (order: OrderItem) => {
    if (!order.customer_email || order.customer_email === 'N/A') {
      toast.error('Missing Email', 'This order does not have a customer email address on file.');
      return;
    }

    setSendingEmailId(order.id);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          templateType: 'SHIPPING_UPDATE',
          targetEmail: order.customer_email,
          customerName: order.customer_name,
          order: {
            order_number: order.order_number,
            customer_name: order.customer_name,
            email: order.customer_email,
            total: order.total,
            status: 'SHIPPED',
            tracking_number: order.tracking_number || undefined
          }
        }
      });

      if (error) throw error;
      toast.success('Shipping Email Sent', `Dispatched tracking notification to ${order.customer_email}`);
    } catch (err: any) {
      console.error('Failed to send shipping email:', err);
      toast.error('Email Dispatch Warning', err.message || 'Could not dispatch shipping email.');
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const currentOrder = orders.find(o => o.id === id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));

    try {
      await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
      
      if (currentOrder && currentOrder.status !== newStatus) {
        await supabase.from('order_status_history').insert({
          order_id: id,
          previous_status: currentOrder.status,
          new_status: newStatus,
          reason: 'Updated by admin'
        });
      }
      
      if (newStatus === 'SHIPPED' && currentOrder) {
        // Automatically dispatch shipping email to customer
        if (currentOrder.customer_email && currentOrder.customer_email !== 'N/A') {
          sendShippingEmail({ ...currentOrder, status: 'SHIPPED' });
        } else {
          toast.success('Order Marked SHIPPED', `Order #${currentOrder.order_number} status updated.`);
        }
      } else {
        toast.success('Status Updated', `Order #${currentOrder?.order_number || id} is now ${newStatus}.`);
      }
    } catch (e: any) {
      console.warn("Update status error:", e);
      toast.error('Status Update Failed', e.message || 'Could not update order status.');
    }

    try {
      const localOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');
      const updatedLocal = localOrders.map((item: any) => {
        if (item.order?.id === id) {
          return { ...item, order: { ...item.order, status: newStatus } };
        }
        return item;
      });
      localStorage.setItem('local_orders', JSON.stringify(updatedLocal));
    } catch (e) {
      // ignore
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price || 0);
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'ALL' && o.status.toUpperCase() !== statusFilter.toUpperCase()) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        o.order_number.toLowerCase().includes(term) ||
        o.customer_name.toLowerCase().includes(term) ||
        o.customer_email.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="container page-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Order <span style={{ color: 'var(--accent)' }}>Management</span>
        </h1>
        <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Live order fulfillment, tracking synchronization, and automatic dispatch notifications.
        </p>
      </div>

      <AdminNav />

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="admin-search-wrapper" style={{ flex: 1, minWidth: '16rem' }}>
          <Search size={16} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by order #, name, email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="admin-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ width: 'auto', minWidth: '11rem' }}
        >
          <option value="ALL">All Statuses</option>
          {ORDER_STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="brand-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="brand-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No orders found in database.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredOrders.map(order => {
            const isPaid = order.status.toUpperCase() === 'PAID' || order.status.toUpperCase() === 'DELIVERED';
            const isGuest = order.order_number.startsWith('DC-GUEST-') || order.customer_name === 'Guest User';

            return (
              <div key={order.id} className="brand-card" style={{ overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)' }}>
                      #{order.order_number}
                    </span>
                    {isGuest && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        GUEST
                      </span>
                    )}
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {new Date(order.created_at).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {order.customer_name}
                    </span>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      backgroundColor: isPaid ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                      color: isPaid ? '#4ade80' : '#facc15',
                      border: '1px solid var(--border)'
                    }}>
                      {order.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                      {formatPrice(order.total)}
                    </span>
                    {order.expanded ? <ChevronUp size={20} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={20} style={{ color: 'var(--text-secondary)' }} />}
                  </div>
                </div>

                {/* Expanded Details */}
                {order.expanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '1.5rem', backgroundColor: 'var(--bg)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                      <div>
                        <div style={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>Customer Info</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{order.customer_name}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>{order.customer_email}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>Shipping Address</div>
                        <div style={{ color: 'var(--text-primary)' }}>{order.shipping_address}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>Payment Details</div>
                        <div style={{ color: 'var(--text-primary)' }}>Ref: {order.payment_ref}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>Payment Status: {order.payment_status}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>Tracking Number</div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <input
                            type="text"
                            placeholder="e.g. TCG1234567ZA"
                            value={order.tracking_number || ''}
                            onChange={(e) => handleTrackingChange(order.id, e.target.value)}
                            className="input-field"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8125rem' }}
                          />
                          <button
                            onClick={() => saveTrackingNumber(order.id, order.tracking_number || '')}
                            className="btn btn-outline"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    {order.items && order.items.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ordered Items</div>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                            <thead>
                              <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '0.5rem 0' }}>Product</th>
                                <th style={{ padding: '0.5rem 0' }}>Variant</th>
                                <th style={{ padding: '0.5rem 0' }}>QTY</th>
                                <th style={{ padding: '0.5rem 0' }}>Price</th>
                                <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                  <td style={{ padding: '0.6rem 0', color: 'var(--text-primary)', fontWeight: 700 }}>{item.product_name}</td>
                                  <td style={{ padding: '0.6rem 0', color: 'var(--text-secondary)' }}>{item.variant || 'Standard'}</td>
                                  <td style={{ padding: '0.6rem 0', color: 'var(--text-primary)' }}>{item.quantity}</td>
                                  <td style={{ padding: '0.6rem 0', color: 'var(--text-primary)' }}>{formatPrice(item.price)}</td>
                                  <td style={{ padding: '0.6rem 0', color: 'var(--text-primary)', textAlign: 'right', fontWeight: 700 }}>{formatPrice(item.price * item.quantity)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Actions and Status Select */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Status:</span>
                        <select
                          className="admin-select"
                          value={order.status.toUpperCase()}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          style={{ width: 'auto', minWidth: '10rem' }}
                        >
                          {ORDER_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>

                        <button
                          onClick={() => sendShippingEmail(order)}
                          disabled={sendingEmailId === order.id}
                          className="btn btn-outline"
                          style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          {sendingEmailId === order.id ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Mail size={14} />
                              <span>Send Shipping Email</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                        Total: {formatPrice(order.total)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
