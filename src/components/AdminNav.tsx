import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Warehouse, FileText, Monitor, Megaphone, Mail, Image, Users } from 'lucide-react';

export function AdminNav() {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Inventory', path: '/admin/inventory', icon: Warehouse },
    { label: 'Invoices', path: '/admin/invoices', icon: FileText },
    { label: 'POS', path: '/admin/pos', icon: Monitor },
    { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { label: 'Messages', path: '/admin/messages', icon: Mail },
    { label: 'Gallery', path: '/admin/gallery', icon: Image },
    { label: 'Customers', path: '/admin/customers', icon: Users },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="brand-card" style={{ padding: '0.75rem var(--spacing-container-px)', marginBottom: '2rem', borderRadius: 'var(--radius-md)' }}>
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: active ? 800 : 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                backgroundColor: active ? 'var(--accent)' : 'transparent',
                color: active ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
