import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronLeft } from 'lucide-react';
import { storeConfig } from '../config/store';

export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!id) return;
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();
        
        if (orderError) throw orderError;
        setOrder(orderData);

        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', id);
          
        if (itemsError) throw itemsError;
        setItems(itemsData || []);
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrderDetails();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">Order not found.</p>
        <Link to="/account/orders" className="text-blue-600 hover:underline mt-4 inline-block">Back to orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/account/orders" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Orders
      </Link>
      
      <div className="bg-white shadow-sm sm:rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <div>
            <h3 className="text-lg leading-6 font-bold text-gray-900">
              Order #{order.order_number}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
            ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
              order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
              'bg-yellow-100 text-yellow-800'}`}>
            {order.status.replace('_', ' ')}
          </span>
        </div>
        
        <div className="px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.payment_status}</dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {order.shipping_information.address}<br />
                {order.shipping_information.city}, {order.shipping_information.province}<br />
                {order.shipping_information.postalCode}, {order.shipping_information.country}
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 mb-4">Items</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <ul className="divide-y divide-gray-100 border-t border-b border-gray-100">
                  {items.map((item) => (
                    <li key={item.id} className="py-3 flex justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{item.product_name_snapshot}</span>
                        {item.variant_snapshot && <span className="text-gray-500 text-xs mt-0.5">{item.variant_snapshot}</span>}
                        <span className="text-gray-500 text-sm mt-1">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-medium text-gray-900">{formatPrice(item.total)}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:px-6">
              <dl className="space-y-3 text-sm text-gray-600 text-right">
                <div className="flex justify-between sm:justify-end sm:space-x-12">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-gray-900">{formatPrice(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between sm:justify-end sm:space-x-12">
                  <dt>Shipping</dt>
                  <dd className="font-medium text-gray-900">{formatPrice(order.shipping_amount)}</dd>
                </div>
                <div className="flex justify-between sm:justify-end sm:space-x-12 pt-3 border-t border-gray-200 text-base">
                  <dt className="font-bold text-gray-900">Total</dt>
                  <dd className="font-bold text-gray-900">{formatPrice(order.total)}</dd>
                </div>
              </dl>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
