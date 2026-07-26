import { useEffect, useRef, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { Product } from '../types';
import {
  resolveRouteMeta,
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
  productSchema,
  breadcrumbSchema,
  getHreflangEntries,
  BASE_URL,
} from '../lib/seo';

const SITE_NAME = 'Atelier Riman | Sharjah Bridal & Evening Couture';
const DEFAULT_DESCRIPTION = 'Discover the zenith of Sharjah couture. Riman Fashion offers bespoke bridal gowns, evening wear, and premium rentals.';
const DEFAULT_OG_IMAGE = '/logo.png';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  product?: Product;
  breadcrumbs?: { name: string; url: string }[];
}

function getAdminSettings() {
  try {
    const raw = localStorage.getItem('riman_admin_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.advanced || {};
    }
  } catch {}
  return {};
}

/** Inject or update a <script> tag with the given JSON content. Tag identity is keyed by `id`. */
function injectJsonLd(id: string, data: unknown) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export default function SEOHead({ title, description, image, noIndex, product: propProduct, breadcrumbs }: SEOProps) {
  const location = useLocation();
  const { language } = useLanguage();
  const { products } = useData();
  const params = useParams();
  const canonical = `${BASE_URL}${location.pathname}`;
  const admin = getAdminSettings();
  const previousPathRef = useRef(location.pathname);

  // Resolve route metadata as fallback
  const routeMeta = resolveRouteMeta(location.pathname);
  const isProductPage = location.pathname.startsWith('/product/');

  // Auto-detect product from context on product pages
  const product = useMemo<Product | undefined>(() => {
    if (propProduct) return propProduct;
    if (isProductPage && params.id) {
      return products.find(p => p.id === params.id);
    }
    return undefined;
  }, [propProduct, isProductPage, params.id, products]);

  // Auto-generate breadcrumbs when not explicitly provided
  const resolvedBreadcrumbs = useMemo(() => {
    if (breadcrumbs) return breadcrumbs;

    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return [{ name: 'Home', url: '/' }];

    const trail: { name: string; url: string }[] = [{ name: 'Home', url: '/' }];

    if (parts[0] === 'collection' && parts[1]) {
      trail.push({ name: 'Collection', url: '/collection/all' });
      const categoryName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      trail.push({ name: categoryName, url: `/collection/${parts[1]}` });
    } else if (parts[0] === 'product' && product) {
      // We need the category for the breadcrumb
      const categorySlug = product.category.toLowerCase().replace(/\s+/g, '-');
      trail.push({ name: product.category, url: `/collection/${categorySlug}` });
      trail.push({ name: product.name, url: location.pathname });
    } else {
      // Generic page breadcrumb
      const label = parts[parts.length - 1]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      trail.push({ name: label, url: location.pathname });
    }

    return trail;
  }, [breadcrumbs, location.pathname, product]);

  const pageTitle = title
    ? `${title} | Atelier Riman`
    : routeMeta.title || SITE_NAME;
  const pageDesc = description || routeMeta.description || admin.metaDescription || DEFAULT_DESCRIPTION;
  const ogImage = image || admin.ogImageUrl || DEFAULT_OG_IMAGE;
  const shouldNoIndex = noIndex ?? routeMeta.noIndex ?? false;
  const ogType = product ? 'product' : routeMeta.ogType || 'website';

  // ――――――――――――――――――――――――――――――――――――――――――
  // HTML attributes (lang / dir on <html>)
  // ――――――――――――――――――――――――――――――――――――――――――
  useEffect(() => {
    document.documentElement.lang = language === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // ――――――――――――――――――――――――――――――――――――――――――
  // Standard meta, OG, Twitter, canonical, robots
  // ――――――――――――――――――――――――――――――――――――――――――
  useEffect(() => {
    const pathChanged = previousPathRef.current !== location.pathname;
    previousPathRef.current = location.pathname;

    document.title = pageTitle;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const removeMeta = (name: string, property = false) => {
      const attr = property ? 'property' : 'name';
      const el = document.querySelector(`meta[${attr}="${name}"]`);
      if (el) el.remove();
    };

    // Standard meta
    setMeta('description', pageDesc);
    const keywords = admin.keywords || '';
    if (keywords) setMeta('keywords', keywords);

    // Open Graph
    setMeta('og:title', pageTitle, true);
    setMeta('og:description', pageDesc, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:url', canonical, true);
    setMeta('og:type', ogType, true);
    setMeta('og:site_name', 'Atelier Riman', true);
    setMeta('og:locale', language === 'ar' ? 'ar_AE' : 'en_AE', true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', pageTitle);
    setMeta('twitter:description', pageDesc);
    setMeta('twitter:image', ogImage);

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical);

    // Hreflang
    const hreflangEntries = getHreflangEntries(location.pathname);
    // Remove old hreflang links (but not the canonical)
    document.querySelectorAll('link[rel="alternate"]').forEach(el => el.remove());
    hreflangEntries.forEach(entry => {
      const el = document.createElement('link');
      el.setAttribute('rel', 'alternate');
      el.setAttribute('href', entry.href);
      el.setAttribute('hreflang', entry.hreflang);
      document.head.appendChild(el);
    });

    // Robots
    let robots = document.querySelector('meta[name="robots"]');
    if (shouldNoIndex) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.setAttribute('name', 'robots');
        document.head.appendChild(robots);
      }
      robots.setAttribute('content', 'noindex, nofollow');
    } else if (robots) {
      robots.remove();
    }

    // Cleanup: when the route changes, remove meta tags from this render
    // so they don't accumulate. Disabled because each new effect re-applies them.
    // We only clean up on unmount or when the query params change.
    return () => {
      if (pathChanged) {
        removeMeta('description');
        if (keywords) removeMeta('keywords');
        removeMeta('og:title', true);
        removeMeta('og:description', true);
        removeMeta('og:image', true);
        removeMeta('og:url', true);
        removeMeta('og:type', true);
        removeMeta('og:site_name', true);
        removeMeta('og:locale', true);
        removeMeta('twitter:card');
        removeMeta('twitter:title');
        removeMeta('twitter:description');
        removeMeta('twitter:image');
        document.querySelectorAll('link[rel="alternate"]').forEach(el => el.remove());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageTitle, pageDesc, ogImage, canonical, shouldNoIndex, ogType, language, location.pathname]);

  // ――――――――――――――――――――――――――――――――――――――――――
  // JSON-LD Structured Data
  // ――――――――――――――――――――――――――――――――――――――――――
  useEffect(() => {
    // Global schemas (injected once)
    injectJsonLd('ld-organization', organizationSchema());
    injectJsonLd('ld-local-business', localBusinessSchema());
    injectJsonLd('ld-website', websiteSchema());

    // Product schema — on product detail pages
    if (product) {
      injectJsonLd('ld-product', productSchema(product));
    } else if (isProductPage) {
      // Remove stale product schema when navigating away
      const stale = document.getElementById('ld-product');
      if (stale) stale.remove();
    }

    // Breadcrumb schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      injectJsonLd('ld-breadcrumb', breadcrumbSchema(breadcrumbs));
    } else {
      const stale = document.getElementById('ld-breadcrumb');
      if (stale) stale.remove();
    }

    return () => {
      // Don't remove global schemas (they're needed on every page).
      // Only clean up page-specific ones.
      if (!product) {
        const p = document.getElementById('ld-product');
        if (p) p.remove();
      }
      if (!breadcrumbs) {
        const b = document.getElementById('ld-breadcrumb');
        if (b) b.remove();
      }
    };
  }, [product, breadcrumbs, isProductPage]);

  // ――――――――――――――――――――――――――――――――――――――――――
  // Analytics injection (unchanged from original)
  // ――――――――――――――――――――――――――――――――――――――――――
  useEffect(() => {
    const gaId = admin.gaId;
    if (!gaId || document.getElementById('riman-ga')) return;

    const script = document.createElement('script');
    script.id = 'riman-ga';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    const inline = document.createElement('script');
    inline.id = 'riman-ga-config';
    inline.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}', { page_path: '${location.pathname}' });
    `;
    document.head.appendChild(inline);
  }, [admin.gaId, location.pathname]);

  useEffect(() => {
    const domain = admin.plausibleDomain;
    if (!domain || document.getElementById('riman-plausible')) return;

    const script = document.createElement('script');
    script.id = 'riman-plausible';
    script.defer = true;
    script.dataset.domain = domain;
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
  }, [admin.plausibleDomain]);

  useEffect(() => {
    const siteId = admin.fathomSiteId;
    if (!siteId || document.getElementById('riman-fathom')) return;

    const script = document.createElement('script');
    script.id = 'riman-fathom';
    script.src = 'https://cdn.usefathom.com/script.js';
    script.dataset.site = siteId;
    script.defer = true;
    document.head.appendChild(script);
  }, [admin.fathomSiteId]);

  useEffect(() => {
    if (!admin.customHeadCode || document.getElementById('riman-custom-head')) return;
    // Sanitize: allow only meta, link, style tags; strip scripts and event handlers
    const sanitized = admin.customHeadCode
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
      .replace(/<object[\s\S]*?<\/object>/gi, '')
      .replace(/<embed[\s\S]*?>/gi, '')
      .replace(/<form[\s\S]*?<\/form>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript\s*:/gi, '');
    if (!sanitized.trim()) return;
    const el = document.createElement('div');
    el.id = 'riman-custom-head';
    el.style.display = 'none';
    el.innerHTML = sanitized;
    document.head.appendChild(el);
  }, [admin.customHeadCode]);

  return null;
}
