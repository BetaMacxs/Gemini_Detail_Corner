import React from 'react';
import { RefreshCcw, Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { storeConfig } from '../config/store';

export function Returns() {
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
              <RefreshCcw size={32} />
            </div>
            <h1 className="content-page-title">
              Returns & <span style={{ color: 'var(--accent)' }}>Refunds</span>
            </h1>
            <p className="content-page-subtitle">
              Last updated: August 2026 • {storeConfig.WARRANTY_DAYS}-Day Satisfaction Guaranteed
            </p>
          </motion.div>
        </div>

        <div className="brand-card content-card-body">
          <section>
            <h2 className="content-section-title">
              <Package size={20} />
              <span>1. {storeConfig.RETURN_WINDOW_DAYS}-Day Return Window</span>
            </h2>
            <p className="content-section-text">
              We offer a {storeConfig.RETURN_WINDOW_DAYS}-day return policy for unopened and unused products. If you are not completely satisfied with your purchase, you can return it within {storeConfig.RETURN_WINDOW_DAYS} days of delivery for a full refund or store credit, excluding shipping costs.
            </p>
          </section>

          <section className="content-divider-section">
            <h2 className="content-section-title">
              <AlertCircle size={20} />
              <span>2. Damaged or Defective Items</span>
            </h2>
            <p className="content-section-text">
              In the rare event that an item arrives damaged or defective, please notify us immediately at <a href={`mailto:${storeConfig.CONTACT_EMAIL}`} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{storeConfig.CONTACT_EMAIL}</a> with photographic evidence. We will arrange for a replacement or full refund at no additional cost to you.
            </p>
          </section>

          <section className="content-divider-section">
            <h2 className="content-section-title">
              <CheckCircle2 size={20} />
              <span>3. Refund Process</span>
            </h2>
            <p className="content-section-text">
              Once your return is received and inspected, we will send you an email notification. Approved refunds will be processed via your original payment method (PayFast) within 5-7 business days.
            </p>
          </section>

          <section className="content-divider-section">
            <h2 className="content-section-title">
              <span>4. Non-Returnable Items</span>
            </h2>
            <p className="content-section-text">
              Please note that used chemical formulations, opened microfiber towels, and clearance items are not eligible for return due to safety and strict quality control standards.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

