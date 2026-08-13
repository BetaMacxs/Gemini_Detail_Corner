import React from 'react';
import { FAQSection } from '../components/FAQSection';

export function FAQ() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Hero Header */}
      <div style={{ position: 'relative', paddingTop: '5rem', paddingBottom: '5rem', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)', opacity: 0.2 }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            How can we <span style={{ color: 'var(--accent)' }}>Help?</span>
          </h1>
          <p style={{ maxWidth: '42rem', margin: '0 auto', fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
            Find answers to common questions about our detailing products, shipping, and more.
          </p>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="container" style={{ paddingBottom: '6rem' }}>
        <FAQSection />
      </div>

      {/* Still Need Help? Section */}
      <div style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: '1rem' }}>Still have questions?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Our team of detailing experts is ready to help you with any specific queries you might have.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="mailto:info@detailcorner.co.za" 
              className="btn btn-primary"
              style={{ padding: '1rem 2rem' }}
            >
              Email Us
            </a>
            <a 
              href="tel:0215559876" 
              className="btn btn-outline"
              style={{ padding: '1rem 2rem' }}
            >
              Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
