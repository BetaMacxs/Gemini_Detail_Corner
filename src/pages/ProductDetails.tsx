import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductsStore } from '../features/products/store';
import { useCartStore } from '../features/cart/store';
import { useAuthStore } from '../features/auth/store';
import { supabase } from '../lib/supabase';
import { ShoppingBag, ChevronRight, Check, Star, User } from 'lucide-react';
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
  const { user } = useAuthStore();
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReviewError("You must be logged in to leave a review.");
      return;
    }
    
    setIsSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(false);

    try {
      const { error } = await supabase.from('product_reviews').insert([
        {
          product_id: product.id,
          profile_id: user.id,
          rating: newReviewRating,
          comment: newReviewComment,
        }
      ]);

      if (error) throw error;
      
      setReviewSuccess(true);
      setNewReviewComment('');
      setNewReviewRating(5);
      
      // Reload product to get the new review
      if (slug) {
        const data = await fetchProductBySlug(slug);
        if (data) {
          setProduct(data);
        }
      }
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex space-x-2 mb-8">
          <div className="h-4 bg-brand-border/80 rounded animate-pulse w-12"></div>
          <div className="h-4 bg-brand-border/80 rounded animate-pulse w-4"></div>
          <div className="h-4 bg-brand-border/80 rounded animate-pulse w-12"></div>
          <div className="h-4 bg-brand-border/80 rounded animate-pulse w-4"></div>
          <div className="h-4 bg-brand-border/80 rounded animate-pulse w-24"></div>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
          <div className="w-full aspect-w-1 aspect-h-1 bg-brand-border/80 rounded-2xl animate-pulse"></div>

          <div className="mt-10 px-4 sm:px-0 lg:mt-0">
            <div className="h-10 bg-brand-border/80 rounded animate-pulse w-3/4 mb-4"></div>
            <div className="h-8 bg-brand-border/80 rounded animate-pulse w-1/4 mb-8"></div>
            
            <div className="space-y-3 mb-8">
              <div className="h-4 bg-brand-border/80 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-brand-border/80 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-brand-border/80 rounded animate-pulse w-2/3"></div>
            </div>

            <div className="border-t border-brand-border/50 pt-8 mt-8">
              <div className="h-6 bg-brand-border/80 rounded animate-pulse w-32 mb-8"></div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <div className="h-12 bg-brand-border/80 rounded-xl animate-pulse w-full sm:w-32"></div>
                <div className="h-12 bg-brand-border/80 rounded-xl animate-pulse w-full sm:flex-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-2xl font-bold text-brand-text-primary">Product not found</h2>
        <p className="mt-2 text-brand-text-secondary">The product you're looking for doesn't exist or is unavailable.</p>
        <Link to="/products" className="mt-6 inline-block text-brand-accent hover:text-brand-accent-hover font-medium">
          Return to shop
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
  const inStock = currentStock > 0;

  const reviews = product.reviews || [];
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-brand-text-secondary mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link to="/" className="hover:text-brand-text-primary transition-colors">Home</Link>
          </li>
          <li><ChevronRight className="h-4 w-4" /></li>
          <li>
            <Link to="/products" className="hover:text-brand-text-primary transition-colors">Shop</Link>
          </li>
          {product.category && (
            <>
              <li><ChevronRight className="h-4 w-4" /></li>
              <li>
                <Link to={`/shop?category=${product.category.id}`} className="hover:text-brand-text-primary transition-colors">
                  {product.category.name}
                </Link>
              </li>
            </>
          )}
          <li><ChevronRight className="h-4 w-4" /></li>
          <li className="text-brand-text-primary font-medium truncate" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
        {/* Image gallery */}
        <div className="flex flex-col-reverse">
          <div className="w-full aspect-w-1 aspect-h-1 bg-brand-border rounded-2xl overflow-hidden border border-brand-border/50">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0].storage_path}
                alt={product.images[0].alt_text || product.name}
                className="w-full h-full object-center object-cover"
              />
            ) : (
              <img 
                src={`/${product.slug.toLowerCase()}.png`}
                alt={product.name}
                className="w-full h-full object-center object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23333333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
                  e.currentTarget.className = "w-full h-full object-contain p-24 opacity-50";
                }}
              />
            )}
          </div>
        </div>

        {/* Product info */}
        <div className="mt-10 px-4 sm:px-0 lg:mt-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-text-primary">{product.name}</h1>
          
          {/* Reviews */}
          <div className="mt-3">
            <h3 className="sr-only">Reviews</h3>
            <div className="flex items-center">
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <Star
                    key={rating}
                    className={`h-5 w-5 flex-shrink-0 ${
                      averageRating > rating ? 'text-yellow-400 fill-current' : 'text-brand-text-secondary'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="sr-only">{averageRating} out of 5 stars</p>
              <a href="#reviews" className="ml-3 text-sm font-medium text-brand-accent hover:text-brand-accent-hover">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </a>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl text-brand-text-primary">{formatPrice(currentPrice)}</p>
          </div>

          <div className="mt-6">
            <h3 className="sr-only">Description</h3>
            <div className="text-base text-brand-text-secondary space-y-6">
              <p>{product.description || product.short_description}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-brand-border/50 pt-8">
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
                <h3 className="text-sm font-medium text-brand-text-primary">Size / Option</h3>
                <div className="mt-3 flex flex-wrap gap-3">
                  {product.variants.map((variant: any) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`
                        border rounded-xl py-2 px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent
                        ${selectedVariant?.id === variant.id 
                          ? 'bg-brand-accent border-transparent text-brand-text-primary hover:bg-brand-accent-hover' 
                          : 'bg-black/40 border-brand-border text-brand-text-primary hover:bg-brand-bg'
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
              <h3 className="text-sm font-medium text-brand-text-primary">Quantity</h3>
              <div className="mt-3 flex items-center border border-brand-border rounded-xl w-32">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-brand-text-secondary hover:text-brand-text-primary"
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
                  className="w-full text-center border-0 focus:ring-0 p-0 text-brand-text-primary bg-transparent"
                  disabled={!inStock}
                />
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="px-4 py-2 text-brand-text-secondary hover:text-brand-text-primary"
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
                className={`w-full border border-transparent rounded-xl py-3 px-8 flex items-center justify-center text-base font-medium text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                  ${added ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-accent hover:bg-brand-accent-hover'}`}
              >
                {added ? 'Added to Cart' : 'Add to Cart'}
              </button>
            </div>
            
            <div className="mt-6 text-sm text-brand-text-secondary">
              <p>SKU: {selectedVariant ? selectedVariant.sku : product.sku}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div id="reviews" className="mt-24 border-t border-brand-border/50 pt-16">
        <h2 className="text-2xl font-extrabold tracking-tight text-brand-text-primary">Customer Reviews</h2>
        
        <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-4">
            <h3 className="text-lg font-medium text-brand-text-primary">Average Rating</h3>
            <div className="mt-3 flex items-center">
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <Star
                    key={rating}
                    className={`h-5 w-5 flex-shrink-0 ${
                      averageRating > rating ? 'text-yellow-400 fill-current' : 'text-brand-text-secondary'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="ml-3 text-sm font-medium text-brand-text-primary">
                {averageRating.toFixed(1)} out of 5
              </p>
            </div>
            <p className="mt-3 text-sm text-brand-text-secondary">Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
            
            <div className="mt-10">
              <h3 className="text-lg font-medium text-brand-text-primary">Share your thoughts</h3>
              <p className="mt-1 text-sm text-brand-text-secondary">
                If you’ve used this product, share your thoughts with other customers.
              </p>
              
              {!user ? (
                <div className="mt-6 bg-brand-bg p-4 rounded-xl text-sm text-brand-text-secondary text-center">
                  <Link to="/login" className="text-brand-accent font-medium hover:text-brand-accent-hover">Log in</Link> to write a review.
                </div>
              ) : (
                <form className="mt-6" onSubmit={handleSubmitReview}>
                  {reviewSuccess && (
                    <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-xl text-sm border border-green-100">
                      Your review has been submitted successfully!
                    </div>
                  )}
                  {reviewError && (
                    <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl text-sm border border-red-100">
                      {reviewError}
                    </div>
                  )}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-brand-text-secondary mb-2">Rating</label>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setNewReviewRating(rating)}
                          className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent rounded-sm"
                        >
                          <Star
                            className={`h-6 w-6 flex-shrink-0 ${
                              newReviewRating >= rating ? 'text-yellow-400 fill-current' : 'text-brand-text-secondary'
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="review-comment" className="block text-sm font-medium text-brand-text-secondary mb-2">
                      Review
                    </label>
                    <textarea
                      id="review-comment"
                      rows={4}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      className="block w-full border border-brand-border rounded-xl px-4 py-3 focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                      placeholder="What did you like or dislike?"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full bg-black/40 border border-brand-border rounded-xl py-2 px-4 text-sm font-medium text-brand-text-primary hover:bg-brand-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Write a Review'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-10 lg:mt-0 lg:col-span-8">
            {reviews.length === 0 ? (
              <div className="text-center bg-brand-bg rounded-2xl py-12 px-4">
                <User className="h-12 w-12 text-brand-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-brand-text-primary">No reviews yet</h3>
                <p className="mt-2 text-sm text-brand-text-secondary">Be the first to review this product!</p>
              </div>
            ) : (
              <div className="space-y-10">
                {reviews.map((review: any) => (
                  <div key={review.id} className="border-b border-brand-border/50 pb-10">
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-10 bg-brand-border rounded-full flex items-center justify-center mr-4">
                        <User className="h-5 w-5 text-brand-text-secondary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-brand-text-primary">{review.profile?.full_name || 'Anonymous User'}</h4>
                        <div className="mt-1 flex items-center">
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <Star
                              key={rating}
                              className={`h-4 w-4 flex-shrink-0 ${
                                review.rating > rating ? 'text-yellow-400 fill-current' : 'text-brand-text-secondary'
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                      </div>
                      <time className="ml-auto text-sm text-brand-text-secondary" dateTime={review.created_at}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </time>
                    </div>
                    <div className="mt-4 text-sm text-brand-text-secondary italic">
                      {review.comment && <p>"{review.comment}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}