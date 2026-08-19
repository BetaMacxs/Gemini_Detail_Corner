import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { PiInstagramLogo, PiFacebookLogo, PiTiktokLogo } from 'react-icons/pi';
import { storeConfig } from '../config/store';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand-column">
            <span className="footer-logo">
              Detail <span style={{ color: 'var(--accent)' }}>Corner</span>
            </span>
            <p className="footer-brand-description">
              Premium car care products for those who demand excellence. Engineered for the professional, accessible to the enthusiast.
            </p>
            <div className="social-links">
              <a 
                href={storeConfig.SOCIAL_INSTAGRAM} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link"
                aria-label="Follow Detail Corner on Instagram"
                title="Instagram (@detail_corner2022)"
              >
                <PiInstagramLogo size={20} />
              </a>
              <a 
                href={storeConfig.SOCIAL_FACEBOOK} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link"
                aria-label="Follow Detail Corner on Facebook"
                title="Facebook (Detail Corner)"
              >
                <PiFacebookLogo size={20} />
              </a>
              <a 
                href={storeConfig.SOCIAL_TIKTOK} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link"
                aria-label="Follow Detail Corner on TikTok"
                title="TikTok (@detailcorner2022)"
              >
                <PiTiktokLogo size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-list">
              {['Shop All', 'New Arrivals', 'Featured Items'].map((link) => (
                <li key={link}>
                  <Link to="/products" className="footer-list-link">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="footer-heading">Support</h3>
            <ul className="footer-list">
              <li><Link to="/about" className="footer-list-link">About Us</Link></li>
              <li><Link to="/contact" className="footer-list-link">Contact</Link></li>
              <li><Link to="/track" className="footer-list-link">Track Order</Link></li>
              <li><Link to="/faq" className="footer-list-link">FAQ</Link></li>
              <li><Link to="/privacy" className="footer-list-link">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="footer-heading">Contact Info</h3>
            <ul className="footer-list footer-contact-list">
              <li className="footer-contact-item">
                <span className="footer-contact-icon"><MapPin size={20} /></span>
                <span className="footer-contact-text">
                  {storeConfig.STORE_ADDR}
                </span>
              </li>
              <li className="footer-contact-item center">
                <span className="footer-contact-icon"><Phone size={20} /></span>
                <span className="footer-contact-text">{storeConfig.CONTACT_PHONE}</span>
              </li>
              <li className="footer-contact-item center">
                <span className="footer-contact-icon"><Mail size={20} /></span>
                <span className="footer-contact-text">{storeConfig.CONTACT_EMAIL}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} Detail Corner. All Rights Reserved.
          </p>
          <div className="footer-legal-links">
            <Link to="/terms" className="footer-legal-link">Terms</Link>
            <Link to="/privacy" className="footer-legal-link">Privacy</Link>
            <Link to="/returns" className="footer-legal-link">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
