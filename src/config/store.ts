/**
 * Centralized Store & Business Configuration
 * Single source of truth for branding, contact details, social links, pricing, and shipping policies.
 */

export const storeConfig = {
  // Brand & Identity
  STORE_NAME: "Detail Corner",
  STORE_TAGLINE: "The Art of Perfection",
  STORE_SUBTITLE: "Where Passion Meets Perfection",
  STORE_DESCRIPTION: "Premium car care products engineered for the professional and accessible to the enthusiast.",
  STORE_SHORT_DESCRIPTION: "Premium car care products.",
  FOUNDED_YEAR: "2022",
  ORIGIN_CITY: "Cape Town, South Africa",
  DEFAULT_COUNTRY: "South Africa",

  // Contact Details
  CONTACT_EMAIL: "info@detailcorner.co.za",
  MERCHANT_SUPPORT: "support@detailcorner.co.za",
  STORE_EMAIL: "info@detailcorner.co.za",
  CONTACT_PHONE: "021 555 9876",
  CONTACT_PHONE_RAW: "0215559876",
  STORE_PHONE: "082 898 6893",
  STORE_PHONE_RAW: "0828986893",
  
  // Physical Location & Banking
  STORE_ADDR: "Pacific Business Park, Mitchell's Plain",
  STORE_CITY: "Cape Town",
  STORE_PROVINCE: "Western Cape",
  STORE_POSTAL: "7785",
  STORE_VAT_NO: "9248783244",
  MERCHANT_STORE: "Detail Corner SA (Pty Ltd)",
  MERCHANT_LOCATION: "Cape Town",
  STORE_BANK_NAME: "Capitec Business Account",
  STORE_BANK_ACCOUNT_NAME: "Detail Corner",
  STORE_BANK_ACCOUNT_NUMBER: "1053564880",
  STORE_BANK_BRANCH_CODE: "470010",
  MAPS_EMBED_URL: "https://www.openstreetmap.org/export/embed.html?bbox=18.608%2C-34.035%2C18.628%2C-34.015&layer=mapnik&marker=-34.025%2C18.618",

  // Social Links & Handles
  SOCIAL_INSTAGRAM: "https://www.instagram.com/detail_corner2022/",
  SOCIAL_INSTAGRAM_HANDLE: "@detail_corner2022",
  SOCIAL_FACEBOOK: "https://www.facebook.com/p/Detail-Corner-61570508712171/",
  SOCIAL_FACEBOOK_HANDLE: "Detail Corner",
  SOCIAL_TIKTOK: "https://www.tiktok.com/@detailcorner2022/",
  SOCIAL_TIKTOK_HANDLE: "@detailcorner2022",

  // Commerce & Shipping Rules
  STORE_CURRENCY: "ZAR",
  CURRENCY_SYMBOL: "R",
  CURRENCY_LOCALE: "en-ZA",
  FREE_SHIPPING_THRESHOLD: 500,
  FLAT_SHIPPING_FEE: 100,
  ORDER_PREFIX: "DC",
  GUEST_ORDER_PREFIX: "DC-GUEST",
  ESTIMATED_DELIVERY_DAYS: "3-5 business days",
  PROCESSING_TIME_DAYS: "1-2 business days",
  RETURN_WINDOW_DAYS: 14,
  WARRANTY_DAYS: 30,

  // Navigation Links
  NAV_LINKS: [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/products" },
    { label: "Gallery", path: "/gallery" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
    { label: "FAQ", path: "/faq" },
    { label: "Track Order", path: "/track" },
  ],

  // Footer Navigation
  FOOTER_EXPLORE_LINKS: [
    { label: "All Products", path: "/products" },
    { label: "Transformation Gallery", path: "/gallery" },
    { label: "About Our Story", path: "/about" },
    { label: "Track Your Order", path: "/track" },
  ],
  FOOTER_SUPPORT_LINKS: [
    { label: "Contact Support", path: "/contact" },
    { label: "Frequently Asked Questions", path: "/faq" },
    { label: "Shipping & Returns Policy", path: "/returns" },
    { label: "Terms & Conditions", path: "/terms" },
    { label: "Privacy Policy", path: "/privacy" },
  ],
};

/**
 * Centrally format any monetary number into localized currency string.
 */
export function formatPrice(price: number | null | undefined): string {
  return new Intl.NumberFormat(storeConfig.CURRENCY_LOCALE, {
    style: 'currency',
    currency: storeConfig.STORE_CURRENCY,
  }).format(price || 0);
}

/**
 * Centrally format guest or customer order numbers with guaranteed format.
 */
export function generateOrderNumber(isGuest: boolean = false): string {
  const today = new Date();
  const dateStr = today.getFullYear().toString() + 
                  (today.getMonth() + 1).toString().padStart(2, '0') + 
                  today.getDate().toString().padStart(2, '0');
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const prefix = isGuest ? storeConfig.GUEST_ORDER_PREFIX : storeConfig.ORDER_PREFIX;
  return `#${prefix}-${dateStr}-${randomSuffix}`;
}
