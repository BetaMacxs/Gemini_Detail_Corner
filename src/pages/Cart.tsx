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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" />
        <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900">Your cart is empty</h2>
        <p className="mt-4 text-gray-500">Looks like you haven't added any products to your cart yet.</p>
        <div className="mt-8">
          <Link
            to="/shop"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-8">Shopping Cart</h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <div className="lg:col-span-8">
          <ul className="border-t border-b border-gray-200 divide-y divide-gray-200">
            {items.map((item) => {
              const maxStock = item.variant ? item.variant.stock_quantity : item.product.stock_quantity;
              const price = item.variant ? item.variant.price : item.product.price;
              const image = item.product.images?.[0]?.storage_path;

              return (
                <li key={item.id} className="flex py-6 sm:py-8">
                  <div className="flex-shrink-0">
                    {image ? (
                      <img
                        src={image}
                        alt={item.product.name}
                        className="w-24 h-24 rounded-xl object-center object-cover sm:w-32 sm:h-32 border border-gray-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center sm:w-32 sm:h-32 border border-gray-100">
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-sm">
                            <Link to={`/product/${item.product.slug}`} className="font-medium text-gray-700 hover:text-gray-800">
                              {item.product.name}
                            </Link>
                          </h3>
                        </div>
                        {item.variant && (
                          <p className="mt-1 text-sm text-gray-500">{item.variant.name}</p>
                        )}
                        <p className="mt-1 text-sm font-medium text-gray-900">{formatPrice(price)}</p>
                      </div>

                      <div className="mt-4 sm:mt-0 sm:pr-9">
                        <label htmlFor={`quantity-${item.id}`} className="sr-only">
                          Quantity, {item.product.name}
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-xl w-32 bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1.5 text-gray-600 hover:text-gray-900"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <input
                            id={`quantity-${item.id}`}
                            name={`quantity-${item.id}`}
                            type="number"
                            min="1"
                            max={maxStock}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-full text-center border-0 focus:ring-0 p-0 text-sm bg-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1.5 text-gray-600 hover:text-gray-900"
                            disabled={item.quantity >= maxStock}
                          >
                            +
                          </button>
                        </div>

                        <div className="absolute top-0 right-0 sm:top-0 sm:right-0">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="-m-2 p-2 inline-flex text-gray-400 hover:text-gray-500 transition-colors"
                          >
                            <span className="sr-only">Remove</span>
                            <Trash2 className="h-5 w-5" aria-hidden="true" />
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
        <div className="mt-16 bg-gray-50 rounded-2xl px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-4 border border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
          
          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">Subtotal</dt>
              <dd className="text-sm font-medium text-gray-900">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="flex items-center text-sm text-gray-600">
                <span>Shipping estimate</span>
              </dt>
              <dd className="text-sm font-medium text-gray-900">Calculated at checkout</dd>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="text-base font-medium text-gray-900">Order total</dt>
              <dd className="text-base font-medium text-gray-900">{formatPrice(subtotal)}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <Link
              to="/checkout"
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              Checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>
              or{' '}
              <Link to="/shop" className="text-blue-600 font-medium hover:text-blue-500 transition-colors">
                Continue Shopping<span aria-hidden="true"> &rarr;</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
