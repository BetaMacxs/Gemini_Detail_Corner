import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Star,
  Shield,
  Zap,
  Sparkles,
  Droplets,
  Eye,
} from 'lucide-react';
import { useProductsStore } from '../features/products/store';
import { storeConfig } from '../config/store';
import { QuickViewModal } from '../components/QuickViewModal';
import { ProductRating } from '../components/ProductRating';
import { ProductWithDetails } from '../types/database';

export function Home() {
  const { products, fetchProducts, isLoading } = useProductsStore();
  const [quickViewProduct, setQuickViewProduct] = useState<ProductWithDetails | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price);
  };

  const heroFeatures = [
    {
      icon: Shield,
      label: 'Premium Quality',
      desc: 'Professional Grade',
    },
    {
      icon: Zap,
      label: 'Fast Shipping',
      desc: 'Within 24 Hours',
    },
    {
      icon: Sparkles,
      label: 'Expert Support',
      desc: 'Detailing Pros',
    },
    {
      icon: Droplets,
      label: 'pH Neutral',
      desc: 'Safe for all Finishes',
    },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-image-wrapper">
          <img
            src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=2000"
            alt="Premium Detailing"
            className="hero-image"
          />

          <div className="hero-gradient-overlay"></div>
        </div>

        <div className="hero-content-wrapper">
          <div className="hero-layout">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="hero-content"
            >
              <div className="section-eyebrow">
                <div className="eyebrow-line"></div>

                <span className="eyebrow-text">
                  The Art of Perfection
                </span>
              </div>

              <h1 className="hero-title">
                Premium <br />
                <span style={{ color: 'var(--accent)' }}>
                  Car Care
                </span>{' '}
                <br />
                Products
              </h1>

              <p className="hero-description">
                Elevate your car care routine with professional grade
                products designed for those who demand nothing but
                perfection.
              </p>

              <div className="hero-buttons">
                <Link
                  to="/products"
                  className="btn btn-primary"                  
                >
                  <span>Explore Shop</span>

                  <ArrowRight
                    size={20}
                    style={{ marginLeft: '0.75rem' }}
                  />
                </Link>

                <Link
                  to="/gallery"
                  className="btn btn-outline"
                >
                  Our Gallery
                </Link>
              </div>
            </motion.div>

            {/* Hero Features */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: 'easeOut',
              }}
              className="hero-features"
            >
              {heroFeatures.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={index}
                    className="hero-feature-item"
                  >
                    <div className="hero-feature-icon">
                      <Icon size={24} />
                    </div>

                    <div className="hero-feature-content">
                      <div className="hero-feature-title">
                        {feature.label}
                      </div>

                      <div className="hero-feature-desc">
                        {feature.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products-section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">
                <div className="eyebrow-line"></div>

                <span className="eyebrow-text">
                  Collection
                </span>
              </div>

              <h2 className="section-title">
                Featured{' '}
                <span style={{ color: 'var(--accent)' }}>
                  Products
                </span>
              </h2>
            </div>

            <Link
              to="/products"
              className="view-all-link"
            >
              <span>View All Products</span>

              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="products-grid">
            {isLoading ? (
              [...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="product-card-skeleton"
                ></div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -10 }}
                  className="product-card brand-card"
                >
                  <Link
                    to={`/product/${product.slug}`}
                    className="block"
                  >
                    <div className="product-card-image-wrapper">
                      <img
                        src={
                          product.images?.[0]?.url ||
                          product.images?.[0]?.storage_path ||
                          `/${product.slug.toLowerCase()}.png`
                        }
                        alt={product.name}
                        className="product-card-image"
                        onError={(event) => {
                          event.currentTarget.src =
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23333333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';

                          event.currentTarget.style.height =
                            '100%';

                          event.currentTarget.style.width =
                            '100%';

                          event.currentTarget.style.objectFit =
                            'contain';

                          event.currentTarget.style.padding =
                            '3rem';

                          event.currentTarget.style.opacity =
                            '0.5';
                        }}
                      />

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

                      <div className="product-card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                        <div className="product-card-price" style={{ margin: 0 }}>
                          {formatPrice(product.price)}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setQuickViewProduct(product);
                          }}
                          className="quickview-icon-btn"
                          title="Quick View"
                          aria-label={`Quick view ${product.name}`}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="products-empty-state">
                <p>No featured products available.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-background-glow"></div>

        <div className="cta-content">
          <div
            className="section-eyebrow"
            style={{ justifyContent: 'center' }}
          >
            <Sparkles size={20} />

            <span className="eyebrow-text">
              Join the Community
            </span>
          </div>

          <h2 className="cta-title">
            Ready to give your car <br />
            The{' '}
            <span className="cta-accent-text">
              Ultimate Shine?
            </span>
          </h2>

          <p className="cta-description">
            Sign up for our newsletter to receive exclusive
            detailing tips, early access to new products, and
            special offers.
          </p>

          <div className="cta-form">
            <input
              type="email"
              placeholder="Your email address"
              className="cta-input"
            />

            <button
              className="btn btn-primary"              
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={quickViewProduct !== null}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}