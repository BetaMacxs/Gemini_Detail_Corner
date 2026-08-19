import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, Shield, Search, X } from 'lucide-react';
import { PiInstagramLogo, PiFacebookLogo, PiTiktokLogo } from 'react-icons/pi';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../features/auth/store';
import { useCartStore } from '../features/cart/store';
import { storeConfig } from '../config/store';

export function Header() {
  const { user, profile } = useAuthStore();
  const cartItemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="navbar glass">
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-brand">
            <Link to="/" className="navbar-brand-logo">
              <img src="/logo3.png" alt="Detail Corner" width={110} height={58} />
            </Link>
          </div>
          
          <nav className="navbar-menu">
            {[
              { to: "/", label: "Home" },
              { to: "/products", label: "Products" },
              { to: "/gallery", label: "Gallery" },
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
              { to: "/faq", label: "FAQ" },
              { to: "/track", label: "Track Order" }
            ].map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className="navbar-link"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="navbar-actions">
            <div className="navbar-actions-group">
              {user ? (
                <div className="navbar-actions-group">
                  {profile?.is_admin && (
                    <Link to="/admin" className="navbar-icon-btn admin group" aria-label="Admin Dashboard">
                      <Shield className="h-5 w-5" />
                    </Link>
                  )}
                  <Link to="/account" className="navbar-icon-btn" aria-label="My Account">
                    <User className="h-5 w-5" />
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="navbar-icon-btn" aria-label="Sign In">
                  <User className="h-5 w-5" />
                </Link>
              )}
              
              <Link to="/cart" className="navbar-icon-btn" aria-label={`Shopping Cart with ${cartItemCount} items`}>
                <ShoppingCart className="h-5 w-5" />
                <AnimatePresence>
                  {cartItemCount > 0 && (
                    <motion.span
                      key="cart-count-badge"
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: [1.3, 1], opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="cart-badge"
                    >
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="navbar-mobile-toggle"
                aria-label="Toggle Navigation Menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="navbar-mobile-menu glass"
          >
            <div className="navbar-mobile-content">
              {[
                { to: "/", label: "Home" },
                { to: "/products", label: "Products" },
                { to: "/gallery", label: "Gallery" },
                { to: "/about", label: "About" },
                { to: "/contact", label: "Contact" },
                { to: "/faq", label: "FAQ" },
                { to: "/track", label: "Track Order" }
              ].map((link) => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className="navbar-mobile-link" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <Link 
                to="/cart" 
                className="navbar-mobile-link" 
                onClick={() => setIsMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <ShoppingCart className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  Shopping Cart
                </span>
                {cartItemCount > 0 && (
                  <span
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.65rem',
                      borderRadius: '9999px',
                    }}
                  >
                    {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                  </span>
                )}
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Follow Detail Corner</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <a
                    href={storeConfig.SOCIAL_INSTAGRAM}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                    aria-label="Instagram Profile"
                    title="Instagram (@detail_corner2022)"
                  >
                    <PiInstagramLogo size={16} />
                  </a>
                  <a
                    href={storeConfig.SOCIAL_FACEBOOK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                    aria-label="Facebook Page"
                    title="Facebook (Detail Corner)"
                  >
                    <PiFacebookLogo size={16} />
                  </a>
                  <a
                    href={storeConfig.SOCIAL_TIKTOK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                    aria-label="TikTok Account"
                    title="TikTok (@detailcorner2022)"
                  >
                    <PiTiktokLogo size={16} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
