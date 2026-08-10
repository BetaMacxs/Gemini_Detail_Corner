import { Link } from 'react-router-dom';
import { storeConfig } from '../config/store';

export function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Today's Sales</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">ZAR 0.00</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Orders</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Low Stock Products</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-bold text-gray-900">Management Modules</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Select an area to manage.</p>
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/orders" className="p-4 border border-gray-200 rounded-xl hover:border-gray-900 transition-colors">
            <h4 className="font-bold text-gray-900">Orders</h4>
            <p className="text-sm text-gray-500 mt-1">Manage customer orders and status.</p>
          </Link>
          <Link to="/admin/products" className="p-4 border border-gray-200 rounded-xl hover:border-gray-900 transition-colors">
            <h4 className="font-bold text-gray-900">Products</h4>
            <p className="text-sm text-gray-500 mt-1">Manage catalogue and categories.</p>
          </Link>
          <Link to="/admin/inventory" className="p-4 border border-gray-200 rounded-xl hover:border-gray-900 transition-colors">
            <h4 className="font-bold text-gray-900">Inventory</h4>
            <p className="text-sm text-gray-500 mt-1">Manage stock levels.</p>
          </Link>
          <Link to="/admin/customers" className="p-4 border border-gray-200 rounded-xl hover:border-gray-900 transition-colors">
            <h4 className="font-bold text-gray-900">Customers</h4>
            <p className="text-sm text-gray-500 mt-1">View customer accounts.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
