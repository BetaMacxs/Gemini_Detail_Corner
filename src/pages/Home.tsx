import { Link } from 'react-router-dom';
import { storeConfig } from '../config/store';

export function Home() {
  return (
    <div>
      <section className="relative bg-gray-50 py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">{storeConfig.STORE_NAME}</span>
            <span className="block text-gray-500 text-2xl sm:text-3xl mt-3 font-medium">
              Premium automotive detailing products.
            </span>
          </h1>
          <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
            <Link
              to="/shop"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gray-900 hover:bg-gray-800 transition-colors md:py-4 md:text-lg md:px-10"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
