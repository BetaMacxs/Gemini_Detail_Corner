import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store';
import { LogOut, Package, MapPin, User, Settings } from 'lucide-react';

export function Account() {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Account</h1>
        
        <div className="mt-8 bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex items-center">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                <User className="h-8 w-8" />
              </div>
              <div className="ml-6">
                <h2 className="text-xl font-bold text-gray-900">{profile?.full_name || 'Customer'}</h2>
                <p className="text-sm text-gray-500">{profile?.email}</p>
                {profile?.is_admin && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                    Administrator
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            <Link to="/account/orders" className="p-6 flex items-start hover:bg-gray-50 transition-colors">
              <Package className="h-6 w-6 text-gray-400 mt-0.5" />
              <div className="ml-4">
                <h3 className="text-base font-medium text-gray-900">Order History</h3>
                <p className="mt-1 text-sm text-gray-500">View and track your past orders.</p>
              </div>
            </Link>
            
            <Link to="/account/addresses" className="p-6 flex items-start hover:bg-gray-50 transition-colors">
              <MapPin className="h-6 w-6 text-gray-400 mt-0.5" />
              <div className="ml-4">
                <h3 className="text-base font-medium text-gray-900">Addresses</h3>
                <p className="mt-1 text-sm text-gray-500">Manage your shipping and billing addresses.</p>
              </div>
            </Link>

            {profile?.is_admin && (
              <Link to="/admin" className="p-6 flex items-start hover:bg-gray-50 transition-colors">
                <Settings className="h-6 w-6 text-gray-400 mt-0.5" />
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-900">Admin Dashboard</h3>
                  <p className="mt-1 text-sm text-gray-500">Manage products, orders, and store settings.</p>
                </div>
              </Link>
            )}
          </div>

          <div className="bg-gray-50 p-6 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              className="flex items-center text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
