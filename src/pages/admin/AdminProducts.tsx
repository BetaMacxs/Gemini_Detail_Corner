import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../lib/storage';
import { storeConfig } from '../../config/store';
import { Plus, Edit2, Trash2, X, Power, Search } from 'lucide-react';
import { AdminNav } from '../../components/AdminNav';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  compare_at_price?: number | null;
  stock_quantity?: number;
  low_stock_threshold?: number;
  active?: boolean;
  is_active?: boolean;
  category_id?: string | null;
  categories?: { name: string } | null;
  short_description?: string;
  description?: string;
  specifications?: any;
  highlights?: any;
  application_steps?: any;
  product_images?: { id: string; storage_path: string; url?: string }[];
}

export function AdminProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    compare_at_price: '',
    stock_quantity: '10',
    category_id: '',
    short_description: '',
    description: '',
    specifications: '',
    highlights: '',
    application_steps: '',
    active: true,
    image_url: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Categories
      const { data: catData } = await supabase.from('categories').select('*');
      if (catData) setCategories(catData);

      // 2. Fetch Products
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name), product_images(id, storage_path)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      price: '',
      compare_at_price: '',
      stock_quantity: '10',
      category_id: categories[0]?.id || '',
      short_description: '',
      description: '',
      specifications: '',
      highlights: '',
      application_steps: '',
      active: true,
      image_url: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const handleOpenEdit = (p: ProductItem) => {
    setEditingProduct(p);
    const mainImage = p.product_images && p.product_images.length > 0 ? p.product_images[0].storage_path : '';
    setFormData({
      name: p.name || '',
      sku: p.sku || '',
      price: p.price ? p.price.toString() : '',
      compare_at_price: p.compare_at_price ? p.compare_at_price.toString() : '',
      stock_quantity: p.stock_quantity !== undefined ? p.stock_quantity.toString() : '10',
      category_id: p.category_id || (categories[0]?.id || ''),
      short_description: p.short_description || '',
      description: p.description || '',
      specifications: p.specifications ? JSON.stringify(p.specifications, null, 2) : '',
      highlights: Array.isArray(p.highlights) ? p.highlights.join('\n') : '',
      application_steps: p.application_steps ? JSON.stringify(p.application_steps, null, 2) : '',
      active: typeof p.active === 'boolean' ? p.active : (typeof p.is_active === 'boolean' ? p.is_active : true),
      image_url: mainImage
    });
    setImageFile(null);
    setImagePreview(mainImage);
    setShowModal(true);
  };

  const handleToggleActive = async (p: ProductItem) => {
    const currentActive = typeof p.active === 'boolean' ? p.active : (typeof p.is_active === 'boolean' ? p.is_active : true);
    const newActive = !currentActive;

    setProducts(prev => prev.map(item => item.id === p.id ? { ...item, active: newActive, is_active: newActive } : item));

    try {
      await supabase.from('products').update({ active: newActive }).eq('id', p.id);
    } catch (e) {
      console.warn("Update active error:", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (e) {
      console.warn("Delete product error:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const priceNum = parseFloat(formData.price) || 0;
    const compareNum = formData.compare_at_price ? parseFloat(formData.compare_at_price) : null;
    const stockNum = parseInt(formData.stock_quantity) || 0;

    let specsObj = null;
    try {
      if (formData.specifications) specsObj = JSON.parse(formData.specifications);
    } catch (e) {
      alert("Invalid JSON in Specifications");
      setSaving(false);
      return;
    }

    let stepsObj = null;
    try {
      if (formData.application_steps) stepsObj = JSON.parse(formData.application_steps);
    } catch (e) {
      alert("Invalid JSON in Application Steps");
      setSaving(false);
      return;
    }

    const highlightsArr = formData.highlights.split('\n').filter(h => h.trim() !== '');

    let finalImageUrl = formData.image_url;
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile, 'products');
      if (uploadedUrl) {
        // If it's a Supabase storage URL, we extract just the filename to store as a relative path
        // This keeps the database clean and portable across environments
        if (uploadedUrl.includes('/storage/v1/object/public/products/')) {
          finalImageUrl = uploadedUrl.split('/storage/v1/object/public/products/').pop() || uploadedUrl;
        } else {
          finalImageUrl = uploadedUrl;
        }
      }
    }

    const payload = {
      name: formData.name,
      slug,
      sku: formData.sku,
      price: priceNum,
      compare_at_price: compareNum,
      stock_quantity: stockNum,
      category_id: formData.category_id || null,
      short_description: formData.short_description,
      description: formData.description,
      specifications: specsObj,
      highlights: highlightsArr.length > 0 ? highlightsArr : null,
      application_steps: stepsObj,
      active: formData.active
    };

    let productId = editingProduct?.id;

    if (editingProduct) {
      try {
        await supabase.from('products').update(payload).eq('id', editingProduct.id);
      } catch (e) {
        console.warn("Update product error:", e);
      }
    } else {
      try {
        const { data: newP, error: pErr } = await supabase.from('products').insert([payload]).select();
        if (newP && newP[0]) {
          productId = newP[0].id;
        }
      } catch (e) {
        console.warn("Insert product error:", e);
      }
    }

    if (productId && finalImageUrl) {
      try {
        // Simple strategy: delete existing and insert new for main image
        if (editingProduct) {
          await supabase.from('product_images').delete().eq('product_id', productId);
        }
        await supabase.from('product_images').insert([{
          product_id: productId,
          storage_path: finalImageUrl,
          alt_text: formData.name,
          sort_order: 0
        }]);
      } catch (e) {
        console.warn("Update images error:", e);
      }
    }

    setSaving(false);
    setShowModal(false);
    fetchData();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price || 0);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Manage <span style={{ color: 'var(--accent)' }}>Products</span>
          </h1>
          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Real-time product catalogue connected directly to database.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      <AdminNav />

      {/* Search Bar */}
      <div className="admin-search-wrapper" style={{ marginBottom: '1.5rem' }}>
        <Search size={16} className="admin-search-icon" />
        <input
          type="text"
          className="admin-search-input"
          placeholder="Filter products..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Modal for Add / Edit */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="admin-modal-close" aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="admin-form-group">
                <label className="admin-label">Product Image</label>
                <div className="admin-file-control">
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" style={{ width: '3.5rem', height: '3.5rem', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }} 
                  />
                </div>
                <input 
                  type="text" 
                  className="admin-input"
                  value={formData.image_url} 
                  onChange={e => setFormData({ ...formData, image_url: e.target.value })} 
                  placeholder="Or enter image URL manually..."
                  style={{ marginTop: '0.35rem' }}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Product Name</label>
                <input type="text" required className="admin-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Ceramic Force Coating" />
              </div>

              <div className="admin-form-grid admin-form-grid-2">
                <div className="admin-form-group">
                  <label className="admin-label">SKU</label>
                  <input type="text" required className="admin-input" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Price (ZAR)</label>
                  <input type="number" step="0.01" required className="admin-input" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" />
                </div>
              </div>

              <div className="admin-form-grid admin-form-grid-2">
                <div className="admin-form-group">
                  <label className="admin-label">Compare Price (ZAR)</label>
                  <input type="number" step="0.01" className="admin-input" value={formData.compare_at_price} onChange={e => setFormData({ ...formData, compare_at_price: e.target.value })} placeholder="Optional" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Stock Quantity</label>
                  <input type="number" required className="admin-input" value={formData.stock_quantity} onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })} />
                </div>
              </div>

              {categories.length > 0 && (
                <div className="admin-form-group">
                  <label className="admin-label">Category</label>
                  <select className="admin-select" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="admin-form-group">
                <label className="admin-label">Short Summary</label>
                <input type="text" className="admin-input" value={formData.short_description} onChange={e => setFormData({ ...formData, short_description: e.target.value })} placeholder="Brief 1-sentence product highlight" />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Full Description</label>
                <textarea rows={3} className="admin-textarea" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Detailed product specifications..." />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Specifications (JSON Object)</label>
                <textarea rows={3} className="admin-textarea" value={formData.specifications} onChange={e => setFormData({ ...formData, specifications: e.target.value })} placeholder='{"pH Level": "7.0", "Scent": "Cherry"}' />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Highlights (One per line)</label>
                <textarea rows={3} className="admin-textarea" value={formData.highlights} onChange={e => setFormData({ ...formData, highlights: e.target.value })} placeholder="Premium Formula&#10;UV Protection" />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Application Steps (JSON Array)</label>
                <textarea rows={3} className="admin-textarea" value={formData.application_steps} onChange={e => setFormData({ ...formData, application_steps: e.target.value })} placeholder='[{"title": "Spray", "instruction": "..."}]' />
              </div>

              <label className="admin-checkbox-label">
                <input type="checkbox" className="admin-checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} />
                <span>Product is active and visible in store</span>
              </label>

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ padding: '0.55rem 1.25rem', fontSize: '0.8125rem' }}>Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '0.55rem 1.5rem', fontSize: '0.8125rem' }}>
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="brand-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg)' }}>
              <tr>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Product</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>SKU</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Stock</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No products found in database. Click "Add Product" to create one.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isActive = typeof product.active === 'boolean' ? product.active : (typeof product.is_active === 'boolean' ? product.is_active : true);

                  return (
                    <tr key={product.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        <a href={`/product/${product.slug}`} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                          {product.name}
                        </a>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {product.sku || '-'}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {product.categories?.name || 'Uncategorized'}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {formatPrice(product.price)}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {product.stock_quantity ?? 0}
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
                          <Power size={12} />
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleOpenEdit(product)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Edit2 size={12} /> Edit
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
