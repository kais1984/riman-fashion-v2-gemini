# Riman Fashion — AI Studio E-Commerce App

React + Vite + TypeScript fashion e-commerce site with Supabase backend, Stripe payments, Gemini AI integration, and Tailwind CSS v4 styling. Features include product browsing, cart/wishlist, appointments, rentals, alterations, 3D product viewer, style quiz, multilingual support, and an admin dashboard. Deployed via Docker with Nginx.

## Token Efficiency Rules (MANDATORY)

**You MUST use context-mode tools (`ctx_batch_execute`, `ctx_execute_file`, `ctx_search`, `ctx_fetch_and_index`) as your PRIMARY research method.** Direct tools (`grep`, `read`, `bash`) are FORBIDDEN for data gathering — they dump raw output into context and waste tokens.

- `grep` — ALLOWED only as a quick existence check with `files_with_matches` mode. Never use `content` mode.
- `read` — ALLOWED only when you already KNOW the exact file path and need to EDIT it.
- `bash` — ALLOWED only for git operations, file mutations, and navigation.
- `ctx_batch_execute` — USE THIS for ALL multi-file searches, code analysis, and data gathering.
- `ctx_execute_file` — USE THIS for analyzing file contents (extracts info without loading raw content into context).
- Single-file or single-pattern lookups → `ctx_search` (NOT `grep`).
- Before spawning background agents (explore/librarian), ask: "Can `ctx_batch_execute` do this in one call?" If yes, use that instead.
