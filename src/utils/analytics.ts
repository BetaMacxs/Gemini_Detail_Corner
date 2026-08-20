import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Utility for sending tracking events to Google Analytics 4 and Meta Pixel.
 * Assumes the base scripts are injected into index.html and variables are available globally.
 */

// Define global types for window.gtag and window.fbq
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export type AnalyticsEvent = 
  | { name: 'page_view'; payload: { page_path: string } }
  | { name: 'add_to_cart'; payload: { currency: 'ZAR'; value: number; items: any[] } }
  | { name: 'purchase'; payload: { transaction_id: string; currency: 'ZAR'; value: number; items: any[] } }
  | { name: 'begin_checkout'; payload: { currency: 'ZAR'; value: number; items: any[] } };

export const trackEvent = (event: AnalyticsEvent) => {
  try {
    // 1. Google Analytics 4 (gtag)
    if (typeof window.gtag === 'function') {
      window.gtag('event', event.name, event.payload);
    } else if (window.dataLayer) {
      window.dataLayer.push({ event: event.name, ...event.payload });
    }

    // 2. Meta Pixel (fbq)
    if (typeof window.fbq === 'function') {
      // Map GA4 standard events to Meta Standard events
      switch (event.name) {
        case 'page_view':
          window.fbq('track', 'PageView');
          break;
        case 'add_to_cart':
          window.fbq('track', 'AddToCart', {
            value: event.payload.value,
            currency: event.payload.currency,
            contents: event.payload.items.map(i => ({ id: i.item_id, quantity: i.quantity }))
          });
          break;
        case 'purchase':
          window.fbq('track', 'Purchase', {
            value: event.payload.value,
            currency: event.payload.currency,
            contents: event.payload.items.map(i => ({ id: i.item_id, quantity: i.quantity }))
          });
          break;
        case 'begin_checkout':
          window.fbq('track', 'InitiateCheckout', {
            value: event.payload.value,
            currency: event.payload.currency
          });
          break;
      }
    }
  } catch (error) {
    console.warn('Analytics tracking error:', error);
  }
};

/**
 * Hook to automatically track page views on route changes
 */
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    trackEvent({
      name: 'page_view',
      payload: { page_path: location.pathname + location.search }
    });
  }, [location]);
};
