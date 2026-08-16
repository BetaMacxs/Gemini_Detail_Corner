import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

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
              Premium automotive detailing supplies for those who demand excellence. Engineered for the professional, accessible to the enthusiast.
            </p>
            <div className="social-links">
              <a href="#" className="social-link">
                <Instagram size={20} />
              </a>
              <a href="#" className="social-link">
                <Facebook size={20} />
              </a>
              <a href="#" className="social-link">
                <Youtube size={20} />
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
                <MapPin className="footer-contact-icon" />
                <span className="footer-contact-text">
                  Pacific Business Park,<br />Mitchell's Plain, Cape Town 7785
                </span>
              </li>
              <li className="footer-contact-item center">
                <Phone className="footer-contact-icon" />
                <span className="footer-contact-text">021 555 9876</span>
              </li>
              <li className="footer-contact-item center">
                <Mail className="footer-contact-icon" />
                <span className="footer-contact-text">info@detailcorner.co.za</span>
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
