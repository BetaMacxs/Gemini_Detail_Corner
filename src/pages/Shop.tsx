import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProductsStore } from '../features/products/store';
import { Search, Filter, ShoppingBag } from 'lucide-react';
import { storeConfig } from '../config/store';

export function Shop() {
  const { products, categories, isLoading, error, fetchProducts, fetchCategories } = useProductsStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      searchParams.set('category', val);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-text-primary tracking-tight">Shop Products</h1>
          <p className="mt-2 text-sm text-brand-text-secondary">Premium detailing supplies for the perfect finish.</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent sm:text-sm transition-shadow"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-text-secondary" />
          </form>
          
          <div className="relative">
            <select
              value={categoryId}
              onChange={handleCategoryChange}
              className="w-full sm:w-48 pl-10 pr-8 py-2 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent sm:text-sm appearance-none bg-black/40 transition-shadow"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-brand-text-secondary" />
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center">
          <p>{error}</p>
          <p className="text-sm mt-2 opacity-80">Make sure Supabase is configured with valid credentials in the settings.</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="group block">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-2xl bg-brand-border/80 animate-pulse xl:aspect-w-7 xl:aspect-h-8 border border-brand-border/50">
              </div>
              <div className="mt-4 flex justify-between items-start">
                <div className="w-full">
                  <div className="h-4 bg-brand-border/80 rounded animate-pulse w-3/4 mb-2"></div>
                  <div className="h-3 bg-brand-border/80 rounded animate-pulse w-1/2"></div>
                </div>
                <div className="text-right pl-4">
                  <div className="h-4 bg-brand-border/80 rounded animate-pulse w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-brand-bg rounded-2xl border border-brand-border/50">
          <ShoppingBag className="mx-auto h-12 w-12 text-brand-text-secondary" />
          <h3 className="mt-4 text-lg font-medium text-brand-text-primary">No products found</h3>
          <p className="mt-2 text-sm text-brand-text-secondary">We couldn't find anything matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link key={product.id} to={`/product/${product.slug}`} className="group block">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-2xl bg-brand-border xl:aspect-w-7 xl:aspect-h-8 border border-brand-border/50 transition-all hover:shadow-md">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].storage_path}
                    alt={product.images[0].alt_text || product.name}
                    className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
                  />
                ) : (
                  <img 
                    src={`/${product.slug.toLowerCase()}.png`}
                    alt={product.name}
                    className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
                    onError={(e) => {
                      // Fallback if image doesn't exist yet
                      e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23333333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
                      e.currentTarget.className = "h-full w-full object-contain p-12 opacity-50";
                    }}
                  />
                )}
              </div>
              <div className="mt-4 flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-brand-text-primary group-hover:text-brand-accent transition-colors">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-brand-text-secondary line-clamp-1">{product.short_description}</p>
                </div>
                <div className="text-right pl-4">
                  <p className="text-sm font-medium text-brand-text-primary">
                    {formatPrice(product.price)}
                  </p>
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <p className="text-xs text-brand-text-secondary line-through mt-0.5">
                      {formatPrice(product.compare_at_price)}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
