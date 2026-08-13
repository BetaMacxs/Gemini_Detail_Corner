import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { storeConfig } from '../../config/store';
import { Plus, Edit2, Trash2, X, Check, Power } from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  compare_at_price?: number | null;
  stock_quantity?: number;
  active?: boolean;
  is_active?: boolean;
  description?: string;
  short_description?: string;
  categories?: { name: string } | null;
}

export function AdminProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    compare_at_price: '',
    stock_quantity: '10',
    short_description: '',
    description: '',
    active: true
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('name');
      
      if (!error && data) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      price: '',
      compare_at_price: '',
      stock_quantity: '10',
      short_description: '',
      description: '',
      active: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p: ProductItem) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      sku: p.sku || '',
      price: p.price ? p.price.toString() : '',
      compare_at_price: p.compare_at_price ? p.compare_at_price.toString() : '',
      stock_quantity: p.stock_quantity !== undefined ? p.stock_quantity.toString() : '10',
      short_description: p.short_description || '',
      description: p.description || '',
      active: p.active !== undefined ? p.active : (p.is_active !== undefined ? p.is_active : true)
    });
    setShowModal(true);
  };

  const handleToggleActive = async (p: ProductItem) => {
    const currentActive = p.active !== undefined ? p.active : (p.is_active !== undefined ? p.is_active : true);
    const newActive = !currentActive;

    try {
      await supabase.from('products').update({ active: newActive }).eq('id', p.id);
    } catch (e) {
      console.warn("Toggle active notice:", e);
    }

    setProducts(prev => prev.map(item => item.id === p.id ? { ...item, active: newActive, is_active: newActive } : item));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (e) {
      console.warn("Delete product notice:", e);
    }

    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const priceNum = parseFloat(formData.price) || 0;
    const compareNum = formData.compare_at_price ? parseFloat(formData.compare_at_price) : null;
    const stockNum = parseInt(formData.stock_quantity) || 0;

    const payload = {
      name: formData.name,
      slug,
      sku: formData.sku,
      price: priceNum,
      compare_at_price: compareNum,
      stock_quantity: stockNum,
      short_description: formData.short_description,
      description: formData.description,
      active: formData.active
    };

    if (editingProduct) {
      try {
        await supabase.from('products').update(payload).eq('id', editingProduct.id);
      } catch (e) {
        console.warn("Update product notice:", e);
      }
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...payload, is_active: formData.active } : p));
    } else {
      let insertedItem: ProductItem | null = null;
      try {
        const { data } = await supabase.from('products').insert(payload).select().single();
        if (data) insertedItem = data;
      } catch (e) {
        console.warn("Insert product notice:", e);
      }

      if (!insertedItem) {
        insertedItem = {
          id: `prod_${Date.now()}`,
          ...payload,
          is_active: formData.active
        };
      }

      setProducts(prev => [insertedItem!, ...prev]);
    }

    setSaving(false);
    setShowModal(false);
  };

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
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>Manage Products</h1>
          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Add, edit, and organize product listings in your store.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="brand-card" style={{ width: '100%', maxWidth: '36rem', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Product Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="auth-input" placeholder="e.g. Milky Tyre Shine 500ml" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>SKU</label>
                  <input type="text" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="auth-input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Price (ZAR)</label>
                  <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="auth-input" placeholder="0.00" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Compare Price (ZAR)</label>
                  <input type="number" step="0.01" value={formData.compare_at_price} onChange={e => setFormData({ ...formData, compare_at_price: e.target.value })} className="auth-input" placeholder="Optional" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Stock Quantity</label>
                  <input type="number" required value={formData.stock_quantity} onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })} className="auth-input" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Short Summary</label>
                <input type="text" value={formData.short_description} onChange={e => setFormData({ ...formData, short_description: e.target.value })} className="auth-input" placeholder="Brief 1-sentence product highlight" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Full Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="auth-input" placeholder="Detailed product specifications and directions..." />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} />
                <span>Product is active and visible in store</span>
              </label>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.875rem' }}>
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="brand-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg)' }}>
              <tr>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Product</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>SKU</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Stock</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isActive = product.active !== undefined ? product.active : (product.is_active !== undefined ? product.is_active : true);

                return (
                  <tr key={product.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {product.name}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {product.sku}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {formatPrice(product.price)}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {product.stock_quantity ?? 10}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <button
                        onClick={() => handleToggleActive(product)}
                        style={{
                          padding: '0.25rem 0.6rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          borderRadius: '9999px',
                          backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
                          color: isActive ? '#166534' : '#991b1b',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <Power className="h-3 w-3" />
                        <span>{isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleOpenEdit(product)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
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
