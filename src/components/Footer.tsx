import { Link } from 'react-router-dom';
import { storeConfig } from '../config/store';
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-brand-bg border-t border-brand-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <span className="text-xl font-medium text-brand-accent tracking-tight">Detail Corner</span>
            <ul className="mt-6 space-y-4 text-sm text-brand-text-secondary">
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>021 555 9876</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>info@detailcorner.co.za</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-3 mt-0.5 flex-shrink-0" />
                <span>Pacific Business Park,<br />Mitchell's Plain</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-medium text-brand-text-primary tracking-wide">Explore</h3>
            <ul className="mt-6 space-y-4">
              <li>
                <Link to="/products" className="text-sm text-brand-text-secondary hover:text-brand-text-primary transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-sm text-brand-text-secondary hover:text-brand-text-primary transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-sm text-brand-text-secondary hover:text-brand-text-primary transition-colors">
                  News and Competitions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-medium text-brand-text-primary tracking-wide">Info</h3>
            <ul className="mt-6 space-y-4">
              <li>
                <Link to="/about" className="text-sm text-brand-text-secondary hover:text-brand-text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-brand-text-secondary hover:text-brand-text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-brand-text-secondary hover:text-brand-text-primary transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-brand-text-secondary hover:text-brand-text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-medium text-brand-text-primary tracking-wide">Follow Us</h3>
            <ul className="mt-6 space-y-4">
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-brand-text-secondary hover:text-brand-text-primary transition-colors">
                  <Instagram className="h-4 w-4 mr-3 flex-shrink-0" />
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-brand-text-secondary hover:text-brand-text-primary transition-colors">
                  <Facebook className="h-4 w-4 mr-3 flex-shrink-0" />
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-brand-text-secondary hover:text-brand-text-primary transition-colors">
                  <svg className="h-4 w-4 mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                  TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-brand-border pt-8">
          <p className="text-sm text-brand-text-secondary text-center">
            &copy; {new Date().getFullYear()} Detail Corner
          </p>
        </div>
      </div>
    </footer>
  );
}
