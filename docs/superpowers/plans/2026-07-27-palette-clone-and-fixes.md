# Palette Clone + UI Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply site-wide palette clone (bone/ink/rust), hide native cursor on desktop, remove hero RIMAN outline collision, and redesign product card hover overlay.

**Architecture:** CSS-first palette swap via Tailwind `@theme` variables + hardcoded class replacements across ~50 files. Cursor hidden via scoped media query. Hero outline removed from `Index.tsx`. ProductCard hover redesigned with motion.

**Tech Stack:** React 19, Tailwind CSS v4, motion/react, TypeScript

## Global Constraints
- Existing tests must continue to pass (`npm test` = Vitest)
- TypeScript must compile clean (`tsc --noEmit`)
- Build must succeed (`npm run build`)
- RTL (Arabic) must still work — cursor:none only on `(hover:hover) and (pointer:fine)`
- `prefers-reduced-motion: reduce` must still disable animations

## Color Mapping

| Current Token | New Value | Semantic Role |
|---|---|---|
| `--color-gold: #D4AF37` | `--color-gold: #A2492B` (rust) | Accent / CTA |
| `--color-gold-light: #F9E27E` | `--color-gold-light: #C45A3C` (lighter rust) | Hover accent |
| `--color-gold-dark: #A67C00` | `--color-gold-dark: #7A3520` (dark rust) | Dark accent |
| `--color-onyx: #0A0A0A` | `--color-onyx: #161513` (ink) | Dark backgrounds |
| `--color-bone: #FDFBF7` | `--color-bone: #EFEAE2` (warm bone) | Secondary light bg |
| `--color-ivory: #FFFDF9` | `--color-ivory: #EFEAE2` (same as bone) | Primary light bg |

---

### Task 1: Hide native cursor on desktop

**Files:**
- Modify: `src/index.css:44-63` (add cursor:none rule in `@layer base`)

**Interfaces:**
- Consumes: `customCursor` feature flag (already exists in `useFeature.ts`)
- Produces: Site-wide cursor:none on desktop, scoped to `(hover:hover) and (pointer:fine)`

- [ ] **Step 1: Add cursor:none CSS rule**

In `src/index.css`, inside the `@layer base` block (after line 63), add:

```css
/* Hide native cursor when custom cursor is active (desktop only) */
@media (hover: hover) and (pointer: fine) {
  html.custom-cursor-active {
    cursor: none !important;
  }
  html.custom-cursor-active *,
  html.custom-cursor-active *::before,
  html.custom-cursor-active *::after {
    cursor: none !important;
  }
}
```

- [ ] **Step 2: Toggle class in ImmersiveUI.tsx**

In `src/components/ImmersiveUI.tsx`, add a `useEffect` that toggles `custom-cursor-active` on `<html>`:

After line 89 (end of mouse tracking useEffect), add:

```tsx
// Toggle custom cursor class on <html>
useEffect(() => {
  const html = document.documentElement;
  if (customCursorEnabled && !prefersReducedMotion) {
    html.classList.add('custom-cursor-active');
    return () => html.classList.remove('custom-cursor-active');
  }
  html.classList.remove('custom-cursor-active');
}, [customCursorEnabled, prefersReducedMotion]);
```

- [ ] **Step 3: Run tests**

Run: `npm test` — all 50 tests should pass

- [ ] **Step 4: Commit**

```bash
git add src/index.css src/components/ImmersiveUI.tsx
git commit -m "feat: hide native cursor on desktop when custom cursor enabled"
```

---

### Task 2: Remove hero RIMAN outline layers

**Files:**
- Modify: `src/pages/Index.tsx:137-176` (remove both RIMAN giant text layers)

**Interfaces:**
- Consumes: nothing
- Produces: Cleaner hero with "REVERIE & ESSENCE" no longer colliding with RIMAN outline

- [ ] **Step 1: Remove both giant RIMAN typography divs**

In `src/pages/Index.tsx`, remove lines 137–176 (both the fill layer and the gold outline layer):

Delete these blocks entirely:
- Lines 137-156: "Giant RIMAN typography — couture backdrop (fill layer)"
- Lines 157-176: "Giant RIMAN typography — gold outline layer"

Also remove the now-unused `giantY` motion value and `heroScroll` if no other element uses them. Check: `giantY` is only used by these two divs. `heroScroll` feeds `giantY`. Remove:

Delete lines 95-101:
```tsx
// Hero scroll parallax — giant typography drifts up, video drifts down
const heroRef = useRef<HTMLElement>(null);
const { scrollYProgress: heroScroll } = useScroll({
  target: heroRef,
  offset: ['start start', 'end start'],
});
const giantY = useTransform(heroScroll, [0, 1], ['0%', '-22%']);
```

But keep `heroRef` since it's used by the `<section ref={heroRef}>` on line 115. Wait — check: is `heroRef` used elsewhere? It's only used for `heroScroll` which feeds `giantY`. So we can keep `heroRef` on the section for future use but remove the scroll parallax. Actually, if we remove both giant layers, `heroRef` and `heroScroll` and `giantY` are all dead code. Remove them all.

Also: `videoY` is used on the video container at line 117. Keep `videoY` but we need `heroScroll` for it... no, `videoY` uses its own scroll. Let me re-check: `videoY` is defined at line 102 using `heroScroll`. So we need `heroScroll` and `heroRef` for the video parallax. Keep them. Only remove `giantY` and both giant RIMAN divs.

So the changes are:
1. Delete `const giantY = useTransform(heroScroll, [0, 1], ['0%', '-22%']);` (line 101)
2. Delete the two `<motion.div>` blocks for giant RIMAN (lines 137-176)
3. Keep `heroRef`, `heroScroll`, `videoY`

- [ ] **Step 2: Run tests and build**

Run: `npm test && npx tsc --noEmit && npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/pages/Index.tsx
git commit -m "feat: remove hero RIMAN outline layers to fix collision with REVERIE & ESSENCE"
```

---

### Task 3: Palette clone — CSS variables + body background

**Files:**
- Modify: `src/index.css:4-19` (@theme color tokens), `src/index.css:51` (body bg), `src/index.css:126-133` (btn-luxury), `src/index.css:131-133` (btn-luxury-outline), `src/index.css:150-151` (heading-editorial), `src/index.css:157-159` (divider-gold), `src/index.css:182` (shimmer fallback gradient)

**Interfaces:**
- Consumes: nothing
- Produces: New color tokens that all downstream components inherit

- [ ] **Step 1: Update @theme color tokens**

In `src/index.css`, replace the `--color-*` block (lines 12-19):

```css
  --color-gold: #A2492B;
  --color-gold-light: #C45A3C;
  --color-gold-dark: #7A3520;
  --color-onyx: #161513;
  --color-bone: #EFEAE2;
  --color-ivory: #EFEAE2;
  --color-pearl: #E8E3D9;
  --color-jewelry: linear-gradient(45deg, #7A3520 0%, #A2492B 45%, #C45A3C 50%, #A2492B 55%, #7A3520 100%);
```

- [ ] **Step 2: Update body background**

Line 51 — body already uses `bg-ivory` which maps to `--color-ivory`. Since we changed `--color-ivory` to `#EFEAE2`, this auto-updates. No change needed.

- [ ] **Step 3: Update btn-luxury gradient**

Line 127 — update the hardcoded gradient:
```css
background: linear-gradient(135deg, #161513 0%, #252320 100%);
```

- [ ] **Step 4: Update btn-luxury box-shadow**

Line 128 — update shadow color:
```css
box-shadow: 0 4px 20px rgba(162, 73, 43, 0.1);
```

- [ ] **Step 5: Update shimmer fallback gradient**

Line 182 — update the reduced-motion shimmer fallback:
```css
background: linear-gradient(135deg, #7A3520, #A2492B) !important;
```

- [ ] **Step 6: Run tests**

Run: `npm test && npx tsc --noEmit`

- [ ] **Step 7: Commit**

```bash
git add src/index.css
git commit -m "feat: update CSS theme tokens to bone/ink/rust palette"
```

---

### Task 4: Palette clone — Header + Footer

**Files:**
- Modify: `src/components/Header.tsx` (many `text-gold`, `bg-gold`, `bg-ivory`, `hover:text-gold`, `hover:bg-gold` classes)
- Modify: `src/components/Footer.tsx` (same classes)

**Interfaces:**
- Consumes: new CSS tokens from Task 3
- Produces: Updated Header/Footer with rust accents

**Note:** Since the Tailwind tokens `gold`, `onyx`, `ivory`, `bone` still exist (just with new hex values), most class names DON'T need to change. Only **hardcoded hex values** and **inline styles** need manual replacement. The Tailwind utility classes like `text-gold`, `bg-onyx`, `bg-ivory` will automatically use the new colors.

The only hardcoded references to check are:
- `#0A0A0A` or `rgba(212,175,55,...)` in inline styles
- `gold` vs `rust` naming (keep class names as `gold` — they're just token names now)

Let me verify: grep for any inline hex references in Header and Footer.

- [ ] **Step 1: Verify no hardcoded hex in Header.tsx**

Run grep for hex patterns in Header.tsx. The Header uses only Tailwind classes (`text-gold`, `bg-gold`, `bg-onyx`, `bg-ivory`) — no hardcoded hex. No changes needed.

- [ ] **Step 2: Verify no hardcoded hex in Footer.tsx**

Same check. Footer uses only Tailwind classes. No changes needed.

- [ ] **Step 3: Run build to verify token propagation**

Run: `npm run build` — verify no errors and visual changes propagate

- [ ] **Step 4: Commit (no-op if no changes)**

If Header/Footer had no hardcoded hex, skip commit and move to Task 5.

---

### Task 5: Palette clone — ImmersiveUI (preloader, cursor, progress bar)

**Files:**
- Modify: `src/components/ImmersiveUI.tsx`

**Interfaces:**
- Consumes: new CSS tokens from Task 3
- Produces: Preloader and cursor use new ink background, rust accents

**Note:** ImmersiveUI uses Tailwind classes like `bg-onyx`, `text-ivory`, `text-gold/60`, `bg-gold`, `border-gold/60`. These all auto-update via the new tokens. Check for hardcoded hex.

- [ ] **Step 1: Check for hardcoded hex in ImmersiveUI.tsx**

The file uses only Tailwind utility classes. No hardcoded hex found. No changes needed.

- [ ] **Step 2: Skip commit (no changes)**

---

### Task 6: Palette clone — ProductCard

**Files:**
- Modify: `src/components/ProductCard.tsx`

**Interfaces:**
- Consumes: new CSS tokens from Task 3
- Produces: ProductCard badges and hover use new colors

**Note:** ProductCard uses Tailwind classes (`bg-gold`, `text-gold`, `bg-onyx`, `bg-ivory`). No hardcoded hex. Auto-updates.

- [ ] **Step 1: Skip (auto-updates via tokens)**

---

### Task 7: Palette clone — all other components

**Files:**
- Modify: All `.tsx` files under `src/components/` and `src/pages/` that use `bg-gold`, `text-gold`, `bg-onyx`, `bg-ivory`, `bg-bone`, `text-onyx`, `text-ivory`, `text-bone`, `border-gold`

**Interfaces:**
- Consumes: new CSS tokens from Task 3
- Produces: Entire site uses new palette

**Note:** Since all these files use Tailwind utility classes that reference the `@theme` tokens, and we've already updated the tokens in Task 3, **all of these files auto-update with zero code changes**. The Tailwind classes `bg-gold`, `text-gold`, `bg-onyx`, `bg-ivory`, `bg-bone` etc. all resolve to the new hex values automatically.

- [ ] **Step 1: Verify no hardcoded hex in any component/page**

Run a search for `#D4AF37`, `#A67C00`, `#F9E27E`, `#0A0A0A`, `#FFFDF9`, `#FDFBF7`, `rgba(212,175,55` across all `.tsx` files.

Found in `src/index.css:127` (btn-luxury gradient — fixed in Task 3).
Found in `src/index.css:182` (shimmer fallback — fixed in Task 3).

Any other occurrences need to be updated.

- [ ] **Step 2: Fix any remaining hardcoded hex references**

Replace all found hex values with new palette equivalents.

- [ ] **Step 3: Run full test suite**

Run: `npm test && npx tsc --noEmit && npm run build`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: palette clone complete — bone/ink/rust site-wide"
```

---

### Task 8: Redesign ProductCard hover overlay

**Files:**
- Modify: `src/components/ProductCard.tsx:139-211` (quick actions overlay)

**Interfaces:**
- Consumes: existing `handleQuickAdd`, `toggleWishlist`, `showSizes`, `setShowSizes`, `handleSizeSelect`, `isAdded`, `saved`, `hasSizes` from ProductCard
- Produces: Slim slide-up bar on hover instead of chunky full-height overlay

- [ ] **Step 1: Replace the hover overlay with a slim slide-up bar**

Replace the "Quick Actions Overlay" div (lines 140-211) with a slim bottom-anchored bar:

```tsx
        {/* Quick Actions — slim slide-up bar on hover */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 z-10 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
          showMobileActions
            ? "translate-y-0 opacity-100"
            : "translate-y-full md:translate-y-full md:group-hover:translate-y-0 md:opacity-0 md:group-hover:opacity-100"
        )}>
          {/* Inline size selector */}
          {showSizes && hasSizes && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-ivory/95 backdrop-blur-sm p-3 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] tracking-[0.2em] uppercase text-stone-500 font-bold">Select Size</span>
                <button onClick={cancelSizeSelection} className="text-stone-400 hover:text-stone-800 transition-colors">
                  <span className="text-[9px] tracking-widest uppercase">Cancel</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => handleSizeSelect(size, e)}
                    className={cn(
                      "min-w-[2.5rem] h-9 px-2 flex items-center justify-center border text-[10px] tracking-wider transition-all",
                      selectedSize === size
                        ? "border-gold bg-gold text-white"
                        : "border-stone-300 text-stone-600 hover:border-gold hover:text-gold"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Slim bar with two actions */}
          <div className="flex bg-onyx/95 backdrop-blur-sm border-t border-gold/20">
            <button
              onClick={handleQuickAdd}
              className={cn(
                "flex-1 py-3 text-[10px] tracking-[0.2em] uppercase font-body transition-all duration-300 flex items-center justify-center gap-1.5",
                isAdded
                  ? "text-emerald-400"
                  : "text-white hover:text-gold"
              )}
            >
              {isAdded ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('product.added')}
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {t('product.quick_add')}
                </>
              )}
            </button>
            <div className="w-px bg-white/10" />
            <button
              onClick={toggleWishlist}
              className={cn(
                "flex-1 py-3 text-[10px] tracking-[0.2em] uppercase font-body transition-colors duration-300 flex items-center justify-center gap-1.5",
                saved
                  ? "text-rose-400"
                  : "text-white/70 hover:text-rose-400"
              )}
            >
              <Heart className={cn("w-3.5 h-3.5", saved && "fill-current")} />
              {saved ? t('product.in_wishlist') : t('product.add_wishlist')}
            </button>
          </div>
        </div>
```

Key changes from old overlay:
- **Removed** `bg-onyx/5` semi-transparent overlay that covered the entire image
- **Removed** `pointer-events-none` wrapper — the bar itself handles pointer events
- **Added** `translate-y-full` default state + `group-hover:translate-y-0` for slide-up
- **Changed** from two stacked buttons to a slim side-by-side bar
- **Changed** from opaque `bg-gold`/`bg-stone-800` button backgrounds to transparent text-only actions
- **Kept** the size selector working identically

- [ ] **Step 2: Remove the old Quick Actions Overlay wrapper**

The old code had a wrapping div with `pointer-events-none` and complex opacity transitions. The new code replaces all of that.

Also remove the old wrapper's border styling (line 141: `"absolute inset-0 z-10 flex flex-col items-center justify-end pb-16 px-4 gap-2 border pointer-events-none..."`).

- [ ] **Step 3: Run tests**

Run: `npm test && npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/components/ProductCard.tsx
git commit -m "feat: redesign ProductCard hover to slim slide-up bar"
```

---

### Task 9: Final verification

- [ ] **Step 1: Run full test suite**

Run: `npm test` — expect 50/50 pass

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit` — expect clean

- [ ] **Step 3: Build**

Run: `npm run build` — expect success

- [ ] **Step 4: Take screenshots**

Take screenshots of: homepage hero, product cards hover, header, footer, preloader (clear sessionStorage first)

- [ ] **Step 5: Push**

```bash
git push
```

---

## Self-Review Checklist

1. **Spec coverage:** ✅ All 4 user requests addressed (cursor, hero outline, palette, product card)
2. **Placeholder scan:** ✅ All steps have concrete code and commands
3. **Type consistency:** ✅ No new types introduced; existing types unchanged
4. **Token mapping verified:** ✅ `gold` → rust, `onyx` → ink, `ivory`/`bone` → warm bone
