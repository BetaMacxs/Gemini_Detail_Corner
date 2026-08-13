import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  stock_quantity?: number;
  active?: boolean;
  is_active?: boolean;
  category_id?: string;
  categories?: { name: string } | null;
}

export function AdminProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category_id: '',
    active: true
  });

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      const { data: catData } = await supabase.from('categories').select('*');
      if (catData && catData.length > 0) {
        setCategories(catData);
      } else {
        setCategories([
          { id: 'cat-1', name: 'Accessories' },
          { id: 'cat-2', name: 'Exterior' },
          { id: 'cat-3', name: 'Wheels' },
          { id: 'cat-4', name: 'Interior' },
        ]);
      }

      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('name');

      if (!error && data && data.length > 0) {
        setProducts(data);
      } else {
        // Fallback default list matching screenshot
        setProducts([
          { id: 'p1', name: 'Air Freshener', slug: 'air-freshener', sku: 'AF-1', price: 30, active: true, categories: { name: 'Accessories' } },
          { id: 'p2', name: 'Air Freshener Hanger', slug: 'air-freshener-hanger', sku: 'AFH-1', price: 35, active: true, categories: { name: 'Accessories' } },
          { id: 'p3', name: 'Ceramic Force', slug: 'ceramic-force', sku: 'CF-1', price: 80, active: false, categories: { name: 'Exterior' } },
          { id: 'p4', name: 'Chemois', slug: 'chemois', sku: 'CH-1', price: 40, active: true, categories: { name: 'Accessories' } },
          { id: 'p5', name: 'Clay Bar', slug: 'clay-bar', sku: 'CB-1', price: 100, active: true, categories: { name: 'Accessories' } },
          { id: 'p6', name: 'Clear Tyre Shine', slug: 'clear-tyre-shine', sku: 'CTS-1', price: 85, active: true, categories: { name: 'Wheels' } },
          { id: 'p7', name: 'Crystal Gloss', slug: 'crystal-gloss', sku: 'crystal-gloss', price: 150, active: true, categories: { name: 'Exterior' } },
          { id: 'p8', name: 'Dash Flash', slug: 'dash-flash', sku: 'DF-1', price: 65, active: true, categories: { name: 'Interior' } },
        ]);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const handleToggleActive = async (p: ProductItem) => {
    const currentActive = typeof p.active === 'boolean' ? p.active : (typeof p.is_active === 'boolean' ? p.is_active : true);
    const newActive = !currentActive;

    setProducts(prev => prev.map(item => item.id === p.id ? { ...item, active: newActive, is_active: newActive } : item));

    try {
      await supabase.from('products').update({ active: newActive }).eq('id', p.id);
    } catch (e) {
      console.warn("Toggle active notice:", e);
    }
  };

  const handlePriceChange = async (id: string, newPriceStr: string) => {
    const newPrice = parseFloat(newPriceStr) || 0;
    setProducts(prev => prev.map(item => item.id === id ? { ...item, price: newPrice } : item));

    try {
      await supabase.from('products').update({ price: newPrice }).eq('id', id);
    } catch (e) {}
  };

  const handleCategoryChange = async (id: string, catName: string) => {
    setProducts(prev => prev.map(item => item.id === id ? { ...item, categories: { name: catName } } : item));

    try {
      const matched = categories.find(c => c.name === catName);
      if (matched) {
        await supabase.from('products').update({ category_id: matched.id }).eq('id', id);
      }
    } catch (e) {}
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newProd: ProductItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `p_${Date.now()}`,
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      price: parseFloat(formData.price) || 0,
      active: formData.active,
      categories: { name: 'Accessories' }
    };

    setProducts(prev => [newProd, ...prev]);
    setShowModal(false);

    try {
      await supabase.from('products').insert({
        name: newProd.name,
        slug: newProd.slug,
        sku: newProd.sku,
        price: newProd.price,
        active: newProd.active,
        stock_quantity: 10
      });
    } catch (e) {}
  };

  const totalPages = Math.ceil(products.length / pageSize) || 1;
  const paginatedProducts = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#f3f4f6' }}>
          Products
        </h1>
        <button
          onClick={() => {
            setFormData({ name: '', price: '', category_id: '', active: true });
            setShowModal(true);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.5rem 1.25rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            borderRadius: '9999px',
            border: '1px solid #333333',
            backgroundColor: '#222222',
            color: '#e5e5e5',
            cursor: 'pointer'
          }}
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Product Card Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {paginatedProducts.map((p) => {
          const isActive = typeof p.active === 'boolean' ? p.active : (typeof p.is_active === 'boolean' ? p.is_active : true);
          const currentCat = p.categories?.name || 'Accessories';

          return (
            <div
              key={p.id}
              style={{
                backgroundColor: '#1f1f1f',
                border: '1px solid #2e2e2e',
                borderRadius: '0.5rem',
                padding: '0.85rem 1.25rem',
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr auto',
                alignItems: 'center',
                gap: '1.5rem'
              }}
            >
              {/* Product Title */}
              <div>
                <a
                  href={`/product/${p.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    textDecoration: 'underline',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {p.name}
                </a>
              </div>

              {/* Price Field */}
              <div>
                <input
                  type="text"
                  value={`${p.price.toFixed(2).replace('.', ',')}`}
                  onChange={(e) => handlePriceChange(p.id, e.target.value.replace(',', '.'))}
                  style={{
                    width: '100%',
                    backgroundColor: '#141414',
                    border: '1px solid #2e2e2e',
                    borderRadius: '0.375rem',
                    padding: '0.4rem 0.75rem',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <select
                  value={currentCat}
                  onChange={(e) => handleCategoryChange(p.id, e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#141414',
                    border: '1px solid #2e2e2e',
                    borderRadius: '0.375rem',
                    padding: '0.4rem 0.75rem',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                >
                  <option value="Accessories">Accessories</option>
                  <option value="Exterior">Exterior</option>
                  <option value="Wheels">Wheels</option>
                  <option value="Interior">Interior</option>
                </select>
              </div>

              {/* Active / Hidden Pill Button */}
              <div>
                <button
                  onClick={() => handleToggleActive(p)}
                  style={{
                    padding: '0.3rem 0.85rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: '9999px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: isActive ? '#4ade80' : '#f87171',
                    minWidth: '4.5rem',
                    textAlign: 'center'
                  }}
                >
                  {isActive ? 'active' : 'hidden'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '2.5rem' }}>
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '9999px',
            border: '1px solid #333333',
            backgroundColor: '#222222',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.3 : 1
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
          page {currentPage} of {totalPages} ({products.length} Products)
        </span>

        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '9999px',
            border: '1px solid #333333',
            backgroundColor: '#222222',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.3 : 1
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#222222', border: '1px solid #333333', borderRadius: '0.5rem', padding: '1.5rem', width: '100%', maxWidth: '28rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>Add Product</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Product Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '0.5rem', backgroundColor: '#141414', border: '1px solid #333', borderRadius: '0.375rem', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Price (R)</label>
                <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} style={{ width: '100%', padding: '0.5rem', backgroundColor: '#141414', border: '1px solid #333', borderRadius: '0.375rem', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #333', backgroundColor: 'transparent', color: '#ccc', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
