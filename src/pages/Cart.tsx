import { Link } from 'react-router-dom';
import { useCartStore } from '../features/cart/store';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { storeConfig } from '../config/store';

export function Cart() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price);
  };

  const subtotal = getSubtotal();

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
              const image = item.product.images?.[0]?.storage_path;

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
              <div className="summary-row summary-divider">
                <dt className="summary-label">
                  Shipping estimate
                </dt>
                <dd className="summary-value" style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>Calculated at checkout</dd>
              </div>
              <div className="summary-total-row">
                <dt className="summary-total-label">Order total</dt>
                <dd className="summary-total-value">{formatPrice(subtotal)}</dd>
              </div>
            </dl>

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
