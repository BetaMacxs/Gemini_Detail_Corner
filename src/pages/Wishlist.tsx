import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useWishlistStore } from '../features/wishlist/store';
import { storeConfig } from '../config/store';

export function Wishlist() {
  const { items, removeItem, clearWishlist } = useWishlistStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="container page-container" style={{ textAlign: 'center', paddingTop: '6rem', paddingBottom: '6rem' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--surface)', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          <Heart size={48} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.05em', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Your Wishlist is Empty
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
          Save items you love here and purchase them when you're ready.
        </p>
        <Link to="/products" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingBag size={20} />
          <span>Start Shopping</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', paddingTop: '4rem', paddingBottom: '6rem' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textDecoration: 'none', marginBottom: '1rem' }}>
              <ArrowLeft size={16} />
              <span>Back to Shop</span>
            </Link>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.05em', color: 'var(--text-primary)' }}>
              My <span style={{ color: 'var(--accent)' }}>Wishlist</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          <button 
            onClick={clearWishlist}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
          >
            Clear All
          </button>
        </div>

        <div className="products-grid">
          {items.map((item) => {
            const { product } = item;
            const price = product.price;
            const image = product.images?.[0] ? (product.images[0].url || product.images[0].storage_path) : `/${product.slug.toLowerCase()}.png`;

            return (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
                className="product-card" 
                style={{ position: 'relative' }}
              >
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeItem(item.id); }}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 10,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '50%',
                    width: '2.5rem',
                    height: '2.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} />
                </button>

                <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <div className="product-image-container">
                    <img 
                      src={image} 
                      alt={product.name} 
                      className="product-image"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.classList.add('image-fallback');
                          parent.innerHTML = `<span class="image-fallback-text">${product.name.charAt(0)}</span>`;
                        }
                      }}
                    />
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{product.name}</h3>
                    <div className="product-price">{formatPrice(price)}</div>
                    <div style={{ marginTop: '1rem' }}>
                      <span className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        View Details
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
