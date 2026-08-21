# Task 3 Report — InvitationRule

- **Status:** DONE
- **Commit:** `14d3bcd` feat(salon): add InvitationRule booking-thread component with en/ar keys (branch: salon-rebrand)
- **Tests:** 3 files / 3 tests passed (`npx vitest run src/components/salon`) — includes InvitationRule.test.tsx
- **Lint:** PASS (`tsc --noEmit`)
- **Build:** PASS (`vite build`, 3330 modules)

## Changes
- `src/components/salon/InvitationRule.tsx` — created (gold rule + invitation line + CTA link to `/appointment`)
- `src/components/salon/InvitationRule.test.tsx` — committed (already had vitest imports; step D not needed)
- `src/contexts/LanguageContext.tsx` — added `invitation.line`, `invitation.cta`, `nav.private_viewing` keys to both `en` and `ar` locales
