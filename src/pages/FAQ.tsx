import React from 'react';
import { FAQSection } from '../components/FAQSection';
import { motion } from 'motion/react';
import { storeConfig } from '../config/store';
import { HelpCircle, Mail, Phone } from 'lucide-react';

export function FAQ() {
  return (
    <div className="content-page" style={{ paddingTop: 0, paddingBottom: 0 }}>
      {/* Hero Header */}
      <div className="content-page-hero">
        <div className="content-hero-glow" />
        
        <div className="container" style={{ position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="content-hero-icon-badge">
              <HelpCircle size={32} />
            </div>
            <h1 className="content-page-title">
              How Can We <span style={{ color: 'var(--accent)' }}>Help?</span>
            </h1>
            <p className="content-page-subtitle">
              Find answers to common questions about {storeConfig.STORE_NAME}'s products, orders, shipping, and detailing advice.
            </p>
          </motion.div>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="container" style={{ paddingBottom: '4rem' }}>
        <FAQSection />
      </div>

      {/* Still Need Help? Section */}
      <div style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Still have questions?
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.9375rem' }}>
            Our team of detailing specialists is ready to help you choose the right formulations and tools.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href={`mailto:${storeConfig.CONTACT_EMAIL}`}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Mail size={16} />
              <span>Email Us ({storeConfig.CONTACT_EMAIL})</span>
            </a>
            <a 
              href={`tel:${storeConfig.CONTACT_PHONE_RAW}`}
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Phone size={16} />
              <span>Call Us ({storeConfig.CONTACT_PHONE})</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

