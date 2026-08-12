import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../features/cart/store';
import { useAuthStore } from '../features/auth/store';
import { storeConfig } from '../config/store';
import { supabase } from '../lib/supabase';

export function Checkout() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: profile?.full_name?.split(' ')[0] || '',
    lastName: profile?.full_name?.split(' ').slice(1).join(' ') || '',
    email: profile?.email || user?.email || '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: storeConfig.DEFAULT_COUNTRY,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const shipping = 100; // Flat rate for now
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("Please log in to complete your checkout.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('create-order', {
        body: {
          items,
          customerData: formData
        }
      });

      if (functionError) {
        throw new Error(functionError.message || "Failed to initialize payment");
      }
      
      if (data && data.payfastData && data.payfastUrl) {
         // Clear cart because we are redirecting away to PayFast
         clearCart();
         
         const form = document.createElement('form');
         form.method = 'POST';
         form.action = data.payfastUrl;
         
         Object.keys(data.payfastData).forEach(key => {
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = key;
            hiddenField.value = data.payfastData[key];
            form.appendChild(hiddenField);
         });
         
         document.body.appendChild(form);
         form.submit();
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
         throw new Error("Invalid response from payment server");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      // Helpful message if Edge Functions aren't deployed yet
      if (err.message.includes('Failed to fetch') || err.message.includes('edge function')) {
        setError('Checkout requires the create-order Supabase Edge Function to be deployed. See documentation for setup instructions.');
      } else {
        setError(err.message || 'Failed to process checkout');
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-2xl font-bold text-brand-text-primary">Your cart is empty</h2>
        <Link to="/products" className="mt-4 inline-flex text-brand-accent hover:text-brand-accent-hover font-medium">
          Return to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-text-primary mb-8">Checkout</h1>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-7">
            <form onSubmit={handleCheckout} className="space-y-8">
              
              {/* Contact Information */}
              <div className="bg-black/40 p-6 sm:p-8 rounded-2xl shadow-sm border border-brand-border/50">
                <h2 className="text-xl font-bold text-brand-text-primary mb-6">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-brand-text-secondary">First name</label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-brand-border rounded-xl shadow-sm focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-brand-text-secondary">Last name</label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-brand-border rounded-xl shadow-sm focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-brand-text-secondary">Email address</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-brand-border rounded-xl shadow-sm focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-brand-text-secondary">Phone number</label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-brand-border rounded-xl shadow-sm focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-black/40 p-6 sm:p-8 rounded-2xl shadow-sm border border-brand-border/50">
                <h2 className="text-xl font-bold text-brand-text-primary mb-6">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-brand-text-secondary">Address</label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-brand-border rounded-xl shadow-sm focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-brand-text-secondary">City</label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-brand-border rounded-xl shadow-sm focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="province" className="block text-sm font-medium text-brand-text-secondary">Province / State</label>
                    <input
                      type="text"
                      name="province"
                      id="province"
                      required
                      value={formData.province}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-brand-border rounded-xl shadow-sm focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-brand-text-secondary">Postal code</label>
                    <input
                      type="text"
                      name="postalCode"
                      id="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-brand-border rounded-xl shadow-sm focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-brand-text-secondary">Country</label>
                    <select
                      name="country"
                      id="country"
                      required
                      value={formData.country}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-brand-border rounded-xl shadow-sm focus:ring-brand-accent focus:border-brand-accent sm:text-sm bg-black/40"
                    >
                      <option value="South Africa">South Africa</option>
                      {/* Add more countries if needed */}
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-brand-text-primary bg-brand-accent hover:bg-brand-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
              </button>
            </form>
          </div>

          {/* Order Summary sidebar */}
          <div className="mt-10 lg:mt-0 lg:col-span-5">
            <div className="bg-black/40 p-6 sm:p-8 rounded-2xl shadow-sm border border-brand-border/50 sticky top-24">
              <h2 className="text-lg font-medium text-brand-text-primary mb-6">Order Summary</h2>
              
              <ul className="divide-y divide-brand-border border-b border-brand-border pb-6 mb-6">
                {items.map((item) => {
                   const price = item.variant ? item.variant.price : item.product.price;
                   return (
                    <li key={item.id} className="py-4 flex">
                      <div className="flex-shrink-0 w-16 h-16 bg-brand-border rounded-lg overflow-hidden border border-brand-border/50">
                        {item.product.images?.[0] ? (
                          <img src={item.product.images[0].storage_path} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <img 
                            src={`/${item.product.slug.toLowerCase()}.png`}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                      <div className="ml-4 flex-1 flex flex-col">
                        <div>
                          <div className="flex justify-between text-sm font-medium text-brand-text-primary">
                            <h3>{item.product.name}</h3>
                            <p className="ml-4">{formatPrice(price * item.quantity)}</p>
                          </div>
                          {item.variant && <p className="mt-1 text-sm text-brand-text-secondary">{item.variant.name}</p>}
                        </div>
                        <div className="flex-1 flex items-end justify-between text-sm">
                          <p className="text-brand-text-secondary">Qty {item.quantity}</p>
                        </div>
                      </div>
                    </li>
                   )
                })}
              </ul>

              <dl className="space-y-4 text-sm text-brand-text-secondary">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-brand-text-primary">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd className="font-medium text-brand-text-primary">{formatPrice(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-brand-border pt-4 text-base">
                  <dt className="font-bold text-brand-text-primary">Total</dt>
                  <dd className="font-bold text-brand-text-primary">{formatPrice(total)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
