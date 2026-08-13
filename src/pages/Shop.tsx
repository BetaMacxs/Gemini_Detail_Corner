import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useProductsStore } from '../features/products/store';
import { Search, Filter, ShoppingBag, Star, SlidersHorizontal } from 'lucide-react';
import { storeConfig } from '../config/store';

export function Shop() {
  const { products, categories, isLoading, error, fetchProducts, fetchCategories } = useProductsStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const categoryId = searchParams.get('category') || '';

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts(searchParams.get('q') || '', categoryId);
  }, [fetchProducts, searchParams, categoryId]);

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
    <div className="bg-brand-bg min-h-screen">
      {/* Shop Header */}
      <div className="bg-brand-surface border-b border-brand-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter text-brand-text-primary">
                Professional <span className="text-brand-accent">Inventory</span>
              </h1>
              <p className="text-brand-text-secondary mt-2">Discover our full range of professional car care supplies.</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-text-secondary" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-brand-bg border border-brand-border rounded-full py-3 pl-12 pr-6 text-sm w-full md:w-80 focus:ring-1 focus:ring-brand-accent outline-none transition-all"
                />
              </form>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`lg:hidden p-3 rounded-full border transition-all ${isFilterOpen ? 'bg-brand-accent border-brand-accent text-white' : 'bg-brand-bg border-brand-border text-brand-text-secondary hover:border-brand-accent'}`}
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <div className={`lg:block w-full lg:w-64 space-y-8 ${isFilterOpen ? 'block' : 'hidden'}`}>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-brand-text-primary mb-6">Categories</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${!categoryId ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'text-brand-text-secondary hover:bg-brand-surface'}`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${categoryId === cat.id ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'text-brand-text-secondary hover:bg-brand-surface'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm text-brand-text-secondary font-bold uppercase tracking-wider">
                Showing {products.length} Results
              </span>
            </div>

            {error ? (
              <div className="text-center py-24 bg-brand-surface rounded-3xl border border-brand-border border-dashed">
                <div className="text-red-500 mb-4">Error loading products</div>
                <p className="text-brand-text-secondary">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    [...Array(6)].map((_, i) => (
                      <div key={i} className="bg-brand-surface border border-brand-border rounded-2xl h-[450px] animate-pulse"></div>
                    ))
                  ) : products.length === 0 ? (
                    <div className="col-span-full text-center py-24 bg-brand-surface rounded-3xl border border-dashed border-brand-border">
                      <ShoppingBag className="h-16 w-16 text-brand-text-secondary mx-auto mb-6 opacity-20" />
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter">No Products Found</h3>
                      <p className="text-brand-text-secondary mt-2">Try adjusting your filters or search query.</p>
                      <button 
                        onClick={() => {handleCategoryChange(''); setSearchTerm('');}}
                        className="mt-8 text-brand-accent font-bold uppercase tracking-widest text-xs underline underline-offset-4"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  ) : (
                    products.map((product) => (
                      <motion.div 
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -8 }}
                        className="group bg-brand-surface border border-brand-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-brand-accent/50"
                      >
                        <Link to={`/product/${product.slug}`} className="block">
                          <div className="aspect-[4/5] overflow-hidden bg-brand-bg relative">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0].storage_path}
                                alt={product.images[0].alt_text || product.name}
                                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <img 
                                src={`/${product.slug.toLowerCase()}.png`}
                                alt={product.name}
                                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 opacity-30"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23333333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
                                  e.currentTarget.className = "h-full w-full object-contain p-12 opacity-50";
                                }}
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <div className="p-6">
                            <div className="flex items-center space-x-1 mb-3">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < 4 ? 'fill-brand-gold text-brand-gold' : 'text-brand-text-secondary/30'}`} />
                              ))}
                              <span className="text-[10px] text-brand-text-secondary ml-2 uppercase font-black tracking-widest">(4.8)</span>
                            </div>
                            <h3 className="text-xl font-black uppercase italic tracking-tight mb-2 group-hover:text-brand-accent transition-colors truncate">
                              {product.name}
                            </h3>
                            <p className="text-sm text-brand-text-secondary line-clamp-2 mb-6 h-10">
                              {product.short_description || "Professional grade detailing product for superior results."}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-brand-border/50">
                              <div className="text-2xl font-black text-brand-text-primary italic">
                                {formatPrice(product.price)}
                              </div>
                              <div className="bg-brand-accent p-2 rounded-lg transform transition-transform group-hover:rotate-12">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
