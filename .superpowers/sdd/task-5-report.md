# Task 5 Report: Header restyle + Private Viewing link

## What changed
- **navLinks**: Replaced 6-entry array in `src/components/Header.tsx` — new order: Our Story, Bridal, Evening, Rentals, Contact; "Book Now" replaced by "Private Viewing" (`/appointment`, key `nav.private_viewing`).
- **font-label swap**: Both nav-link className blocks (desktop `slice(0,4)` and right-side `slice(4,7)`) changed from `font-heading text-xs tracking-[0.2em]` → `font-label text-xs tracking-[0.25em]` (2 occurrences).
- **Hover fix**: All `hover:text-sunset` → `hover:text-gold-dark` (2 occurrences).

## Verification
- Grep `text-sunset` across `src/`: **0 occurrences** (dead token fully removed).
- `npx tsc --noEmit`: **PASS** (no errors).
- `npm run build`: **PASS** (built in ~1m10s; only pre-existing chunk-size/dynamic-import warnings).

## Commit
- SHA: `93065d979a3392d55f5c1cad782a0fc30598e0a6`
- Subject: `feat(salon): header nav — Archivo labels, gold-dark hover fix, Private Viewing thread`
- Branch: `salon-rebrand`
- Diff: 1 file changed, 6 insertions(+), 6 deletions(-)

## Notes
- No other files modified. Logo component, mobile nav trigger, scroll behavior untouched.
- Desktop nav split remains `slice(0,4)` / `slice(4,7)` → left: Our Story, Bridal, Evening, Rentals; right: Contact, Private Viewing.
