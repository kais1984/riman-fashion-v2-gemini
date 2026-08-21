# Task 2 Report: Salon primitives — ChapterLabel + CalligraphicAccent (TDD)

**Branch:** `salon-rebrand`
**Commit:** `9a5105c` — feat(salon): add ChapterLabel and CalligraphicAccent primitives with en/ar keys
**Status:** DONE

## TDD Evidence

### RED (Step 2)

`npx vitest run src/components/salon` — both suites failed as expected, before implementation existed:

```
FAIL  src/components/salon/CalligraphicAccent.test.tsx
Error: Failed to resolve import "./CalligraphicAccent" from "src/components/salon/CalligraphicAccent.test.tsx". Does the file exist?

FAIL  src/components/salon/ChapterLabel.test.tsx
Error: Failed to resolve import "./ChapterLabel" from "src/components/salon/ChapterLabel.test.tsx". Does the file exist?

 Test Files  2 failed (2)
      Tests  no tests
```

### GREEN (Step 5)

After adding i18n keys + implementing both components:

```
 Test Files  2 passed (2)
      Tests  2 passed (2)
   Duration  ~12s
```

Note: plan anticipated "3 tests ... or possibly 2 total" — actual result is 2 total (1 test per file), matching the spec'd test files exactly.

## Files Created / Modified

| File | Action |
|---|---|
| `src/components/salon/ChapterLabel.test.tsx` | created |
| `src/components/salon/CalligraphicAccent.test.tsx` | created |
| `src/components/salon/ChapterLabel.tsx` | created |
| `src/components/salon/CalligraphicAccent.tsx` | created |
| `src/contexts/LanguageContext.tsx` | modified (+10 lines: 3 en keys after en `// Hero`, 3 ar keys after ar `// Hero`) |

## Key Parity Check (Step 6)

Lines containing `'chapter.` in `src/contexts/LanguageContext.tsx`: **6** (exactly 3 en + 3 ar).

- en: lines 69–71 (`chapter.atelier`, `chapter.silhouettes`, `chapter.savoir_faire`)
- ar: lines 748–750 (same three keys)
- Arabic values verified intact in file via read-back (PowerShell console showed `?` due to codepage display only; file is correct UTF-8).

## Verification (Step 7)

- `npm run lint` (tsc --noEmit): PASS
- `npm run build` (vite build): PASS (~1m24s; pre-existing chunk-size/dynamic-import warnings only, unrelated to this change)

## Deviation From Plan (self-review finding)

The plan's test snippets used vitest globals (`describe`, `it`, `expect`) without importing them. The repo's tsconfig does not enable vitest global types, so `tsc --noEmit` failed with TS2582/TS2304 on first lint run. Existing repo tests (e.g. `src/components/luxury/Marquee.test.tsx:1`) all use explicit imports. I followed the repo convention and added `import { describe, it, expect } from 'vitest';` to both new test files. No other changes to the planned test bodies.

## Self-Review Findings

1. **Vitest globals deviation** — resolved as above; tests remain behaviorally identical to the plan.
2. Components match the planned implementations exactly (`font-label`, `font-heading`, `font-arabic-heading`, `text-gold*` utilities from Task 1 tokens).
3. `CalligraphicAccent` is decorative-only: `aria-hidden="true"`, `pointer-events-none`, `select-none` — asserted by its test.
4. `ChapterLabel` renders translated title via `t(titleKey)` inside `LanguageProvider`; test asserts `"L'Atelier"` resolves for `chapter.atelier`.
5. Commit contains only the 4 salon files + LanguageContext.tsx (72 insertions total); `.superpowers/` left untracked intentionally.
