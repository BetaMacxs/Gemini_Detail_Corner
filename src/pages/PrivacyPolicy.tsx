import React from 'react';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', paddingTop: '4rem', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '48rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', marginBottom: '1rem', color: 'var(--accent)' }}>
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, fontStyle: 'italic', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '-0.05em' }}>
            Privacy <span style={{ color: 'var(--accent)' }}>Policy</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Last updated: August 2026 • Detail Corner South Africa
          </p>
        </div>

        <div className="brand-card" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--accent)' }}>
              <Lock className="h-5 w-5" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)' }}>1. Data Protection & Security</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              At Detail Corner, we prioritize customer confidentiality and data security. All payment transactions processed through PayFast are protected by end-to-end 256-bit encryption. We never store credit card numbers or sensitive financial credentials on our servers.
            </p>
          </section>

          <section style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--accent)' }}>
              <Eye className="h-5 w-5" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)' }}>2. Information Collection</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              We only collect information necessary to fulfill your detailing order, communicate order status updates, and provide high-caliber support. This includes your name, delivery address, phone number, and email address.
            </p>
          </section>

          <section style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--accent)' }}>
              <FileText className="h-5 w-5" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)' }}>3. POPIA Compliance</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              In compliance with the Protection of Personal Information Act (POPIA) of South Africa, you reserve the right to request access to, correction of, or deletion of your personal profile data at any time by contacting support at info@detailcorner.co.za.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
