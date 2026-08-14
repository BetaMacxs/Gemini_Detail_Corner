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
        <ShoppingBag className="mx-auto h-16 w-16 text-brand-text-secondary" />
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
                        <div className="w-full h-full flex items-center justify-center text-brand-text-secondary p-6">
                           <ShoppingBag className="h-8 w-8 opacity-20" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="cart-item-details">
                    <div className="cart-item-header">
                      <div>
                        <div className="flex justify-between">
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
                            <Trash2 className="h-5 w-5" />
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
                <div className="summary-row text-green-600 font-medium">
                  <dt className="summary-label flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    {couponCode}
                    <button onClick={removeCoupon} className="ml-2 hover:text-red-500 text-gray-400 transition-colors" title="Remove coupon">
                      <X className="h-4 w-4" />
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
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="coupon"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="input-field flex-1 text-sm py-2"
                    placeholder="Enter code"
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponInput.trim()}
                    className="btn btn-secondary py-2 px-4 whitespace-nowrap disabled:opacity-50"
                  >
                    {isValidatingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="mt-2 text-sm text-red-500">{couponError}</p>}
              </div>
            )}

            <div className="mt-10">
              <Link
                to="/checkout"
                className="btn btn-primary checkout-link-btn"
              >
                Checkout <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="mt-6 text-center">
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
