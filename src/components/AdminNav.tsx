import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Warehouse, FileText, Monitor, Megaphone, Mail, Image, Users, Bell } from 'lucide-react';

export function AdminNav() {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
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
    <div className="admin-nav-container">
      <div className="admin-nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-link ${active ? 'active' : ''}`}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
