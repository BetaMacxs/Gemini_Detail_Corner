import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { storeConfig } from '../../config/store';
import { AlertTriangle, RefreshCw, Search, ChevronRight, ChevronLeft } from 'lucide-react';
import { AdminNav } from '../../components/AdminNav';

interface ProductInventory {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  low_stock_threshold: number;
  price: number;
  active: boolean;
  reserved_quantity?: number;
  is_variant?: boolean;
  parent_id?: string;
  variants?: ProductInventory[];
}

export function AdminInventory() {
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editedQuantities, setEditedQuantities] = useState<Record<string, number>>({});
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterLowStock]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      // Fetch reserved stock first
      const { data: reservedData, error: reservedError } = await supabase
        .from('reserved_stock')
        .select('*');

      const reservedMap: Record<string, number> = {};
      if (!reservedError && reservedData) {
        reservedData.forEach((r: any) => {
          const key = r.variant_id || r.product_id;
          reservedMap[key] = (reservedMap[key] || 0) + Number(r.quantity || 0);
        });
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          id, name, sku, stock_quantity, low_stock_threshold, price, active,
          variants:product_variants (id, name, sku, stock_quantity, price, active)
        `)
        .order('name');

      if (!error && data) {
        const items = data.map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku || p.id.slice(0, 8),
          stock_quantity: p.stock_quantity ?? 0,
          reserved_quantity: reservedMap[p.id] || 0,
          low_stock_threshold: p.low_stock_threshold ?? 5,
          price: p.price ?? 0,
          active: p.active ?? true,
          variants: (p.variants as any[])?.map(v => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            stock_quantity: v.stock_quantity ?? 0,
            reserved_quantity: reservedMap[v.id] || 0,
            low_stock_threshold: p.low_stock_threshold ?? 5,
            price: v.price ?? p.price ?? 0,
            active: v.active ?? true,
            is_variant: true,
            parent_id: p.id
          })) || []
        }));
        setProducts(items);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.warn("Failed to fetch inventory from DB:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (id: string, val: number) => {
    setEditedQuantities(prev => ({ ...prev, [id]: val }));
  };

  const handleSaveStock = async (id: string, isVariant: boolean, parentId?: string) => {
    const newQty = editedQuantities[id];
    if (newQty === undefined) return;

    setSavingId(id);
    try {
      const table = isVariant ? 'product_variants' : 'products';
      const { error } = await supabase.from(table).update({ stock_quantity: newQty }).eq('id', id);
      
      if (error) throw error;

      // Log the manual update
      await supabase.from('inventory_logs').insert({
        product_id: isVariant ? parentId : id,
        variant_id: isVariant ? id : null,
        change_amount: 0, // We don't have the old qty easily here without more state, but we log the new total in reason
        reason: `Manual stock update to ${newQty}`,
      });

      // Update local state
      setProducts(prev => prev.map(p => {
        if (!isVariant && p.id === id) {
          return { ...p, stock_quantity: newQty };
        }
        if (isVariant && p.id === parentId) {
          return {
            ...p,
            variants: p.variants?.map(v => v.id === id ? { ...v, stock_quantity: newQty } : v)
          };
        }
        return p;
      }));

      // Clear edit state for this ID
      setEditedQuantities(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

    } catch (e) {
      console.warn("Stock update warning:", e);
      alert("Failed to update stock. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedProducts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price || 0);
  };

  // Flatten products and variants for filtering, or keep hierarchy?
  // User wants: "Show its associated variants beneath/within the product."
  // So we'll keep hierarchy but filter based on search matching product or any of its variants.
  
  const filteredHierarchy = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesProduct = p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
    const matchesVariant = p.variants?.some(v => v.name.toLowerCase().includes(term) || v.sku.toLowerCase().includes(term));
    
    if (searchTerm && !matchesProduct && !matchesVariant) return false;
    
    if (filterLowStock) {
      const productLow = p.stock_quantity <= p.low_stock_threshold;
      const variantLow = p.variants?.some(v => v.stock_quantity <= v.low_stock_threshold);
      if (!productLow && !variantLow) return false;
    }
    
    return true;
  });

  const totalPages = Math.ceil(filteredHierarchy.length / itemsPerPage);
  const paginatedProducts = filteredHierarchy.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const lowStockCount = products.reduce((acc, p) => {
    const hasVariants = p.variants && p.variants.length > 0;
    if (hasVariants) {
      return acc + (p.variants?.filter(v => {
        const available = v.stock_quantity - (v.reserved_quantity || 0);
        return available <= v.low_stock_threshold;
      }).length || 0);
    }
    const available = p.stock_quantity - (p.reserved_quantity || 0);
    return acc + (available <= p.low_stock_threshold ? 1 : 0);
  }, 0);

  return (
    <div className="container page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Inventory & <span style={{ color: 'var(--accent)' }}>Stock</span>
          </h1>
          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Monitor and update real-time stock levels for products and individual variants.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`btn ${filterLowStock ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.5rem var(--spacing-container-px)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <AlertTriangle size={16} />
            <span>Low Stock Alerts ({lowStockCount})</span>
          </button>
          <button
            onClick={fetchInventory}
            className="btn btn-outline"
            style={{ padding: '0.5rem var(--spacing-container-px)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <AdminNav />

      {/* Search Input */}
      <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '24rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input
          type="text"
          placeholder="Filter products or variants..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '2.5rem' }}
        />
      </div>

      <div className="brand-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg)' }}>
              <tr>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Item</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>SKU</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Physical</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Reserved</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Available</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading stock data...
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const hasVariants = p.variants && p.variants.length > 0;
                  const isExpanded = expandedProducts[p.id];
                  const currentQty = editedQuantities[p.id] !== undefined ? editedQuantities[p.id] : p.stock_quantity;
                  const availableQty = currentQty - (p.reserved_quantity || 0);
                  const isLow = availableQty <= p.low_stock_threshold;
                  const isDirty = editedQuantities[p.id] !== undefined && editedQuantities[p.id] !== p.stock_quantity;

                  return (
                    <React.Fragment key={p.id}>
                      <tr style={{ borderTop: '1px solid var(--border)', backgroundColor: hasVariants ? 'rgba(var(--accent-rgb), 0.02)' : 'transparent' }}>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {hasVariants && (
                              <button 
                                onClick={() => toggleExpand(p.id)}
                                style={{ 
                                  background: 'none', 
                                  border: 'none', 
                                  color: 'var(--accent)', 
                                  cursor: 'pointer',
                                  padding: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  transform: isExpanded ? 'rotate(90deg)' : 'none',
                                  transition: 'transform 0.2s'
                                }}
                              >
                                <ChevronRight size={16} />
                              </button>
                            )}
                            <span>{p.name}</span>
                            {hasVariants && (
                              <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.1rem 0.4rem', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', marginLeft: '0.25rem' }}>
                                {p.variants?.length} Variants
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{p.sku}</td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{formatPrice(p.price)}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          {!hasVariants ? (
                            <input
                              type="number"
                              min="0"
                              value={currentQty}
                              onChange={(e) => handleStockChange(p.id, parseInt(e.target.value) || 0)}
                              style={{
                                width: '5rem',
                                padding: '0.4rem 0.6rem',
                                borderRadius: 'var(--radius-sm)',
                                border: availableQty <= p.low_stock_threshold ? '1px solid #ef4444' : '1px solid var(--border)',
                                backgroundColor: 'var(--bg)',
                                color: 'var(--text-primary)',
                                fontWeight: 700
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: (p.reserved_quantity || 0) > 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                           {p.reserved_quantity || 0}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: availableQty <= 0 ? '#ef4444' : 'var(--text-primary)' }}>
                           {availableQty}
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          {!hasVariants ? (
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              borderRadius: '9999px',
                              backgroundColor: isLow ? '#fee2e2' : '#dcfce7',
                              color: isLow ? '#991b1b' : '#166534'
                            }}>
                              {isLow ? (availableQty <= 0 ? 'Out of Stock' : 'Low Stock') : 'In Stock'}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Managed via variants</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                          {!hasVariants && (
                            <button
                              disabled={!isDirty || savingId === p.id}
                              onClick={() => handleSaveStock(p.id, false)}
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
                          )}
                        </td>
                      </tr>

                      {/* Variant Rows */}
                      {hasVariants && isExpanded && p.variants?.map(v => {
                        const vQty = editedQuantities[v.id] !== undefined ? editedQuantities[v.id] : v.stock_quantity;
                        const vAvailable = vQty - (v.reserved_quantity || 0);
                        const vLow = vAvailable <= v.low_stock_threshold;
                        const vDirty = editedQuantities[v.id] !== undefined && editedQuantities[v.id] !== v.stock_quantity;

                        return (
                          <tr key={v.id} style={{ backgroundColor: 'var(--bg)', borderTop: '1px solid var(--border)', borderLeft: '4px solid var(--accent)' }}>
                            <td style={{ padding: '0.75rem 1.5rem 0.75rem 3rem', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>└</span>
                                <span style={{ fontWeight: 600 }}>{v.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '0.75rem 1.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{v.sku}</td>
                            <td style={{ padding: '0.75rem 1.5rem', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{formatPrice(v.price)}</td>
                            <td style={{ padding: '0.75rem 1.5rem' }}>
                              <input
                                type="number"
                                min="0"
                                value={vQty}
                                onChange={(e) => handleStockChange(v.id, parseInt(e.target.value) || 0)}
                                style={{
                                  width: '4.5rem',
                                  padding: '0.3rem 0.5rem',
                                  borderRadius: 'var(--radius-sm)',
                                  border: vAvailable <= v.low_stock_threshold ? '1px solid #ef4444' : '1px solid var(--border)',
                                  backgroundColor: 'var(--bg)',
                                  color: 'var(--text-primary)',
                                  fontWeight: 600,
                                  fontSize: '0.8125rem'
                                }}
                              />
                            </td>
                            <td style={{ padding: '0.75rem 1.5rem', fontSize: '0.8125rem', color: (v.reserved_quantity || 0) > 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                               {v.reserved_quantity || 0}
                            </td>
                            <td style={{ padding: '0.75rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, color: vAvailable <= 0 ? '#ef4444' : 'var(--text-primary)' }}>
                               {vAvailable}
                            </td>
                            <td style={{ padding: '0.75rem 1.5rem' }}>
                              <span style={{
                                padding: '0.2rem 0.45rem',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                borderRadius: '9999px',
                                backgroundColor: vLow ? '#fee2e2' : '#dcfce7',
                                color: vLow ? '#991b1b' : '#166534'
                              }}>
                                {vLow ? (vAvailable <= 0 ? 'Out of Stock' : 'Low Stock') : 'In Stock'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1.5rem', textAlign: 'right' }}>
                              <button
                                disabled={!vDirty || savingId === v.id}
                                onClick={() => handleSaveStock(v.id, true, p.id)}
                                className="btn btn-outline"
                                style={{
                                  padding: '0.3rem 0.6rem',
                                  fontSize: '0.7rem',
                                  opacity: vDirty ? 1 : 0.4,
                                  cursor: vDirty ? 'pointer' : 'default',
                                  borderColor: 'var(--accent)',
                                  color: 'var(--accent)'
                                }}
                              >
                                {savingId === v.id ? '...' : 'Update'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
    </div>
  );
}
