import { Link } from 'react-router-dom';
import { storeConfig } from '../config/store';

export function AdminDashboard() {
  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2rem' }}>
        Admin <span style={{ color: 'var(--accent)' }}>Dashboard</span>
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="brand-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Sales</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>ZAR 0.00</p>
        </div>
        <div className="brand-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Orders</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>0</p>
        </div>
        <div className="brand-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Low Stock Products</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>0</p>
        </div>
      </div>

      <div className="brand-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Management Modules</h3>
          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Select an area to manage.</p>
        </div>
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <Link to="/admin/orders" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', backgroundColor: 'var(--bg)', display: 'block' }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Orders</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Manage customer orders and status.</p>
          </Link>
          <Link to="/admin/products" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', backgroundColor: 'var(--bg)', display: 'block' }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Products</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Manage catalogue and categories.</p>
          </Link>
          <Link to="/admin/inventory" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', backgroundColor: 'var(--bg)', display: 'block' }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Inventory</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Manage stock levels.</p>
          </Link>
          <Link to="/admin/customers" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', backgroundColor: 'var(--bg)', display: 'block' }}>
            <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Customers</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>View customer accounts.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
