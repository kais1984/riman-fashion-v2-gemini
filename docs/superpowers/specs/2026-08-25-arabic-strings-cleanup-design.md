# Arabic-Page English Residue Cleanup — Design

**Date:** 2026-08-25
**Status:** Approved design
**Scope decision:** UI strings + finite value dictionaries (fabric/category/silhouette). Product names/descriptions stay English (future `*Ar` work). Emails, admin pages, brand marks stay English intentionally.

## Problem

Customer-facing Arabic pages render English: Checkout trust box literals, whole PaymentCancel/WeddingChecklist/WeddingTimeline pages (all routed), cookie banner + Atelier Circle modal, error boundaries, several toasts, `'Luxury Blend'` fallbacks — and every products.ts `fabric`/`category`/`silhouette` value is English-only (no `*Ar` fields exist). Additionally, `t()` returns the raw dotted key when the ar block lacks a key (`translations[lang][key] || key`, LanguageContext.tsx:1521).

## Approach

Central vocab module + t() hardening ("Approach A"):

1. **`src/lib/productVocab.ts`** — explicit dictionaries mapping all 35 fabric, 4 category, 6 silhouette values to Arabic; `translateProductValue(field, value, lang)` returns the original string for `en` or unmapped values (defensive). `designer` excluded (brand mark). Exhaustiveness unit test fails if products.ts gains an unmapped value.
2. **LanguageContext** — ~45 new UI keys authored in en+ar (formal feminine-atelier register matching existing tone) + fallback chain `translations[lang][key] || translations.en[key] || key`.
3. **Render-site wiring** — replace hardcoded literals with `t()`; wrap fabric/category/silhouette renders with `translateProductValue`.
4. **Provider fix** — `AuthProvider` currently sits outside `LanguageProvider` (App.tsx:75-77), so AuthContext can't translate toasts; reorder to `SettingsProvider > LanguageProvider > AuthProvider > WishlistProvider > CartProvider`.

## Key decisions

- Class-based `GlobalErrorBoundary` gets a small function-component fallback child so `useLanguage()` works inside it.
- Brand marks stay verbatim everywhere: "Riman", "Atelier Riman", "Riman Atelier", "Riman Fashion", "Maison de Couture", "Stripe".
- Western digits kept inside Arabic time strings ("قبل 12 شهرًا") for consistency with data-driven numerals.
- Feminine imperative voice matches existing ar copy ("أضيفي صورة").

## Testing

- Unit: vocab exhaustiveness + translation behavior; t() fallback probe via provider render.
- Component: cookie banner renders Arabic under `riman_lang='ar'`.
- Scripted browser sweep (ar locale) over `/payment/cancel`, `/timeline`, `/wedding-checklist`: no untranslated ASCII sentences remain (brand allowlist enforced).
- Full lint/vitest/playwright green (7 legacy failures remain documented pre-existing baseline).

## Out of scope

Email templates, admin UI, product names/descriptions, color tokens unless found rendered raw (extend dict then, same pattern).
