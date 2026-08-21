# Task 1: Design tokens & typography foundation

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Produces: Tailwind utilities `font-heading` (Fraunces), `font-editorial`/`font-body` (Newsreader), `font-label` (Archivo), `font-arabic-heading` (Amiri), color class `bg-champagne`/`text-champagne` etc., `.btn-luxury` (restyled). All later tasks consume these.

- [ ] **Step 1: Check shimmer/float usage outside the homepage**

Search for `animate-shimmer|animate-float` in `src`, excluding `src/pages/Index.tsx`.
- If **no matches**: proceed to Step 2 (tokens stay removed).
- If **matches exist**: after Step 2, re-add to `@theme` the four lines below (and keep using them elsewhere; do not delete their keyframes):

```css
  --animate-float: float 6s ease-in-out infinite;
  --animate-shimmer: shimmer 3s infinite linear;
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
  @keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
```

- [ ] **Step 2: Replace the font import (line 1)**

Replace the entire line 1 `@import url(...)` with:

```css
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Archivo:wght@300;400;500&family=Cairo:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..600&display=swap');
```

- [ ] **Step 3: Replace the `@theme` block (lines 4–42)**

Replace wholesale with:

```css
@theme {
  --font-heading: "Fraunces", serif;
  --font-editorial: "Newsreader", serif;
  --font-body: "Newsreader", serif;
  --font-label: "Archivo", sans-serif;
  --font-arabic: "Cairo", "IBM Plex Sans Arabic", sans-serif;
  --font-arabic-heading: "Amiri", serif;
  --font-jewelry: "Fraunces", serif;

  --color-gold: #A2492B;
  --color-gold-light: #C45A3C;
  --color-gold-dark: #7A3520;
  --color-onyx: #161513;
  --color-bone: #EFEAE2;
  --color-ivory: var(--color-bone);
  --color-champagne: #F6F0E6;
  --color-pearl: #E8E3D9;
  --color-jewelry: linear-gradient(45deg, #7A3520 0%, #A2492B 45%, #C45A3C 50%, #A2492B 55%, #7A3520 100%);

  --animate-fade-up: fade-up 0.8s ease-out forwards;
  --animate-fade-in: fade-in 1s ease-out forwards;

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
```

(Leave the marquee keyframes block at lines ~225–241 untouched — the `Marquee` component still exists.)

- [ ] **Step 4: Rewrite `.btn-luxury` (lines ~137–141)**

Replace the whole rule with:

```css
.btn-luxury {
  @apply inline-flex items-center justify-center px-10 py-5 font-label text-xs tracking-[0.25em] uppercase transition-colors duration-700 bg-onyx text-bone hover:text-gold;
}
```

- [ ] **Step 5: Append RTL heading font + reduced-motion guard at end of file**

```css
/* Arabic display type takes over headings under RTL */
[dir="rtl"] h1, [dir="rtl"] h2, [dir="rtl"] h3 {
  font-family: var(--font-arabic-heading);
  letter-spacing: normal;
}

/* Respect reduced motion globally */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 6: Verify**

Run: `npm run lint && npm run build`
Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add src/index.css
git commit -m "feat(salon): swap type system to Fraunces/Archivo/Newsreader/Amiri, add champagne token, ivory alias, reduced-motion guard"
```
