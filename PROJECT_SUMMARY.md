# KhidmatAI — Project Summary

> **What it is:** A React Native (Expo) mobile app where users describe a household service need in plain language (Urdu/English). An AI agent extracts intent, queries a Neon PostgreSQL database of local service providers, and recommends the best matches with cost estimates and safety warnings.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native + Expo Router |
| Styling | NativeWind (Tailwind for RN) |
| Backend | tRPC on Bun/Node HTTP server |
| Database | Neon (PostgreSQL) via Drizzle ORM |
| AI | OpenRouter API (multi-model fallback) |
| Auth | OAuth (Google) via server-side session cookies |

---

## Active Files

### Root Config
| File | Purpose |
|---|---|
| `.env` | All secrets: `DATABASE_URL` (Neon), `BUILT_IN_FORGE_API_KEY` (OpenRouter), OAuth creds |
| `app.config.ts` | Expo app config — bundle ID, plugins, env var injection |
| `drizzle.config.ts` | Drizzle ORM config — points to Neon DB for migrations |
| `tsconfig.json` | TypeScript compiler config |
| `tailwind.config.js` | NativeWind/Tailwind config |
| `babel.config.js` | Babel transforms for Expo |
| `metro.config.js` | Metro bundler config |
| `package.json` | Dependencies and scripts (`npm run dev` starts both app + server) |
| `global.css` | Global CSS entry for NativeWind |

### `app/` — Screens (Expo Router)
| File | Purpose |
|---|---|
| `app/_layout.tsx` | Root layout — sets up tRPC provider, theme, auth guard |
| `app/(tabs)/_layout.tsx` | Bottom tab navigator config |
| `app/(tabs)/index.tsx` | **Main chat screen** — user types request, AI responds |
| `app/(tabs)/settings.tsx` | Settings screen — theme toggle, session info |
| `app/oauth/` | OAuth callback screen (handles redirect from Google login) |

### `server/` — Backend (tRPC API)
| File | Purpose |
|---|---|
| `server/routers.ts` | Merges all routers into the main app router |
| `server/db.ts` | Creates the Drizzle + Neon DB connection (lazy singleton) |
| `server/storage.ts` | File storage abstraction (for future file uploads) |
| `server/routers/booking.ts` | **Core AI router** — `chat` (intent extraction) + `recommend` (provider matching) tRPC procedures |

### `server/_core/` — Server Infrastructure
| File | Purpose |
|---|---|
| `index.ts` | Server entry point — starts HTTP server, mounts tRPC + REST routes |
| `env.ts` | Loads and exports all environment variables (with dotenv override) |
| `llm.ts` | **LLM client** — `invokeLLM()` with OpenRouter multi-model fallback chain |
| `trpc.ts` | tRPC context, router, and procedure definitions |
| `oauth.ts` | Google OAuth flow — login redirect + callback token exchange |
| `cookies.ts` | HTTP cookie helpers for session management |
| `context.ts` | tRPC request context builder (extracts session from cookie) |
| `sdk.ts` | Client SDK auto-generated helpers |
| `dataApi.ts` | Generic data API endpoint handler |
| `systemRouter.ts` | System-level tRPC routes (health check, ping) |
| `heartbeat.ts` | Keep-alive / health monitoring |
| `storageProxy.ts` | Proxies storage requests |
| `notification.ts` | Push notification helpers (not yet wired to UI) |
| `imageGeneration.ts` | Image generation via AI (not yet wired to UI) |
| `voiceTranscription.ts` | Voice-to-text transcription (not yet wired to UI) |

### `drizzle/` — Database
| File | Purpose |
|---|---|
| `schema.ts` | **DB schema** — `conversations`, `bookings`, `providers` tables |
| `relations.ts` | Drizzle relation definitions |
| `migrations/` | Auto-generated SQL migration files |
| `0000_tense_lady_deathstrike.sql` | Initial schema migration (full schema) |
| `0000_elite_eternals.sql` | Older/duplicate migration (superseded) |

### `components/` — UI Components
| File | Purpose |
|---|---|
| `chat-bubble.tsx` | Single chat message bubble (user or AI) |
| `thinking-bubble.tsx` | Animated "AI is thinking..." indicator |
| `input-bar.tsx` | Text input + send button at bottom of chat |
| `provider-card.tsx` | Card displaying a recommended service provider |
| `booking-card.tsx` | Card showing a confirmed/past booking |
| `screen-container.tsx` | Standard screen wrapper with safe area + scroll |
| `themed-view.tsx` | View that respects light/dark theme |

### `lib/` — Client-side Utilities
| File | Purpose |
|---|---|
| `lib/trpc.ts` | tRPC client setup for the mobile app |
| `lib/theme-provider.tsx` | Light/dark theme context provider |
| `lib/utils.ts` | General utility functions |
| `lib/services/booking-api.ts` | Client-side service layer wrapping all tRPC booking calls |

### `hooks/` — React Hooks
| File | Purpose |
|---|---|
| `use-auth.ts` | Auth state hook — reads session, triggers login/logout |
| `use-colors.ts` | Returns current theme color palette |
| `use-color-scheme.ts` | Detects system light/dark mode (native) |
| `use-color-scheme.web.ts` | Same, but for web/Expo Go |

### `server/utils/`
| File | Purpose |
|---|---|
| `distance.ts` | Haversine formula — calculates km between two GPS coordinates for provider proximity sorting |

### `scripts/` — Dev Tools
| File | Purpose |
|---|---|
| `seed.ts` | Seeds the Neon DB with mock service providers (run once) |
| `seed-providers.sql` | Raw SQL version of the seed data |
| `load-env.js` | Helper to load `.env` before running scripts |

---

## ⚠️ Unused / Dead Files

| File | Reason |
|---|---|
| `test_insert.ts` | One-off test script, not part of any flow |
| `drizzle/0000_elite_eternals.sql` | Older duplicate migration, superseded by `0000_tense_lady_deathstrike.sql` |
| `components/external-link.tsx` | Expo template leftover, not used in any screen |
| `components/hello-wave.tsx` | Expo template leftover, not used |
| `components/haptic-tab.tsx` | Expo template leftover, not used |
| `components/parallax-scroll-view.tsx` | Expo template leftover, not used |
| `references/` | Design reference images only, not code |
| `app/dev/` | Dev-only debug screens, not in production nav |
| `template.json` | Expo template metadata, not used at runtime |
| `README.md` (server) | Auto-generated Manus template docs, project-specific docs are in root |
| `README_MOBILE_APP.md` | Duplicate of README content |
| `SETUP_GUIDE.md` | Outdated (references Supabase, now on Neon) |
| `design.md` | Design notes, not code |
| `todo.md` | Task notes, not code |
| `scripts/generate_qr.mjs` | Utility to generate a QR code, standalone helper |
| `scripts/reset-project.js` | Expo template reset script, destructive — keep but don't run |

---

## AI Fallback Chain (OpenRouter)

```
1. meta-llama/llama-3.3-70b-instruct:free
2. google/gemma-4-31b-it:free
3. qwen/qwen3-coder:free
4. z-ai/glm-4.5-air:free
```

If all fail → error is surfaced to the user.
