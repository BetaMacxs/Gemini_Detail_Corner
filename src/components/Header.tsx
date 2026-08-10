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
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight">
              {storeConfig.STORE_NAME}
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/shop" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
              Shop
            </Link>
            <Link to="/categories" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
              Categories
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                {profile?.is_admin && (
                  <Link to="/admin" className="p-2 text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1">
                    <Shield className="h-5 w-5" />
                    <span className="text-sm font-medium hidden sm:block">Admin</span>
                  </Link>
                )}
                <Link to="/account" className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <span className="text-sm font-medium hidden sm:block">
                    {profile?.full_name || 'Account'}
                  </span>
                  <User className="h-5 w-5" />
                </Link>
              </div>
            ) : (
              <Link to="/login" className="p-2 text-gray-400 hover:text-gray-500 transition-colors">
                <span className="sr-only">Login</span>
                <User className="h-5 w-5" />
              </Link>
            )}
            
            <Link to="/cart" className="p-2 text-gray-400 hover:text-gray-500 transition-colors relative">
              <span className="sr-only">Cart</span>
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-gray-900 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <button className="md:hidden p-2 text-gray-400 hover:text-gray-500 transition-colors">
              <span className="sr-only">Menu</span>
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
