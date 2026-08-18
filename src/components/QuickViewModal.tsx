import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShoppingBag,
  Star,
  Check,
  ChevronRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Plus,
  Minus,
  ExternalLink,
  Package,
  Layers
} from 'lucide-react';
import { ProductWithDetails } from '../types/database';
import { useCartStore } from '../features/cart/store';
import { toast } from '../features/toast/store';
import { storeConfig } from '../config/store';

interface QuickViewModalProps {
  product: ProductWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem } = useCartStore();
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Sync state when product changes or modal opens
  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants && product.variants.length > 0 ? product.variants[0] : null);
      setSelectedImageIndex(0);
      setQuantity(1);
      setIsAdded(false);
    }
  }, [product, isOpen]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ url: `/${product.slug.toLowerCase()}.png`, storage_path: `/${product.slug.toLowerCase()}.png`, alt_text: product.name }];

  const activeImage = images[selectedImageIndex]?.url || images[selectedImageIndex]?.storage_path || `/${product.slug.toLowerCase()}.png`;

  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant
    ? (selectedVariant.stock_quantity ?? product.stock_quantity ?? 0)
    : (product.stock_quantity ?? 0);
  const isOutOfStock = currentStock <= 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: storeConfig.STORE_CURRENCY,
    }).format(price || 0);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);

    toast.cart(product.name, {
      variant: selectedVariant?.name,
      quantity,
      image: activeImage,
      priceFormatted: formatPrice(activePrice * quantity),
    });
  };

  const handleIncrement = () => {
    if (quantity < Math.min(99, currentStock || 99)) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const reviewCount = product.reviews?.length || 0;
  const avgRating = reviewCount > 0
    ? (product.reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / reviewCount).toFixed(1)
    : '4.8';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="quickview-overlay" role="dialog" aria-modal="true" aria-labelledby="quickview-title">
          {/* Backdrop */}
          <motion.div
            className="quickview-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="quickview-dialog-wrapper">
            <motion.div
              className="quickview-modal glass brand-card"
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="quickview-close-btn"
                aria-label="Close quick view"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="quickview-body">
                {/* Left Gallery Column */}
                <div className="quickview-gallery">
                  <div className="quickview-main-image-container">
                    <img
                      src={activeImage}
                      alt={images[selectedImageIndex]?.alt_text || product.name}
                      className="quickview-main-image"
                      onError={(e) => {
                        e.currentTarget.src =
                          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23333333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
                        e.currentTarget.style.height = '100%';
                        e.currentTarget.style.width = '100%';
                        e.currentTarget.style.objectFit = 'contain';
                        e.currentTarget.style.padding = '2rem';
                        e.currentTarget.style.opacity = '0.4';
                      }}
                    />

                    {product.category && (
                      <span className="quickview-category-badge">
                        {product.category.name}
                      </span>
                    )}

                    {isOutOfStock ? (
                      <span className="quickview-stock-tag out-of-stock">
                        Out of Stock
                      </span>
                    ) : currentStock <= 5 ? (
                      <span className="quickview-stock-tag low-stock">
                        Only {currentStock} left
                      </span>
                    ) : (
                      <span className="quickview-stock-tag in-stock">
                        In Stock
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {images.length > 1 && (
                    <div className="quickview-thumbnails">
                      {images.map((img: any, idx: number) => {
                        const thumbUrl = img.url || img.storage_path || `/${product.slug.toLowerCase()}.png`;
                        const isSelected = selectedImageIndex === idx;
                        return (
                          <button
                            key={img.id || idx}
                            type="button"
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`quickview-thumbnail-btn ${isSelected ? 'active' : ''}`}
                            aria-label={`View thumbnail ${idx + 1}`}
                          >
                            <img
                              src={thumbUrl}
                              alt=""
                              className="quickview-thumbnail-img"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Product Details Column */}
                <div className="quickview-details">
                  {/* Category & Rating */}
                  <div className="quickview-meta-row">
                    <div className="quickview-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4"
                          style={{
                            fill: i < Math.floor(Number(avgRating)) ? 'var(--gold)' : 'none',
                            color: i < Math.floor(Number(avgRating)) ? 'var(--gold)' : 'var(--text-secondary)',
                          }}
                        />
                      ))}
                      <span className="quickview-rating-text">
                        {avgRating} ({reviewCount > 0 ? `${reviewCount} reviews` : 'Verified'})
                      </span>
                    </div>
                    {product.sku && (
                      <span className="quickview-sku">SKU: {product.sku}</span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 id="quickview-title" className="quickview-title">
                    {product.name}
                  </h2>

                  {/* Price */}
                  <div className="quickview-price-row">
                    <span className="quickview-price">
                      {formatPrice(activePrice)}
                    </span>
                    {quantity > 1 && (
                      <span className="quickview-price-total">
                        Total: {formatPrice(activePrice * quantity)}
                      </span>
                    )}
                  </div>

                  {/* Short Description */}
                  <p className="quickview-description">
                    {product.short_description || product.description || 'Professional grade detailing formula engineered for superior performance and automotive excellence.'}
                  </p>

                   {/* Key Highlights */}
                   <div className="quickview-features-grid">
                     {(product.highlights || ["Pro Grade Formula", "Surface Safe", "Fast Shipping"]).slice(0, 3).map((highlight, idx) => (
                       <div key={idx} className="quickview-feature-item">
                         {idx === 0 ? <Zap className="h-4 w-4" style={{ color: 'var(--accent)' }} /> : 
                          idx === 1 ? <ShieldCheck className="h-4 w-4" style={{ color: 'var(--accent)' }} /> : 
                          <Package className="h-4 w-4" style={{ color: 'var(--accent)' }} />}
                         <span>{highlight}</span>
                       </div>
                     ))}
                   </div>

                  {/* Variant Selection */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="quickview-variants-section">
                      <label className="quickview-section-label">
                        <Layers className="h-3.5 w-3.5" />
                        <span>Select Option / Size</span>
                      </label>
                      <div className="quickview-variants-list">
                        {product.variants.map((variant: any) => {
                          const isSelected = selectedVariant?.id === variant.id;
                          const varOutOfStock = (variant.stock_quantity ?? 0) <= 0;
                          return (
                            <button
                              key={variant.id}
                              type="button"
                              onClick={() => setSelectedVariant(variant)}
                              disabled={varOutOfStock}
                              className={`quickview-variant-btn ${isSelected ? 'active' : ''} ${varOutOfStock ? 'disabled' : ''}`}
                            >
                              <span className="variant-name">{variant.name}</span>
                              <span className="variant-price">{formatPrice(variant.price)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quantity & Add to Cart */}
                  <div className="quickview-actions-section">
                    <div className="quickview-quantity-wrapper">
                      <label className="quickview-section-label">Quantity</label>
                      <div className="quickview-quantity-control">
                        <button
                          type="button"
                          onClick={handleDecrement}
                          disabled={quantity <= 1 || isOutOfStock}
                          className="quantity-btn"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="quantity-value">{quantity}</span>
                        <button
                          type="button"
                          onClick={handleIncrement}
                          disabled={quantity >= Math.min(99, currentStock || 99) || isOutOfStock}
                          className="quantity-btn"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="quickview-cta-group">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`btn btn-primary quickview-add-btn ${isAdded ? 'added' : ''}`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            <span>Added to Cart!</span>
                          </>
                        ) : isOutOfStock ? (
                          <span>Out of Stock</span>
                        ) : (
                          <>
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            <span>Add to Cart ({formatPrice(activePrice * quantity)})</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* View Full Product Details Link */}
                  <div className="quickview-footer-link">
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={onClose}
                      className="quickview-full-details-link"
                    >
                      <span>View Full Product Specifications & Reviews</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
