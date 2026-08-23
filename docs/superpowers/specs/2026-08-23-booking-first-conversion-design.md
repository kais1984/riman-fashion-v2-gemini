# Booking-First Conversion Model — Atelier Riman

Date: 2026-08-23
Status: Approved (design sections confirmed by owner)

## Problem

The site's conversion spine is an e-commerce cart-to-checkout funnel with exact prices. The actual business is rental-led, appointment-only in spirit, and cannot quote exact prices (alterations, on-demand work). Most customers are Arabic speakers, yet the site defaults to English with Arabic as opt-in.

## Goal

Make "Reserve a Private Viewing" the primary conversion path while keeping online purchase functional but secondary. Bridge browsing to booking through a saved-gowns Selection that pre-fills the appointment request.

## Decisions (owner-confirmed)

1. Booking first, checkout secondary.
2. "From" pricing (`From AED X`; rentals `From AED X · 3 days`) — never exact quotes.
3. Arabic becomes the default language; English one tap away; choice remembered.
4. Booking intake lands in the existing admin Appointments calendar + confirmation emails + WhatsApp handoff.

## Customer Flow

1. Collection cards: tap opens PDP (unchanged); card action saves gown to Selection ("Save").
2. PDP primary CTA: "Reserve a Private Viewing" — saves gown+size to Selection, opens request panel. Secondary CTA: "Add to Bag" (quieter).
3. Selection drawer ("مختاراتك / Your Selection"): saved gowns (thumbnail, name, size), count badge in header and mobile bottom nav; single primary CTA: Request Private Viewing. Empty state invites browsing.
4. Request panel: name, phone, email, preferred date/time, note; saved gowns listed automatically. On submit:
   - Creates appointment row incl. `interested_gowns`.
   - Emails client confirmation + admin alert (fire-and-forget, no-op without RESEND_API_KEY).
   - Success view shows "Continue on WhatsApp" deep link pre-filled with gowns, name, slot.
   - On failure: panel state kept, retry shown, WhatsApp link always available. No dead ends.
5. Pricing copy everywhere: "From AED X" (+ rental variant) and the line "Final quote confirmed at your consultation — fitting and alterations included." Rental deposits disclosed within the request flow when rental gowns are selected.

## Technical Design

### Data
- Migration: `appointments.interested_gowns jsonb` (nullable array of `{id, name, size, thumbnail, intent}`). Old rows unaffected.
- Admin Appointments renders gown thumbnails inline per booking.

### Components
- `SelectionDrawer`: evolves existing wishlist drawer (renamed copy, gown metadata, single CTA).
- `RequestViewingPanel`: wraps existing appointment form; injects selection; success hosts WhatsApp link (`wa.me/971553730792?text=…` encoded).
- `src/lib/email.ts`: add `sendAppointmentConfirmationEmail`, `sendAppointmentAdminAlert` using the existing lazy-client pattern.
- Header / MobileBottomNav: promote Selection badge; demote bag icon.

### i18n
- Default language fallback `'en'` → `'ar'` in `LanguageContext.tsx:1415`.
- New namespaces: `selection.*`, `request.*`, `pricing.from` (EN + AR complete).
- Route PaymentSuccess, quick-add buttons, checkout summary labels through `t()`; dates via `toLocaleDateString(lang === 'ar' ? 'ar-AE' : 'en-AE')`.

### Error Handling
- Submit failure keeps state + retry + WhatsApp alternative.
- Email failures logged only, never block UI.
- Empty-selection guard on the request CTA.

### Testing & Rollout
- New Playwright spec: save → drawer → request → success incl. WhatsApp link presence.
- Update click-verification specs affected by label changes.
- Full suite green before REST deploy; verify live bundle hash; commit/push.
- TestSprite plan refresh deferred until after owner click-through.

## Out of Scope
- Removing checkout or Stripe readiness; Journal rebuild; broader audit fixes (typography ramp, brand-consistency tokens) — separate workstream.
