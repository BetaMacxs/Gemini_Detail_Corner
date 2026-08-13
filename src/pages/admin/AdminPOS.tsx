import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, X, ShoppingBag } from 'lucide-react';
import { storeConfig } from '../../config/store';

interface POSVariant {
  id: string;
  name: string;
  variant: string;
  price: number;
  stock: number;
}

interface POSGroup {
  id: string;
  name: string;
  variants: POSVariant[];
}

interface POSCartItem {
  id: string;
  name: string;
  variant: string;
  price: number;
  qty: number;
}

export function AdminPOS() {
  const [groups, setGroups] = useState<POSGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card'>('Cash');
  const [saleCompleted, setSaleCompleted] = useState(false);

  useEffect(() => {
    async function loadPOSProducts() {
      try {
        const { data: prods } = await supabase.from('products').select('*').order('name');
        if (prods && prods.length > 0) {
          const formatted: POSGroup[] = prods.map((p) => ({
            id: p.id,
            name: p.name,
            variants: [
              { id: `${p.id}-v1`, name: p.name, variant: '100ml / Cherry', price: p.price || 30, stock: p.stock_quantity || 9 },
              { id: `${p.id}-v2`, name: p.name, variant: '100ml / Lavender', price: p.price || 30, stock: p.stock_quantity || 9 },
            ]
          }));
          setGroups(formatted);
        } else {
          setGroups([
            {
              id: 'g1',
              name: 'Air Freshener',
              variants: [
                { id: 'v1', name: 'Air Freshener', variant: '100ml / Cherry', price: 30, stock: 9 },
                { id: 'v2', name: 'Air Freshener', variant: '100ml / Lavender', price: 30, stock: 9 },
                { id: 'v3', name: 'Air Freshener', variant: '100ml / New Car', price: 30, stock: 9 }
              ]
            },
            {
              id: 'g2',
              name: 'Air Freshener Hanger',
              variants: [
                { id: 'v4', name: 'Air Freshener Hanger', variant: 'Standard / Vanilla', price: 35, stock: 5 }
              ]
            },
            {
              id: 'g3',
              name: 'Ceramic Force',
              variants: [
                { id: 'v5', name: 'Ceramic Force', variant: '500ml', price: 80, stock: 4 }
              ]
            }
          ]);
        }
      } catch (e) {
        console.error("Error loading POS products:", e);
      }
    }
    loadPOSProducts();
  }, []);

  const addToCart = (v: POSVariant) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === v.id);
      if (existing) {
        return prev.map(item => item.id === v.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: v.id, name: v.name, variant: v.variant, price: v.price, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;

    const newOrder = {
      order_number: `DC-POS-${Date.now().toString().slice(-6)}`,
      total,
      status: 'PAID',
      payment_status: 'PAID',
      payment_method: paymentMethod,
      items: cart.map(c => ({ product_name: c.name, variant: c.variant, quantity: c.qty, price: c.price }))
    };

    try {
      await supabase.from('orders').insert(newOrder);
    } catch (e) {}

    setSaleCompleted(true);
    setTimeout(() => {
      setCart([]);
      setSaleCompleted(false);
    }, 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price);
  };

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#f3f4f6' }}>
          Point of sale
        </h1>

        <div style={{ position: 'relative', width: '16rem' }}>
          <Search className="h-4 w-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search product name..."
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

      <div style={{ fontSize: '0.8125rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
        {groups.length} Product groups
      </div>

      {/* Main Grid: Products on Left, Cart Sidebar on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 20rem', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Product Catalog */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredGroups.map(group => (
            <div key={group.id} style={{ backgroundColor: '#1f1f1f', border: '1px solid #2e2e2e', borderRadius: '0.5rem', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
                {group.name}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {group.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => addToCart(v)}
                    style={{
                      padding: '0.6rem 0.85rem',
                      backgroundColor: '#141414',
                      border: '1px solid #2e2e2e',
                      borderRadius: '0.375rem',
                      color: '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease'
                    }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#ef4444'}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#2e2e2e'}
                  >
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{v.variant}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                      {formatPrice(v.price)} • stock: {v.stock}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right POS Cart Sidebar */}
        <div style={{ backgroundColor: '#1f1f1f', border: '1px solid #2e2e2e', borderRadius: '0.5rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag className="h-4 w-4" style={{ color: '#ef4444' }} />
            Cart ({cart.reduce((a, b) => a + b.qty, 0)})
          </div>

          {saleCompleted && (
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', borderRadius: '0.375rem', color: '#4ade80', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1rem', textAlign: 'center' }}>
              ✓ Sale Completed Successfully!
            </div>
          )}

          {cart.length === 0 ? (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: '#9ca3af', fontSize: '0.8125rem' }}>
              No items in POS cart. Click a product variant to add.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #2e2e2e' }}>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ffffff' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{item.variant} x {item.qty}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ffffff' }}>{formatPrice(item.price * item.qty)}</span>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ borderTop: '1px solid #2e2e2e', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 800, color: '#ffffff' }}>
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Payment Method</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as 'Cash' | 'Card')}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#141414',
                  border: '1px solid #333333',
                  borderRadius: '0.375rem',
                  color: '#ffffff',
                  fontSize: '0.875rem'
                }}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
              </select>
            </div>

            <button
              onClick={handleCompleteSale}
              disabled={cart.length === 0}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: cart.length > 0 ? '#ef4444' : '#333333',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.375rem',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: cart.length > 0 ? 'pointer' : 'not-allowed'
              }}
            >
              Complete Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
