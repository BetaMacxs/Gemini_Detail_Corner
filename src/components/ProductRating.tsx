import React from 'react';
import { Star } from 'lucide-react';
import { calculateProductRating, ProductRatingStats } from '../utils/rating';
import { ProductReview } from '../types/database';

interface ProductRatingProps {
  reviews?: (ProductReview | { rating?: number | null })[] | null;
  stats?: ProductRatingStats;
  size?: number;
  className?: string;
  showText?: boolean;
  textMode?: 'score-only' | 'score-and-count' | 'badge';
  noReviewsText?: string;
}

export function ProductRating({
  reviews,
  stats: providedStats,
  size = 12,
  className = '',
  showText = true,
  textMode = 'score-only',
  noReviewsText = 'No reviews'
}: ProductRatingProps) {
  const stats = providedStats || calculateProductRating(reviews);
  const { averageRating, formattedRating, reviewCount, hasReviews } = stats;

  return (
    <div className={`product-rating ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
        {[...Array(5)].map((_, i) => {
          const isFilled = hasReviews && averageRating !== null && i < Math.round(averageRating);
          return (
            <Star
              key={i}
              size={size}
              style={{
                fill: isFilled ? 'var(--gold)' : 'none',
                color: isFilled ? 'var(--gold)' : 'var(--text-secondary)',
                opacity: hasReviews ? 1 : 0.35,
                flexShrink: 0
              }}
            />
          );
        })}
      </div>

      {showText && (
        hasReviews ? (
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginLeft: '0.25rem', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em' }}>
            {textMode === 'score-and-count' 
              ? `${formattedRating} (${reviewCount})`
              : `(${formattedRating})`
            }
          </span>
        ) : (
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginLeft: '0.25rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', opacity: 0.6 }}>
            {noReviewsText}
          </span>
        )
      )}
    </div>
  );
}
