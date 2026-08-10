import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductsStore } from '../features/products/store';
import { useCartStore } from '../features/cart/store';
import { ShoppingBag, ChevronRight, Check } from 'lucide-react';
import { storeConfig } from '../config/store';

export function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { fetchProductBySlug } = useProductsStore();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setIsLoading(true);
      const data = await fetchProductBySlug(slug);
      if (data) {
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } else {
        setError("Product not found");
      }
      setIsLoading(false);
    }
    loadProduct();
  }, [slug, fetchProductBySlug]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price);
  };

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <p className="mt-2 text-gray-500">The product you're looking for doesn't exist or is unavailable.</p>
        <Link to="/shop" className="mt-6 inline-block text-blue-600 hover:text-blue-500 font-medium">
          Return to shop
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
  const inStock = currentStock > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
          </li>
          <li><ChevronRight className="h-4 w-4" /></li>
          <li>
            <Link to="/shop" className="hover:text-gray-900 transition-colors">Shop</Link>
          </li>
          {product.category && (
            <>
              <li><ChevronRight className="h-4 w-4" /></li>
              <li>
                <Link to={`/shop?category=${product.category.id}`} className="hover:text-gray-900 transition-colors">
                  {product.category.name}
                </Link>
              </li>
            </>
          )}
          <li><ChevronRight className="h-4 w-4" /></li>
          <li className="text-gray-900 font-medium truncate" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
        {/* Image gallery */}
        <div className="flex flex-col-reverse">
          <div className="w-full aspect-w-1 aspect-h-1 bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0].storage_path}
                alt={product.images[0].alt_text || product.name}
                className="w-full h-full object-center object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center min-h-[400px]">
                <ShoppingBag className="h-24 w-24 text-gray-300" />
              </div>
            )}
          </div>
        </div>

        {/* Product info */}
        <div className="mt-10 px-4 sm:px-0 lg:mt-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
          
          <div className="mt-3">
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl text-gray-900">{formatPrice(currentPrice)}</p>
          </div>

          <div className="mt-6">
            <h3 className="sr-only">Description</h3>
            <div className="text-base text-gray-700 space-y-6">
              <p>{product.description || product.short_description}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-8">
            <div className="flex items-center">
              <div className={`flex items-center ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                {inStock ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">In stock and ready to ship</span>
                  </>
                ) : (
                  <span className="text-sm font-medium">Currently out of stock</span>
                )}
              </div>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Size / Option</h3>
                <div className="mt-3 flex flex-wrap gap-3">
                  {product.variants.map((variant: any) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`
                        border rounded-xl py-2 px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900
                        ${selectedVariant?.id === variant.id 
                          ? 'bg-gray-900 border-transparent text-white hover:bg-gray-800' 
                          : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                        }
                        ${variant.stock_quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      disabled={variant.stock_quantity === 0}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
              <div className="mt-3 flex items-center border border-gray-300 rounded-xl w-32">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  disabled={!inStock}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={currentStock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(currentStock, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full text-center border-0 focus:ring-0 p-0 text-gray-900 bg-transparent"
                  disabled={!inStock}
                />
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  disabled={!inStock}
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock || added}
                className={`w-full border border-transparent rounded-xl py-3 px-8 flex items-center justify-center text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                  ${added ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-900 hover:bg-gray-800'}`}
              >
                {added ? 'Added to Cart' : 'Add to Cart'}
              </button>
            </div>
            
            <div className="mt-6 text-sm text-gray-500">
              <p>SKU: {selectedVariant ? selectedVariant.sku : product.sku}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
