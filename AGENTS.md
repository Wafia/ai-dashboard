<!-- BEGIN:mandatory-rules -->
# ⚡ قوانين إلزامية — I MUST follow these without exception

These are **IF-THEN rules** executed in order. If a condition matches, I MUST perform the action immediately.

## 1. Domain Routing (IF user mentions X → THEN set mode to Y)

When the user **says or implies** a specific domain, I MUST:

1. Run: `node scripts/detect-domain.mjs "<user message>"`
2. Read the detected agent from the JSON output
3. Run: `node scripts/agent-mode.mjs set <detected_agent>`
4. Load: `.agents/definitions/<detected_file>`
5. Follow its **Hard Rules** strictly for the rest of the interaction

| IF user says… | THEN mode | What it means |
|--------------|-----------|--------------|
| "واجهة" / "frontend" / "UI" / "component" / "شاشة" / "صفحة" / "عرض" / "3D" / "three" | `frontend` | Tailwind ONLY, NO backend code, RTL required |
| "API" / "backend" / "endpoint" / "route" / "server" / "واجهة خلفية" / "business logic" | `backend` | API routes only, Zod validation required, NO UI code |
| "قاعدة بيانات" / "database" / "DB" / "جدول" / "migration" / "SQL" / "schema" | `database` | SQL migrations only, NO application code |
| "أمان" / "security" / "ثغرة" / "vulnerability" / "اختراق" / "حماية" / "audit" | `security` | READ ONLY — review only, NO code changes |
| "تصميم" / "UX" / "UI review" / "accessibility" / "a11y" / "تجربة مستخدم" | `uiux-reviewer` | READ ONLY — review only, NO code changes |
| "اختبار" / "test" / "QA" / "quality" / "unit test" | `qa-tester` | Test files only |
| "هيكلة" / "architect" / "architecture" / "system design" / "معمارية" | `architect` | READ ONLY — design docs only, NO code changes |
| "code review" / "مراجعة كود" / "مراجعة" / "CR" | `code-reviewer` | READ ONLY — review only, NO code changes |

**If the user does NOT specify a domain**: stay in `coordinator` mode (all domains allowed).

## 2. Pre-Write Check (BEFORE every Edit or Write tool call)

BEFORE calling Edit or Write on ANY file:

1. Run: `node scripts/precheck.mjs "<filepath>" "<new_content_before_writing>"`
2. **If precheck returns BLOCK (exit code 1)** → STOP immediately. Do NOT write the code. Explain to user which rule was violated and the suggested fix from mistakes.json.
3. **If precheck returns WARN** → review carefully before proceeding.
4. **If precheck returns OK (exit code 0)** → proceed with the edit.

## 3. Domain Boundary Enforcement

BEFORE editing any file, check the current mode:
- Run: `node scripts/agent-mode.mjs check "<filepath>"`
- Read the JSON output. If `allowed: false` → STOP. Explain to user:
  - "Current mode is [mode]. This file is outside the domain. Switch mode or handle it yourself."
- If `allowed: true` → proceed.

## 4. Post-Write Check (AFTER every code change)

AFTER writing code:

1. Run: `npm run security-audit`
2. **If new vulnerabilities found** → report to user with severity and location
3. **If the code introduced a NEW mistake pattern** → ADD to `knowledge-base/mistakes.json` AND `knowledge-base/patterns.json`
4. Log the change in today's session

## 5. Session Lifecycle

### Session Start
0. Run: `node "D:\Users\vie\Desktop\shop-knowledge\scripts\ensure-git.mjs" "."` — auto-init Git if missing
1. Read `knowledge-base/mistakes.json` + `knowledge-base/patterns.json` to learn from past mistakes
2. Create/find session log: `knowledge-base/sessions/YYYY-MM-DD.md`
3. Run: `node scripts/agent-mode.mjs clear` (ensure clean coordinator mode)

### Session End
1. Update session file with summary
2. If a mistake occurred more than once → add stronger pattern to prevent recurrence
3. Run final: `npm run security-audit`

## 6. If Domain Changes Mid-Session

If the user switches topics mid-session:
- Re-run `node scripts/detect-domain.mjs` with the new message
- Re-set mode with `node scripts/agent-mode.mjs set <new_mode>`
- Load the new agent definition
- Do NOT mix domains (e.g., don't write backend code in frontend mode)

<!-- END:mandatory-rules -->

<!-- BEGIN:project-reference -->
# 📖 Project Reference — AI Tools Hub (ai-dashboard)

## Overview
AI-powered marketing tools dashboard for the Algerian market. 14 specialized AI tools (10 built, 4 planned) connecting to NVIDIA NIM and Google Gemini APIs through a local proxy server.

## Tech Stack
- **Framework:** Vite 8 + React 19 + JavaScript (JSX, no TypeScript)
- **Routing:** react-router-dom v7
- **Styling:** Tailwind CSS v4 (via @tailwindcss/vite plugin)
- **Icons:** lucide-react
- **AI:** NVIDIA NIM + Google Gemini (via local proxy)
- **Proxy:** Node.js HTTP server (server/proxy.cjs, port 3001)
- **Linting:** ESLint v10 (flat config)

## Directory Structure

### `src/` — Frontend Application
| Path | Purpose |
|------|---------|
| `src/main.jsx` | Entry point |
| `src/App.jsx` | BrowserRouter: "/" → Dashboard, "/tool/:toolId" → ToolPage |
| `src/pages/Dashboard.jsx` | Landing page with tool card grid |
| `src/pages/ToolPage.jsx` | Dynamic tool router (loads by toolId) |
| `src/pages/WafiaAdsMaster.jsx` | Ad strategy builder (846 lines) |
| `src/pages/AdScriptStudio.jsx` | Algerian Darija ad script generator (836 lines) |
| `src/pages/AvatarsGenerator.jsx` | Customer persona generation |
| `src/pages/CreativeStudio.jsx` | Product + persona → 6 prompt styles |
| `src/pages/AdProVision.jsx` | Ad image analysis & reproduction |
| `src/pages/AdFusion.jsx` | Product-into-design image fusion |
| `src/pages/PoseCraft.jsx` | Product + avatar pose placement |
| `src/pages/AngleCraft.jsx` | 6 professional photography angles |
| `src/pages/WearCraft.jsx` | Avatar product placement (wearables) |
| `src/pages/SawtDZ.jsx` | Text-to-speech studio |
| `src/components/ToolLayout.jsx` | Shared layout: nav, API key input, model selector |
| `src/data/tools.js` | 14 tool definitions (id, title, icon, component) |
| `src/data/providers.js` | AI provider configs (80+ models) |
| `src/utils/ai.js` | `fetchAI()` — unified AI caller with retry + fallback |

### `server/` — Proxy Server
| Path | Purpose |
|------|---------|
| `server/proxy.cjs` | Node.js HTTP proxy (port 3001, CORS bypass, 5-min timeout) |

## Key Architecture Patterns

### Tool Architecture
```
Dashboard (/)
  └── ToolCard Grid → click → /tool/:toolId
       └── ToolPage → loads component from tools.js registry
            └── <Component> receives: apiKey, model, endpoint from ToolLayout
```

### AI Integration
- `fetchAI()` in `src/utils/ai.js`: unified caller with retry + fallback
- Supports: NVIDIA NIM (OpenAI-compatible) + Google Gemini
- API keys stored in **localStorage** (no server-side auth)
- Local proxy (`server/proxy.cjs`) on port 3001 bypasses CORS
- Run with: `npm run dev:all` (concurrently runs proxy + vite)

### Key Features
- RTL-friendly Arabic design with Tailwind
- 80+ AI models across NVIDIA + Google
- Tool-specific system prompts (e.g., `temp_prompt.txt` for AdScript)
- All tools are client-side only (no database)

## Build & Run
```bash
npm run dev          # Vite dev server only
npm run dev:all      # Proxy (port 3001) + Vite (concurrently)
npm run build        # Production build
npm run lint         # ESLint
```
<!-- END:project-reference -->

<!-- BEGIN:shop-knowledge -->
# 🧠 shop-knowledge system

Installed from: D:\Users\vie\Desktop\shop-knowledge

| Component | Location | Purpose |
|-----------|----------|---------|
| Agent definitions | `.agents/definitions/` | 8 specialist agent roles |
| Workflows | `.agents/workflows/` | new-feature, bug-fix, security-audit |
| Mistake database | `knowledge-base/mistakes.json` | known errors with solutions |
| Detection patterns | `knowledge-base/patterns.json` | regex patterns (BLOCK/WARN) |
| Domain router | `scripts/detect-domain.mjs` | Routes user input to agent |
| Mode enforcer | `scripts/agent-mode.mjs` | Manages `.agent-mode.json` |
| Git enforcer | `scripts/ensure-git.mjs` | Auto-initializes Git if missing |

**Commands:**
- `node scripts/detect-domain.mjs "<message>"` — detect domain
- `node scripts/agent-mode.mjs set <mode>` — set current mode
- `node scripts/agent-mode.mjs check <file>` — check file allowed
- `node scripts/agent-mode.mjs clear` — reset to coordinator
- `node scripts/precheck.mjs <file> "<code>"` — pre-write check
- `node scripts/ensure-git.mjs "."` — ensure Git initialized (local)
- `node "D:\Users\vie\Desktop\shop-knowledge\scripts\ensure-git.mjs" "."` — ensure Git initialized (shop-knowledge)
- `npm run security-audit` — post-write vulnerability scan
<!-- END:shop-knowledge -->
