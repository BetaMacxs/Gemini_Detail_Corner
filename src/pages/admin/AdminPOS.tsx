import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { storeConfig } from '../../config/store';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Search, CreditCard, UserCheck, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminNav } from '../../components/AdminNav';
import { toast } from '../../features/toast/store';

interface POSProduct {
  id: string;
  product_id: string;
  variant_id: string | null;
  name: string;
  base_name: string;
  variant_name: string | null;
  sku: string;
  price: number;
  stock_quantity: number;
}

interface POSCartItem {
  product: POSProduct;
  quantity: number;
}

export function AdminPOS() {
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerEmail, setCustomerEmail] = useState('pos@detailcorner.co.za');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'EFT'>('CARD');
  const [processing, setProcessing] = useState(false);
  const [completedOrderNum, setCompletedOrderNum] = useState<string | null>(null);
  
  const [lastOrder, setLastOrder] = useState<{
    orderNum: string;
    items: POSCartItem[];
    subtotal: number;
    total: number;
    paymentMethod: string;
    date: string;
    customerName: string;
  } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, name, sku, price, stock_quantity,
          variants:product_variants (id, name, sku, price, stock_quantity, active)
        `)
        .order('name');

      if (!error && data) {
        const sellableItems: POSProduct[] = [];
        data.forEach(p => {
          const activeVariants = p.variants?.filter((v: any) => v.active) || [];
          if (activeVariants.length > 0) {
            activeVariants.forEach((v: any) => {
               sellableItems.push({
                 id: v.id,
                 product_id: p.id,
                 variant_id: v.id,
                 name: `${p.name} - ${v.name}`,
                 base_name: p.name,
                 variant_name: v.name,
                 sku: v.sku || `${p.sku || ''}-${v.name.substring(0,3).toUpperCase()}`,
                 price: Number(v.price || p.price || 0),
                 stock_quantity: v.stock_quantity ?? 0,
               });
            });
          } else {
             sellableItems.push({
                 id: p.id,
                 product_id: p.id,
                 variant_id: null,
                 name: p.name,
                 base_name: p.name,
                 variant_name: null,
                 sku: p.sku || p.id.slice(0, 8),
                 price: Number(p.price || 0),
                 stock_quantity: p.stock_quantity ?? 0,
             });
          }
        });
        setProducts(sellableItems);
      } else {
        setProducts([]);
      }
    } catch (e) {
      console.error("POS fetch products error:", e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const addToCart = (product: POSProduct) => {
    if (product.stock_quantity <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) return prev; // stock limit
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock_quantity) return item; // stock limit
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as POSCartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setProcessing(true);

    const subtotal = calculateSubtotal();
    const total = subtotal;
    
    let orderNumber;
    try {
      const { data: generatedOrderNumber, error: generateError } = await supabase.rpc('generate_pos_order_number');
      if (generateError || !generatedOrderNumber) {
        throw generateError || new Error('No order number returned');
      }
      orderNumber = generatedOrderNumber;
    } catch (err) {
      console.warn('Failed to generate POS secure order number, falling back:', err);
      const today = new Date();
      const dateStr = today.getFullYear().toString() + 
                      (today.getMonth() + 1).toString().padStart(2, '0') + 
                      today.getDate().toString().padStart(2, '0');
      const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      orderNumber = `POS-${dateStr}-${randomSuffix}`;
    }

    const newOrder = {
      order_number: orderNumber,
      customer_id: null,
      email: customerEmail,
      customer_name: customerName,
      phone: storeConfig.CONTACT_PHONE || '0000000000',
      billing_information: {
        firstName: customerName,
        lastName: '(POS Walk-in)',
        address: storeConfig.STORE_ADDR || 'In store sale',
        city: storeConfig.STORE_CITY || 'Cape Town',
        postalCode: storeConfig.STORE_POSTAL || '8001',
        email: customerEmail
      },
      shipping_information: {
        firstName: customerName,
        lastName: '(POS Walk-in)',
        address: storeConfig.STORE_ADDR || 'In store sale',
        city: storeConfig.STORE_CITY || 'Cape Town',
        postalCode: storeConfig.STORE_POSTAL || '8001',
        email: customerEmail
      },
      subtotal,
      shipping_amount: 0,
      total,
      currency: storeConfig.STORE_CURRENCY || 'ZAR',
      status: 'PENDING_PAYMENT',
      payment_status: 'PENDING',
      notes: `POS In-Store Checkout (${paymentMethod})`,
      created_at: new Date().toISOString()
    };

    try {
      const { data: dbOrder, error: orderErr } = await supabase
        .from('orders')
        .insert([newOrder])
        .select()
        .single();

      if (!orderErr && dbOrder) {
        const orderItemsList = cart.map(item => ({
          order_id: dbOrder.id,
          product_id: item.product.product_id,
          variant_id: item.product.variant_id,
          product_name_snapshot: item.product.base_name,
          variant_snapshot: item.product.variant_name,
          sku_snapshot: item.product.sku,
          quantity: item.quantity,
          unit_price: item.product.price,
          total: item.product.price * item.quantity
        }));

        await supabase.from('order_items').insert(orderItemsList);

        // Update order status to PAID - this triggers on_order_paid_deduct_stock atomically
        await supabase.from('orders').update({
          status: 'PAID',
          payment_status: 'PAID',
          updated_at: new Date().toISOString()
        }).eq('id', dbOrder.id);

        await supabase.from('payments').insert({
          order_id: dbOrder.id,
          provider: 'POS',
          amount: total,
          currency: storeConfig.STORE_CURRENCY || 'ZAR',
          status: 'PAID'
        });
        
        await supabase.from('order_status_history').insert({
          order_id: dbOrder.id,
          previous_status: 'PENDING_PAYMENT',
          new_status: 'PAID',
          reason: 'POS Sale Completed'
        });
      }
    } catch (e) {
      console.warn("POS checkout error:", e);
    }

    setLastOrder({
      orderNum: orderNumber,
      items: [...cart],
      subtotal,
      total,
      paymentMethod,
      date: new Date().toLocaleString(),
      customerName
    });
    setCompletedOrderNum(orderNumber);
    setCart([]);
    setProcessing(false);
    fetchProducts();
    toast.success('POS Sale Completed', `Order #${orderNumber} processed successfully.`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price || 0);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrint = () => {
    const printContent = document.getElementById('print-receipt-area');
    if (!printContent) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.write(`
        <html>
          <head>
            <title>POS Receipt</title>
            <style>
              body { font-family: monospace; background-color: white; color: black; padding: 10px; margin: 0; width: 100%; max-width: 320px; }
              @media print {
                @page { margin: 0; size: 80mm auto; }
                body { padding: 0; }
                #print-receipt-area { box-shadow: none !important; margin: 0 !important; padding: 5mm !important; }
              }
            </style>
          </head>
          <body>
            ${printContent.outerHTML}
          </body>
        </html>
      `);
      doc.close();
      
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 2000);
      }, 100);
    }
  };

  return (
    <div className="container page-container">
      {lastOrder && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="brand-card" style={{ backgroundColor: 'var(--bg)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div id="print-receipt-area" style={{ backgroundColor: 'white', padding: '1.25rem', margin: '0 auto', width: '100%', maxWidth: '320px', color: 'black', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.4', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase' }}>{storeConfig.STORE_NAME || 'Detail Corner'}</h2>
                <div style={{ fontSize: '12px' }}>
                  <p style={{ margin: 0 }}>{storeConfig.STORE_ADDR || 'Store Address'}</p>
                  <p style={{ margin: 0 }}>{storeConfig.STORE_CITY || 'City'}, {storeConfig.STORE_POSTAL || '0000'}</p>
                  <p style={{ margin: 0 }}>Tel: {storeConfig.CONTACT_PHONE || '000 000 0000'}</p>
                  <p style={{ margin: 0 }}>{storeConfig.STORE_EMAIL || 'info@detailcorner.co.za'}</p>
                </div>
              </div>
              
              <div style={{ borderBottom: '1px dashed black', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontSize: '12px' }}>
                <p style={{ margin: 0 }}>Sale #: {lastOrder.orderNum}</p>
                <p style={{ margin: 0 }}>Date: {lastOrder.date}</p>
                <p style={{ margin: 0 }}>Cashier: {storeConfig.STORE_NAME || 'Admin'}</p>
                <p style={{ margin: 0 }}>Customer: {lastOrder.customerName}</p>
              </div>
              
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderBottom: '1px dashed black', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
                  <span style={{ flex: 2, textAlign: 'left' }}>Item</span>
                  <span style={{ flex: 1, textAlign: 'center' }}>Qty</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>Price</span>
                </div>
                {lastOrder.items.map((item, idx) => (
                   <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', alignItems: 'flex-start' }}>
                     <span style={{ flex: 2, paddingRight: '0.5rem', textAlign: 'left', wordBreak: 'break-word' }}>{item.product.name}</span>
                     <span style={{ flex: 1, textAlign: 'center' }}>{item.quantity}</span>
                     <span style={{ flex: 1, textAlign: 'right' }}>{formatPrice(item.product.price * item.quantity)}</span>
                   </div>
                ))}
              </div>
              
              <div style={{ borderTop: '1px dashed black', paddingTop: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Subtotal:</span>
                  <span>{formatPrice(lastOrder.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', marginTop: '0.25rem' }}>
                  <span>TOTAL:</span>
                  <span>{formatPrice(lastOrder.total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span>Payment:</span>
                  <span>{lastOrder.paymentMethod}</span>
                </div>
              </div>
              
              <div style={{ textAlign: 'center', borderTop: '1px dashed black', paddingTop: '1rem' }}>
                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>THANK YOU</p>
                <p style={{ margin: 0, fontSize: '12px' }}>Please retain receipt for returns</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={16} /> Print Receipt
              </button>
              <button onClick={() => setLastOrder(null)} className="btn btn-outline" style={{ flex: 1 }}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Point of <span style={{ color: 'var(--accent)' }}>Sale (POS)</span>
            </h1>
            <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Process in-store counter orders instantly with automatic inventory deduction.
            </p>
          </div>
        </div>

        <AdminNav />

        {completedOrderNum && !lastOrder && (
          <div className="brand-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', borderLeft: '4px solid #22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={20} style={{ color: '#22c55e' }} />
              <div>
                <div style={{ fontWeight: 800, color: '#22c55e', fontSize: '0.9375rem' }}>Sale Completed Successfully!</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Order reference: {completedOrderNum}</div>
              </div>
            </div>
            <button onClick={() => setCompletedOrderNum(null)} className="btn btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}>Dismiss</button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.8fr) minmax(300px, 1.2fr)', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Column: Product Selection Grid */}
          <div>
            <div className="admin-search-wrapper" style={{ marginBottom: '1.25rem' }}>
              <Search size={16} className="admin-search-icon" />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search POS catalogue by name or SKU..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="brand-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Loading catalogue products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="brand-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No active products or variants available in database matching your search.
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {currentProducts.map(p => {
                    const isOutOfStock = p.stock_quantity <= 0;
                    return (
                      <div
                        key={p.id}
                        className="brand-card"
                        style={{
                          padding: '1.25rem',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          flexDirection: 'column',
                          justify: 'space-between',
                          height: '100%',
                          opacity: isOutOfStock ? 0.6 : 1
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{p.sku}</span>
                          <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem', marginBottom: '0.2rem' }}>{p.base_name}</h4>
                          {p.variant_name && <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '0.5rem', fontWeight: 600 }}>{p.variant_name}</div>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                          <div>
                            <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>{formatPrice(p.price)}</div>
                            <div style={{ fontSize: '0.75rem', color: isOutOfStock ? '#ef4444' : p.stock_quantity <= 2 ? '#f59e0b' : 'var(--text-secondary)', fontWeight: isOutOfStock ? 700 : 400 }}>
                              {isOutOfStock ? 'Out of Stock' : `Stock: ${p.stock_quantity}`}
                            </div>
                          </div>
                          <button
                            onClick={() => addToCart(p)}
                            disabled={isOutOfStock}
                            className="btn btn-primary"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Plus size={12} /> Add
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1.5rem', gap: '1rem' }}>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Page {currentPage} of {totalPages}</span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column: Counter Cart */}
          <div className="brand-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                Counter Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h3>
            </div>

            {cart.length === 0 ? (
              <div style={{ padding: 'var(--spacing-page-y) var(--spacing-container-px)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Select products from the catalogue on the left to begin counter sale.
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', maxHeight: '20rem', overflowY: 'auto' }}>
                  {cart.map(item => (
                    <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg)' }}>
                      <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {item.product.base_name}
                        </div>
                        {item.product.variant_name && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                            {item.product.variant_name}
                          </div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatPrice(item.product.price)} each</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => updateQuantity(item.product.id, -1)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.25rem' }}>
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, width: '1.5rem', textAlign: 'center' }}>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, 1)} 
                          disabled={item.quantity >= item.product.stock_quantity}
                          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: item.quantity >= item.product.stock_quantity ? 'var(--border)' : 'var(--text-primary)', cursor: item.quantity >= item.product.stock_quantity ? 'not-allowed' : 'pointer', padding: '0.25rem' }}
                        >
                          <Plus size={12} />
                        </button>
                        <button onClick={() => removeFromCart(item.product.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: '0.25rem' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <div className="admin-form-group">
                    <label className="admin-label">Customer Name</label>
                    <input type="text" className="admin-input" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Payment Method</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      {(['CARD', 'CASH', 'EFT'] as const).map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`btn ${paymentMethod === m ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '0.4rem', fontSize: '0.75rem' }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Total & Checkout Button */}
                <div style={{ borderTop: '2px solid var(--border)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Total Due:</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{formatPrice(calculateSubtotal())}</span>
                  </div>

                  <button
                    disabled={processing}
                    onClick={handleCompleteSale}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.85rem', fontSize: '0.9375rem', fontWeight: 800, textTransform: 'uppercase' }}
                  >
                    {processing ? 'Processing Sale...' : 'Complete Walk-in Sale'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
