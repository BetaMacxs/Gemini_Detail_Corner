import React from 'react';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { storeConfig } from '../config/store';

export function PrivacyPolicy() {
  return (
    <div className="content-page">
      <div className="container" style={{ maxWidth: '48rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="content-hero-icon-badge">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="content-page-title">
              Privacy <span style={{ color: 'var(--accent)' }}>Policy</span>
            </h1>
            <p className="content-page-subtitle">
              Last updated: August 2026 • {storeConfig.STORE_NAME} {storeConfig.ORIGIN_CITY}
            </p>
          </motion.div>
        </div>

        <div className="brand-card content-card-body">
          <section>
            <h2 className="content-section-title">
              <Lock className="h-5 w-5" />
              <span>1. Data Protection & Security</span>
            </h2>
            <p className="content-section-text">
              At {storeConfig.STORE_NAME}, we prioritize customer confidentiality and data security. All payment transactions processed through PayFast are protected by end-to-end 256-bit encryption. We never store credit card numbers or sensitive financial credentials on our servers.
            </p>
          </section>

          <section className="content-divider-section">
            <h2 className="content-section-title">
              <Eye className="h-5 w-5" />
              <span>2. Information Collection</span>
            </h2>
            <p className="content-section-text">
              We only collect information necessary to fulfill your detailing order, communicate order status updates, and provide high-caliber support. This includes your name, delivery address, phone number, and email address.
            </p>
          </section>

          <section className="content-divider-section">
            <h2 className="content-section-title">
              <FileText className="h-5 w-5" />
              <span>3. POPIA Compliance</span>
            </h2>
            <p className="content-section-text">
              In compliance with the Protection of Personal Information Act (POPIA) of {storeConfig.DEFAULT_COUNTRY}, you reserve the right to request access to, correction of, or deletion of your personal profile data at any time by contacting support at <a href={`mailto:${storeConfig.CONTACT_EMAIL}`} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{storeConfig.CONTACT_EMAIL}</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

