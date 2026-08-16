import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Star, Shield, Zap, Sparkles, Droplets, Trophy, Car } from 'lucide-react';
import { useProductsStore } from '../features/products/store';
import { storeConfig } from '../config/store';

export function Home() {
  const { products, fetchProducts, isLoading } = useProductsStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const featuredProducts = products.filter(p => p.featured).slice(0, 4);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price);
  };

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
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hero-content"
          >
            <div className="section-eyebrow">
              <div className="eyebrow-line"></div>
              <span className="eyebrow-text">The Art of Perfection</span>
            </div>
            <h1 className="hero-title">
              Premium <br />
              <span style={{ color: 'var(--accent)' }}>Car Care</span> <br />
              Products
            </h1>
            <p className="hero-description">
              Elevate your car care routine with professional grade products designed for those who demand nothing but perfection.
            </p>
            <div className="hero-buttons">
              <Link 
                to="/products" 
                className="btn btn-primary"
                style={{ padding: '1.25rem 2.5rem', borderRadius: '1rem' }}
              >
                <span>Explore Shop</span>
                <ArrowRight size={20} style={{ marginLeft: '0.75rem' }} />
              </Link>
              <Link 
                to="/gallery" 
                className="btn btn-outline"
                style={{ padding: '1.25rem 2.5rem', borderRadius: '1rem' }}
              >
                Our Gallery
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            {[
              { icon: Shield, label: "Premium Quality", desc: "Professional Grade" },
              { icon: Zap, label: "Fast Shipping", desc: "Within 24 Hours" },
              { icon: Sparkles, label: "Expert Support", desc: "Detailing Pros" },
              { icon: Droplets, label: "pH Neutral", desc: "Safe for all Finishes" }
            ].map((badge, idx) => (
              <div key={idx} className="feature-item">
                <badge.icon className="feature-icon" />
                <div>
                  <div className="feature-title">{badge.label}</div>
                  <div className="feature-desc">{badge.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
              <div className="eyebrow-line"></div>
              <span className="eyebrow-text">Department</span>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.05em', color: 'var(--text-primary)' }}>
              Browse by <span style={{ color: 'var(--accent)' }}>Category</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {[
              { name: 'Exterior', image: 'https://images.unsplash.com/photo-1599256621730-535171e28e50?auto=format&fit=crop&q=80&w=600', icon: Car },
              { name: 'Interior', image: 'https://images.unsplash.com/photo-1507136566466-4d333f06041e?auto=format&fit=crop&q=80&w=600', icon: Droplets },
              { name: 'Wheels', image: 'https://images.unsplash.com/photo-1549927681-0b673b8243ab?auto=format&fit=crop&q=80&w=600', icon: Zap },
              { name: 'Accessories', image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=600', icon: Sparkles }
            ].map((cat, i) => (
              <Link 
                key={i} 
                to={`/products?category=${cat.name.toUpperCase()}`}
                className="brand-card"
                style={{ 
                  position: 'relative', 
                  height: '18rem', 
                  overflow: 'hidden', 
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '2rem'
                }}
              >
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6, transition: 'transform 0.5s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <cat.icon size={32} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', textTransform: 'uppercase', fontStyle: 'italic', margin: 0 }}>{cat.name}</h3>
                </div>
              </Link>
            ))}
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
                <span className="eyebrow-text">Collection</span>
              </div>
              <h2 className="section-title">
                Featured <span style={{ color: 'var(--accent)' }}>Products</span>
              </h2>
            </div>
            <Link to="/products" className="view-all-link">
              <span>View All Products</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="products-grid">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="product-card-skeleton"></div>
              ))
            ) : (
              featuredProducts.map((product) => (
                <motion.div 
                  key={product.id}
                  whileHover={{ y: -10 }}
                  className="product-card brand-card"
                >
                  <Link to={`/product/${product.slug}`} className="block">
                    <div className="product-card-image-wrapper">
                      <img 
                        src={product.images?.[0]?.url || product.images?.[0]?.storage_path || `/${product.slug.toLowerCase()}.png`} 
                        alt={product.name}
                        className="product-card-image"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23333333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
                          e.currentTarget.style.height = '100%';
                          e.currentTarget.style.width = '100%';
                          e.currentTarget.style.objectFit = 'contain';
                          e.currentTarget.style.padding = '3rem';
                          e.currentTarget.style.opacity = '0.5';
                        }}
                      />
                      <div className="product-card-overlay"></div>
                    </div>
                    <div className="product-card-info">
                      <div className="product-rating">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="product-rating-star" style={{ fill: i < 4 ? 'var(--gold)' : 'none', color: i < 4 ? 'var(--gold)' : 'var(--text-secondary)' }} />
                        ))}
                      </div>
                      <h3 className="product-card-name">
                        {product.name}
                      </h3>
                      <div className="product-card-price">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-background-glow"></div>
        <div className="cta-content">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            <Sparkles size={20} />
            <span className="eyebrow-text">Join the Community</span>
          </div>
          <h2 className="cta-title">
            Ready to give your car <br />
            The <span className="cta-accent-text">Ultimate Shine?</span>
          </h2>
          <p className="cta-description">
            Sign up for our newsletter to receive exclusive detailing tips, early access to new products, and special offers.
          </p>
          <div className="cta-form">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="cta-input"
            />
            <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '0.75rem' }}>
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
