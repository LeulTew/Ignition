# GOAL_BREAKER.EXE Black-Box QA Checklist

Use this matrix to run page-level, modal-level, and API-level verification without diving into code. Execute on desktop (>=1280px) and mobile (≤430px) breakpoints.

## Frontend (Next.js)

| Area / Screen | Scenario | Steps | Expected Outcome |
| --- | --- | --- | --- |
| Landing cockpit | Load page | Open `/` with clear cache | Hero locks to center, dot-grid visible, language/theme toggles anchored upper-right |
| Goal input module | Typing feedback | Enter 20+ chars, observe CTA | Typing click audible (if sound on), button enables only when trimmed text present |
| Goal processing | Progress feedback | Submit valid goal | Progress bar fills, low hum plays, CTA disabled until response |
| Results panel | Step rendering | Submit valid goal | Five cards animate in sequence, complexity badge shows `n/10` |
| Tactical subroutine drawer | Expand step | Tap any step > drawer opens | Spinner shows, then three substeps appear, subroutine ping plays |
| History desktop | Scroll + delete | Scroll list and delete entry | List scrollbars styled square, delete removes card without reload |
| History mobile drawer | Expand/collapse | Tap History toggle | Drawer slides up, internal scroll stable, toggle label updates ▲/▼ |
| Sound toggle (desktop) | Mute/unmute | Click Global Context pill | Status text updates, future sounds suppressed/enabled |
| Sound toggle (mobile) | Overlay clearance | On mobile, verify fixed footer | Toggle card hovers above safe-area, drawer button remains visible |
| Contact footer | Social buttons | Tap Telegram/LinkedIn | Opens new tab, icons sized 36px mobile / 40px desktop, button focus ring visible |
| Localization toggle | Switch Amharic | Tap language toggle, submit goal | Labels and generated steps shift to Amharic (Dark Technical tone preserved) |
| Theme toggle | Light/dark | Switch theme | Background + cards invert, no layout shift |

### Modals / Overlays

| Modal / Drawer | Scenario | Steps | Expected |
| --- | --- | --- | --- |
| History drawer (mobile) | Swipe resilience | Open drawer, swipe content end-to-end | Drawer height capped, footer toggle remains accessible |
| Subroutine expansion | Multiple opens | Expand 3 steps sequentially | Each fetch runs independently, previously fetched substeps cached |

## Backend (FastAPI)

| Endpoint | Scenario | Steps | Expected Response |
| --- | --- | --- | --- |
| `GET /` | Health | Curl base URL | `{"status":"System Online","latency":"12ms"}` |
| `POST /breakdown` | Valid goal | Send `{goal:"Launch MVP",language:"en"}` | 200 + JSON with 5 steps array + `complexity` int |
| `POST /breakdown` guardrail | Gibberish input | Send repeated emoji string | 200 + fallback plan steps (noise warning) + `complexity:1` |
| `POST /breakdown` abuse | Send insult | 200 + escalation plan, no AI call executed |
| `POST /breakdown` Amharic | `language:"am"` | Steps returned in Amharic |
| `POST /sub-breakdown` | Retrieve substeps | Send `{step:"Audit stack",language:"en"}` | JSON `{substeps:[...3 entries...]}` |
| `POST /sub-breakdown` offline | Simulate no API key | Unset `GEMINI_API_KEY`, hit endpoint | Deterministic offline substeps returned |

_Note: Run `./venv/bin/python -m pytest` (backend) and `pnpm lint && pnpm build` (frontend) before each release candidate._
