import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { storeConfig } from '../../config/store';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Search, CreditCard, UserCheck } from 'lucide-react';
import { AdminNav } from '../../components/AdminNav';

interface POSProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  category?: string;
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
  const [customerEmail, setCustomerEmail] = useState('pos@counter.local');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'EFT'>('CARD');
  const [processing, setProcessing] = useState(false);
  const [completedOrderNum, setCompletedOrderNum] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, price, stock_quantity')
        .order('name');

      if (!error && data) {
        setProducts(data.map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku || p.id.slice(0, 8),
          price: Number(p.price || 0),
          stock_quantity: p.stock_quantity ?? 0
        })));
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

  const addToCart = (product: POSProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
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
    const orderNum = `POS-${Date.now().toString().slice(-6)}`;

    const newOrder = {
      order_number: orderNum,
      guest_email: customerEmail,
      shipping_address: {
        firstName: customerName,
        lastName: '(POS Walk-in)',
        address: 'Over-the-Counter Store Pick',
        city: 'Johannesburg',
        postalCode: '2000',
        email: customerEmail
      },
      subtotal,
      shipping_total: 0,
      tax_total: Math.round((total * 15 / 115) * 100) / 100,
      total,
      status: 'PAID',
      payment_status: 'PAID',
      payment_method: paymentMethod,
      items: cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('orders').insert([newOrder]);

      // Decrement stock in database
      for (const item of cart) {
        const newStock = Math.max(0, item.product.stock_quantity - item.quantity);
        await supabase.from('products').update({ stock_quantity: newStock }).eq('id', item.product.id);
      }
    } catch (e) {
      console.warn("POS checkout error:", e);
    }

    setCompletedOrderNum(orderNum);
    setCart([]);
    setProcessing(false);
    fetchProducts();
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

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
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

      {completedOrderNum && (
        <div className="brand-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', borderLeft: '4px solid #22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 className="h-5 w-5" style={{ color: '#22c55e' }} />
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
          <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
            <Search className="h-4 w-4" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search POS catalogue by name or SKU..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="auth-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {loading ? (
            <div className="brand-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading catalogue products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="brand-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No active products available in database.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {filteredProducts.map(p => (
                <div
                  key={p.id}
                  className="brand-card"
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    height: '100%'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{p.sku}</span>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem', marginBottom: '0.5rem' }}>{p.name}</h4>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>{formatPrice(p.price)}</div>
                      <div style={{ fontSize: '0.75rem', color: p.stock_quantity <= 2 ? '#ef4444' : 'var(--text-secondary)' }}>Stock: {p.stock_quantity}</div>
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Select products from the catalogue on the left to begin counter sale.
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', maxHeight: '20rem', overflowY: 'auto' }}>
                {cart.map(item => (
                  <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg)' }}>
                    <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.product.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatPrice(item.product.price)} each</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button onClick={() => updateQuantity(item.product.id, -1)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.25rem' }}>
                        <Minus className="h-3 w-3" />
                      </button>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, width: '1.5rem', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, 1)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.25rem' }}>
                        <Plus className="h-3 w-3" />
                      </button>
                      <button onClick={() => removeFromCart(item.product.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: '0.25rem' }}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Customer Name</label>
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="auth-input" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Payment Method</label>
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
  );
}
