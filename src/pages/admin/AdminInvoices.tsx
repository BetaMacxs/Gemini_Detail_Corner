import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { storeConfig } from '../../config/store';
import { FileText, Printer, Search, Download } from 'lucide-react';
import { AdminNav } from '../../components/AdminNav';

interface InvoiceOrder {
  id: string;
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  subtotal: number;
  shipping_total: number;
  vat_amount: number;
  total: number;
  shipping_address?: any;
  items?: any[];
}

export function AdminInvoices() {
  const [orders, setOrders] = useState<InvoiceOrder[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data: dbOrders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      let localOrders: any[] = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');
      } catch (e) {}

      const combined: InvoiceOrder[] = [];

      if (!error && dbOrders && dbOrders.length > 0) {
        dbOrders.forEach(o => {
          let customerName = 'Valued Customer';
          if (o.shipping_address?.firstName) {
            customerName = `${o.shipping_address.firstName} ${o.shipping_address.lastName || ''}`.trim();
          } else if (o.guest_email) {
            customerName = o.guest_email.split('@')[0];
          }

          const tot = Number(o.total || 0);
          const sub = Number(o.subtotal || tot * 0.85);
          const ship = Number(o.shipping_total || 0);
          const vat = Math.round((tot * 15 / 115) * 100) / 100;

          combined.push({
            id: o.id,
            order_number: o.order_number || `INV-${o.id.slice(0, 8)}`,
            created_at: o.created_at || new Date().toISOString(),
            customer_name: customerName,
            customer_email: o.guest_email || o.shipping_address?.email || 'N/A',
            subtotal: sub,
            shipping_total: ship,
            vat_amount: vat,
            total: tot,
            shipping_address: o.shipping_address,
            items: o.items || []
          });
        });
      }

      localOrders.forEach(l => {
        if (l.order && !combined.some(c => c.id === l.order.id)) {
          const tot = Number(l.order.total || 0);
          const vat = Math.round((tot * 15 / 115) * 100) / 100;

          combined.push({
            id: l.order.id,
            order_number: l.order.order_number || `INV-LOCAL-${l.order.id.slice(0, 6)}`,
            created_at: l.order.created_at || new Date().toISOString(),
            customer_name: l.order.shipping_address?.firstName ? `${l.order.shipping_address.firstName} ${l.order.shipping_address.lastName || ''}` : 'Guest User',
            customer_email: l.order.shipping_address?.email || 'N/A',
            subtotal: Number(l.order.subtotal || tot * 0.85),
            shipping_total: Number(l.order.shipping_total || 0),
            vat_amount: vat,
            total: tot,
            shipping_address: l.order.shipping_address,
            items: l.items || []
          });
        }
      });

      setOrders(combined);
      if (combined.length > 0) {
        setSelectedInvoice(combined[0]);
      }
    } catch (e) {
      console.error("Error loading invoice orders:", e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredOrders = orders.filter(o => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(term) ||
      o.customer_name.toLowerCase().includes(term) ||
      o.customer_email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Tax <span style={{ color: 'var(--accent)' }}>Invoices</span>
          </h1>
          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Compliant South African 15% VAT Tax Invoices generated from real order records.
          </p>
        </div>
      </div>

      <AdminNav />

      {loading ? (
        <div className="brand-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading tax invoices...
        </div>
      ) : orders.length === 0 ? (
        <div className="brand-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No orders available in database to generate tax invoices.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Column: Order Selector */}
          <div className="brand-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <Search className="h-4 w-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="auth-input"
                style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '32rem', overflowY: 'auto' }}>
              {filteredOrders.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;
                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'var(--accent-glow)' : 'var(--bg)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{inv.order_number}</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--accent)' }}>{formatPrice(inv.total)}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {inv.customer_name} • {new Date(inv.created_at).toLocaleDateString('en-ZA')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Tax Invoice Document Preview */}
          {selectedInvoice && (
            <div className="brand-card" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tax Invoice Preview</span>
                <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Printer className="h-4 w-4" /> Print / PDF Invoice
                </button>
              </div>

              {/* Printable Area */}
              <div id="tax-invoice-sheet" style={{ backgroundColor: '#ffffff', color: '#111827', padding: '2rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb', fontFamily: 'sans-serif' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #111827', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#111827', margin: 0 }}>{storeConfig.STORE_NAME}</h2>
                    <p style={{ fontSize: '0.8125rem', color: '#4b5563', margin: '0.25rem 0 0 0' }}>{storeConfig.STORE_DESCRIPTION}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>VAT Reg #: ZA4820193847</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ef4444', margin: 0 }}>TAX INVOICE</h1>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827', margin: '0.25rem 0 0 0' }}>{selectedInvoice.order_number}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>Date: {new Date(selectedInvoice.created_at).toLocaleDateString('en-ZA')}</p>
                  </div>
                </div>

                {/* Billed To */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.8125rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 800, textTransform: 'uppercase', color: '#6b7280', fontSize: '0.75rem', margin: '0 0 0.5rem 0' }}>Billed To (Customer):</h4>
                    <p style={{ fontWeight: 700, margin: 0 }}>{selectedInvoice.customer_name}</p>
                    <p style={{ margin: '0.2rem 0', color: '#4b5563' }}>{selectedInvoice.customer_email}</p>
                    {selectedInvoice.shipping_address && (
                      <p style={{ margin: 0, color: '#4b5563' }}>
                        {typeof selectedInvoice.shipping_address === 'string'
                          ? selectedInvoice.shipping_address
                          : `${selectedInvoice.shipping_address.address || ''}, ${selectedInvoice.shipping_address.city || ''}, ${selectedInvoice.shipping_address.postalCode || ''}`}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h4 style={{ fontWeight: 800, textTransform: 'uppercase', color: '#6b7280', fontSize: '0.75rem', margin: '0 0 0.5rem 0' }}>Merchant Info:</h4>
                    <p style={{ fontWeight: 700, margin: 0 }}>Detailing Store RSA</p>
                    <p style={{ margin: '0.2rem 0', color: '#4b5563' }}>Johannesburg, South Africa</p>
                    <p style={{ margin: 0, color: '#4b5563' }}>support@detailing.co.za</p>
                  </div>
                </div>

                {/* Line Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem', marginBottom: '1.5rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #d1d5db' }}>
                      <th style={{ padding: '0.6rem', color: '#374151', fontWeight: 800 }}>Description</th>
                      <th style={{ padding: '0.6rem', color: '#374151', fontWeight: 800 }}>Qty</th>
                      <th style={{ padding: '0.6rem', color: '#374151', fontWeight: 800 }}>Unit Price</th>
                      <th style={{ padding: '0.6rem', color: '#374151', fontWeight: 800, textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '0.6rem', fontWeight: 600 }}>{item.product_name || 'Detailing Product'}</td>
                          <td style={{ padding: '0.6rem' }}>{item.quantity || 1}</td>
                          <td style={{ padding: '0.6rem' }}>{formatPrice(item.price || 0)}</td>
                          <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 700 }}>{formatPrice((item.price || 0) * (item.quantity || 1))}</td>
                        </tr>
                      ))
                    ) : (
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.6rem', fontWeight: 600 }}>Detailing Products Order</td>
                        <td style={{ padding: '0.6rem' }}>1</td>
                        <td style={{ padding: '0.6rem' }}>{formatPrice(selectedInvoice.total - selectedInvoice.shipping_total)}</td>
                        <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 700 }}>{formatPrice(selectedInvoice.total - selectedInvoice.shipping_total)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Totals Breakdown */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid #111827', paddingTop: '1rem', fontSize: '0.875rem' }}>
                  <div style={{ width: '16rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                      <span>Subtotal (Excl. VAT):</span>
                      <span>{formatPrice(selectedInvoice.total - selectedInvoice.vat_amount - selectedInvoice.shipping_total)}</span>
                    </div>
                    {selectedInvoice.shipping_total > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                        <span>Courier Shipping:</span>
                        <span>{formatPrice(selectedInvoice.shipping_total)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                      <span>VAT (15% Included):</span>
                      <span>{formatPrice(selectedInvoice.vat_amount)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, color: '#111827', fontSize: '1.125rem', borderTop: '1px solid #d1d5db', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                      <span>Total (Incl. VAT):</span>
                      <span>{formatPrice(selectedInvoice.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280', borderTop: '1px dashed #d1d5db', paddingTop: '1rem' }}>
                  Thank you for shopping with {storeConfig.STORE_NAME}. All prices include 15% South African Value Added Tax (VAT).
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
