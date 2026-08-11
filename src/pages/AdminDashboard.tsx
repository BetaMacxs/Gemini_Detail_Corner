import { Link } from 'react-router-dom';
import { storeConfig } from '../config/store';

export function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-brand-text-primary tracking-tight mb-8">
        Admin <span className="text-brand-accent">Dashboard</span>
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-brand-bg/80 p-6 rounded-2xl shadow-sm border border-[#3a3a3a]">
          <h3 className="text-sm font-medium text-brand-text-secondary uppercase tracking-wider">Today's Sales</h3>
          <p className="mt-2 text-3xl font-bold text-brand-text-primary">ZAR 0.00</p>
        </div>
        <div className="bg-brand-bg/80 p-6 rounded-2xl shadow-sm border border-[#3a3a3a]">
          <h3 className="text-sm font-medium text-brand-text-secondary uppercase tracking-wider">Pending Orders</h3>
          <p className="mt-2 text-3xl font-bold text-brand-text-primary">0</p>
        </div>
        <div className="bg-brand-bg/80 p-6 rounded-2xl shadow-sm border border-[#3a3a3a]">
          <h3 className="text-sm font-medium text-brand-text-secondary uppercase tracking-wider">Low Stock Products</h3>
          <p className="mt-2 text-3xl font-bold text-brand-text-primary">0</p>
        </div>
      </div>

      <div className="bg-brand-bg/80 shadow-sm rounded-2xl border border-[#3a3a3a] overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-[#3a3a3a]">
          <h3 className="text-lg leading-6 font-bold text-brand-text-primary">Management Modules</h3>
          <p className="mt-1 max-w-2xl text-sm text-brand-text-secondary">Select an area to manage.</p>
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/orders" className="p-4 border border-[#3a3a3a] rounded-xl hover:border-brand-accent hover:bg-brand-bg transition-colors">
            <h4 className="font-bold text-brand-text-primary">Orders</h4>
            <p className="text-sm text-brand-text-secondary mt-1">Manage customer orders and status.</p>
          </Link>
          <Link to="/admin/products" className="p-4 border border-[#3a3a3a] rounded-xl hover:border-brand-accent hover:bg-brand-bg transition-colors">
            <h4 className="font-bold text-brand-text-primary">Products</h4>
            <p className="text-sm text-brand-text-secondary mt-1">Manage catalogue and categories.</p>
          </Link>
          <Link to="/admin/inventory" className="p-4 border border-[#3a3a3a] rounded-xl hover:border-brand-accent hover:bg-brand-bg transition-colors">
            <h4 className="font-bold text-brand-text-primary">Inventory</h4>
            <p className="text-sm text-brand-text-secondary mt-1">Manage stock levels.</p>
          </Link>
          <Link to="/admin/customers" className="p-4 border border-[#3a3a3a] rounded-xl hover:border-brand-accent hover:bg-brand-bg transition-colors">
            <h4 className="font-bold text-brand-text-primary">Customers</h4>
            <p className="text-sm text-brand-text-secondary mt-1">View customer accounts.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
