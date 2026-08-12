import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storeConfig } from '../config/store';
import { useProductsStore } from '../features/products/store';

export function Home() {
  const { products, fetchProducts, isLoading } = useProductsStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const featuredProducts = products.slice(0, 4);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price);
  };

  return (
    <div>
      <section className="relative bg-brand-bg overflow-hidden">
        {/* Placeholder for the car background image */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-b from-transparent to-[#1f1f1f]">
          <div className="absolute inset-0 bg-brand-bg/80" style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8))' }}></div>
        </div>
        <div className="relative py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-brand-text-primary sm:text-5xl md:text-6xl">
              <span className="block"><span className="text-brand-accent">Detail</span> Corner</span>
              <span className="block text-brand-text-secondary text-2xl sm:text-3xl mt-3 font-medium">
                Premium automotive detailing products.
              </span>
            </h1>
            <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
              <Link
                to="/products"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-brand-text-primary bg-brand-accent hover:bg-brand-accent-hover transition-colors md:py-4 md:text-lg md:px-10"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-brand-text-primary sm:text-4xl">Featured Products</h2>
            <p className="mt-4 text-lg text-brand-text-secondary">Discover our top-rated detailing supplies.</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
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

          <div className="mt-12 text-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-3 border border-brand-border text-base font-medium rounded-full text-brand-text-primary hover:border-brand-accent hover:bg-brand-accent hover:text-white transition-all md:py-4 md:text-lg md:px-10"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
