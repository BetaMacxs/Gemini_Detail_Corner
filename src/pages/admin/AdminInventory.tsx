import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { storeConfig } from '../../config/store';
import { Package, AlertTriangle, RefreshCw, Save } from 'lucide-react';

interface ProductInventory {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  low_stock_threshold: number;
  price: number;
  active: boolean;
}

export function AdminInventory() {
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editedQuantities, setEditedQuantities] = useState<Record<string, number>>({});
  const [filterLowStock, setFilterLowStock] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    let items: ProductInventory[] = [];

    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, stock_quantity, low_stock_threshold, price, active')
        .order('name');

      if (!error && data) {
        items = data.map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku || p.id.slice(0, 8),
          stock_quantity: p.stock_quantity ?? 10,
          low_stock_threshold: p.low_stock_threshold ?? 5,
          price: p.price ?? 0,
          active: p.active ?? true
        }));
      }
    } catch (err) {
      console.warn("Failed to fetch inventory from DB:", err);
    }

    if (items.length === 0) {
      // Fallback local products
      items = [
        { id: 'p1', name: 'Milky Tyre Shine 500ml', sku: 'TYRE-MILK-500', stock_quantity: 15, low_stock_threshold: 5, price: 55, active: true },
        { id: 'p2', name: 'Clear Tyre Shine 500ml', sku: 'TYRE-CLEAR-500', stock_quantity: 3, low_stock_threshold: 5, price: 85, active: true },
        { id: 'p3', name: 'Quick Detail Spray 500ml', sku: 'QUICK-DET-500', stock_quantity: 22, low_stock_threshold: 5, price: 70, active: true },
        { id: 'p4', name: 'Ceramic Force Coating 250ml', sku: 'CERAMIC-250', stock_quantity: 2, low_stock_threshold: 5, price: 120, active: true },
        { id: 'p5', name: 'Hyper Foam Shampoo 1L', sku: 'FOAM-1L', stock_quantity: 40, low_stock_threshold: 10, price: 70, active: true },
      ];
    }

    setProducts(items);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (id: string, val: number) => {
    setEditedQuantities(prev => ({ ...prev, [id]: val }));
  };

  const handleSaveStock = async (id: string) => {
    const newQty = editedQuantities[id];
    if (newQty === undefined) return;

    setSavingId(id);
    try {
      await supabase.from('products').update({ stock_quantity: newQty }).eq('id', id);
    } catch (e) {
      console.warn("Stock update warning:", e);
    }

    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_quantity: newQty } : p));
    setSavingId(null);
  };

  const displayedProducts = filterLowStock
    ? products.filter(p => p.stock_quantity <= p.low_stock_threshold)
    : products;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '16rem' }}>
        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', borderBottom: '2px solid var(--accent)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Inventory <span style={{ color: 'var(--accent)' }}>Management</span>
          </h1>
          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Monitor and update real-time stock levels across products.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`btn ${filterLowStock ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Low Stock Alerts ({products.filter(p => p.stock_quantity <= p.low_stock_threshold).length})</span>
          </button>
          <button
            onClick={fetchInventory}
            className="btn btn-outline"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="brand-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg)' }}>
              <tr>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Product</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>SKU</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current Stock</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.map((p) => {
                const currentQty = editedQuantities[p.id] !== undefined ? editedQuantities[p.id] : p.stock_quantity;
                const isLow = currentQty <= p.low_stock_threshold;
                const isDirty = editedQuantities[p.id] !== undefined && editedQuantities[p.id] !== p.stock_quantity;

                return (
                  <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{p.sku}</td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{formatPrice(p.price)}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <input
                        type="number"
                        min="0"
                        value={currentQty}
                        onChange={(e) => handleStockChange(p.id, parseInt(e.target.value) || 0)}
                        style={{
                          width: '5rem',
                          padding: '0.4rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          border: isLow ? '1px solid #ef4444' : '1px solid var(--border)',
                          backgroundColor: 'var(--bg)',
                          color: 'var(--text-primary)',
                          fontWeight: 700
                        }}
                      />
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderRadius: '9999px',
                        backgroundColor: isLow ? '#fee2e2' : '#dcfce7',
                        color: isLow ? '#991b1b' : '#166534'
                      }}>
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <button
                        disabled={!isDirty || savingId === p.id}
                        onClick={() => handleSaveStock(p.id)}
                        className="btn btn-primary"
                        style={{
                          padding: '0.4rem 0.75rem',
                          fontSize: '0.75rem',
                          opacity: isDirty ? 1 : 0.4,
                          cursor: isDirty ? 'pointer' : 'default'
                        }}
                      >
                        {savingId === p.id ? 'Saving...' : 'Update'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
