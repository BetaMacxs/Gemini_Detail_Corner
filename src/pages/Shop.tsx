import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useProductsStore } from '../features/products/store';
import { useCartStore } from '../features/cart/store';
import { toast } from '../features/toast/store';
import { Search, Filter, ShoppingBag, Star, SlidersHorizontal, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { storeConfig } from '../config/store';
import { QuickViewModal } from '../components/QuickViewModal';
import { ProductRating } from '../components/ProductRating';
import { ProductWithDetails } from '../types/database';

export function Shop() {
  const { products, categories, isLoading, error, fetchProducts, fetchCategories } = useProductsStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductWithDetails | null>(null);
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

  const addItem = useCartStore((s) => s.addItem);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price);
  };

  const handleQuickAdd = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, undefined, 1);
    const image = product.images && product.images.length > 0
      ? (product.images[0].url || product.images[0].storage_path)
      : `/${product.slug.toLowerCase()}.png`;

    toast.cart(product.name, {
      quantity: 1,
      image,
      priceFormatted: formatPrice(product.price),
    });
  };

  return (
    <div className="shop-page">
      {/* Shop Header */}
      <div className="shop-header">
        <div className="shop-header-container">
          <div className="shop-header-content">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="shop-title">
                  Professional <span style={{ color: 'var(--accent)' }}>Inventory</span>
                </h1>
                <p className="shop-subtitle">Discover our full range of professional car care supplies.</p>
              </motion.div>
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
                <SlidersHorizontal size={20} />
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
              {/* <h3 className="sidebar-filter-heading">Categories</h3> */}
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

            {error ? (
              <div className="error-state">
                <div className="error-text">Error loading products</div>
                <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
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
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Try adjusting your filters or search query.</p>
                        <button
                          onClick={() => { handleCategoryChange(''); setSearchTerm(''); }}
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
                                    e.currentTarget.style.height = '100%';
                                    e.currentTarget.style.width = '100%';
                                    e.currentTarget.style.objectFit = 'contain';
                                    e.currentTarget.style.padding = '3rem';
                                    e.currentTarget.style.opacity = '0.5';
                                  }}
                                />
                              )}
                              <div className="product-card-overlay"></div>
                              
                              {/* Quick View Hover Action */}
                              <div className="product-card-quick-actions">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setQuickViewProduct(product);
                                  }}
                                  className="quickview-card-trigger-btn"
                                  aria-label={`Quick view ${product.name}`}
                                >
                                  <Eye size={14} />
                                  <span>Quick View</span>
                                </button>
                              </div>
                            </div>
                            <div className="product-card-info">
                              <ProductRating reviews={product.reviews} size={12} className="product-rating" noReviewsText="No reviews" />
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
                                <div className="product-card-footer-actions">                                 
                                  <button
                                    type="button"
                                    onClick={(e) => handleQuickAdd(e, product)}
                                    className="add-to-cart-quick-btn"
                                    title="Add to Cart"
                                    aria-label={`Add ${product.name} to Cart`}
                                    style={{ border: 'none', cursor: 'pointer' }}
                                  >
                                    <ShoppingBag size={18} style={{ color: '#ffffff' }} />
                                  </button>
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
                      <ChevronLeft size={16} />
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
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={quickViewProduct !== null}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
