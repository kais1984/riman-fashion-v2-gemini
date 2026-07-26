import { Product } from '../types';

// ────────────────────────────────
// Route-level metadata
// ────────────────────────────────

export interface RouteMeta {
  title: string;
  description: string;
  ogType?: string;
  noIndex?: boolean;
}

export const ROUTE_META: Record<string, RouteMeta> = {
  '/': {
    title: 'Atelier Riman | Sharjah Bridal & Evening Couture',
    description: 'Discover the zenith of Sharjah couture. Riman Fashion offers bespoke bridal gowns, evening wear, premium rentals, and fine jewelry at our flagship atelier.',
    ogType: 'website',
  },
  '/collection/all': {
    title: 'All Designs | Atelier Riman',
    description: 'Browse the complete Atelier Riman collection — bridal gowns, evening dresses, luxurious rentals, and fine jewelry. Each piece is handcrafted in Sharjah.',
    ogType: 'website',
  },
  '/collection/bridal': {
    title: 'Bridal Collection | Atelier Riman',
    description: 'Discover exquisite bridal gowns at Atelier Riman in Sharjah. From classic A-line to dramatic ballgowns — each gown is a masterpiece of couture craftsmanship.',
    ogType: 'website',
  },
  '/collection/evening': {
    title: 'Evening Gowns | Atelier Riman',
    description: 'Shop luxurious evening gowns and formal wear for galas, red carpets, and special occasions. Exclusive designs available for purchase and premium rental.',
    ogType: 'website',
  },
  '/collection/rental': {
    title: 'Premium Rentals | Atelier Riman',
    description: 'Rent designer bridal and evening gowns from Atelier Riman. 7-day premium rental includes dry cleaning and insurance. Perfect for your special occasion.',
    ogType: 'website',
  },
  '/collection/jewelry': {
    title: 'Fine Jewelry | Atelier Riman',
    description: 'Discover Atelier Riman\'s fine jewelry collection — handcrafted pieces that complement our bridal and evening couture. Gold, diamonds, and precious gems.',
    ogType: 'website',
  },
  '/about': {
    title: 'Our Story | Atelier Riman',
    description: 'Discover the heritage of Atelier Riman — Sharjah\'s premier bridal and evening couture house. Where tradition meets contemporary luxury.',
  },
  '/contact': {
    title: 'Contact | Atelier Riman',
    description: 'Visit our Sharjah atelier for a private consultation. Book an appointment to explore our bridal and evening collections with our master stylists.',
  },
  '/blog': {
    title: 'Journal | Atelier Riman',
    description: 'Explore the Atelier Riman journal — bridal style guides, fashion insights, and the stories behind our collections.',
    ogType: 'article',
  },
  '/faq': {
    title: 'FAQ | Atelier Riman',
    description: 'Find answers to common questions about Atelier Riman\'s bridal and evening wear, including sizing, rentals, alterations, and ordering.',
  },
  '/alterations': {
    title: 'Bespoke Alterations | Atelier Riman',
    description: 'Expert bespoke tailoring and alterations at our Sharjah atelier. From hem adjustments to complete gown restructuring by our master seamstresses.',
  },
  '/gallery': {
    title: 'Gallery | Atelier Riman',
    description: 'Browse our gallery of Atelier Riman creations — bridal gowns, evening wear, and editorial features from our Sharjah atelier.',
  },
  '/style-quiz': {
    title: 'Style Quiz | Atelier Riman',
    description: 'Discover your perfect bridal or evening silhouette with Atelier Riman\'s style consultation quiz. Find the gown that matches your vision.',
  },
  '/appointment': {
    title: 'Book Appointment | Atelier Riman',
    description: 'Schedule a private consultation at our Sharjah atelier. Experience our bridal and evening collections with personalised styling guidance.',
  },
  '/timeline': {
    title: 'Bridal Timeline | Atelier Riman',
    description: 'Plan your wedding journey with Atelier Riman\'s bridal concierge. From your first consultation to your final fitting — we guide every step.',
  },
  '/wedding-checklist': {
    title: 'Wedding Checklist | Atelier Riman',
    description: 'Your complete wedding planning checklist from Atelier Riman. Stay organised from engagement to your grand entrance.',
  },
  '/wishlist': {
    title: 'Your Wishlist | Atelier Riman',
    description: 'View your saved Atelier Riman designs. Create your personal collection of bridal and evening favourites.',
    noIndex: true,
  },
  '/profile': {
    title: 'My Account | Atelier Riman',
    description: 'Manage your Atelier Riman account, view orders, and update preferences.',
    noIndex: true,
  },
  '/checkout': {
    title: 'Checkout | Atelier Riman',
    description: 'Complete your purchase at Atelier Riman. Secure checkout for bridal gowns, evening wear, and rentals.',
    noIndex: true,
  },
  '/search': {
    title: 'Search | Atelier Riman',
    description: 'Search the complete Atelier Riman collection for the perfect bridal or evening ensemble.',
    noIndex: true,
  },
  '/privacy': {
    title: 'Privacy Policy | Atelier Riman',
    description: 'Atelier Riman privacy policy — how we protect and handle your personal information.',
  },
  '/terms': {
    title: 'Terms & Conditions | Atelier Riman',
    description: 'Atelier Riman terms and conditions for purchases, rentals, and appointments.',
  },
};

// ────────────────────────────────
// JSON-LD Structured Data
// ────────────────────────────────

export const BASE_URL = 'https://rimanfashion.com';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'Atelier Riman',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'Sharjah\'s premier bridal and evening couture house. Bespoke gowns, premium rentals, and fine jewelry.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Al Majaz, Sharjah',
      addressLocality: 'Sharjah',
      addressCountry: 'AE',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+971-55-373-0792',
      contactType: 'customer service',
      availableLanguage: ['English', 'Arabic'],
    },
    sameAs: [
      'https://instagram.com/rimanfashion',
      'https://facebook.com/rimanfashion',
    ],
  };
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Store', 'FashionStore'],
    '@id': `${BASE_URL}/#store`,
    parentOrganization: { '@id': `${BASE_URL}/#organization` },
    name: 'Atelier Riman - Sharjah Boutique',
    url: BASE_URL,
    image: `${BASE_URL}/logo.png`,
    description: 'Premier bridal and evening couture atelier in Sharjah, UAE.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Sharjah',
      addressCountry: 'AE',
    },
    telephone: '+971-55-373-0792',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      opens: '10:00',
      closes: '20:00',
    },
    priceRange: '$$$$',
  };
}

export function productSchema(product: Product) {
  const offers = [];
  if (product.productType === 'sale' || product.productType === 'both') {
    offers.push({
      '@type': 'Offer',
      name: 'Purchase',
      price: product.salePrice || 0,
      priceCurrency: 'AED',
      availability: 'https://schema.org/InStock',
    });
  }
  if (product.productType === 'rent' || product.productType === 'both') {
    offers.push({
      '@type': 'Offer',
      name: '7-Day Rental',
      price: product.rentalPrice || 0,
      priceCurrency: 'AED',
      availability: 'https://schema.org/InStock',
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${BASE_URL}/product/${product.id}`,
    name: product.name,
    description: product.description,
    image: product.images[0],
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: 'Atelier Riman',
    },
    offers: offers.length === 1 ? offers[0] : offers,
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Atelier Riman',
    description: 'Sharjah\'s premier bridal and evening couture house.',
    inLanguage: ['en', 'ar'],
    publisher: { '@id': `${BASE_URL}/#organization` },
  };
}

// ────────────────────────────────
// Helpers
// ────────────────────────────────

/** Resolve page meta from a pathname, falling back to the root defaults. */
export function resolveRouteMeta(pathname: string): RouteMeta {
  // Static route match first
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];

  // Dynamic route patterns: /collection/:category, /product/:id
  if (pathname.startsWith('/collection/')) {
    const category = pathname.replace('/collection/', '');
    return {
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Collection | Atelier Riman`,
      description: `Explore the ${category} collection at Atelier Riman. Exquisite gowns and formal wear crafted in our Sharjah atelier.`,
      ogType: 'website',
    };
  }
  if (pathname.startsWith('/product/')) {
    return {
      title: 'Design Detail | Atelier Riman',
      description: 'View this exclusive Atelier Riman creation. Discover the craftsmanship, fabrics, and details that define our couture.',
      ogType: 'product',
    };
  }
  if (pathname.startsWith('/admin')) {
    return {
      title: 'Admin | Atelier Riman',
      description: 'Atelier Riman administration panel.',
      noIndex: true,
    };
  }

  // Fallback
  return ROUTE_META['/'];
}

/** Build hreflang entries for the current path. */
export function getHreflangEntries(pathname: string) {
  return [
    { rel: 'alternate', href: `${BASE_URL}${pathname}`, hreflang: 'en' },
    { rel: 'alternate', href: `${BASE_URL}/ar${pathname}`, hreflang: 'ar' },
    { rel: 'alternate', href: `${BASE_URL}${pathname}`, hreflang: 'x-default' },
  ];
}
