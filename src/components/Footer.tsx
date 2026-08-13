import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-brand-surface border-t border-brand-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8">
          <div className="lg:pr-12">
            <span className="text-2xl font-black text-brand-text-primary tracking-tighter uppercase italic">
              Detail <span className="text-brand-accent">Corner</span>
            </span>
            <p className="mt-6 text-sm text-brand-text-secondary leading-relaxed">
              Premium automotive detailing supplies for those who demand excellence. Engineered for the professional, accessible to the enthusiast.
            </p>
            <div className="mt-8 flex items-center space-x-4">
              <a href="#" className="p-2 bg-brand-bg border border-brand-border rounded-lg text-brand-text-secondary hover:text-brand-accent hover:border-brand-accent transition-all">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-brand-bg border border-brand-border rounded-lg text-brand-text-secondary hover:text-brand-accent hover:border-brand-accent transition-all">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-brand-bg border border-brand-border rounded-lg text-brand-text-secondary hover:text-brand-accent hover:border-brand-accent transition-all">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-brand-text-primary mb-8 italic">Quick Links</h3>
            <ul className="space-y-4">
              {['Shop All', 'New Arrivals', 'Featured Items', 'Gift Cards'].map((link) => (
                <li key={link}>
                  <Link to="/products" className="text-sm font-bold text-brand-text-secondary hover:text-brand-accent transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-brand-text-primary mb-8 italic">Support</h3>
            <ul className="space-y-4">
              {['About Us', 'Contact', 'FAQ', 'Privacy Policy'].map((link) => (
                <li key={link}>
                  <Link to={`/${link.toLowerCase().replace(' ', '')}`} className="text-sm font-bold text-brand-text-secondary hover:text-brand-accent transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-brand-text-primary mb-8 italic">Contact Info</h3>
            <ul className="space-y-6">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-brand-accent mr-4 flex-shrink-0" />
                <span className="text-sm text-brand-text-secondary font-bold">
                  Pacific Business Park,<br />Mitchell's Plain, CP 7785
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-brand-accent mr-4 flex-shrink-0" />
                <span className="text-sm text-brand-text-secondary font-bold">021 555 9876</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-brand-accent mr-4 flex-shrink-0" />
                <span className="text-sm text-brand-text-secondary font-bold">info@detailcorner.co.za</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-24 pt-12 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary">
            &copy; {new Date().getFullYear()} Detail Corner. All Rights Reserved.
          </p>
          <div className="flex items-center space-x-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary hover:text-brand-accent cursor-pointer">Terms</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary hover:text-brand-accent cursor-pointer">Privacy</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary hover:text-brand-accent cursor-pointer">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
