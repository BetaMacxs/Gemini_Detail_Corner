import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useProductsStore } from '../features/products/store';
import { Search, Filter, ShoppingBag, Star, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { storeConfig } from '../config/store';

export function Shop() {
  const { products, categories, isLoading, error, fetchProducts, fetchCategories } = useProductsStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  
  const categoryId = searchParams.get('category') || '';

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(searchParams.get('q') || '', categoryId);
  }, [fetchProducts, searchParams, categoryId]);

  const totalPages = Math.ceil(products.length / pageSize);
  const paginatedProducts = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      searchParams.set('q', searchTerm);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  };

  const handleCategoryChange = (id: string) => {
    if (id) {
      searchParams.set('category', id);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price);
  };

  return (
    <div className="shop-page">
      {/* Shop Header */}
      <div className="shop-header">
        <div className="shop-header-container">
          <div className="shop-header-content">
            <div>
              <h1 className="shop-title">
                Professional <span style={{ color: 'var(--accent)' }}>Inventory</span>
              </h1>
              <p className="shop-subtitle">Discover our full range of professional car care supplies.</p>
            </div>
            
            <div className="shop-actions">
              <form onSubmit={handleSearch} className="search-form">
                <Search className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </form>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`filter-toggle ${isFilterOpen ? 'active' : ''}`}
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="shop-main-container">
        <div className="shop-layout">
          {/* Sidebar Filters */}
          <div className={`sidebar-filters ${isFilterOpen ? 'mobile-visible' : ''}`}>
            <div className="sidebar-filter-section">
              <h3 className="sidebar-filter-heading">Categories</h3>
              <div className="filter-buttons-list">
                <button 
                  onClick={() => handleCategoryChange('')}
                  className={`filter-button ${!categoryId ? 'active' : ''}`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`filter-button ${categoryId === cat.id ? 'active' : ''}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="shop-content">
            <div className="results-header">
              <span className="results-count">
                Showing {products.length > 0 ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, products.length)} of ${products.length}` : '0'} Results
              </span>
            </div>

            {error ? (
              <div className="error-state">
                <div className="error-text">Error loading products</div>
                <p className="text-brand-text-secondary">{error}</p>
              </div>
            ) : (
              <>
                <div className="shop-products-grid">
                  <AnimatePresence mode="popLayout">
                    {isLoading ? (
                      [...Array(6)].map((_, i) => (
                        <div key={i} className="product-card-skeleton"></div>
                      ))
                    ) : products.length === 0 ? (
                      <div className="empty-state">
                        <ShoppingBag className="empty-state-icon" />
                        <h3 className="empty-state-title">No Products Found</h3>
                        <p className="text-brand-text-secondary mt-2">Try adjusting your filters or search query.</p>
                        <button 
                          onClick={() => {handleCategoryChange(''); setSearchTerm('');}}
                          className="clear-filters-btn"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    ) : (
                      paginatedProducts.map((product) => (
                        <motion.div 
                          key={product.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          whileHover={{ y: -8 }}
                          className="product-card brand-card"
                        >
                          <Link to={`/product/${product.slug}`} className="block">
                            <div className="product-card-image-wrapper">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0].url || product.images[0].storage_path}
                                  alt={product.images[0].alt_text || product.name}
                                  className="product-card-image"
                                />
                              ) : (
                                <img 
                                  src={`/${product.slug.toLowerCase()}.png`}
                                  alt={product.name}
                                  className="product-card-image"
                                  style={{ opacity: 0.8 }}
                                  onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23333333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
                                    e.currentTarget.className = "h-full w-full object-contain p-12 opacity-50";
                                  }}
                                />
                              )}
                              <div className="product-card-overlay"></div>
                            </div>
                            <div className="product-card-info">
                              <div className="product-rating">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="product-rating-star" style={{ fill: i < 4 ? 'var(--gold)' : 'none', color: i < 4 ? 'var(--gold)' : 'var(--text-secondary)' }} />
                                ))}
                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginLeft: '0.5rem', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em' }}>(4.8)</span>
                              </div>
                              <h3 className="product-card-name">
                                {product.name}
                              </h3>
                              <p className="product-card-short-desc">
                                {product.short_description || "Professional grade detailing product for superior results."}
                              </p>
                              <div className="product-card-footer">
                                <div className="product-card-footer-price">
                                  {formatPrice(product.price)}
                                </div>
                                <div className="add-to-cart-quick-btn">
                                  <ShoppingBag className="h-5 w-5 text-white" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>

                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 0.75rem', opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`btn ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '0.5rem 0.85rem', fontSize: '0.875rem' }}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 0.75rem', opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
