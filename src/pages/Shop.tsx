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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shop Products</h1>
          <p className="mt-2 text-sm text-gray-500">Premium detailing supplies for the perfect finish.</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-shadow"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </form>
          
          <div className="relative">
            <select
              value={categoryId}
              onChange={handleCategoryChange}
              className="w-full sm:w-48 pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:ring-gray-900 focus:border-gray-900 sm:text-sm appearance-none bg-white transition-shadow"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center">
          <p>{error}</p>
          <p className="text-sm mt-2 opacity-80">Make sure Supabase is configured with valid credentials in the settings.</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-2xl border border-gray-100">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-2 text-sm text-gray-500">We couldn't find anything matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link key={product.id} to={`/product/${product.slug}`} className="group block">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-2xl bg-gray-100 xl:aspect-w-7 xl:aspect-h-8 border border-gray-100 transition-all hover:shadow-md">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].storage_path}
                    alt={product.images[0].alt_text || product.name}
                    className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
                  />
                ) : (
                  <div className="h-64 w-full flex items-center justify-center text-gray-400">
                    <ShoppingBag className="h-12 w-12 opacity-50" />
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-1">{product.short_description}</p>
                </div>
                <div className="text-right pl-4">
                  <p className="text-sm font-medium text-gray-900">
                    {formatPrice(product.price)}
                  </p>
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <p className="text-xs text-gray-500 line-through mt-0.5">
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
