import React from 'react';
import { FileText, Shield, Gavel, Scale } from 'lucide-react';

export function Terms() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', paddingTop: '4rem', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '48rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', marginBottom: '1rem', color: 'var(--accent)' }}>
            <Gavel size={32} />
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, fontStyle: 'italic', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '-0.05em' }}>
            Terms & <span style={{ color: 'var(--accent)' }}>Conditions</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Last updated: August 2026 • Detail Corner South Africa
          </p>
        </div>

        <div className="brand-card" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--accent)' }}>
              <Scale size={20} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)' }}>1. Acceptance of Terms</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              By accessing and using the Detail Corner website, you agree to be bound by these Terms and Conditions. Our services are provided for automotive enthusiasts and professionals seeking high-caliber detailing supplies and information.
            </p>
          </section>

          <section style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--accent)' }}>
              <FileText size={20} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)' }}>2. Use of Products</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              Detailing products sold on this site are intended for automotive use. Users must strictly follow application instructions and safety warnings provided with each product. Detail Corner is not liable for damages resulting from improper application or use on incompatible surfaces.
            </p>
          </section>

          <section style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--accent)' }}>
              <Shield size={20} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)' }}>3. Intellectual Property</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              All content, including logos, images, product descriptions, and instructional media, is the intellectual property of Detail Corner. Unauthorized reproduction or commercial use is strictly prohibited.
            </p>
          </section>

          <section style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: '1rem' }}>4. Governing Law</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
              These terms are governed by the laws of the Republic of South Africa. Any disputes shall be settled in the competent courts of Cape Town.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
