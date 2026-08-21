import React from 'react';
import { motion } from 'motion/react';
import { FileText, Shield, Gavel, Scale } from 'lucide-react';
import { storeConfig } from '../config/store';

export function Terms() {
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
              <Gavel size={32} />
            </div>          
            <h1 className="content-page-title">
              Terms & <span style={{ color: 'var(--accent)' }}>Conditions</span>
            </h1>
            <p className="content-page-subtitle">
              Last updated: August 2026 • {storeConfig.STORE_NAME} {storeConfig.ORIGIN_CITY}
            </p>
          </motion.div>
        </div>

        <div className="brand-card content-card-body">
          <section>
            <h2 className="content-section-title">
              <Scale size={20} />
              <span>1. Acceptance of Terms</span>
            </h2>
            <p className="content-section-text">
              By accessing and using the {storeConfig.STORE_NAME} website, you agree to be bound by these Terms and Conditions. Our services are provided for automotive enthusiasts and professionals seeking high-caliber detailing supplies and technical care formulas.
            </p>
          </section>

          <section className="content-divider-section">
            <h2 className="content-section-title">
              <FileText size={20} />
              <span>2. Use of Products</span>
            </h2>
            <p className="content-section-text">
              Detailing products sold on this site are intended for automotive use. Users must strictly follow application instructions and safety warnings provided with each product. {storeConfig.STORE_NAME} is not liable for damages resulting from improper application or use on incompatible surfaces.
            </p>
          </section>

          <section className="content-divider-section">
            <h2 className="content-section-title">
              <Shield size={20} />
              <span>3. Intellectual Property</span>
            </h2>
            <p className="content-section-text">
              All content, including logos, images, product descriptions, and instructional media, is the intellectual property of {storeConfig.STORE_NAME}. Unauthorized reproduction or commercial use is strictly prohibited.
            </p>
          </section>

          <section className="content-divider-section">
            <h2 className="content-section-title">
              <span>4. Consumer Protection Act</span>
            </h2>
            <p className="content-section-text">
              These terms are compliant with the {storeConfig.DEFAULT_COUNTRY} Consumer Protection Act (CPA). Your statutory rights regarding defective goods and cooling-off periods apply to all purchases.
            </p>
          </section>

          <section className="content-divider-section">
            <h2 className="content-section-title">
              <span>5. Governing Law</span>
            </h2>
            <p className="content-section-text">
              These terms are governed by the laws of the Republic of {storeConfig.DEFAULT_COUNTRY}. Any disputes shall be settled in the competent courts of {storeConfig.STORE_CITY}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

