import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Home, Search, HelpCircle, Truck, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="container page-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      <div 
        className="brand-card" 
        style={{ 
          maxWidth: '36rem', 
          width: '100%', 
          textAlign: 'center', 
          padding: '3rem 2rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--card-bg)'
        }}
      >
        <div 
          style={{ 
            fontSize: '5rem', 
            fontWeight: 900, 
            lineHeight: 1, 
            color: 'var(--accent)', 
            letterSpacing: '-0.05em',
            marginBottom: '0.5rem'
          }}
        >
          404
        </div>
        
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Page Not Found
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          The page you are looking for might have been moved, renamed, or is temporarily unavailable. Browse our catalog or use the quick links below.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '22rem', margin: '0 auto 2rem auto' }}>
          <Link 
            to="/shop" 
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem 1.5rem' }}
          >
            <ShoppingBag size={18} />
            <span>Browse All Products</span>
          </Link>
          
          <Link 
            to="/track" 
            className="btn btn-outline" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem 1.5rem' }}
          >
            <Truck size={18} />
            <span>Track Your Order</span>
          </Link>

          <Link 
            to="/" 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem 1.5rem' }}
          >
            <Home size={18} />
            <span>Return to Home</span>
          </Link>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Need assistance? <Link to="/contact" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'underline' }}>Contact Detail Corner Support</Link>
        </div>
      </div>
    </div>
  );
}
