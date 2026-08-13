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
    <div className="account-page">
      <div className="account-container">
        <h1 className="account-title">My Account</h1>
        
        <div className="account-card">
          <div className="account-profile-header">
            <div className="account-user-info">
              <div className="account-avatar-wrapper">
                <User className="h-8 w-8" />
              </div>
              <div className="account-user-details">
                <h2 className="account-user-name">{profile?.full_name || 'Customer'}</h2>
                <p className="account-user-email">{profile?.email}</p>
                {profile?.is_admin && (
                  <span className="admin-badge">
                    Administrator
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="account-links-grid">
            <Link to="/account/orders" className="account-link-item">
              <Package className="h-6 w-6 text-brand-text-secondary mt-0.5" />
              <div className="ml-4">
                <h3 className="account-link-title">Order History</h3>
                <p className="account-link-desc">View and track your past orders.</p>
              </div>
            </Link>
            
            <Link to="/account/addresses" className="account-link-item">
              <MapPin className="h-6 w-6 text-brand-text-secondary mt-0.5" />
              <div className="ml-4">
                <h3 className="account-link-title">Addresses</h3>
                <p className="account-link-desc">Manage your shipping and billing addresses.</p>
              </div>
            </Link>

            {profile?.is_admin && (
              <Link to="/admin" className="account-link-item">
                <Settings className="h-6 w-6 text-brand-text-secondary mt-0.5" />
                <div className="ml-4">
                  <h3 className="account-link-title">Admin Dashboard</h3>
                  <p className="account-link-desc">Manage products, orders, and store settings.</p>
                </div>
              </Link>
            )}
          </div>

          <div className="account-card-footer">
            <button
              onClick={handleSignOut}
              className="signout-btn"
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
