import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { md5 } from 'js-md5';
import { useCartStore } from '../features/cart/store';
import { useAuthStore } from '../features/auth/store';
import { storeConfig } from '../config/store';
import { supabase } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';

function generatePayfastSignature(data: Record<string, string>, passphrase?: string): string {
  let pfOutput = '';
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== '') {
      pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, '+')}&`;
    }
  }

  let getString = pfOutput.slice(0, -1);
  if (passphrase) {
    getString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }

  return md5(getString);
}

export function Checkout() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCancelled = searchParams.get('cancelled') === 'true';
  const isFailed = searchParams.get('failed') === 'true';

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
  const shipping = 100; // Flat rate
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

  const submitPayfastForm = (payfastData: Record<string, string>, payfastUrl: string) => {
    // Note: Do NOT clear cart here. The cart must only be cleared upon confirmed payment success!
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = payfastUrl;

    Object.keys(payfastData).forEach(key => {
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = key;
      hiddenField.value = payfastData[key];
      form.appendChild(hiddenField);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    // 1. Try PayFast Edge Function if available
    try {
      const { data, error: functionError } = await supabase.functions.invoke('create-order', {
        body: {
          items,
          customerData: formData
        }
      });

      if (!functionError && data && data.payfastData && data.payfastUrl) {
        submitPayfastForm(data.payfastData, data.payfastUrl);
        return;
      }
    } catch (edgeErr) {
      console.warn("Edge function invocation unavailable, proceeding with direct PayFast integration:", edgeErr);
    }

    // 2. Direct order creation + PayFast gateway redirect
    try {
      const isValidUUID = (str: string | null | undefined): boolean => {
        if (!str) return false;
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      };

      const validUserId = isValidUUID(user?.id) ? user.id : null;

      // Ensure profile exists in profiles table so foreign key constraint succeeds
      if (validUserId) {
        try {
          await supabase.from('profiles').upsert({
            id: validUserId,
            email: formData.email,
            full_name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone
          }, { onConflict: 'id' });
        } catch (pErr) {
          console.warn('Profile sync notice:', pErr);
        }
      }

      const orderId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const orderNumber = `ORD-${Math.floor(Date.now() / 1000)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      const newOrder = {
        id: orderId,
        order_number: orderNumber,
        customer_id: validUserId,
        email: formData.email,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        billing_information: formData,
        shipping_information: formData,
        subtotal,
        shipping_amount: shipping,
        total,
        currency: storeConfig.STORE_CURRENCY || 'ZAR',
        status: 'PENDING_PAYMENT',
        payment_status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const orderItemsList = items.map((item) => {
        const price = item.variant ? item.variant.price : item.product.price;
        return {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          order_id: orderId,
          product_id: isValidUUID(item.product?.id) ? item.product.id : null,
          variant_id: isValidUUID(item.variant?.id) ? item.variant.id : null,
          product_name_snapshot: item.product.name,
          sku_snapshot: item.variant ? item.variant.sku : item.product.sku,
          variant_snapshot: item.variant ? item.variant.name : null,
          quantity: item.quantity,
          unit_price: price,
          total: price * item.quantity,
          created_at: new Date().toISOString()
        };
      });

      let finalOrderId = orderId;

      // Inserting into Supabase orders & order_items & payments tables
      try {
        const { data: dbOrder, error: orderInsertError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            customer_id: validUserId,
            email: formData.email,
            customer_name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            billing_information: formData,
            shipping_information: formData,
            subtotal,
            shipping_amount: shipping,
            total,
            currency: storeConfig.STORE_CURRENCY || 'ZAR',
            status: 'PENDING_PAYMENT',
            payment_status: 'PENDING'
          })
          .select()
          .single();

        if (orderInsertError) {
          console.error('Supabase orders insert error:', orderInsertError);
        } else if (dbOrder) {
          finalOrderId = dbOrder.id;
          newOrder.id = dbOrder.id;

          const itemsToInsert = orderItemsList.map(i => ({
            order_id: dbOrder.id,
            product_id: i.product_id,
            variant_id: i.variant_id,
            product_name_snapshot: i.product_name_snapshot,
            sku_snapshot: i.sku_snapshot,
            variant_snapshot: i.variant_snapshot,
            quantity: i.quantity,
            unit_price: i.unit_price,
            total: i.total
          }));

          const { error: itemsInsertErr } = await supabase.from('order_items').insert(itemsToInsert);
          if (itemsInsertErr) {
            console.error('Supabase order_items insert error:', itemsInsertErr);
          }

          // Create payment record in payments table
          await supabase.from('payments').insert({
            order_id: dbOrder.id,
            provider: 'PayFast',
            amount: total,
            currency: storeConfig.STORE_CURRENCY || 'ZAR',
            status: 'PENDING'
          });
        }
      } catch (dbErr) {
        console.warn('Direct database insert notice:', dbErr);
      }

      // Save to local_orders in localStorage
      try {
        const existingLocalOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');
        const updatedLocalOrders = [
          { order: newOrder, items: orderItemsList },
          ...existingLocalOrders.filter((o: any) => o.order?.id !== newOrder.id)
        ];
        localStorage.setItem('local_orders', JSON.stringify(updatedLocalOrders));
      } catch (lsErr) {
        console.warn('LocalStorage save error:', lsErr);
      }

      // Build PayFast redirect parameters
      const merchantId = (import.meta.env.VITE_PAYFAST_MERCHANT_ID as string) || '10000100';
      const merchantKey = (import.meta.env.VITE_PAYFAST_MERCHANT_KEY as string) || '46f0cd694581a';
      const passphrase = (import.meta.env.VITE_PAYFAST_PASSPHRASE as string) || '';
      const isSandbox = (import.meta.env.VITE_PAYFAST_SANDBOX as string) !== 'false';

      const payfastData: Record<string, string> = {
        merchant_id: merchantId,
        merchant_key: merchantKey,
        return_url: `${window.location.origin}/account/orders/${finalOrderId}?payment=success`,
        cancel_url: `${window.location.origin}/checkout?cancelled=true`,
        notify_url: `${window.location.origin}/api/payfast-itn`,
        name_first: formData.firstName || 'Customer',
        name_last: formData.lastName || 'User',
        email_address: formData.email,
        m_payment_id: finalOrderId,
        amount: total.toFixed(2),
        item_name: `Detail Corner Order ${orderNumber}`,
      };

      const signature = generatePayfastSignature(payfastData, passphrase);
      payfastData.signature = signature;

      const payfastUrl = isSandbox
        ? 'https://sandbox.payfast.co.za/eng/process'
        : 'https://www.payfast.co.za/eng/process';

      submitPayfastForm(payfastData, payfastUrl);
    } catch (err: any) {
      console.error("Checkout processing error:", err);
      setError(err.message || 'Failed to initialize PayFast payment');
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

        {isCancelled && (
          <div style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.875rem' }}>PayFast Payment Cancelled</div>
              <div style={{ fontSize: '0.8125rem', opacity: 0.9 }}>Your payment session was cancelled. Your cart items have been preserved below so you can try again.</div>
            </div>
          </div>
        )}

        {isFailed && (
          <div style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.875rem' }}>PayFast Payment Failed</div>
              <div style={{ fontSize: '0.8125rem', opacity: 0.9 }}>Payment was not processed. All items in your cart have been preserved so you can re-submit or choose another method.</div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{error}</div>
          </div>
        )}
        
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
                          <img src={item.product.images[0].url || item.product.images[0].storage_path} alt={item.product.name} className="w-full h-full object-cover" />
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
