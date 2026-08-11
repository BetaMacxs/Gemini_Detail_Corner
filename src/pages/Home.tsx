import { Link } from 'react-router-dom';
import { storeConfig } from '../config/store';

export function Home() {
  return (
    <div>
      <section className="relative bg-brand-bg overflow-hidden">
        {/* Placeholder for the car background image */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-b from-transparent to-[#1f1f1f]">
          <div className="absolute inset-0 bg-brand-bg/80" style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8))' }}></div>
        </div>
        <div className="relative py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-brand-text-primary sm:text-5xl md:text-6xl">
              <span className="block"><span className="text-brand-accent">Detail</span> Corner</span>
              <span className="block text-brand-text-secondary text-2xl sm:text-3xl mt-3 font-medium">
                Premium automotive detailing products.
              </span>
            </h1>
            <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
              <Link
                to="/products"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-brand-text-primary bg-brand-accent hover:bg-brand-accent-hover transition-colors md:py-4 md:text-lg md:px-10"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
