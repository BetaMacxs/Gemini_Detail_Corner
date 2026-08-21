import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useProductsStore } from '../features/products/store';
import { useCartStore } from '../features/cart/store';
import { useWishlistStore } from '../features/wishlist/store';
import { useAuthStore } from '../features/auth/store';
import { toast } from '../features/toast/store';
import { supabase } from '../lib/supabase';
import { ShoppingBag, ChevronRight, Check, Star, User, ShieldCheck, Zap, Sparkles, MessageSquare, ArrowLeft, Plus, Minus, Info, Timer, Droplets, FlaskConical, Award, Heart, Eye } from 'lucide-react';

// Helper to get icon for specifications
const getSpecIcon = (key: string) => {
  const k = key.toLowerCase();
  if (k.includes('ph')) return <FlaskConical size={20} />;
  if (k.includes('scent')) return <Sparkles size={20} />;
  if (k.includes('finish') || k.includes('gloss')) return <Award size={20} />;
  if (k.includes('dilution')) return <Droplets size={20} />;
  if (k.includes('durability') || k.includes('timer')) return <Timer size={20} />;
  if (k.includes('uv') || k.includes('protection')) return <ShieldCheck size={20} />;
  return <Info size={20} />;
};
import { storeConfig } from '../config/store';
import { calculateProductRating } from '../utils/rating';
import { ProductRating } from '../components/ProductRating';
import { QuickViewModal } from '../components/QuickViewModal';
import { ProductWithDetails } from '../types/database';

export function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { fetchProductBySlug } = useProductsStore();
  const { addItem } = useCartStore();
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
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
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductWithDetails | null>(null);

  const [activeImage, setActiveImage] = useState<string | null>(null);

  const toggleWishlist = () => {
    if (!product) return;
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent, p: any) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(p, undefined, 1);
    const image = p.images && p.images.length > 0
      ? (p.images[0].url || p.images[0].storage_path)
      : `/${p.slug.toLowerCase()}.png`;

    toast.cart(p.name, {
      quantity: 1,
      image,
      priceFormatted: formatPrice(p.price),
    });
  };

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
        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0].url || data.images[0].storage_path);
        }

        // Fetch related products (same category, excluding this one)
        if (data.category_id) {
          const { data: related } = await supabase
            .from('products')
            .select(`
              *,
              variants:product_variants(*),
              images:product_images(*),
              reviews:product_reviews(*)
            `)
            .eq('category_id', data.category_id)
            .eq('active', true)
            .neq('id', data.id)
            .limit(4);
          
          if (related) {
            setRelatedProducts(related);
          }
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

      let isPurchased = false;

      // 1. Check local_orders in localStorage
      try {
        const saved = JSON.parse(localStorage.getItem('local_orders') || '[]');
        const localMatched = saved.some((o: any) => 
          o.order && (o.order.customer_id === user.id || o.order.email === user.email) &&
          Array.isArray(o.items) && o.items.some((item: any) => item.product_id === product.id)
        );
        if (localMatched) {
          isPurchased = true;
        }
      } catch (e) {
        // ignore
      }

      // 2. If not found in local_orders, try Supabase query safely
      if (!isPurchased) {
        try {
          const { data: purchaseData, error: purchaseError } = await supabase
            .from('order_items')
            .select('id, orders!inner(id, customer_id, status)')
            .eq('product_id', product.id)
            .eq('orders.customer_id', user.id)
            .in('orders.status', ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED']);

          if (!purchaseError && purchaseData && purchaseData.length > 0) {
            isPurchased = true;
          }
        } catch (err) {
          // ignore RLS permission errors on orders table
        }
      }

      setHasPurchased(isPurchased);

      // 3. Check review status
      try {
        const { data: reviewData, error: reviewError } = await supabase
          .from('product_reviews')
          .select('id')
          .eq('product_id', product.id)
          .eq('profile_id', user.id);

        if (!reviewError && reviewData) {
          setHasReviewed(reviewData.length > 0);
        } else {
          setHasReviewed(false);
        }
      } catch (err) {
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

    const price = selectedVariant ? selectedVariant.price : product.price;
    const image = product.images && product.images.length > 0 
      ? (product.images[0].url || product.images[0].storage_path) 
      : `/${product.slug.toLowerCase()}.png`;

    toast.cart(product.name, {
      variant: selectedVariant?.name,
      quantity,
      image,
      priceFormatted: formatPrice(price * quantity),
    });
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
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', borderTop: '2px solid var(--accent)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container page-container" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.05em', color: 'var(--text-primary)' }}>Product not found</h2>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>The product you're looking for doesn't exist or is unavailable.</p>
        <Link to="/products" style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', textDecoration: 'none' }}>
          <ArrowLeft size={16} />
          <span>Return to shop</span>
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
  const inStock = currentStock > 0;
  const reviews = product.reviews || [];
  const { averageRating, formattedRating, reviewCount, hasReviews } = calculateProductRating(reviews);

  // Default fallbacks if data is missing
  const specs = product.specifications || {
    "Grade": "Professional",
    "Protection": "High Performance",
    "Finish": "Showroom Shine"
  };

  const highlights = product.highlights || [
    "Professional Grade Formulation",
    "pH Balanced & Surface Safe",
    "Streak-Free Performance",
    "UV Protection Integrated"
  ];

  const applicationSteps = product.application_steps || [
    { title: "Clean Surface", instruction: "Ensure the surface is cool and free from heavy dirt or contaminants." },
    { title: "Apply Solution", instruction: "Apply a small amount to a clean microfiber applicator or towel." },
    { title: "Buff to Shine", instruction: "Gently buff in a circular motion until a high-gloss finish is achieved." }
  ];

  return (
    <div className="product-details-page">
      {/* Product Detail Section */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <ChevronRight size={12} />
            <Link to="/products" className="breadcrumb-link">Shop</Link>
            {product.category && (
              <>
                <ChevronRight size={12} />
                <Link to={`/products?category=${product.category.id}`} className="breadcrumb-link">{product.category.name}</Link>
              </>
            )}
            <ChevronRight size={12} />
            <span className="breadcrumb-current">{product.name}</span>
          </nav>

          <div className="product-details-grid">
            {/* Image Section */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="product-gallery"
            >
              <div className="product-image-container">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="product-image"
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem', opacity: 0.2 }}>
                    <img src={`/${product.slug.toLowerCase()}.png`} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                )}
              </div>
              
              {product.images && product.images.length > 1 && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {product.images.map((img: any, idx: number) => {
                    const url = img.url || img.storage_path;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(url)}
                        style={{
                          width: '4rem',
                          height: '4rem',
                          borderRadius: 'var(--radius-sm)',
                          border: activeImage === url ? '2px solid var(--accent)' : '1px solid var(--border)',
                          overflow: 'hidden',
                          flexShrink: 0,
                          cursor: 'pointer',
                          padding: 0,
                          backgroundColor: 'var(--surface)'
                        }}
                      >
                        <img src={url} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Content Section */}
            <div className="product-info">
              <div>
                <div className="product-rating-summary">
                  <div className="product-rating-stars">
                    {[...Array(5)].map((_, i) => {
                      const isFilled = hasReviews && averageRating !== null && i < Math.round(averageRating);
                      return (
                        <Star
                          key={i}
                          size={16}
                          style={{
                            fill: isFilled ? 'var(--gold)' : 'none',
                            color: isFilled ? 'var(--gold)' : 'var(--text-secondary)',
                            opacity: hasReviews ? 1 : 0.35
                          }}
                        />
                      );
                    })}
                  </div>
                  <a href="#reviews" className="review-count-link">
                    {hasReviews ? `${formattedRating} (${reviewCount} ${reviewCount === 1 ? 'Review' : 'Reviews'})` : 'No reviews yet'}
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <h1 className="product-title" style={{ margin: 0 }}>
                    {product.name}
                  </h1>
                  <button 
                    onClick={toggleWishlist}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      padding: '0.5rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: isInWishlist(product.id) ? 'var(--accent)' : 'var(--text-secondary)',
                      transition: 'color 0.2s ease, transform 0.2s ease'
                    }}
                    title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart 
                      size={24} 
                      style={{ 
                        fill: isInWishlist(product.id) ? 'var(--accent)' : 'none' 
                      }} 
                    />
                  </button>
                </div>
                <div className="product-price-large" style={{ marginTop: '0.5rem' }}>
                  {formatPrice(currentPrice)}
                </div>
                <p className="product-description-text">
                  {product.description || product.short_description || "Experience professional-grade results with our premium detailing solution. Engineered for automotive enthusiasts who demand nothing but the absolute best for their vehicle's finish."}
                </p>
              </div>

              {/* Controls Section */}
              <div className="product-controls">
                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div>
                    <h3 className="variant-selector-heading">Select Size</h3>
                    <div className="variant-buttons-list">
                      {product.variants.map((variant: any) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`variant-btn ${selectedVariant?.id === variant.id ? 'active' : ''}`}
                          disabled={variant.stock_quantity === 0}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Status */}
                <div className="stock-status-wrapper">
                  <div className={`stock-dot ${inStock ? 'in-stock' : 'out-of-stock'}`}></div>
                  <span className={`stock-text ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                    {inStock ? 'In Stock & Ready to Ship' : 'Currently Out of Stock'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="purchase-actions">
                  <div className="quantity-control">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="quantity-btn"
                      disabled={!inStock}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="quantity-value">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      className="quantity-btn"
                      disabled={!inStock}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock || added}
                    className={`btn btn-primary add-to-cart-main-btn ${added ? 'success' : ''}`}
                  >
                    {added ? (
                      <>
                        <Check size={20} />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={20} />
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
      <section className="product-info-tabs">
        <div className="info-tabs-container">
          <div className="info-grid">
            <div>
              <h3 className="info-heading">Product <span style={{ color: 'var(--accent)' }}>Information</span></h3>
              <div style={{ color: 'var(--text-secondary)' }}>
                <p>{product.description || product.short_description || "Designed and formulated to provide professional results at home. Our formula is pH balanced and safe for use on all high-end finishes, ceramic coatings, and wraps."}</p>
                <ul className="info-list">
                  {highlights.map((item: string, i: number) => (
                    <li key={i} className="info-list-item">
                      <div className="info-dot"></div>
                      <span className="info-item-text">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h3 className="info-heading">How to <span style={{ color: 'var(--accent)' }}>Apply</span></h3>
              <div className="application-steps">
                {applicationSteps.map((step: any, i: number) => (
                  <div key={i} className="step-item">
                    <span className="step-number">{(i + 1).toString().padStart(2, '0')}</span>
                    <div>
                      <h4 className="step-title">{step.title}</h4>
                      <p className="step-desc">{step.instruction || step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="reviews-section">
        <div className="reviews-container">
          <div className="reviews-layout">
            {/* Review Summary */}
            <div className="reviews-summary">
              <div className="reviews-summary-sticky">
                <div className="reviews-eyebrow">
                  <MessageSquare size={24} />
                  <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Feedback</span>
                </div>
                <h2 className="reviews-title">
                  Customer <br /> <span style={{ color: 'var(--accent)' }}>Reviews</span>
                </h2>
                
                <div className="rating-score-card">
                  <div className="rating-big-score">{hasReviews ? formattedRating : '—'}</div>
                  <div className="product-rating-stars" style={{ marginBottom: '1rem' }}>
                    {[...Array(5)].map((_, i) => {
                      const isFilled = hasReviews && averageRating !== null && i < Math.round(averageRating);
                      return (
                        <Star
                          key={i}
                          size={20}
                          style={{
                            fill: isFilled ? 'var(--gold)' : 'none',
                            color: isFilled ? 'var(--gold)' : 'var(--text-secondary)',
                            opacity: hasReviews ? 1 : 0.35
                          }}
                        />
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
                    {hasReviews 
                      ? `Based on ${reviewCount} ${reviewCount === 1 ? 'Review' : 'Reviews'}`
                      : 'No customer reviews yet'
                    }
                  </div>
                </div>

                {/* Review Form Toggle / Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {!user ? (
                    <Link to="/login" className="btn btn-secondary" style={{ textAlign: 'center', display: 'block' }}>
                      Sign in to review
                    </Link>
                  ) : hasReviewed ? (
                    <div className="rating-status-badge">
                      <p className="rating-status-text" style={{ color: 'var(--accent)' }}>You've Shared Your Experience</p>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsSubmittingReview(!isSubmittingReview)}
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                    >
                      Write a Review
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Review List & Form */}
            <div className="reviews-list-container">
              <AnimatePresence>
                {isSubmittingReview && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="review-form-card"
                  >
                    <form onSubmit={handleSubmitReview}>
                      <h3 className="review-form-title">Your Experience</h3>
                      
                      <div className="review-form-group">
                        <label className="review-form-label">Rating</label>
                        <div className="review-rating-buttons">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setNewReviewRating(rating)}
                              className="rating-star-btn"
                            >
                              <Star
                                size={32}
                                style={{ fill: newReviewRating >= rating ? 'var(--gold)' : 'none', color: newReviewRating >= rating ? 'var(--gold)' : 'var(--text-secondary)' }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="review-form-group" style={{ marginBottom: '2rem' }}>
                        <label htmlFor="comment" className="review-form-label">Detailed Feedback</label>
                        <textarea
                          id="comment"
                          rows={4}
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          className="review-textarea"
                          placeholder="What makes this product stand out? How was the application process?"
                          required
                        />
                      </div>

                      {reviewError && <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem', fontStyle: 'italic' }}>{reviewError}</div>}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button 
                          type="button"
                          onClick={() => setIsSubmittingReview(false)}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="btn btn-primary"
                        >
                          Submit Review
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {reviews.length === 0 ? (
                <div className="empty-state">
                  <MessageSquare className="empty-state-icon" />
                  <h3 className="empty-state-title" style={{ fontSize: '1.125rem' }}>No Reviews Yet</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Be the first professional to share your results.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {reviews.map((review: any) => (
                    <motion.div 
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="review-card"
                    >
                      <div className="review-card-header">
                        <div className="review-user-info">
                          <div className="user-avatar-placeholder">
                            <User size={24} style={{ color: 'var(--accent)' }} />
                          </div>
                          <div>
                            <div className="user-name">
                              {review.profile?.full_name || 'Anonymous User'}
                            </div>
                            <div className="product-rating-stars">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} style={{ fill: i < review.rating ? 'var(--gold)' : 'none', color: i < review.rating ? 'var(--gold)' : 'var(--text-secondary)' }} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="review-date">
                          {new Date(review.created_at).toLocaleDateString('en-ZA', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="review-comment">
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

      {/* Frequently Bought Together / Upselling */}
      {relatedProducts.length > 0 && (
        <section style={{ padding: '4rem 0', backgroundColor: 'var(--surface)' }}>
          <div className="container">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.05em', color: 'var(--text-primary)', marginBottom: '2rem', textAlign: 'center' }}>
              You May Also <span style={{ color: 'var(--accent)' }}>Like</span>
            </h2>
            <div className="products-grid">
              {relatedProducts.map(related => {
                const activeVariants = related.variants?.filter((v: any) => v.active) || [];
                const price = activeVariants.length > 0 ? activeVariants[0].price : related.price;
                
                const imgRecord = related.images?.find((img: any) => img.sort_order === 0) || related.images?.[0];
                let image = `/${related.slug.toLowerCase()}.png`;
                if (imgRecord) {
                  if (imgRecord.url) {
                    image = imgRecord.url;
                  } else if (imgRecord.storage_path) {
                    const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gllpmefitusfsuzrjgtf.supabase.co';
                    image = imgRecord.storage_path.startsWith('http') || imgRecord.storage_path.startsWith('/') 
                      ? imgRecord.storage_path 
                      : `${baseUrl}/storage/v1/object/public/products/${imgRecord.storage_path}`;
                  }
                }
                
                return (
                  <motion.div
                    key={related.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -8 }}
                    className="product-card brand-card"
                  >
                    <Link to={`/product/${related.slug}`} className="block" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                      <div className="product-card-image-wrapper">
                        <img 
                          src={image} 
                          alt={related.name} 
                          className="product-card-image"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23333333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
                            e.currentTarget.style.height = '100%';
                            e.currentTarget.style.width = '100%';
                            e.currentTarget.style.objectFit = 'contain';
                            e.currentTarget.style.padding = '3rem';
                            e.currentTarget.style.opacity = '0.5';
                          }}
                        />
                        <div className="product-card-overlay"></div>
                        
                        <div className="product-card-quick-actions">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setQuickViewProduct(related);
                            }}
                            className="quickview-card-trigger-btn"
                            aria-label={`Quick view ${related.name}`}
                          >
                            <Eye size={14} />
                            <span>Quick View</span>
                          </button>
                        </div>
                      </div>
                      <div className="product-card-info">
                        <ProductRating reviews={related.reviews} size={12} className="product-rating" noReviewsText="No reviews" />
                        <h3 className="product-card-name">{related.name}</h3>
                        <p className="product-card-short-desc">
                          {related.short_description || "Professional grade detailing product for superior results."}
                        </p>
                        <div className="product-card-footer">
                          <div className="product-card-footer-price">
                            {formatPrice(price)}
                          </div>
                          <div className="product-card-footer-actions">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setQuickViewProduct(related);
                              }}
                              className="quickview-icon-btn"
                              title="Quick View"
                              aria-label={`Quick view ${related.name}`}
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleQuickAdd(e, related)}
                              className="add-to-cart-quick-btn"
                              title="Add to Cart"
                              aria-label={`Add ${related.name} to Cart`}
                              style={{ border: 'none', cursor: 'pointer' }}
                            >
                              <ShoppingBag size={18} style={{ color: '#ffffff' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={quickViewProduct !== null}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}