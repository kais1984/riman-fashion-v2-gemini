# Salon Rebrand — SDD Progress Ledger
Branch: salon-rebrand
Plan: docs/superpowers/plans/2026-08-21-riman-salon-rebrand.md
Baseline: 50 tests passing @ 40aa7fe

Task 1: complete (40aa7fe..fae6abf, spec ✅, code quality Approved, motion-band note deferred to final review)
Task 2: complete (fae6abf..9a5105c, 4 files created, TDD RED→GREEN, 6 chapter keys en+ar, manual review PASS)
Task 3: complete (9a5105c..14d3bcd, InvitationRule, 3 tests passing, lint+build clean)
Task 4: complete (14d3bcd..3239084, EditorialPlate, 5 tests green, lint+build clean)
Task 5: complete (3239084..93065d9, Header restyle, text-sunset=0, lint+build clean)
Task 6: complete (93065d9..90306f4, homepage rewrite, 20 i18n keys, video adaptation, lint+build clean)
Task 7: complete (90306f4..7bac73d, ProductCard plate, lint+build clean, touch-hover concern flagged)
Task 8: complete (7bac73d..9fb50fb, AppointmentPage+Footer, lint+build clean, padding concern noted)
Task 9: complete (9fb50fb..d85e47e, 55/55 tests, lint+build clean, dead-class sweep clear)

ALL IMPLEMENTATION TASKS COMPLETE — FINAL REVIEW NEXT

# Booking-First Conversion - SDD Progress Ledger
Plan: docs/superpowers/plans/2026-08-23-booking-first-conversion.md
Baseline: b664b48
BF Task 1: complete (b664b48..f393d42, review clean)
BF Task 2: complete (f393d42..74955a9, review clean; minors: EN AM/PM slots in appt page, dup locale ternary)
BF Task 3: complete (74955a9..517a5ee, review clean; minors: note always renders, rental_period key unconsumed)
BF Task 4: complete (517a5ee..0d594de, lint clean; adaptations: merged GownRef import, compact mobile-bar sizing)
BF Task 4: complete (517a5ee..0d594de, review clean; minor: mobile sticky bar ~30px taller, pb-24 may need bump — check in T11)
BF Task 5: complete (0d594de..cf638ab, review clean; minors: dup CTA mapping x2, redundant cast)
BF Task 6: complete (cf638ab..1fe6a2d, review clean; minors: unescaped HTML interpolation house-wide (escapeHtml helper future), EOF newline)
BF Task 7: complete (1fe6a2d..820b234, review clean; minors: AR copy says follow-us vs continue, spacing above button, raw date in wa message)
BF Task 8: complete (820b234..c2549ee, review clean; minors: badge a11y parity w/ cart, mobile badge physical RTL positioning pre-existing)
BF Task 9: complete (c2549ee..8b869a3, review clean; select('*') confirmed; basis-full adaptation approved)
BF Task 10: complete (8b869a3..fa04689, review clean; minors: product.close follow-up for 'Close' literal + aria-labels, PaymentSuccess EOF newline pre-existing)
BF Task 11: complete (fa04689..0e0ea58, 73/73 green; minors: hardcoded EN placeholders in PDP test, silent-skip hearts backstop, waitForApp duplicate)
BF Task 12: PARTIAL - lint+build clean (index-DNQINdQg.js), deployed 6a8af36c, LIVE OK. BLOCKED: migration NOT applied - prod DB confirmed missing appointments.interested_gowns (42703 via REST check); no supabase access token on machine. Push held per brief order.

## Perfect-Polish Pass (plan 0cb0675, spec 6cd8e66)
Baseline: 0cb0675
PP Task 1: complete (0cb0675..39a7927, review clean; minors: blank-line offset cosmetic, no line-height companion token)
PP Task 2: complete (39a7927..c8ecb22, review clean; minors: stale 'Journal' word in click-verification.spec.js:172 section comment, report key-count typo)
PP Task 3: complete (c8ecb22..85250dd + fix c6204e8, re-review approved; minors: report count inaccuracies)
PP Task 4: complete (c6204e8..5cba22d, review clean; minors: SearchPage indent drift, ProductDetail EOF newline, report tally nit)
PP Task 5: complete (5cba22d..f80b93e, review clean; minors: 2 hover-state lifts beyond table (justified), text-[7px] in AdminProducts upload placeholder violates 11px-floor spirit - final review triage)
PP Task 6: complete (f80b93e..d409a50, review clean; minors: frontmatter label 11px vs buttons 12px inconsistency inherited from brief)
PP Task 7: PARTIAL - lint+build clean (index-CwHTfC6O.js), extinction zero, Playwright 72/72 (fixed suite-load flake 269d2ba), deployed 6a8b2051 LIVE OK. BLOCKED on push: appointments.interested_gowns still missing in prod (42703) - user SQL not yet applied.
PP final whole-branch review: Ready with conditions. Must-fix text-[7px] fixed (9438d60). Push still BLOCKED: column missing as of re-check. Redeploy needed at push time to include 9438d60.
PP Task 7: COMPLETE - column verified (COLUMN OK), redeployed 6a8b2b81 (index-BBCwwDZc.js) LIVE OK, pushed e04ee4d..9438d60 salon-rebrand->main. Both waves (booking-first + perfect-polish) shipped.

# Rental Calendar A11y (plan 2026-08-24-rental-calendar-a11y)
Baseline: 6e80aca (checkpoint commit of pending audit edits)
RC Task 1: complete (6e80aca..28cbfdd, review clean; minors: implicit weekStartsOn, matrix padding unasserted, inclusive horizon note)
RC Task 2: complete (28cbfdd..db81650, review clean; minors: UTF-8 packaging of future review packages)
RC Task 3: complete (db81650..bfb635c + fix 6502e60, re-review approved; minors: summary-line test title overpromises, selectedRef clearing untested, no Home/End-arrow tests, out-of-month ', available' label, load() refires on language toggle)
RC Task 4: complete (6502e60..6e9269d, review approved; follow-up: booking-aware e2e seed picker [Important-inherited]; minors: revealSeed loop race guard, hardcoded localized nav names in setup locator)
RC Task 5: complete - lint clean, vitest 25f/119t green, rental e2e 4/4, browser sweep 11/11 en+ar zero console errors
RC final whole-branch review: With fixes -> fix commit 46540b1 (failure announcement, columnheaders in-grid, selection-clear test) -> re-review READY TO MERGE. Follow-ups parked in ledger minors: booking-aware e2e seed, Home/End tests, load() refire on locale toggle, useId headingId, inclusive-horizon naming, manual NVDA/VoiceOver spot check pending.

# Arabic Strings Cleanup (plan 2026-08-25)
Baseline: 444b416
AR Task 1: complete (46540b1..927956f, review clean; minors: plan comment-wording tension, empty-string-falls-through idiom note)
AR Task 2: complete (927956f..0e87210 + calendar-test hotfix 246cf89 [year-substring flake], review clean; follow-up glossary pass: A-Line/ablayer/lame renderings)
AR Task 3: complete (246cf89..851b9ab, review clean; minors: disclosed whitespace lint fix, hotfix attribution confirmed)
AR Task 4: complete (851b9ab..a64b023 after honest-amend remediation, re-review approved; commit carries audit-session edits for App/ProductCard/Checkout/WishlistPage - disclosed in message body; follow-ups: degenerate ternary WishlistPage empty_desc, stale report hash refs)
AR Task 5: complete - lint/vitest 27f-126t/e2e 4-4/sweep PASS (checkout seeded, trust box ar OK, 0 console errors)
AR final whole-branch review: With fixes -> e9ae9fe (safe language default fixes crash-path white-screen [Critical], Intl dates on ProductCard availability, wishlist nits) -> controller-verified scope+content. READY. Follow-ups backlog: testimonial roles, MaintenanceGate/auth literals, garbled legacy ar strings (quiz.q2_opt4, faq.*), locale-less toLocaleDateString in checkout rows, vocab glossary pass
