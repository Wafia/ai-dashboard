#!/usr/bin/env node

import { readFileSync, statSync, readdirSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const API_DIR = join(ROOT, 'app', 'api');
const COMPONENTS_DIR = join(ROOT, 'components');
const LIB_DIR = join(ROOT, 'lib');

const findings = [];

function walkDir(dir, predicate, skipDirs = ['node_modules', '.git', '.next', 'migration-package']) {
  const results = [];
  if (!existsSync(dir)) return results;
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (skipDirs.includes(entry.name)) continue;
        results.push(...walkDir(fullPath, predicate, skipDirs));
      } else if (predicate(entry.name, fullPath)) {
        results.push(fullPath);
      }
    }
  } catch {}
  return results;
}

function findFiles(dir, extList) {
  return walkDir(dir, (name) => extList.some(e => name.endsWith(e)));
}

function readFile(path) {
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    return '';
  }
}

function getRelPath(absPath) {
  return relative(ROOT, absPath).replace(/\\/g, '/');
}

// ── Check 1: Error message leaking ──
function checkErrorLeaking() {
  const results = [];

  // API routes: error.message returned to client
  const apiFiles = findFiles(API_DIR, ['.ts', '.js', '.tsx']);
  for (const file of apiFiles) {
    const content = readFile(file);
    // Pattern 1: return NextResponse.json({ error: err.message ... })
    const matches1 = content.matchAll(/error:\s*(err|error|e)\s*\.\s*message/gi);
    const matches2 = content.matchAll(/\.json\(\s*\{[^}]*error[^}]*\.message/gi);
    const matches3 = content.matchAll(/error:\s*\w+\.message/gi);
    const allMatches = [...matches1, ...matches2, ...matches3].filter(Boolean);

    if (allMatches.length > 0) {
      const lines = content.split('\n');
      const lineNumbers = [];
      for (const m of allMatches) {
        const lineIdx = lines.findIndex(l => l.includes(m[0].substring(0, 30)));
        if (lineIdx >= 0) lineNumbers.push(lineIdx + 1);
      }
      results.push({
        file: getRelPath(file),
        count: allMatches.length,
        lines: [...new Set(lineNumbers)].sort((a,b) => a-b),
      });
    }
  }

  // Components: error.message in toast/setError
  const compFiles = findFiles(COMPONENTS_DIR, ['.tsx', '.ts']);
  const toastMatches = [];
  for (const file of compFiles) {
    const content = readFile(file);
    const m = content.matchAll(/(?:description|error)\s*:\s*(err|error|e)\s*\.\s*message/gi);
    const m2 = content.matchAll(/setError\([^)]*error\.message/gi);
    const all = [...m, ...m2].filter(Boolean);
    if (all.length > 0) {
      const lines = content.split('\n');
      const lineNumbers = [];
      for (const match of all) {
        const lineIdx = lines.findIndex(l => l.includes(match[0].substring(0, 30)));
        if (lineIdx >= 0) lineNumbers.push(lineIdx + 1);
      }
      toastMatches.push({
        file: getRelPath(file),
        count: all.length,
        lines: [...new Set(lineNumbers)].sort((a,b) => a-b),
      });
    }
  }

  return { api: results, components: toastMatches };
}

// ── Check 2: Hardcoded secrets ──
function checkHardcodedSecrets() {
  const results = [];
  const sensitiveFiles = findFiles(LIB_DIR, ['.ts', '.js']);
  sensitiveFiles.push(...findFiles(API_DIR, ['.ts', '.js']));
  // Deduplicate
  const uniqueFiles = [...new Set(sensitiveFiles)];

  const patterns = [
    { name: 'API Key', regex: /['"][A-Za-z0-9_-]{40,}['"]/g },
    { name: 'Bearer Token', regex: /bearer\s+['"][A-Za-z0-9_-]{20,}['"]/gi },
    { name: 'Service Role Key', regex: /service_role/i },
    { name: 'Secret Key', regex: /secret\s*[=:]\s*['"][A-Za-z0-9_-]{20,}['"]/gi },
    { name: 'Supabase Key (anon)', regex: /supabase.*key.*['"][A-Za-z0-9_-]{20,}['"]/gi },
  ];

  for (const file of uniqueFiles) {
    const content = readFile(file);
    for (const pattern of patterns) {
      const matches = content.match(pattern.regex);
      if (matches) {
        results.push({
          file: getRelPath(file),
          pattern: pattern.name,
          count: matches.length,
        });
      }
    }
  }

  return results;
}

// ── Check 3: Missing auth in admin APIs ──
function checkAdminApiAuth() {
  const results = [];
  const adminRoutes = findFiles(join(API_DIR, 'admin'), ['.ts', '.js', '.tsx']);

  for (const file of adminRoutes) {
    const content = readFile(file);
    const lines = content.split('\n');

    // Check if there's ANY role check or auth verification
    const hasRoleCheck = content.match(/role/i) || content.match(/isAdmin/i) || 
                         content.match(/is_employee/i) || content.match(/employees/i);

    // Check if there's a session check
    const hasSessionCheck = content.match(/getSession/i) || content.match(/getUser/i) ||
                            content.match(/supabase/i);

    // If it's a GET, might be fine (read-only)
    // If POST/PUT/DELETE, should have role check
    const hasMutation = content.match(/POST|PUT|DELETE|PATCH/);

    if (!hasRoleCheck && hasMutation) {
      results.push({
        file: getRelPath(file),
        hasSession: !!hasSessionCheck,
      });
    }
  }

  return results;
}

// ── Check 4: CSRF protection ──
function checkCsrf() {
  const allFiles = findFiles(ROOT, ['.ts', '.tsx', '.js', '.mjs']);
  let hasCsrf = false;
  let csrfFiles = [];

  for (const file of allFiles) {
    if (file.includes('scripts') || file.includes('node_modules')) continue;
    const content = readFile(file);
    if (content.match(/csrf/i) || content.match(/CSRF/i) || content.match(/csrfToken/i)) {
      hasCsrf = true;
      csrfFiles.push(getRelPath(file));
    }
  }

  // Check middleware
  const middlewarePath = join(ROOT, 'middleware.ts');
  let middlewareHasCsrf = false;
  if (existsSync(middlewarePath)) {
    const middleware = readFile(middlewarePath);
    middlewareHasCsrf = middleware.match(/csrf/i) !== null;
  }

  return { hasCsrf, csrfFiles, middlewareHasCsrf };
}

// ── Check 5: Public API routes without any validation ──
function checkPublicApiValidation() {
  const results = [];
  const apiRoutes = findFiles(API_DIR, ['.ts', '.js', '.tsx']);

  for (const file of apiRoutes) {
    // Skip admin routes
    if (file.includes('admin')) continue;

    const content = readFile(file);
    const hasPostHandler = content.match(/export\s+(async\s+)?function\s+POST/);
    if (!hasPostHandler) continue;

    const hasValidation = content.match(/zod/i) || content.match(/validate/i) ||
                          content.match(/safeParse/i) || content.match(/z\.object/i);

    if (!hasValidation) {
      results.push({
        file: getRelPath(file),
      });
    }
  }

  return results;
}

// ── Check 6: Directory listing / index exposure ──
function checkDirectoryExposure() {
  const results = [];
  const publicDirs = [join(ROOT, 'public')];
  for (const dir of publicDirs) {
    if (!existsSync(dir)) continue;
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && /\.(env|json|yml|yaml|config|key|cert|pem)$/i.test(entry.name)) {
          results.push(getRelPath(join(dir, entry.name)));
        }
      }
    } catch {}
  }
  return results;
}

// ── Run all checks ──
function runAudit() {
  const results = {};

  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║     🔒 Security Audit Report             ║');
  console.log('║     تقرير فحص الأمان التلقائي            ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  // Check 1: Error leaking
  console.log('─── 1. تسريب أخطاء (Error Leaking) ───');
  const errorLeak = checkErrorLeaking();
  if (errorLeak.api.length === 0 && errorLeak.components.length === 0) {
    console.log('   ✅ لا توجد أخطاء مكشوفة');
  } else {
    if (errorLeak.api.length > 0) {
      console.log(`   ⚠️  API Routes (${errorLeak.api.length} files):`);
      for (const f of errorLeak.api) {
        console.log(`       • ${f.file} — line ${f.lines.join(', ')} (${f.count} مخالفات)`);
      }
    }
    if (errorLeak.components.length > 0) {
      console.log(`   ⚠️  Components (${errorLeak.components.length} files):`);
      for (const f of errorLeak.components) {
        console.log(`       • ${f.file} — line ${f.lines.join(', ')} (${f.count} مخالفات)`);
      }
    }
  }
  results.errorLeak = errorLeak;

  // Check 2: API Auth
  console.log('');
  console.log('─── 2. صلاحية API (API Authorization) ───');
  const apiAuth = checkAdminApiAuth();
  if (apiAuth.length === 0) {
    console.log('   ✅ جميع admin APIs محمية');
  } else {
    console.log(`   ⚠️  ${apiAuth.length} مسار Admin API يحتاج فحص صلاحية:`);
    for (const r of apiAuth) {
      console.log(`       • ${r.file} ${r.hasSession ? '(لديه session check, ينقصه role check)' : '(لا يوجد أي تحقق)'}`);
    }
  }
  results.apiAuth = apiAuth;

  // Check 3: CSRF
  console.log('');
  console.log('─── 3. حماية CSRF ───');
  const csrf = checkCsrf();
  if (csrf.hasCsrf) {
    console.log('   ✅ توجد حماية CSRF');
  } else {
    console.log('   ❌ لا توجد حماية CSRF في أي مكان');
  }
  results.csrf = csrf;

  // Check 4: Hardcoded secrets
  console.log('');
  console.log('─── 4. مفاتيح مخفية في الكود (Hardcoded Secrets) ───');
  const secrets = checkHardcodedSecrets();
  if (secrets.length === 0) {
    console.log('   ✅ لا توجد مفاتيح مخفية في الكود');
  } else {
    console.log(`   ⚠️  ${secrets.length} مخالفة محتملة:`);
    for (const s of secrets) {
      console.log(`       • ${s.file} — ${s.pattern} (${s.count})`);
    }
  }
  results.secrets = secrets;

  // Check 5: Public API validation
  console.log('');
  console.log('─── 5. API عام بدون تحقق (Public API Validation) ───');
  const pubApi = checkPublicApiValidation();
  if (pubApi.length === 0) {
    console.log('   ✅ جميع APIs العامة فيها تحقق');
  } else {
    console.log(`   ⚠️  ${pubApi.length} API عام بدون Zod/Validation:`);
    for (const r of pubApi) {
      console.log(`       • ${r.file}`);
    }
  }
  results.publicApi = pubApi;

  // Summary
  console.log('');
  console.log('─── الملخص ───');
  const totalIssues = errorLeak.api.length + errorLeak.components.length + 
                      apiAuth.length + secrets.length + pubApi.length +
                      (csrf.hasCsrf ? 0 : 1);
  
  if (totalIssues === 0) {
    console.log('   ✅ الموقع آمن تماماً — لا توجد ثغرات');
  } else {
    console.log(`   ⚠️  تم العثور على ${totalIssues} مشكلة:`);
    if (errorLeak.api.length + errorLeak.components.length > 0)
      console.log(`       • تسريب أخطاء: ${errorLeak.api.length + errorLeak.components.length}`);
    if (apiAuth.length > 0)
      console.log(`       • صلاحية API: ${apiAuth.length}`);
    if (!csrf.hasCsrf)
      console.log(`       • CSRF: 1`);
    if (secrets.length > 0)
      console.log(`       • مفاتيح مخفية: ${secrets.length}`);
    if (pubApi.length > 0)
      console.log(`       • API بدون تحقق: ${pubApi.length}`);
  }

  return results;
}

// Run
const auditResult = runAudit();

// Determine if changes are safe
const hasCriticalIssues = auditResult.apiAuth.length > 0 || 
                          !auditResult.csrf.hasCsrf ||
                          auditResult.secrets.some(s => s.pattern === 'Supabase Key' || s.pattern === 'Service Role Key');

if (hasCriticalIssues) {
  console.log('');
  console.log('   ⛔ تنبيه: توجد مشاكل أمان تتطلب معالجة!');
}

console.log('');
