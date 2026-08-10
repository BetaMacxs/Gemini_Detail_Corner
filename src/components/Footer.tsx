import { Link } from 'react-router-dom';
import { storeConfig } from '../config/store';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="text-xl font-bold text-gray-900 tracking-tight">{storeConfig.STORE_NAME}</span>
            <p className="mt-4 text-sm text-gray-500 max-w-sm">
              {storeConfig.STORE_DESCRIPTION}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Shop</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/shop" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  All Products
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href={`mailto:${storeConfig.CONTACT_EMAIL}`} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} {storeConfig.STORE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
