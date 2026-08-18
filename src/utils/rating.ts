import { ProductReview } from '../types/database';

export interface ProductRatingStats {
  averageRating: number | null;
  formattedRating: string;
  reviewCount: number;
  hasReviews: boolean;
}

/**
 * Safely calculates actual product rating statistics from the real database reviews.
 * Returns null averageRating and hasReviews = false if there are no valid reviews.
 */
export function calculateProductRating(reviews?: (ProductReview | { rating?: number | null })[] | null): ProductRatingStats {
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return {
      averageRating: null,
      formattedRating: 'No reviews',
      reviewCount: 0,
      hasReviews: false,
    };
  }

  const validRatings = reviews
    .map(r => Number(r?.rating))
    .filter(r => !isNaN(r) && r > 0 && r <= 5);

  const count = validRatings.length;

  if (count === 0) {
    return {
      averageRating: null,
      formattedRating: 'No reviews',
      reviewCount: 0,
      hasReviews: false,
    };
  }

  const sum = validRatings.reduce((acc, curr) => acc + curr, 0);
  const avg = Math.round((sum / count) * 10) / 10; // Round to 1 decimal place

  return {
    averageRating: avg,
    formattedRating: avg.toFixed(1),
    reviewCount: count,
    hasReviews: true,
  };
}
