import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const signOut = useAuthStore(state => state.signOut);

  const navItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Products', path: '/admin/products' },
    { label: 'Stock', path: '/admin/inventory' },
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Invoices', path: '/admin/invoices' },
    { label: 'Point of Sale', path: '/admin/pos' },
    { label: 'Announcements', path: '/admin/announcements' },
    { label: 'Messages', path: '/admin/messages' },
    { label: 'Gallery', path: '/admin/gallery' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#181818', color: '#e5e5e5', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Header */}
      <header style={{
        height: '3.5rem',
        backgroundColor: '#111111',
        borderBottom: '1px solid #262626',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f3f4f6', letterSpacing: '-0.02em' }}>
          Detail Corner Admin
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.25rem 0.85rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: '9999px',
            border: '1px solid #ef4444',
            backgroundColor: 'transparent',
            color: '#ef4444',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#ef4444';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#ef4444';
          }}
        >
          Logout
        </button>
      </header>

      {/* Main Layout Container */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 3.5rem)' }}>
        {/* Sidebar */}
        <aside style={{
          width: '13.5rem',
          backgroundColor: '#141414',
          borderRight: '1px solid #262626',
          padding: '1.25rem 0.75rem',
          flexShrink: 0
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'block',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: active ? 700 : 500,
                    textDecoration: 'none',
                    color: active ? '#ef4444' : '#9ca3af',
                    backgroundColor: active ? '#262626' : 'transparent',
                    transition: 'background-color 0.15s ease, color 0.15s ease'
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content View */}
        <main style={{ flex: 1, padding: '2rem 2.5rem', backgroundColor: '#1c1c1c', overflowX: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
