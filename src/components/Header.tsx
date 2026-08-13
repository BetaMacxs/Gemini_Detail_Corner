import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, Shield, Search, X } from 'lucide-react';
import { useAuthStore } from '../features/auth/store';
import { useCartStore } from '../features/cart/store';

export function Header() {
  const { user, profile } = useAuthStore();
  const getTotalItems = useCartStore(state => state.getTotalItems);
  const cartItemCount = getTotalItems();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-brand-bg/80 backdrop-blur-md border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="text-2xl font-black tracking-tighter text-brand-text-primary uppercase italic">
                Detail<span className="text-brand-accent">Corner</span>
              </span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/" className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-brand-text-secondary hover:text-brand-accent transition-colors">Home</Link>
            <Link to="/products" className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-brand-text-secondary hover:text-brand-accent transition-colors">Products</Link>
            <Link to="/gallery" className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-brand-text-secondary hover:text-brand-accent transition-colors">Gallery</Link>
            <Link to="/about" className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-brand-text-secondary hover:text-brand-accent transition-colors">About</Link>
            <Link to="/contact" className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-brand-text-secondary hover:text-brand-accent transition-colors">Contact</Link>
            <Link to="/faq" className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-brand-text-secondary hover:text-brand-accent transition-colors">FAQ</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {user ? (
                <div className="flex items-center space-x-1">
                  {profile?.is_admin && (
                    <Link to="/admin" className="p-2 text-brand-accent hover:bg-brand-accent/10 rounded-full transition-colors relative group">
                      <Shield className="h-6 w-6" />
                    </Link>
                  )}
                  <Link to="/account" className="p-2 text-brand-text-secondary hover:text-brand-accent hover:bg-brand-accent/10 rounded-full transition-colors">
                    <User className="h-6 w-6" />
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="p-2 text-brand-text-secondary hover:text-brand-accent transition-colors">
                  <User className="h-6 w-6" />
                </Link>
              )}
              
              <Link to="/cart" className="p-2 text-brand-text-secondary hover:text-brand-accent hover:bg-brand-accent/10 rounded-full transition-colors relative">
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute top-1 right-1 bg-brand-accent text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-brand-bg">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-brand-text-secondary hover:text-brand-accent transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-brand-bg border-b border-brand-border">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link to="/" className="block px-3 py-4 text-base font-bold uppercase tracking-wider text-brand-text-primary hover:text-brand-accent border-b border-brand-border/50" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/products" className="block px-3 py-4 text-base font-bold uppercase tracking-wider text-brand-text-primary hover:text-brand-accent border-b border-brand-border/50" onClick={() => setIsMenuOpen(false)}>Products</Link>
            <Link to="/gallery" className="block px-3 py-4 text-base font-bold uppercase tracking-wider text-brand-text-primary hover:text-brand-accent border-b border-brand-border/50" onClick={() => setIsMenuOpen(false)}>Gallery</Link>
            <Link to="/about" className="block px-3 py-4 text-base font-bold uppercase tracking-wider text-brand-text-primary hover:text-brand-accent border-b border-brand-border/50" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link to="/contact" className="block px-3 py-4 text-base font-bold uppercase tracking-wider text-brand-text-primary hover:text-brand-accent border-b border-brand-border/50" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            <Link to="/faq" className="block px-3 py-4 text-base font-bold uppercase tracking-wider text-brand-text-primary hover:text-brand-accent" onClick={() => setIsMenuOpen(false)}>FAQ</Link>
          </div>
        </div>
      )}
    </header>
  );
}
