# Task 6 Report — Salon Homepage Rebuild

## Files changed
- `src/pages/Index.tsx` — fully replaced with five-chapter maison narrative (Arrival, L'Atelier, Les Silhouettes, Le Savoir-Faire + disciplines grid, L'Invitation, InvitationRule thread)
- `src/contexts/LanguageContext.tsx` — no changes needed (verified only)

## i18n keys added count
- 0 added / 20 verified present (10 en + 10 ar): `atelier.heading`, `atelier.quote`, `atelier.body`, `savoir.p1`, `savoir.p2`, `disciplines.bridal`, `disciplines.evening`, `disciplines.rentals`, `invitation.heading`, `invitation.contact_line`
- en block: lines 79–88; ar block: lines 775–784

## Media URLs used for the 3 disciplines (from old Category Tiles)
| Discipline | Media | isVideo |
|---|---|---|
| Bridal | `/assets/rimanfashion_3542687554351211237_227867687_1_2025-01-10.jpg` | false |
| Evening | `/assets/rimanfashion_3638158883472325906_1739454936_2_2025-05-22.jpg` | false |
| Rentals | `/assets/rimanfashion_3306305106777368667_227867687_2024-02-19.mp4` | true (rendered as `<video>`) |

## lint/build result
- `npm run lint` (tsc --noEmit): PASS
- `npm run build` (vite build): PASS (pre-existing chunk-size warnings only)

## Concerns
- This project's React types reject a literal `key` prop on plain-function components (`ScrollRevealProps` / `EditorialPlateProps`). Keys were moved to compliant locations: keyed `<div>` wrapping ScrollReveal in the plates loop; keyed `<Link>` in the disciplines loop. Behavior unchanged.
- Rentals tile previously used `<video>` without preload; new code adds `preload="metadata"` per spec.
- "Discover" label on discipline tiles is hardcoded English (as specified); may want an i18n key later.
- Hero video `/assets/rimanfashion_3panel_split.mp4` assumed present in public assets (not verified).
