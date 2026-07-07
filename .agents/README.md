# AI Agent Team — Shop Knowledge System

## Architecture
This directory defines 8 specialized AI agents that work together as a software engineering team.

## How It Works
1. **You (user)** make a request
2. **Coordinator (me)** analyzes and routes to specialists
3. **Agents** execute their tasks and report back
4. **Coordinator** reviews, synthesizes, and delivers results

## Agent Definitions
| # | Agent | File | Responsibility |
|---|-------|------|---------------|
| 00 | Coordinator | `00-coordinator.md` | Team lead, routing, synthesis |
| 01 | Architect | `01-architect.md` | System design, ADRs, planning |
| 02 | Frontend | `02-frontend.md` | UI, React, 3D (Three.js) |
| 03 | Backend | `03-backend.md` | API, auth, business logic |
| 04 | Database | `04-database.md` | Schema, migrations, queries |
| 05 | Security | `05-security.md` | Vulnerability scanning, audits |
| 06 | UI/UX Reviewer | `06-uiux-reviewer.md` | Design quality, accessibility |
| 07 | QA/Tester | `07-qa-tester.md` | Tests, bug detection |
| 08 | Code Reviewer | `08-code-reviewer.md` | Code quality, merge approval |

## Workflows
| Workflow | File | Description |
|----------|------|-------------|
| New Feature | `workflows/new-feature.md` | Full pipeline for new functionality |
| Bug Fix | `workflows/bug-fix.md` | Diagnosis → fix → test → review |
| Security Audit | `workflows/security-audit.md` | Automated + manual security checks |

## Integration with Knowledge Base
- `knowledge-base/mistakes.json` — All known bugs and solutions
- `knowledge-base/patterns.json` — Dangerous code patterns
- `scripts/precheck.mjs` — Prevents writing known-mistake code
- `scripts/security-audit.mjs` — Post-change vulnerability scan

## Commands
```bash
npm run security-audit    # Scan for vulnerabilities
node scripts/precheck.mjs # Check code against known mistakes
```
