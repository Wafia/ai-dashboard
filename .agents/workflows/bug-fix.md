# Bug Fix Workflow

## Trigger
When the user reports a bug or unexpected behavior.

## Pipeline Flow
```
Bug Report → Diagnose Frontend (if UI) → Backend (if API) → Fix → Security → QA → Review
```

## Steps

### Step 1: Diagnosis
**Agent:** Coordinator (me) — or delegate to specialist
**Process:**
1. Reproduce the bug (ask user for steps)
2. Isolate the cause (which layer: frontend, backend, database)
3. Check `knowledge-base/mistakes.json` for similar bugs
4. Run `node scripts/precheck.mjs` on affected files

### Step 2: Implement Fix
**Agent:** Appropriate specialist (Frontend/Backend/Database)
**Input:** Bug diagnosis
**Output:** Fix code
**Hard Rules:**
- Read surrounding code before writing the fix
- Write the minimum code that fixes the bug
- Add a test that would catch regression of this bug

### Step 3: Security Review
**Agent:** Security Agent
**Output:** Quick security check of the fix

### Step 4: QA / Regression
**Agent:** QA Agent
**Output:** Tests pass, new test for the bug
**Gate:** Regression test must pass.

### Step 5: Code Review
**Agent:** Code Reviewer Agent
**Output:** Quick review of the fix

## Logging
After the fix, log it in `knowledge-base/mistakes.json`:
```json
{
  "id": "ERR-NNN",
  "title": "وصف المشكلة",
  "category": "bug",
  "severity": "medium",
  "project": "project-name",
  "symptom": "وصف الأعراض",
  "root_cause": "السبب الحقيقي",
  "solution": "كيف صلحناها",
  "date_discovered": "date",
  "date_fixed": "date",
  "occurrences": 1
}
```

Also add a detection pattern in `knowledge-base/patterns.json` if the bug type might recur.
