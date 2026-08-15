import { Link } from 'react-router-dom';
import { useCartStore } from '../features/cart/store';
import { Trash2, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';
import { storeConfig } from '../config/store';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function Cart() {
  const { items, removeItem, updateQuantity, getSubtotal, applyCoupon, removeCoupon, couponCode, discountAmount } = useCartStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price);
  };

  const subtotal = getSubtotal();
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError('');

    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponInput.trim().toUpperCase())
        .single();

      if (error || !coupon) {
        setCouponError('Invalid coupon code');
        setIsValidatingCoupon(false);
        return;
      }

      const now = new Date();
      if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        setCouponError('Coupon is not active yet');
        setIsValidatingCoupon(false);
        return;
      }
      if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        setCouponError('Coupon has expired');
        setIsValidatingCoupon(false);
        return;
      }
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        setCouponError('Coupon usage limit reached');
        setIsValidatingCoupon(false);
        return;
      }
      if (coupon.minimum_order_value && subtotal < coupon.minimum_order_value) {
        setCouponError(`Minimum order value of ${formatPrice(coupon.minimum_order_value)} required`);
        setIsValidatingCoupon(false);
        return;
      }

      let calculatedDiscount = 0;
      if (coupon.discount_type === 'PERCENTAGE') {
        calculatedDiscount = (subtotal * coupon.discount_value) / 100;
      } else {
        calculatedDiscount = coupon.discount_value;
      }

      applyCoupon(coupon.code, calculatedDiscount);
      setCouponInput('');
    } catch (err) {
      setCouponError('Failed to validate coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart-page" style={{ textAlign: 'center', paddingTop: '6rem', paddingBottom: '6rem' }}>
        <ShoppingBag style={{ margin: '0 auto', height: '4rem', width: '4rem', color: 'var(--text-secondary)' }} />
        <h2 className="cart-title" style={{ marginTop: '2rem', marginBottom: '1rem' }}>Your cart is empty</h2>
        <p className="text-brand-text-secondary" style={{ maxWidth: '24rem', margin: '0 auto' }}>Looks like you haven't added any products to your arsenal yet.</p>
        <div style={{ marginTop: '3rem' }}>
          <Link
            to="/products"
            className="btn btn-primary"
            style={{ padding: '1rem 2rem' }}
          >
            Explore Arsenal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">
        Shopping <span className="text-brand-accent">Cart</span>
      </h1>

      <div className="cart-layout">
        <div className="cart-items-container">
          <ul className="cart-items-list">
            {items.map((item) => {
              const maxStock = item.variant ? item.variant.stock_quantity : item.product.stock_quantity;
              const price = item.variant ? item.variant.price : item.product.price;
              const image = item.product.images?.[0]?.url || item.product.images?.[0]?.storage_path;

              return (
                <li key={item.id} className="cart-item">
                  <div className="cart-item-image-container">
                    <div className="cart-item-image-wrapper">
                      {image ? (
                        <img
                          src={image}
                          alt={item.product.name}
                          className="cart-item-image"
                        />
                      ) : (
                        <div className="cart-item-image-empty" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'var(--text-secondary)' }}>
                           <ShoppingBag size={32} className="opacity-20" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="cart-item-details">
                    <div className="cart-item-header">
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <h3 className="text-sm">
                            <Link to={`/product/${item.product.slug}`} className="cart-item-name">
                              {item.product.name}
                            </Link>
                          </h3>
                        </div>
                        {item.variant && (
                          <p className="cart-item-variant">{item.variant.name}</p>
                        )}
                        <p className="cart-item-price">{formatPrice(price)}</p>
                      </div>

                      <div className="cart-item-controls">
                        <div className="quantity-selector-small">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="quantity-selector-small-btn"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={maxStock}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="quantity-selector-small-input"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="quantity-selector-small-btn"
                            disabled={item.quantity >= maxStock}
                          >
                            +
                          </button>
                        </div>

                        <div className="remove-item-btn-wrapper">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="remove-item-btn"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Order summary */}
        <div className="order-summary-container">
          <div className="order-summary-card">
            <h2 className="summary-heading">Order summary</h2>
            
            <dl className="summary-rows">
              <div className="summary-row">
                <dt className="summary-label">Subtotal</dt>
                <dd className="summary-value">{formatPrice(subtotal)}</dd>
              </div>

              {couponCode && (
                <div className="summary-row" style={{ color: '#16a34a', fontWeight: 500 }}>
                  <dt className="summary-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Tag size={16} />
                    {couponCode}
                    <button onClick={removeCoupon} className="coupon-remove-btn" style={{ marginLeft: '0.5rem', color: '#9ca3af', transition: 'color 0.2s' }} title="Remove coupon">
                      <X size={16} />
                    </button>
                  </dt>
                  <dd className="summary-value">-{formatPrice(discountAmount)}</dd>
                </div>
              )}

              <div className="summary-row summary-divider">
                <dt className="summary-label">
                  Shipping estimate
                </dt>
                <dd className="summary-value" style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>Calculated at checkout</dd>
              </div>
              <div className="summary-total-row">
                <dt className="summary-total-label">Order total</dt>
                <dd className="summary-total-value">{formatPrice(finalTotal)}</dd>
              </div>
            </dl>

            {!couponCode && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#222]">
                <label htmlFor="coupon" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Gift card or discount code</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    id="coupon"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="input-field"
                    style={{ flex: 1, fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                    placeholder="Enter code"
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponInput.trim()}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
                  >
                    {isValidatingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#ef4444' }}>{couponError}</p>}
              </div>
            )}

            <div className="mt-10">
              <Link
                to="/checkout"
                className="btn btn-primary checkout-link-btn"
              >
                Checkout <ArrowRight size={20} />
              </Link>
            </div>
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link to="/products" className="continue-shopping-link">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
