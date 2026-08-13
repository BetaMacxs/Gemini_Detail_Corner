import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Printer, ArrowLeft } from 'lucide-react';
import { storeConfig } from '../../config/store';

interface InvoiceData {
  id: string;
  order_number: string;
  date: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  total: number;
  items: { sr: number; name: string; qty: number; rate: number; amount: number }[];
}

export function AdminInvoices() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoices() {
      setLoading(true);
      try {
        const { data: dbOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        let localOrders: any[] = [];
        try {
          localOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');
        } catch (e) {}

        const list: InvoiceData[] = [];

        if (dbOrders && dbOrders.length > 0) {
          dbOrders.forEach((o) => {
            const total = Number(o.total || 60);
            list.push({
              id: o.id,
              order_number: o.order_number || `DC-${o.id.slice(0, 8)}`,
              date: new Date(o.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              customer_name: o.shipping_address?.firstName ? `${o.shipping_address.firstName} ${o.shipping_address.lastName || ''}` : (o.guest_email?.split('@')[0] || 'Ashley'),
              customer_email: o.guest_email || 'ashley@example.com',
              shipping_address: o.shipping_address ? `${o.shipping_address.address}, ${o.shipping_address.city}` : '10 Station Road, Retreat, Cape Town',
              total,
              items: o.items ? o.items.map((it: any, idx: number) => ({
                sr: idx + 1,
                name: `${it.product_name || 'Product'} ${it.variant ? `- ${it.variant}` : ''}`,
                qty: it.quantity || 1,
                rate: it.price || 30,
                amount: (it.quantity || 1) * (it.price || 30)
              })) : [
                { sr: 1, name: 'Air Freshener - 100ml / Cherry', qty: 2, rate: 30, amount: 60 }
              ]
            });
          });
        }

        localOrders.forEach(l => {
          if (l.order && !list.some(i => i.id === l.order.id)) {
            const total = Number(l.order.total || 60);
            list.push({
              id: l.order.id,
              order_number: l.order.order_number || `DC-${l.order.id.slice(0, 8)}`,
              date: new Date(l.order.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              customer_name: l.order.shipping_address?.firstName ? `${l.order.shipping_address.firstName} ${l.order.shipping_address.lastName || ''}` : 'Ashley',
              customer_email: l.order.shipping_address?.email || 'ashley@example.com',
              shipping_address: l.order.shipping_address ? `${l.order.shipping_address.address}, ${l.order.shipping_address.city}` : '10 Station Road, Retreat, Cape Town',
              total,
              items: l.items ? l.items.map((it: any, idx: number) => ({
                sr: idx + 1,
                name: `${it.product_name || 'Product'} ${it.variant ? `- ${it.variant}` : ''}`,
                qty: it.quantity || 1,
                rate: it.price || 30,
                amount: (it.quantity || 1) * (it.price || 30)
              })) : [{ sr: 1, name: 'Air Freshener - 100ml / Lavender', qty: 2, rate: 30, amount: 60 }]
            });
          }
        });

        if (list.length === 0) {
          list.push({
            id: 'dc-20260810-3',
            order_number: 'DC-20260810-3',
            date: '10 Aug 2026',
            customer_name: 'Ashley',
            customer_email: 'ashley@example.com',
            shipping_address: '10 Station Road, Retreat, Cape Town',
            total: 60,
            items: [
              { sr: 1, name: 'Air Freshener - 100ml / Cherry', qty: 2, rate: 30, amount: 60 }
            ]
          });
          list.push({
            id: 'dc-20260623-1',
            order_number: 'DC-20260623-1',
            date: '23 Jun 2026',
            customer_name: 'Gadjah Khan',
            customer_email: 'khan.gadjah87@gmail.com',
            shipping_address: '10 Station Road, Retreat, Cape Town',
            total: 355,
            items: [
              { sr: 1, name: 'Crystal Gloss 500ml', qty: 1, rate: 150, amount: 150 },
              { sr: 2, name: 'Clay Bar Kit', qty: 1, rate: 105, amount: 105 },
              { sr: 3, name: 'Clear Tyre Shine', qty: 1, rate: 100, amount: 100 }
            ]
          });
        }

        setInvoices(list);
      } catch (e) {
        console.error("Error loading invoices:", e);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price);
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.order_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  // Tax Calculations
  const grandTotal = selectedInvoice ? selectedInvoice.total : 0;
  const taxable = (grandTotal / 1.15);
  const vatAmount = grandTotal - taxable;

  return (
    <div>
      {/* List View */}
      {!selectedInvoice ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#f3f4f6' }}>
              Invoices
            </h1>

            <div style={{ position: 'relative', width: '18rem' }}>
              <Search className="h-4 w-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search by customer..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 2.25rem',
                  backgroundColor: '#222222',
                  border: '1px solid #333333',
                  borderRadius: '9999px',
                  color: '#ffffff',
                  fontSize: '0.8125rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredInvoices.map(inv => (
              <div
                key={inv.id}
                onClick={() => setSelectedInvoice(inv)}
                style={{
                  backgroundColor: '#1f1f1f',
                  border: '1px solid #2e2e2e',
                  borderRadius: '0.5rem',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                    {inv.order_number}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: '0.15rem' }}>
                    {inv.customer_name} - {inv.date}
                  </div>
                </div>

                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                  {formatPrice(inv.total)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Printable Detail View */
        <div>
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button
              onClick={() => setSelectedInvoice(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#9ca3af',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft className="h-4 w-4" /> Back to Invoices
            </button>

            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.25rem',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.375rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <Printer className="h-4 w-4" /> Print
            </button>
          </div>

          {/* Printable White Paper Container */}
          <div
            id="printable-invoice"
            style={{
              backgroundColor: '#ffffff',
              color: '#111827',
              borderRadius: '0.5rem',
              padding: '2.5rem',
              maxWidth: '52rem',
              margin: '0 auto',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            {/* Top Logo & Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e5e7eb', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#dc2626', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🏁 DETAIL CORNER</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#4b5563', marginTop: '0.35rem' }}>
                  10 Station Road, Retreat, Cape Town<br />
                  Phone: 082 898 6893<br />
                  Email: khangadijah87@gmail.com<br />
                  VAT Registration No: 9248783244
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                  INVOICE
                </h2>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4b5563', marginTop: '0.25rem' }}>
                  {selectedInvoice.order_number}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.15rem' }}>
                  Date: {selectedInvoice.date}
                </div>
              </div>
            </div>

            {/* Bill To / Ship To */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', fontSize: '0.875rem' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#374151', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Bill To</div>
                <div style={{ fontWeight: 700, color: '#111827' }}>{selectedInvoice.customer_name}</div>
                <div style={{ color: '#4b5563' }}>{selectedInvoice.customer_email}</div>
              </div>

              <div>
                <div style={{ fontWeight: 700, color: '#374151', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Ship To</div>
                <div style={{ color: '#4b5563' }}>{selectedInvoice.shipping_address}</div>
              </div>
            </div>

            {/* Line Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #d1d5db', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 700, width: '3rem' }}>Sr</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 700 }}>Product</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 700, textAlign: 'center', width: '4rem' }}>Qty</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 700, textAlign: 'right', width: '6rem' }}>Rate</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 700, textAlign: 'right', width: '7rem' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items.map((item) => (
                  <tr key={item.sr} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', color: '#4b5563' }}>{item.sr}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#111827' }}>{item.name}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#111827' }}>{item.qty}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#111827' }}>{formatPrice(item.rate)}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#111827' }}>{formatPrice(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2.5rem' }}>
              <div style={{ width: '18rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                  <span>Amount Inc. Tax:</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{formatPrice(grandTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: '0.8125rem' }}>
                  <span>* Taxable:</span>
                  <span>{formatPrice(taxable)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: '0.8125rem' }}>
                  <span>* (+) VAT 15.00%:</span>
                  <span>{formatPrice(vatAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #111827', paddingTop: '0.5rem', fontWeight: 800, fontSize: '1rem', color: '#111827' }}>
                  <span>Grand Total:</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', fontWeight: 700 }}>
                  <span>Balance:</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
              <div>
                <div style={{ fontFamily: 'cursive', fontSize: '1.25rem', color: '#dc2626' }}>Gadjah Signature</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Authorized Signature</div>
              </div>

              {/* Bank Details Footer Table */}
              <div style={{ fontSize: '0.75rem', color: '#374151', border: '1px solid #d1d5db', padding: '0.75rem 1rem', borderRadius: '0.375rem', backgroundColor: '#f9fafb' }}>
                <div><strong>Payable To:</strong> Detail Corner</div>
                <div><strong>Banking Details:</strong> 1053564880</div>
                <div><strong>Other Details:</strong> Capitec Business Account</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
