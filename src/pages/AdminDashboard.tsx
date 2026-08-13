import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storeConfig } from '../config/store';
import { supabase } from '../lib/supabase';
import { ShoppingCart, Package, AlertTriangle, Users, TrendingUp, FileText, Monitor, Megaphone, Mail, Image } from 'lucide-react';
import { AdminNav } from '../components/AdminNav';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    totalSales: 0,
    pendingOrdersCount: 0,
    totalOrdersCount: 0,
    lowStockCount: 0,
    totalProductsCount: 0,
    messagesCount: 0,
    lowStockItemNames: [] as string[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      let salesToday = 0;
      let salesTotal = 0;
      let pendingCount = 0;
      let totalOrders = 0;
      let lowStockCnt = 0;
      let totalProds = 0;
      let msgCnt = 0;
      let lowStockNames: string[] = [];

      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Orders
      try {
        const { data: dbOrders } = await supabase.from('orders').select('*');
        if (dbOrders) {
          totalOrders = dbOrders.length;
          dbOrders.forEach(o => {
            const val = Number(o.total || 0);
            salesTotal += val;

            const isPaid = o.status === 'PAID' || o.status === 'PROCESSING' || o.status === 'DELIVERED' || o.status === 'SHIPPED';
            if (o.status === 'PENDING' || o.status === 'PENDING_PAYMENT') {
              pendingCount += 1;
            }

            if (isPaid && o.created_at) {
              const oDate = new Date(o.created_at).toISOString().split('T')[0];
              if (oDate === todayStr) {
                salesToday += val;
              }
            }
          });
        }
      } catch (e) {
        console.warn("Error fetching orders for dashboard:", e);
      }

      // 2. Products & Low Stock
      try {
        const { data: prods } = await supabase.from('products').select('*');
        if (prods) {
          totalProds = prods.length;
          const lowList = prods.filter(p => (p.stock_quantity ?? 10) <= (p.low_stock_threshold ?? 5));
          lowStockCnt = lowList.length;
          lowStockNames = lowList.map(p => p.name);
        }
      } catch (e) {
        console.warn("Error fetching products for dashboard:", e);
      }

      // 3. Contact Messages
      try {
        const { data: msgs } = await supabase.from('contact_messages').select('*');
        if (msgs) {
          msgCnt = msgs.length;
        }
      } catch (e) {
        console.warn("Error fetching contact messages for dashboard:", e);
      }

      setStats({
        todaySales: salesToday,
        totalSales: salesTotal,
        pendingOrdersCount: pendingCount,
        totalOrdersCount: totalOrders,
        lowStockCount: lowStockCnt,
        totalProductsCount: totalProds,
        messagesCount: msgCnt,
        lowStockItemNames: lowStockNames
      });
      setLoading(false);
    }

    loadStats();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price || 0);
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Admin <span style={{ color: 'var(--accent)' }}>Dashboard</span>
        </h1>
        <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Welcome back. Store management and live analytical stats from database.
        </p>
      </div>

      <AdminNav />

      {/* Top Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="brand-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Sales</h3>
            <TrendingUp className="h-4 w-4" style={{ color: 'var(--accent)' }} />
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {formatPrice(stats.todaySales)}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total: {formatPrice(stats.totalSales)}</span>
        </div>

        <div className="brand-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Orders</h3>
            <ShoppingCart className="h-4 w-4" style={{ color: 'var(--accent)' }} />
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {stats.totalOrdersCount}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pending: {stats.pendingOrdersCount}</span>
        </div>

        <div className="brand-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Low Stock Items</h3>
            <AlertTriangle className="h-4 w-4" style={{ color: stats.lowStockCount > 0 ? '#ef4444' : 'var(--text-secondary)' }} />
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '1.75rem', fontWeight: 900, color: stats.lowStockCount > 0 ? '#ef4444' : 'var(--text-primary)' }}>
            {stats.lowStockCount}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Catalogue: {stats.totalProductsCount} items</span>
        </div>

        <div className="brand-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Messages</h3>
            <Mail className="h-4 w-4" style={{ color: 'var(--accent)' }} />
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {stats.messagesCount}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Contact submissions</span>
        </div>
      </div>

      {/* Low Stock Alerts Section */}
      {stats.lowStockItemNames.length > 0 && (
        <div className="brand-card" style={{ padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2.5rem', borderLeft: '4px solid #ef4444' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle className="h-4 w-4" /> Low Stock Warning
          </h3>
          <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {stats.lowStockItemNames.map((name, i) => (
              <span key={i} style={{ padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '0.8125rem', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Store Operations Cards */}
      <div className="brand-card" style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', fontStyle: 'italic' }}>Store Management Modules</h3>
          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Direct operations and catalogue controls.</p>
        </div>

        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <Link to="/admin/orders" style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', backgroundColor: 'var(--bg)', display: 'block', transition: 'border-color 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShoppingCart className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>Orders</h4>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Manage orders, status updates & line items.</p>
          </Link>

          <Link to="/admin/products" style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', backgroundColor: 'var(--bg)', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Package className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>Products</h4>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Manage catalogue prices, categories & listings.</p>
          </Link>

          <Link to="/admin/inventory" style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', backgroundColor: 'var(--bg)', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <AlertTriangle className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>Stock & Inventory</h4>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Adjust quantity levels & variant stock.</p>
          </Link>

          <Link to="/admin/invoices" style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', backgroundColor: 'var(--bg)', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <FileText className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>Tax Invoices</h4>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Generate & print official 15% VAT tax invoices.</p>
          </Link>

          <Link to="/admin/pos" style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', backgroundColor: 'var(--bg)', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Monitor className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>Point of Sale</h4>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>In-store counter sales with instant cart checkout.</p>
          </Link>

          <Link to="/admin/announcements" style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', backgroundColor: 'var(--bg)', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Megaphone className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>Announcements</h4>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Promotional banners & store notification popups.</p>
          </Link>

          <Link to="/admin/messages" style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', backgroundColor: 'var(--bg)', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Mail className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>Messages</h4>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Customer contact form submissions.</p>
          </Link>

          <Link to="/admin/gallery" style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', backgroundColor: 'var(--bg)', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Image className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>Gallery & Media</h4>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Manage TikTok videos & promotional photos.</p>
          </Link>

          <Link to="/admin/customers" style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', backgroundColor: 'var(--bg)', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Users className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>Customers</h4>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>View registered user profile accounts.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
