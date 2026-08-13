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
      <div className="checkout-container" style={{ textAlign: 'center', paddingTop: '6rem' }}>
        <h2 className="checkout-title">Your cart is empty</h2>
        <Link to="/products" className="btn btn-secondary" style={{ display: 'inline-flex', marginTop: '1rem' }}>
          Return to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>
        
        <div className="checkout-layout">
          <div className="checkout-form-container">
            <form onSubmit={handleCheckout} className="checkout-form">
              
              {/* Contact Information */}
              <div className="form-card">
                <h2 className="form-card-title">Contact Information</h2>
                <div className="form-grid">
                  <div>
                    <label htmlFor="firstName" className="input-label">First name</label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="input-label">Last name</label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group-full">
                    <label htmlFor="email" className="input-label">Email address</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group-full">
                    <label htmlFor="phone" className="input-label">Phone number</label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="form-card">
                <h2 className="form-card-title">Shipping Address</h2>
                <div className="form-grid">
                  <div className="form-group-full">
                    <label htmlFor="address" className="input-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="input-label">City</label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="province" className="input-label">Province / State</label>
                    <input
                      type="text"
                      name="province"
                      id="province"
                      required
                      value={formData.province}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="input-label">Postal code</label>
                    <input
                      type="text"
                      name="postalCode"
                      id="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="input-label">Country</label>
                    <select
                      name="country"
                      id="country"
                      required
                      value={formData.country}
                      onChange={handleInputChange}
                      className="form-input form-select"
                    >
                      <option value="South Africa">South Africa</option>
                      {/* Add more countries if needed */}
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <div className="checkout-error-msg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary pay-btn"
              >
                {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
              </button>
            </form>
          </div>

          {/* Order Summary sidebar */}
          <div className="order-summary-sidebar">
            <div className="summary-sidebar-card">
              <h2 className="summary-sidebar-title">Order Summary</h2>
              
              <ul className="summary-items-list">
                {items.map((item) => {
                   const price = item.variant ? item.variant.price : item.product.price;
                   return (
                    <li key={item.id} className="summary-item">
                      <div className="summary-item-image-wrapper">
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
                      <div className="summary-item-content">
                        <div>
                          <div className="summary-item-title-row">
                            <h3>{item.product.name}</h3>
                            <p>{formatPrice(price * item.quantity)}</p>
                          </div>
                          {item.variant && <p className="summary-item-variant">{item.variant.name}</p>}
                        </div>
                        <div className="summary-item-qty">
                          <p>Qty {item.quantity}</p>
                        </div>
                      </div>
                    </li>
                   )
                })}
              </ul>

              <dl className="summary-costs">
                <div className="summary-cost-row">
                  <dt>Subtotal</dt>
                  <dd className="summary-value">{formatPrice(subtotal)}</dd>
                </div>
                <div className="summary-cost-row">
                  <dt>Shipping</dt>
                  <dd className="summary-value">{formatPrice(shipping)}</dd>
                </div>
                <div className="summary-cost-row total">
                  <dt>Total</dt>
                  <dd className="total-value">{formatPrice(total)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
