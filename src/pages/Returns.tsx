import React from 'react';
import { RefreshCcw, Package, AlertCircle, CheckCircle2 } from 'lucide-react';

export function Returns() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', paddingTop: '4rem', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '48rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', marginBottom: '1rem', color: 'var(--accent)' }}>
            <RefreshCcw size={32} />
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, fontStyle: 'italic', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '-0.05em' }}>
            Returns & <span style={{ color: 'var(--accent)' }}>Refunds</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Last updated: August 2026 • Satisfaction Guaranteed
          </p>
        </div>

        <div className="brand-card" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--accent)' }}>
              <Package size={20} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)' }}>1. 14-Day Return Window</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              We offer a 14-day return policy for unopened and unused products. If you are not satisfied with your purchase, you can return it within 14 days of delivery for a full refund or store credit, excluding shipping costs.
            </p>
          </section>

          <section style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--accent)' }}>
              <AlertCircle size={20} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)' }}>2. Damaged or Defective Items</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              In the rare event that an item arrives damaged or defective, please notify us immediately at info@detailcorner.co.za with photographic evidence. We will arrange for a replacement or full refund at no additional cost to you.
            </p>
          </section>

          <section style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--accent)' }}>
              <CheckCircle2 size={20} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)' }}>3. Refund Process</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              Once your return is received and inspected, we will send you an email notification. Approved refunds will be processed via your original payment method (PayFast) within 5-7 business days.
            </p>
          </section>

          <section style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: '1rem' }}>4. Non-Returnable Items</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              Please note that used chemical products, opened microfiber towels, and clearance items are not eligible for return due to safety and quality control standards.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
