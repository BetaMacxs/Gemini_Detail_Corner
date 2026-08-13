import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useProductsStore } from '../features/products/store';
import { useCartStore } from '../features/cart/store';
import { useAuthStore } from '../features/auth/store';
import { supabase } from '../lib/supabase';
import { ShoppingBag, ChevronRight, Check, Star, User, ShieldCheck, Zap, Sparkles, MessageSquare, ArrowLeft, Plus, Minus } from 'lucide-react';
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
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

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

  useEffect(() => {
    async function checkReviewStatus() {
      if (!user || !product) {
        setHasPurchased(false);
        setHasReviewed(false);
        return;
      }

      try {
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('order_items')
          .select('id, orders!inner(id, customer_id, status)')
          .eq('product_id', product.id)
          .eq('orders.customer_id', user.id)
          .in('orders.status', ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED']);

        if (purchaseError) throw purchaseError;
        setHasPurchased(purchaseData && purchaseData.length > 0);

        const { data: reviewData, error: reviewError } = await supabase
          .from('product_reviews')
          .select('id')
          .eq('product_id', product.id)
          .eq('profile_id', user.id);

        if (reviewError) throw reviewError;
        setHasReviewed(reviewData && reviewData.length > 0);
      } catch (err) {
        console.error('Error checking review status:', err);
        setHasPurchased(false);
        setHasReviewed(false);
      }
    }

    if (product) {
      checkReviewStatus();
    }
  }, [user, product, reviewSuccess]);

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
    return <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-accent"></div>
    </div>;
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-brand-text-primary">Product not found</h2>
        <p className="mt-4 text-brand-text-secondary">The product you're looking for doesn't exist or is unavailable.</p>
        <Link to="/products" className="mt-8 inline-flex items-center space-x-2 text-brand-accent hover:underline font-bold uppercase tracking-widest text-xs">
          <ArrowLeft className="h-4 w-4" />
          <span>Return to shop</span>
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
    <div className="bg-brand-bg min-h-screen">
      {/* Product Detail Section */}
      <section className="py-12 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary mb-12">
            <Link to="/" className="hover:text-brand-accent transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/products" className="hover:text-brand-accent transition-colors">Shop</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-brand-text-primary">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-start">
            {/* Image Section */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-brand-surface border border-brand-border group-hover:border-brand-accent/30 transition-all duration-500">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].storage_path}
                    alt={product.images[0].alt_text || product.name}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-24 opacity-20">
                    <img src={`/${product.slug.toLowerCase()}.png`} alt={product.name} className="max-h-full object-contain" />
                  </div>
                )}
              </div>
              
              {/* Product Badge */}
              <div className="absolute top-6 left-6 bg-brand-accent text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-xl shadow-brand-accent/20 italic">
                Professional Grade
              </div>
            </motion.div>

            {/* Content Section */}
            <div className="space-y-10">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(averageRating) ? 'fill-brand-gold text-brand-gold' : 'text-brand-text-secondary/30'}`} />
                    ))}
                  </div>
                  <a href="#reviews" className="text-xs font-black uppercase tracking-widest text-brand-text-secondary hover:text-brand-accent transition-colors">
                    {reviews.length} Reviews
                  </a>
                </div>
                <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-brand-text-primary leading-[0.9] mb-4">
                  {product.name}
                </h1>
                <div className="text-4xl font-black text-brand-accent italic mb-8">
                  {formatPrice(currentPrice)}
                </div>
                <p className="text-brand-text-secondary text-lg leading-relaxed max-w-xl">
                  {product.description || product.short_description || "Experience professional-grade results with our premium detailing solution. Engineered for automotive enthusiasts who demand nothing but the absolute best for their vehicle's finish."}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-surface border border-brand-border p-4 rounded-2xl flex items-center space-x-4">
                  <div className="bg-brand-accent/10 p-2 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-brand-accent" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest leading-tight">
                    Premium <br /> Protection
                  </div>
                </div>
                <div className="bg-brand-surface border border-brand-border p-4 rounded-2xl flex items-center space-x-4">
                  <div className="bg-brand-accent/10 p-2 rounded-lg">
                    <Sparkles className="h-5 w-5 text-brand-accent" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest leading-tight">
                    Showroom <br /> Finish
                  </div>
                </div>
              </div>

              {/* Controls Section */}
              <div className="space-y-6 pt-8 border-t border-brand-border/50">
                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-brand-text-primary mb-4 italic">Select Size</h3>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.map((variant: any) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`
                            px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                            ${selectedVariant?.id === variant.id 
                              ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' 
                              : 'bg-brand-surface border border-brand-border text-brand-text-secondary hover:border-brand-accent/50'
                            }
                            ${variant.stock_quantity === 0 ? 'opacity-30 cursor-not-allowed' : ''}
                          `}
                          disabled={variant.stock_quantity === 0}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Status */}
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${inStock ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${inStock ? 'text-green-500' : 'text-red-500'}`}>
                    {inStock ? 'In Stock & Ready to Ship' : 'Currently Out of Stock'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center bg-brand-surface border border-brand-border rounded-xl px-4 py-2 w-full sm:w-auto justify-between sm:justify-start sm:space-x-4">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-brand-text-secondary hover:text-brand-accent transition-colors"
                      disabled={!inStock}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-black w-8 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      className="p-2 text-brand-text-secondary hover:text-brand-accent transition-colors"
                      disabled={!inStock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock || added}
                    className={`
                      w-full sm:flex-1 py-4 rounded-xl flex items-center justify-center space-x-3 font-black uppercase italic tracking-widest transition-all duration-300
                      ${added ? 'bg-green-600 text-white' : 'bg-brand-accent text-white hover:bg-brand-accent-hover shadow-xl shadow-brand-accent/20'}
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {added ? (
                      <>
                        <Check className="h-5 w-5" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-5 w-5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs / Content */}
      <section className="py-24 bg-brand-surface border-y border-brand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6">Product <span className="text-brand-accent">Information</span></h3>
              <div className="prose prose-invert prose-brand max-w-none text-brand-text-secondary">
                <p>Designed and formulated to provide professional results at home. Our formula is pH balanced and safe for use on all high-end finishes, ceramic coatings, and wraps.</p>
                <ul className="mt-4 space-y-2 list-none">
                  {[
                    "Professional Grade Formulation",
                    "pH Balanced & Surface Safe",
                    "Streak-Free Performance",
                    "UV Protection Integrated"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-brand-accent"></div>
                      <span className="text-sm font-bold uppercase tracking-wider">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6">How to <span className="text-brand-accent">Apply</span></h3>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Clean Surface", desc: "Ensure the surface is cool and free from heavy dirt or contaminants." },
                  { step: "02", title: "Apply Solution", desc: "Apply a small amount to a clean microfiber applicator or towel." },
                  { step: "03", title: "Buff to Shine", desc: "Gently buff in a circular motion until a high-gloss finish is achieved." }
                ].map((step, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <span className="text-2xl font-black text-brand-accent italic opacity-50">{step.step}</span>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-brand-text-primary">{step.title}</h4>
                      <p className="text-xs text-brand-text-secondary mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-16">
            {/* Review Summary */}
            <div className="md:w-1/3">
              <div className="sticky top-32">
                <div className="flex items-center space-x-2 text-brand-accent mb-4">
                  <MessageSquare className="h-6 w-6" />
                  <span className="text-xs font-black uppercase tracking-widest">Feedback</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-8 leading-none">
                  Customer <br /> <span className="text-brand-accent">Reviews</span>
                </h2>
                
                <div className="bg-brand-surface border border-brand-border p-8 rounded-3xl mb-8">
                  <div className="text-6xl font-black text-brand-accent italic mb-2">{averageRating.toFixed(1)}</div>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < Math.floor(averageRating) ? 'fill-brand-gold text-brand-gold' : 'text-brand-text-secondary/30'}`} />
                    ))}
                  </div>
                  <div className="text-xs font-black uppercase tracking-widest text-brand-text-secondary">
                    Based on {reviews.length} Verified Purchases
                  </div>
                </div>

                {/* Review Form Toggle / Status */}
                <div className="space-y-4">
                  {!user ? (
                    <Link to="/login" className="block text-center px-8 py-4 border border-brand-border text-brand-text-primary font-black uppercase italic tracking-widest text-xs rounded-xl hover:bg-brand-surface transition-all">
                      Log In to Review
                    </Link>
                  ) : !hasPurchased ? (
                    <div className="p-4 bg-brand-surface border border-brand-border rounded-xl text-center">
                      <p className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider">Verified Purchase Required to Review</p>
                    </div>
                  ) : hasReviewed ? (
                    <div className="p-4 bg-brand-surface border border-brand-border rounded-xl text-center">
                      <p className="text-xs font-bold text-brand-accent uppercase tracking-wider">You've Shared Your Experience</p>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsSubmittingReview(!isSubmittingReview)}
                      className="w-full px-8 py-4 bg-brand-accent text-white font-black uppercase italic tracking-widest text-xs rounded-xl hover:bg-brand-accent-hover transition-all shadow-xl shadow-brand-accent/20"
                    >
                      Write a Review
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Review List & Form */}
            <div className="md:w-2/3 space-y-12">
              <AnimatePresence>
                {isSubmittingReview && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-brand-surface border border-brand-accent/30 rounded-3xl p-8 mb-12"
                  >
                    <form onSubmit={handleSubmitReview}>
                      <h3 className="text-lg font-black uppercase italic tracking-widest mb-6">Your Experience</h3>
                      
                      <div className="mb-6">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-brand-text-secondary mb-4 italic">Rating</label>
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setNewReviewRating(rating)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star
                                className={`h-8 w-8 ${newReviewRating >= rating ? 'fill-brand-gold text-brand-gold' : 'text-brand-text-secondary/30'}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-8">
                        <label htmlFor="comment" className="block text-[10px] font-black uppercase tracking-widest text-brand-text-secondary mb-4 italic">Detailed Feedback</label>
                        <textarea
                          id="comment"
                          rows={4}
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          className="w-full bg-brand-bg border border-brand-border rounded-2xl p-6 text-brand-text-primary focus:ring-1 focus:ring-brand-accent outline-none transition-all resize-none"
                          placeholder="What makes this product stand out? How was the application process?"
                          required
                        />
                      </div>

                      {reviewError && <div className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4 italic">{reviewError}</div>}

                      <div className="flex justify-end space-x-4">
                        <button 
                          type="button"
                          onClick={() => setIsSubmittingReview(false)}
                          className="px-6 py-3 text-xs font-black uppercase tracking-widest text-brand-text-secondary hover:text-brand-text-primary"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="px-10 py-3 bg-brand-accent text-white font-black uppercase italic tracking-widest text-xs rounded-xl hover:bg-brand-accent-hover shadow-lg shadow-brand-accent/20"
                        >
                          Submit Review
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {reviews.length === 0 ? (
                <div className="text-center py-24 bg-brand-surface rounded-3xl border border-dashed border-brand-border">
                  <MessageSquare className="h-12 w-12 text-brand-text-secondary mx-auto mb-6 opacity-20" />
                  <h3 className="text-lg font-black uppercase italic tracking-tighter">No Reviews Yet</h3>
                  <p className="text-brand-text-secondary mt-2">Be the first professional to share your results.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {reviews.map((review: any) => (
                    <motion.div 
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="bg-brand-surface border border-brand-border p-8 rounded-3xl group hover:border-brand-accent/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center">
                            <User className="h-6 w-6 text-brand-accent" />
                          </div>
                          <div>
                            <div className="text-sm font-black uppercase tracking-widest text-brand-text-primary leading-none mb-1">
                              {review.profile?.full_name || 'Anonymous User'}
                            </div>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-brand-gold text-brand-gold' : 'text-brand-text-secondary/30'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary opacity-50 italic">
                          {new Date(review.created_at).toLocaleDateString('en-ZA', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="text-brand-text-secondary text-lg italic leading-relaxed pl-16">
                        "{review.comment}"
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}