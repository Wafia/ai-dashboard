# New Feature Workflow

## Trigger
When the user requests a new feature (new page, new component, new API, new functionality).

## Pipeline Flow
```
Coordinator → Architect → Frontend → Backend → Database (if needed)
                                                      ↓
                                              Security → QA → Code Reviewer
```

## Steps

### Step 1: Architect (Design)
**Agent:** Architect Agent
**Input:** User's feature request
**Output:** Architecture plan (components, data flow, decisions)
**Quality Gate:** Coordinator reviews the plan. If unclear → ask user for clarification.

### Step 2: Database (if schema changes needed)
**Agent:** Database Agent
**Input:** Architecture plan
**Output:** Migration SQL
**Quality Gate:** Migration is idempotent, has proper indexes, has foreign keys.

### Step 3a: Frontend Implementation
**Agent:** Frontend Agent
**Input:** Architecture plan (+ 3D spec if applicable)
**Output:** React components, pages, styles
**Quality Gate:** TypeScript compiles, responsive, RTL, follows patterns.

### Step 3b: Backend Implementation
**Agent:** Backend Agent
**Input:** Architecture plan
**Output:** API routes, Zod schemas, business logic
**Quality Gate:** TypeScript compiles, validation on all endpoints, no error leaking.

### Step 4: Security Review
**Agent:** Security Agent
**Input:** All changed files
**Output:** Security report
**Quality Gate:** No critical vulnerabilities.
**Gate:** If Critical → return to Step 3. Coordinator decides.

### Step 5: QA / Testing
**Agent:** QA Agent
**Input:** All changed files
**Output:** Tests + test report
**Quality Gate:** All tests pass, coverage meets standards.

### Step 6: Code Review
**Agent:** Code Reviewer Agent
**Input:** Full diff
**Output:** Code review verdict
**Quality Gate:** Verdict is APPROVED.
**Gate:** If REJECTED → return to Step 3. If CHANGES REQUIRED → fix then re-review.

## Delivery
Coordinator presents final summary to user:
```
✅ Feature "X" is ready
├── Frontend: file1.tsx, file2.tsx
├── Backend: file3.ts, file4.ts
├── Database: migration.sql
├── Security: ✅ No issues
├── Tests: ✅ 15 tests passing
└── Code Review: ✅ Approved
```
