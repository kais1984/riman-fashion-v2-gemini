# Booking-First Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make "Reserve a Private Viewing" the primary conversion path (saved-gowns Selection → prefilled appointment → admin calendar + emails + WhatsApp), with Arabic as default language and "From AED X" pricing, keeping checkout functional but secondary.

**Architecture:** Reuse the existing WishlistContext (renamed "Your Selection"), the existing AppointmentPage wizard (prefilled via router state), the lazy Resend client in `src/lib/email.ts`, and the admin Appointments calendar. One nullable `jsonb` column on `appointments`. No checkout changes beyond i18n fixes.

**Tech Stack:** React 19 + Vite + TypeScript + Tailwind v4 + Supabase + Resend + Playwright.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-23-booking-first-conversion-design.md`
- Every new user-facing string gets BOTH English and Arabic entries in `src/contexts/LanguageContext.tsx` (en dict ~lines 190–330, ar dict ~lines 890–1030).
- Emails are fire-and-forget (`.catch(console.error)`), never block UI, no-op safely when `RESEND_API_KEY` is unset (use existing `getResendClient()`).
- WhatsApp number: `971553730792`.
- Do NOT remove or restyle checkout, orders, Stripe readiness.
- Dates: `toLocaleDateString(lang === 'ar' ? 'ar-AE' : 'en-AE', …)` — never hardcoded `'en-US'` in touched files.
- Verify each task with `npm run lint` (runs `tsc --noEmit`) before committing.
- Final gate: full Playwright suite green (`npx playwright test`) before deploy; deploy only via `C:\Users\KAIS\AppData\Local\Temp\opencode\netlify-rest-deploy.ps1`; push pattern `git push origin salon-rebrand:main`.

---

### Task 1: Data foundation — `interested_gowns` column, type, service

**Files:**
- Create: `supabase/migrations/20260823100000_appointments_interested_gowns.sql`
- Modify: `src/types.ts` (Appointment interface, lines 36–47)
- Modify: `src/services/appointments.ts:19-45` (createAppointment insert)

**Interfaces:**
- Produces: `GownRef` type in `src/types.ts`: `{ id: string; name: string; size?: string; intent: 'sale' | 'rent' }`
- Produces: `Appointment.interested_gowns?: GownRef[] | null`
- Consumes (later tasks): `createAppointment` accepts and persists `interested_gowns`

- [ ] **Step 1: Write the migration**

```sql
-- appointments.interested_gowns: gowns the client saved before requesting a viewing
alter table public.appointments
  add column if not exists interested_gowns jsonb;

comment on column public.appointments.interested_gowns is
  'Array of {id,name,size,intent} for gowns saved to the client''s selection';
```

- [ ] **Step 2: Extend types**

In `src/types.ts`, above `export interface Appointment` add:

```ts
export interface GownRef {
  id: string;
  name: string;
  size?: string;
  intent: 'sale' | 'rent';
}
```

Inside `interface Appointment` add as the last field:

```ts
  interested_gowns?: GownRef[] | null;
```

- [ ] **Step 3: Persist the column**

In `src/services/appointments.ts` inside the Supabase insert object (line 27), after `notes: appointment.notes,` add:

```ts
        interested_gowns: appointment.interested_gowns ?? null,
```

Also in the local fallback function `createLocalAppointment`, ensure the created object spreads the input (it already persists the whole appointment object — verify, no change needed if so).

- [ ] **Step 4: Typecheck**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260823100000_appointments_interested_gowns.sql src/types.ts src/services/appointments.ts
git commit -m "feat(appointments): interested_gowns jsonb column + GownRef type"
```

---

### Task 2: Arabic default language + locale-aware dates

**Files:**
- Modify: `src/contexts/LanguageContext.tsx:1414-1416`
- Modify: `src/pages/AppointmentPage.tsx:109` (success date line)

**Interfaces:**
- Consumes: nothing new.
- Produces: first-visit language = `'ar'`; pattern `lang === 'ar' ? 'ar-AE' : 'en-AE'` used in AppointmentPage.

- [ ] **Step 1: Flip the fallback**

Replace in `LanguageContext.tsx`:

```ts
    return (localStorage.getItem('riman_lang') as Language) || 'en';
```

with:

```ts
    return (localStorage.getItem('riman_lang') as Language) || 'ar';
```

(Returning visitors with a stored preference are unaffected.)

- [ ] **Step 2: Locale-aware success date**

In `AppointmentPage.tsx` the component already calls `useLanguage()` for `t`. Destructure also `isRtl`:

```ts
  const { t, isRtl } = useLanguage();
```

Replace line 109's `new Date(form.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })` with:

```tsx
{new Date(form.date).toLocaleDateString(isRtl ? 'ar-AE' : 'en-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
```

Apply the same replacement to any other `'en-US'` occurrences inside `AppointmentPage.tsx` (grep the file).

- [ ] **Step 3: Typecheck**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/contexts/LanguageContext.tsx src/pages/AppointmentPage.tsx
git commit -m "feat(i18n): Arabic as default language, locale-aware appointment dates"
```

---

### Task 3: "From" pricing copy

**Files:**
- Modify: `src/contexts/LanguageContext.tsx` (add keys to en + ar dicts)
- Modify: `src/pages/ProductDetail.tsx:311` (sale price), `:321` (rental price), `:643` (mobile bar)
- Modify: `src/components/ProductCard.tsx` (price line — locate `formatPrice(` usage)

**Interfaces:**
- Produces translation keys: `pricing.from`, `pricing.rental_period`, `pricing.consultation_note`

- [ ] **Step 1: Add translation keys**

English dict (near other `product.` keys):

```ts
    // From-pricing
    'pricing.from': 'From',
    'pricing.rental_period': '3-day rental',
    'pricing.consultation_note': 'Final quote confirmed at your consultation — fitting and alterations included.',
```

Arabic dict:

```ts
    // From-pricing
    'pricing.from': 'يبدأ من',
    'pricing.rental_period': 'تأجير ٣ أيام',
    'pricing.consultation_note': 'يتم تأكيد السعر النهائي في موعد الاستشارة — يشمل التفصيل والتعديلات.',
```

(Do not write the `// From-pricing` comments into the dicts if comment style there differs — match surrounding style; keys are what matter.)

- [ ] **Step 2: Desktop PDP sale price (line 311)**

Replace:

```tsx
<span className="font-heading text-3xl text-stone-800">{formatPrice(product.salePrice || 0)}</span>
```

with:

```tsx
<span className="font-heading text-3xl text-stone-800"><span className="text-sm font-body text-stone-500 uppercase tracking-widest me-2">{t('pricing.from')}</span>{formatPrice(product.salePrice || 0)}</span>
```

- [ ] **Step 3: Desktop PDP rental price (line 321)**

Replace:

```tsx
<span className="font-heading text-3xl text-gold">{formatPrice(product.rentalPrice || 0)}</span>
```

with:

```tsx
<span className="font-heading text-3xl text-gold"><span className="text-sm font-body text-stone-500 uppercase tracking-widest me-2">{t('pricing.from')}</span>{formatPrice(product.rentalPrice || 0)}</span>
```

Directly under whichever price block closes (same parent container), append the note:

```tsx
<p className="font-body text-[11px] text-stone-400 italic mt-2 leading-relaxed">{t('pricing.consultation_note')}</p>
```

- [ ] **Step 4: Mobile sticky bar (line 643)**

Wrap the existing price with the From prefix:

```tsx
<p className="font-heading text-sm text-gold"><span className="text-[10px] font-body text-stone-400 uppercase tracking-wider me-1">{t('pricing.from')}</span>{formatPrice(isSale ? (product.salePrice || 0) : (isRent ? (product.rentalPrice || 0) : 0))}</p>
```

- [ ] **Step 5: ProductCard price line**

In `ProductCard.tsx`, find the rendered price (`formatPrice(...)`). Prefix it with `<span className="me-1 text-[9px] uppercase tracking-wider text-stone-400">{t('pricing.from')}</span>` inside the same element, keeping classes intact. `t` is already imported there.

- [ ] **Step 6: Typecheck + visual sanity**

Run: `npm run lint && npm run dev` then open `http://localhost:3001/product/<any-id>` in EN and AR.
Expected: "From"/"يبدأ من" prefixes render; note line visible under desktop price; no layout overflow at 1280px width.

- [ ] **Step 7: Commit**

```bash
git add src/contexts/LanguageContext.tsx src/pages/ProductDetail.tsx src/components/ProductCard.tsx
git commit -m "feat(pricing): From-AED pricing copy + consultation note"
```

---

### Task 4: Prefilled viewing-request flow (PDP primary CTA)

Implementation note vs spec: instead of building a modal panel, the PDP primary CTA navigates to the proven `/appointment` wizard carrying the gown list in router state. Same UX outcome, zero duplicated form logic.

**Files:**
- Modify: `src/contexts/LanguageContext.tsx` (keys below)
- Modify: `src/pages/ProductDetail.tsx` (CTA block lines 368–389, imports, handler)
- Modify: `src/pages/AppointmentPage.tsx` (read `location.state`, chips, prefill)

**Interfaces:**
- Consumes: `GownRef` (Task 1), `addToWishlist` from WishlistContext.
- Produces: route contract `/appointment` accepts `location.state = { gowns?: GownRef[] }`; AppointmentPage auto-selects `service_type: 'rental'` when any gown has `intent: 'rent'`, else `'bridal'`, and pre-fills notes with gown names.
- Produces keys: `product.reserve_viewing`, `appointment.your_gowns`

- [ ] **Step 1: Translation keys**

English:

```ts
    'product.reserve_viewing': 'Reserve a Private Viewing',
    'appointment.your_gowns': 'Your Selected Pieces',
```

Arabic:

```ts
    'product.reserve_viewing': 'احجزي مشاهدة خاصة',
    'appointment.your_gowns': 'قطعك المختارة',
```

- [ ] **Step 2: PDP CTA block rewrite**

In `ProductDetail.tsx`, add import near top:

```ts
import { useNavigate } from 'react-router-dom';
import type { GownRef } from '../types';
```

Inside the component add `const navigate = useNavigate();` beside the other hooks, plus:

```ts
  const reserveViewing = () => {
    if (product) {
      if (!isInWishlist(product.id)) addToWishlist(product);
      const gowns: GownRef[] = [{
        id: product.id,
        name: product.name,
        size: selectedSize || undefined,
        intent: isRent ? 'rent' : 'sale',
      }];
      navigate('/appointment', { state: { gowns } });
    }
  };
```

Replace the primary button block (lines 370–379) so the flex-col contains TWO stacked buttons, heart button unchanged beside them:

```tsx
<div className="flex-1 flex flex-col gap-2">
  <button onClick={reserveViewing} className="w-full btn-luxury flex items-center justify-center gap-3">
    <Sparkles className="w-4 h-4" />
    {t('product.reserve_viewing')}
  </button>
  <button onClick={handleAddToCart} disabled={isAddingToCart} className="w-full btn-luxury-outline !py-3 flex items-center justify-center gap-3">
    {isAddingToCart ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <>
        <ShoppingBag className="w-3.5 h-3.5" />
        {isRent ? t('product.book_rental') : t('product.add_to_collection')}
      </>
    )}
  </button>
  {errorMsg && (
    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-rose-500 uppercase tracking-widest text-center font-bold">
      {errorMsg}
    </motion.p>
  )}
</div>
```

Add `Sparkles` to the lucide-react import. If a second mobile CTA surface exists further down (~lines 700–738), apply the same reserve-primary/bag-secondary ordering there.

- [ ] **Step 3: AppointmentPage prefill**

Add imports:

```ts
import { useLocation } from 'react-router-dom';
import type { GownRef } from '../types';
```

In the component:

```ts
  const location = useLocation();
  const incomingGowns: GownRef[] = (location.state as { gowns?: GownRef[] } | null)?.gowns ?? [];
  const gownNames = incomingGowns.map(g => `${g.name}${g.size ? ` (${g.size})` : ''}`);
```

Change the `form` initial state to prefill:

```ts
  const [form, setForm] = useState(() => ({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    service_type: incomingGowns.some(g => g.intent === 'rent') ? 'rental' : incomingGowns.length ? 'bridal' : '',
    notes: gownNames.length ? `Interested in: ${gownNames.join(', ')}` : '',
  }));
```

Above the form fields (inside step-1 render), when `incomingGowns.length > 0` show:

```tsx
<div className="mb-6 p-4 border border-gold/30 bg-gold/[0.04]">
  <p className="text-[10px] tracking-widest uppercase text-stone-800 font-bold mb-2">{t('appointment.your_gowns')}</p>
  <ul className="space-y-1">
    {incomingGowns.map((g, i) => (
      <li key={`${g.id}-${i}`} className="text-xs text-stone-600 italic">{g.name}{g.size ? ` · ${g.size}` : ''}</li>
    ))}
  </ul>
</div>
```

Pass gowns through submit: in `handleSubmit`, extend the `createAppointment({...})` argument with `interested_gowns: incomingGowns.length ? incomingGowns : null,`.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`. Open a PDP, click "Reserve a Private Viewing".
Expected: lands on /appointment with service preselected, notes prefilled, gold chips listing the gown; submitting creates an appointment row containing `interested_gowns` (check Supabase table editor or local storage fallback).

- [ ] **Step 5: Commit**

```bash
git add src/contexts/LanguageContext.tsx src/pages/ProductDetail.tsx src/pages/AppointmentPage.tsx
git commit -m "feat(booking): Reserve-a-Viewing primary CTA with prefilled appointment"
```

---

### Task 5: Your Selection page (wishlist rename + request CTA)

**Files:**
- Modify: `src/pages/WishlistPage.tsx`
- Modify: `src/contexts/LanguageContext.tsx`

**Interfaces:**
- Consumes: route contract from Task 4 (`location.state.gowns`).
- Produces keys: `selection.title`, `selection.subtitle`, `selection.empty`, `selection.empty_desc`, `selection.explore`, `selection.view`, `selection.add_to_bag`, `selection.request_viewing`, `selection.count`

- [ ] **Step 1: Translation keys**

English (replace the old `wishlist.*` values' usage — keep old keys, add new):

```ts
    // Selection
    'selection.title': 'Your Selection',
    'selection.subtitle': 'Pieces kept aside for your private viewing',
    'selection.empty': 'Your selection is empty',
    'selection.empty_desc': 'Save the silhouettes that catch your eye — we will have them ready for your visit.',
    'selection.explore': 'Explore Atelier',
    'selection.view': 'View',
    'selection.add_to_bag': 'Add to Bag',
    'selection.request_viewing': 'Request Private Viewing',
    'selection.count': 'pieces selected',
```

Arabic:

```ts
    // Selection
    'selection.title': 'مختاراتك',
    'selection.subtitle': 'قطع انتظرناها لمشاهدتك الخاصة',
    'selection.empty': 'مختاراتك فارغة',
    'selection.empty_desc': 'احفظي التصاميم التي أسرت قلبك — وستكون جاهزة عند زيارتك.',
    'selection.explore': 'استكشفي الدار',
    'selection.view': 'عرض',
    'selection.add_to_bag': 'أضف للحقيبة',
    'selection.request_viewing': 'طلب مشاهدة خاصة',
    'selection.count': 'قطعة مختارة',
```

- [ ] **Step 2: Page copy swap + request CTA**

In `WishlistPage.tsx`: replace every `t('wishlist.…')` with the matching `t('selection.…')` (title/subtitle/empty/empty_desc/explore/view/add_to_bag). Under the header subtitle add the count line: `{wishlist.length} {t('selection.count')}` styled like the subtitle. Above the grid (and again below it), when `wishlist.length > 0` render:

```tsx
<button
  onClick={() => navigate('/appointment', {
    state: {
      gowns: wishlist.map(p => ({ id: p.id, name: p.name, intent: (p.productType === 'rent' ? 'rent' : 'sale') as 'rent' | 'sale' })),
    },
  })}
  className="btn-luxury px-12 w-full sm:w-auto"
>
  {t('selection.request_viewing')}
</button>
```

Add `import { useNavigate } from 'react-router-dom';` and `const navigate = useNavigate();`. Check the actual field name for product type on the `Product` interface in `src/types.ts` (`product_type` vs `productType`) and map accordingly — the mapping must compile.

- [ ] **Step 3: Typecheck + manual verify**

Run: `npm run lint`, then save two gowns and open `/wishlist`.
Expected: new title/copy, count line, button navigates to prefilled appointment listing both gowns.

- [ ] **Step 4: Commit**

```bash
git add src/pages/WishlistPage.tsx src/contexts/LanguageContext.tsx
git commit -m "feat(selection): Your Selection page with request-viewing CTA"
```

---

### Task 6: Emails — appointment confirmation + admin alert

**Files:**
- Modify: `src/lib/email.ts`
- Modify: `src/pages/AppointmentPage.tsx` (handleSubmit)

**Interfaces:**
- Consumes: `getResendClient()` (existing), `GownRef`.
- Produces:
  - `sendAppointmentConfirmationEmail(data: { name: string; email: string; date: string; time: string; gowns: string[] }): Promise<{ success: boolean; error?: string }>`
  - `sendAppointmentAdminAlert(data: { name: string; email: string; phone: string; date: string; time: string; gowns: string[] }): Promise<{ success: boolean; error?: string }>`

- [ ] **Step 1: Implement both functions**

Append to `src/lib/email.ts` (match existing HTML style of `sendOrderConfirmationEmail`):

```ts
export async function sendAppointmentConfirmationEmail(data: {
  name: string;
  email: string;
  date: string;
  time: string;
  gowns: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    if (!resend) return { success: false, error: 'not-configured' };

    const html = `
      <!DOCTYPE html>
      <html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1f1f1f;max-width:600px;margin:0 auto;padding:24px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="font-family:'Playfair Display',Georgia,serif;color:#0a0a0a;margin:0 0 8px;font-size:28px;">Riman Fashion</h1>
          <p style="color:#666;font-size:14px;margin:0;">Atelier Riman — Sharjah</p>
        </div>
        <div style="background:#fafafa;border:1px solid #e5e5e5;border-radius:8px;padding:24px;">
          <h2 style="margin:0 0 16px;font-size:20px;">Your Private Viewing</h2>
          <p>Dear <strong>${data.name}</strong>,</p>
          <p>Your viewing request has been received for <strong>${new Date(data.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong> at <strong>${data.time}</strong>.</p>
          ${data.gowns.length ? `<p>Pieces prepared for you:<br/><em>${data.gowns.join('<br/>')}</em></p>` : ''}
          <p style="margin-bottom:0;">Al Zahra St, Sharjah, UAE. To reschedule, simply reply to this email.</p>
        </div>
        <p style="font-size:12px;color:#999;text-align:center;margin-top:32px;">Atelier Riman · hello@rimanfashion.com</p>
      </body></html>`;

    const { error } = await resend.emails.send({
      from: import.meta.env.RESEND_FROM_EMAIL || 'Riman Fashion <orders@rimanfashion.com>',
      to: data.email,
      subject: `Private Viewing Request — ${data.date}`,
      html,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    console.error('sendAppointmentConfirmationEmail error:', err);
    return { success: false, error: String(err) };
  }
}

export async function sendAppointmentAdminAlert(data: {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  gowns: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    if (!resend) return { success: false, error: 'not-configured' };

    const adminEmail = import.meta.env.RESEND_ADMIN_EMAIL || 'admin@rimanfashion.com';
    const html = `
      <h2>New Viewing Request</h2>
      <p><strong>${data.name}</strong> · ${data.phone} · ${data.email}</p>
      <p><strong>Requested:</strong> ${data.date} at ${data.time}</p>
      ${data.gowns.length ? `<p><strong>Gowns:</strong> ${data.gowns.join(', ')}</p>` : ''}
      <p><a href="https://riman-fashion-v2.netlify.app/admin/appointments">Open Admin Calendar</a></p>`;

    const { error } = await resend.emails.send({
      from: import.meta.env.RESEND_FROM_EMAIL || 'Riman Fashion <orders@rimanfashion.com>',
      to: adminEmail,
      subject: `📅 Viewing Request — ${data.name}`,
      html,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    console.error('sendAppointmentAdminAlert error:', err);
    return { success: false, error: String(err) };
  }
}
```

- [ ] **Step 2: Wire into handleSubmit (fire-and-forget)**

In `AppointmentPage.tsx` after `await createAppointment({...})` succeeds and before `setIsSubmitted(true)`:

```ts
      const gownList = gownNames.length ? gownNames : [];
      sendAppointmentConfirmationEmail({ name: form.name, email: form.email, date: form.date, time: form.time, gowns: gownList }).catch(err => console.error('Confirmation email failed:', err));
      sendAppointmentAdminAlert({ name: form.name, email: form.email, phone: form.phone, date: form.date, time: form.time, gowns: gownList }).catch(err => console.error('Admin alert failed:', err));
```

Add the two imports from `'../lib/email'`.

- [ ] **Step 3: Typecheck + manual verify**

Run: `npm run lint`. Submit a booking in dev.
Expected: no errors in UI without RESEND_API_KEY; console shows `[Riman] Email not configured` info only.

- [ ] **Step 4: Commit**

```bash
git add src/lib/email.ts src/pages/AppointmentPage.tsx
git commit -m "feat(email): appointment confirmation + admin alert (fire-and-forget)"
```

---

### Task 7: WhatsApp handoff on success

**Files:**
- Create: `src/lib/whatsapp.ts`
- Modify: `src/pages/AppointmentPage.tsx` (success branch, ~lines 92–130)
- Modify: `src/contexts/LanguageContext.tsx` (key `appointment.whatsapp_continue`)

**Interfaces:**
- Produces: `buildWhatsAppUrl(message: string): string` in `src/lib/whatsapp.ts`
- Produces key: `appointment.whatsapp_continue`

- [ ] **Step 1: Helper**

```ts
const WHATSAPP_NUMBER = '971553730792';

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 2: Key**

English: `'appointment.whatsapp_continue': 'Continue on WhatsApp'`
Arabic: `'appointment.whatsapp_continue': 'تابعينا على واتساب'`

- [ ] **Step 3: Success view button**

In the `if (isSubmitted)` success JSX, after the existing confirmation paragraph add:

```tsx
<a
  href={buildWhatsAppUrl(
    incomingGowns.length
      ? `${t('appointment.booked')} — ${form.name}, ${form.date} ${form.time}. ${t('appointment.your_gowns')}: ${gownNames.join(', ')}`
      : `${t('appointment.booked')} — ${form.name}, ${form.date} ${form.time}`
  )}
  target="_blank"
  rel="noopener noreferrer"
  className="btn-luxury-outline inline-block mt-4 px-10"
>
  {t('appointment.whatsapp_continue')}
</a>
```

Import `buildWhatsAppUrl` from `'../lib/whatsapp'`.

- [ ] **Step 4: Typecheck + manual verify**

Run: `npm run lint`, submit a booking.
Expected: success screen shows the button; link opens wa.me with encoded message including gown names.

- [ ] **Step 5: Commit**

```bash
git add src/lib/whatsapp.ts src/pages/AppointmentPage.tsx src/contexts/LanguageContext.tsx
git commit -m "feat(booking): WhatsApp continue-handoff after viewing request"
```

---

### Task 8: Nav promotion — Selection over Bag

**Files:**
- Modify: `src/components/MobileBottomNav.tsx`
- Modify: `src/components/Header.tsx:155-175` (icon cluster)

**Interfaces:**
- Consumes: `useWishlist().wishlist.length`, `useCart().totalItems`.

- [ ] **Step 1: MobileBottomNav reorder + badges**

Rewrite `navItems` (keep Home/Search/You entries unchanged otherwise):

```ts
  const { totalItems } = useCart();
  const { wishlist } = useWishlist(); // add import from '../contexts/WishlistContext'
  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Selection', path: '/wishlist', icon: Heart, badge: wishlist.length },
    { label: 'Bag', path: '/checkout', icon: ShoppingBag, badge: totalItems },
    { label: 'You', path: '/profile', icon: User },
  ];
```

Badge rendering already handles any item with a numeric `badge`; the current code types items loosely enough — if TypeScript complains about `badge` missing on some entries, give the array an explicit type: `{ label: string; path: string; icon: typeof Home; badge?: number }[]`.

- [ ] **Step 2: Desktop header**

In `Header.tsx` around line 161 the wishlist link exists. Give it a count badge and place it BEFORE the bag link in DOM order (both inside the icon cluster):

```tsx
<Link to="/wishlist" className="hidden lg:block relative hover:text-gold transition-colors" aria-label="Your Selection">
  <Heart className="w-[18px] h-[18px]" />
  {wishlistCount > 0 && (
    <span className="absolute -top-1.5 -right-1.5 bg-gold text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full leading-none font-bold">{wishlistCount}</span>
  </h2>
  </Link>
```

(Copy the badge span markup exactly from the existing cart-icon badge in the same cluster; remove the stray `</h2>` typo if introduced — the closing tag must be `</Link>`.) Wire `const { wishlist } = useWishlist();` and `const wishlistCount = wishlist.length;`. Match whatever icon component the current link uses.

- [ ] **Step 3: Typecheck + manual verify**

Run: `npm run lint`, save a gown, resize to mobile width.
Expected: Selection tab shows count badge; header shows heart-with-badge left of bag.

- [ ] **Step 4: Commit**

```bash
git add src/components/MobileBottomNav.tsx src/components/Header.tsx
git commit -m "feat(nav): promote Your Selection, demote bag"
```

---

### Task 9: Admin — show requested gowns on booking cards

**Files:**
- Modify: `src/pages/admin/AdminAppointments.tsx:93-125` (card body)

**Interfaces:**
- Consumes: `Appointment.interested_gowns?: GownRef[] | null` (Task 1). Verify the admin fetch selects `*` (or add the column to its select list).

- [ ] **Step 1: Render gown list**

After the phone row (line 114) inside the card metadata block add:

```tsx
{(appt.interested_gowns?.length ?? 0) > 0 && (
  <span className="flex items-start gap-1 col-span-full">
    <Heart className="w-3 h-3 mt-0.5 shrink-0" />
    <span className="italic">{appt.interested_gowns!.map(g => `${g.name}${g.size ? ` (${g.size})` : ''}`).join(' · ')}</span>
  </span>
)}
```

Add `Heart` to the lucide-react import. If the grid parent constrains columns, `col-span-full` keeps it on its own row.

- [ ] **Step 2: Typecheck + manual verify**

Run: `npm run lint`. Open `/admin` → Appointments with a booking made in Task 4's manual test.
Expected: gown names listed on the card.

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/AdminAppointments.tsx
git commit -m "feat(admin): display requested gowns on appointment cards"
```

---

### Task 10: Bilingual leak fixes (audit P1s within scope)

**Files:**
- Modify: `src/pages/PaymentSuccess.tsx` (full `t()` routing)
- Modify: `src/components/ProductCard.tsx:137,155` (quick-add strings)
- Modify: `src/pages/Checkout.tsx:466` (summary "Name")

**Interfaces:**
- Produces keys: `payment.verifying`, `payment.success_title`, `payment.success_sub`, `payment.sent_to`, `payment.success_body`, `payment.dashboard`, `payment.error_title`, `payment.error_body`, `payment.contact`, `payment.home`, `product.select_size`, `product.cancel`, `checkout.name_label` (all EN + AR)

- [ ] **Step 1: Keys**

English:

```ts
    'payment.verifying': 'Verifying Payment',
    'payment.please_wait': 'Please wait a moment...',
    'payment.success_title': 'Payment Successful',
    'payment.success_sub': 'Your investment has been received.',
    'payment.sent_to': 'Confirmation sent to',
    'payment.success_body': 'Our team will contact you within 24 hours to arrange fitting and delivery details.',
    'payment.dashboard': 'View My Dashboard',
    'payment.error_title': 'Payment Not Verified',
    'payment.error_body': 'Please contact our atelier to confirm your order.',
    'payment.contact': 'Contact Us',
    'payment.home': 'Return Home',
    'product.select_size': 'Select Size',
    'product.cancel': 'Cancel',
    'product.quick_shop': 'Quick Shop',
    'checkout.name_label': 'Name',
```

Arabic:

```ts
    'payment.verifying': 'جارٍ تأكيد الدفع',
    'payment.please_wait': 'الرجاء الانتظار قليلاً...',
    'payment.success_title': 'تم الدفع بنجاح',
    'payment.success_sub': 'لقد استلمنا طلبك.',
    'payment.sent_to': 'تم إرسال التأكيد إلى',
    'payment.success_body': 'سيتواصل معك فريقنا خلال ٢٤ ساعة لترتيب التفصيل والتوصيل.',
    'payment.dashboard': 'لوحة حسابي',
    'payment.error_title': 'لم يتم تأكيد الدفع',
    'payment.error_body': 'الرجاء التواصل مع الدار لتأكيد طلبك.',
    'payment.contact': 'تواصلي معنا',
    'payment.home': 'العودة للرئيسية',
    'product.select_size': 'اختاري المقاس',
    'product.cancel': 'إلغاء',
    'product.quick_shop': 'تسوق سريع',
    'checkout.name_label': 'الاسم',
```

- [ ] **Step 2: PaymentSuccess routing**

Add `import { useLanguage } from '../contexts/LanguageContext';` and `const { t } = useLanguage();` inside the component. Replace every literal string: `"Verifying Payment"`→`{t('payment.verifying')}`, `"Please wait a moment..."`→`{t('payment.please_wait')}`, `"Payment Successful"`→`{t('payment.success_title')}`, `"Your investment has been received."`→`{t('payment.success_sub')}`, prefix `Confirmation sent to {email}`→`{t('payment.sent_to')} {email}`, the 24-hours paragraph→`{t('payment.success_body')}`, `"View My Dashboard"`→`{t('payment.dashboard')}`, `"Payment Not Verified"`→`{t('payment.error_title')}`, contact-atelier paragraph→`{t('payment.error_body')}`, `"Contact Us"`→`{t('payment.contact')}`, `"Return Home"`→`{t('payment.home')}`.

- [ ] **Step 3: ProductCard quick-add + Checkout label**

In `ProductCard.tsx` replace the literals `'Select Size'`/`'Cancel'`/`Quick Shop` (lines ~137,155) with `t('product.select_size')`, `t('product.cancel')`, `t('product.quick_shop')`. In `Checkout.tsx` line ~466 replace the summary label `"Name"` with `{t('checkout.name_label')}` (`t` already available via `useLanguage` there).

- [ ] **Step 4: Typecheck + manual verify**

Run: `npm run lint`, switch site to Arabic, open checkout summary and trigger the quick-add overlay on a product card.
Expected: no English remnants in those surfaces.

- [ ] **Step 5: Commit**

```bash
git add src/pages/PaymentSuccess.tsx src/components/ProductCard.tsx src/pages/Checkout.tsx src/contexts/LanguageContext.tsx
git commit -m "fix(i18n): route PaymentSuccess, quick-add, checkout label through translations"
```

---

### Task 11: Playwright regression spec — selection → viewing

**Files:**
- Create: `tests/selection-to-viewing.spec.js`

**Interfaces:**
- Consumes: running dev server (Playwright webServer config starts it), routes `/collection/all` (or any listing), `/product/:id`, `/appointment`, `/wishlist`.
- Pattern reference: copy the app-mount wait (`waitForApp`) helper from `tests/helpers.js` if present, else from any existing spec.

- [ ] **Step 1: Write the spec**

```js
import { test, expect } from '@playwright/test';

async function waitForApp(page) {
  await page.goto('/');
  await page.waitForSelector('#root > *', { timeout: 45000 });
}

test.describe('Booking-first conversion', () => {
  test('PDP reserve CTA prefills appointment', async ({ page }) => {
    await waitForApp(page);
    await page.goto('/collection/all');
    await page.waitForSelector('#root > *');
    const card = page.locator('a[href^="/product/"]').first();
    await card.click();
    await expect(page).toHaveURL(/\/product\//);

    const reserve = page.getByRole('button', { name: /reserve a private viewing|احجزي مشاهدة خاصة/i }).first();
    await expect(reserve).toBeVisible();
    await reserve.click();

    await expect(page).toHaveURL(/\/appointment/);
    await expect(page.locator('text=/your selected pieces|قطعك المختارة/i')).toBeVisible();
    await expect(page.locator('textarea, input[name="notes"]').first()).toHaveValue(/interested in:/i);
  });

  test('wishlist request CTA carries all saved gowns', async ({ page }) => {
    await waitForApp(page);
    await page.goto('/collection/all');
    const cards = page.locator('a[href^="/product/"]');
    await cards.nth(0).click();
    const heart = page.getByRole('button', { name: /add to wishlist|أضف/i }).first();
    if (await heart.isVisible()) await heart.click();
    await page.goBack();
    await cards.nth(1).click();
    const heart2 = page.getByRole('button', { name: /add to wishlist|أضف/i }).first();
    if (await heart2.isVisible()) await heart2.click();

    await page.goto('/wishlist');
    const req = page.getByRole('button', { name: /request private viewing|طلب مشاهدة خاصة/i });
    await expect(req).toBeVisible();
    await req.click();
    await expect(page).toHaveURL(/\/appointment/);
    await expect(page.locator('text=/your selected pieces|قطعك المختارة/i')).toBeVisible();
  });

  test('first visit defaults to Arabic RTL', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('riman_lang'));
    await waitForApp(page);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
});
```

Adjust selectors against reality while writing (aria-labels may differ); the assertions above are the contract.

- [ ] **Step 2: Run the new spec**

Run: `npx playwright test tests/selection-to-viewing.spec.js`
Expected: 3 passed (fix selectors/code until green).

- [ ] **Step 3: Full suite**

Run: `npx playwright test`
Expected: all pass including pre-existing suites; repair any click-verification specs broken by the new PDP button order (they may target the first `btn-luxury` button — point them at the bag-secondary button by name `book rental|add to collection`).

- [ ] **Step 4: Commit**

```bash
git add tests/selection-to-viewing.spec.js tests/
git commit -m "test(e2e): selection-to-viewing conversion flow + RTL default"
```

---

### Task 12: Ship — verify, deploy, publish

**Files:** none created; git + Netlify only.

- [ ] **Step 1: Lint + production build**

Run: `npm run lint && npm run build`
Expected: clean; note the emitted `index-*.js` hash.

- [ ] **Step 2: Deploy**

Run: `& "C:\Users\KAIS\AppData\Local\Temp\opencode\netlify-rest-deploy.ps1"`
Expected: `DEPLOY READY: … -> https://riman-fashion-v2.netlify.app`

- [ ] **Step 3: Verify live bundle**

```powershell
$html = Invoke-WebRequest -Uri "https://riman-fashion-v2.netlify.app/?cb=$(Get-Random)" -UseBasicParsing
if ($html.Content -match 'index-<HASH>\.js') { 'LIVE OK' } else { 'STALE' }
```

Expected: `LIVE OK` (replace `<HASH>` with the hash from Step 1).

- [ ] **Step 4: Apply DB migration**

Follow `supabase/DEPLOY_RUNBOOK.md` to run `20260823100000_appointments_interested_gowns.sql` against project `vbuavhnpemnfsuguglqn` (SQL editor or CLI). Verify column exists in Table Editor → appointments.

- [ ] **Step 5: Push**

```bash
git push origin salon-rebrand:main
```

Expected: push accepted.

---

## Self-Review Notes

- Spec coverage: booking-first CTAs (T4), Selection bridge (T5), intake→calendar+email+WhatsApp (T1, T6, T7, T9), From-pricing (T3), Arabic default + leak fixes (T2, T10), nav promotion (T8), tests/rollout (T11, T12). Journal rebuild and typography ramp remain out of scope per spec.
- Deviation documented: RequestViewingPanel implemented as prefilled `/appointment` navigation (Task 4 note) instead of a new modal component — avoids duplicating the validated wizard form.
- Type consistency: `GownRef` defined once (Task 1), consumed identically in Tasks 4/5/6/9; route-state contract `{ gowns: GownRef[] }` shared by Tasks 4/5/11.
