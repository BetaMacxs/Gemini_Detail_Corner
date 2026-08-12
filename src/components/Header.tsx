import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, LogOut, Shield } from 'lucide-react';
import { storeConfig } from '../config/store';
import { useAuthStore } from '../features/auth/store';
import { useCartStore } from '../features/cart/store';

export function Header() {
  const { user, profile } = useAuthStore();
  const getTotalItems = useCartStore(state => state.getTotalItems);
  const cartItemCount = getTotalItems();

  return (
    <header className="bg-brand-surface border-b border-brand-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-1 flex justify-start lg:w-0">
            <Link to="/" className="text-xl font-bold text-brand-text-dark tracking-tight flex items-center">
              <span className="text-brand-accent">Detail</span> Corner
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-brand-text-dark/80 hover:text-brand-accent px-3 py-2 text-sm font-medium transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-brand-text-dark/80 hover:text-brand-accent px-3 py-2 text-sm font-medium transition-colors">
              Products
            </Link>
            <Link to="/gallery" className="text-brand-text-dark/80 hover:text-brand-accent px-3 py-2 text-sm font-medium transition-colors">
              Gallery
            </Link>
            <Link to="/about" className="text-brand-text-dark/80 hover:text-brand-accent px-3 py-2 text-sm font-medium transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-brand-text-dark/80 hover:text-brand-accent px-3 py-2 text-sm font-medium transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex-1 flex items-center justify-end space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                {profile?.role === 'ADMIN' && (
                  <Link to="/admin" className="p-2 text-brand-accent hover:text-brand-accent-hover transition-colors flex items-center space-x-1">
                    <Shield className="h-5 w-5" />
                    <span className="text-sm font-medium hidden sm:block">Admin</span>
                  </Link>
                )}
                <Link to="/account" className="flex items-center space-x-2 p-2 text-brand-text-dark/80 hover:text-brand-text-dark transition-colors">
                  <span className="text-sm font-medium hidden sm:block">
                    {profile?.full_name || 'Account'}
                  </span>
                  <User className="h-5 w-5" />
                </Link>
              </div>
            ) : (
              <Link to="/login" className="p-2 text-brand-text-dark/80 hover:text-brand-text-dark transition-colors">
                <span className="sr-only">Login</span>
                <User className="h-5 w-5" />
              </Link>
            )}
            
            <Link to="/cart" className="p-2 text-brand-text-dark/80 hover:text-brand-text-dark transition-colors relative">
              <span className="sr-only">Cart</span>
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-brand-text-primary transform translate-x-1/2 -translate-y-1/2 bg-brand-accent rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <button className="md:hidden p-2 text-brand-text-dark/80 hover:text-brand-text-dark transition-colors">
              <span className="sr-only">Menu</span>
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
