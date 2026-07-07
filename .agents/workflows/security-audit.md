# Security Audit Workflow

## Trigger
- After every code modification (automated)
- Or on demand: "افحص أمان المشروع"

## Pipeline Flow
```
Security Agent runs automated checks → Manual review of findings → Report
```

## Steps

### Step 1: Automated Scanning
**Tool:** `npm run security-audit`
**Output:** Scan report (error leaking, auth, CSRF, secrets, validation)

### Step 2: Deep Review
**Agent:** Security Agent
**Input:** Scan report + changed files
**Process:**
1. Run `node scripts/precheck.mjs` on all changed files
2. Manual check of security checklist
3. Check authentication flows
4. Check authorization (role-based access)
5. Review error handling patterns

### Step 3: Report Generation
**Output:** Security report with findings

### Step 4: Issue Logging
If new vulnerabilities found:
1. Add to `knowledge-base/mistakes.json`
2. Add detection pattern to `knowledge-base/patterns.json`
3. Update `precheck.mjs` if needed

## Quality Gates
- [ ] Zero critical vulnerabilities
- [ ] All medium vulnerabilities have a plan
- [ ] No `error.message` in new code
- [ ] All admin routes have role checks
- [ ] All POST/PUT/PATCH have Zod validation
