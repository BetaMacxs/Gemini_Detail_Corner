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
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="social-link">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="social-link">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-list">
              {['Shop All', 'New Arrivals', 'Featured Items', 'Gift Cards'].map((link) => (
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
              {['About Us', 'Contact', 'FAQ', 'Privacy Policy'].map((link) => (
                <li key={link}>
                  <Link to={`/${link.toLowerCase().replace(' ', '')}`} className="footer-list-link">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="footer-heading">Contact Info</h3>
            <ul className="footer-list footer-contact-list">
              <li className="footer-contact-item">
                <MapPin className="footer-contact-icon" />
                <span className="footer-contact-text">
                  Pacific Business Park,<br />Mitchell's Plain, CP 7785
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
            <span className="footer-legal-link">Terms</span>
            <span className="footer-legal-link">Privacy</span>
            <span className="footer-legal-link">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
