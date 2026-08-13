import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, Shield, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../features/auth/store';
import { useCartStore } from '../features/cart/store';

export function Header() {
  const { user, profile } = useAuthStore();
  const getTotalItems = useCartStore(state => state.getTotalItems);
  const cartItemCount = getTotalItems();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="navbar glass">
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-brand">
            <Link to="/" className="navbar-brand-logo">
              Detail<span style={{ color: 'var(--accent)' }}>Corner</span>
            </Link>
          </div>
          
          <nav className="navbar-menu">
            {[
              { to: "/", label: "Home" },
              { to: "/products", label: "Products" },
              { to: "/gallery", label: "Gallery" },
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
              { to: "/faq", label: "FAQ" }
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
                    <Link to="/admin" className="navbar-icon-btn admin group">
                      <Shield className="h-5 w-5" />
                    </Link>
                  )}
                  <Link to="/account" className="navbar-icon-btn">
                    <User className="h-5 w-5" />
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="navbar-icon-btn">
                  <User className="h-5 w-5" />
                </Link>
              )}
              
              <Link to="/cart" className="navbar-icon-btn">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="cart-badge">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="navbar-mobile-toggle"
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
                { to: "/faq", label: "FAQ" }
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
