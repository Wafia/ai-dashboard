#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const PATTERNS_PATH = join(ROOT, 'knowledge-base', 'patterns.json');
const MISTAKES_PATH = join(ROOT, 'knowledge-base', 'mistakes.json');
const MODE_FILE = join(ROOT, '.agent-mode.json');

let patterns = [];
let mistakes = [];

try {
  patterns = JSON.parse(readFileSync(PATTERNS_PATH, 'utf-8'));
  mistakes = JSON.parse(readFileSync(MISTAKES_PATH, 'utf-8'));
} catch (e) {
  console.error('⚠️ Could not load knowledge base:', e.message);
  process.exit(1);
}

// ── Domain Boundaries ──
const DOMAIN_BOUNDARIES = {
  coordinator: { allowed_paths: ['**/*'], blocked_paths: [], description: 'All domains' },
  frontend: { allowed_paths: ['components/', 'app/', 'lib/'], blocked_paths: ['app/api/', 'scripts/', 'migration-package/'], description: 'UI only' },
  backend: { allowed_paths: ['app/api/', 'lib/'], blocked_paths: ['components/', 'app/(auth)/', 'migration-package/'], description: 'API only' },
  database: { allowed_paths: ['migration-package/', 'supabase_migration_'], blocked_paths: ['components/', 'app/', 'lib/', 'scripts/'], description: 'SQL only' },
  security: { allowed_paths: [], blocked_paths: ['**/*'], description: 'READ ONLY' },
  'uiux-reviewer': { allowed_paths: [], blocked_paths: ['**/*'], description: 'READ ONLY' },
  'qa-tester': { allowed_paths: ['__tests__/', '*.test.ts', '*.spec.ts', 'tests/'], blocked_paths: ['**/*'], description: 'Tests only' },
  architect: { allowed_paths: [], blocked_paths: ['**/*'], description: 'READ ONLY' },
  'code-reviewer': { allowed_paths: [], blocked_paths: ['**/*'], description: 'READ ONLY' },
};

function getMode() {
  if (!existsSync(MODE_FILE)) return { mode: 'coordinator', activated_at: null };
  try {
    return JSON.parse(readFileSync(MODE_FILE, 'utf-8'));
  } catch { return { mode: 'coordinator', activated_at: null }; }
}

function checkDomainBoundary(filePath) {
  const current = getMode();
  if (current.mode === 'coordinator') return null;

  const normalizedPath = filePath.replace(/\\/g, '/');
  const boundaries = DOMAIN_BOUNDARIES[current.mode];
  if (!boundaries) return null;

  for (const blocked of boundaries.blocked_paths) {
    if (blocked === '**/*') {
      return { action: 'BLOCK', message: `⛔ [DOMAIN] ${current.mode.toUpperCase()} mode: READ ONLY — no code changes allowed in this mode. ${boundaries.description}` };
    }
    if (normalizedPath.includes(blocked)) {
      return { action: 'BLOCK', message: `⛔ [DOMAIN] Current mode is "${current.mode}" (${boundaries.description}). Editing "${blocked}" is not allowed in this mode.` };
    }
  }

  for (const allowed of boundaries.allowed_paths) {
    if (normalizedPath.includes(allowed)) return null;
  }

  if (boundaries.allowed_paths.length > 0) {
    return { action: 'BLOCK', message: `⛔ [DOMAIN] Current mode is "${current.mode}" (${boundaries.description}). File not in allowed paths. Allowed: ${boundaries.allowed_paths.join(', ')}` };
  }

  return null;
}

// ── Helpers ──
function getRelPath(absPath) {
  return absPath.replace(ROOT, '').replace(/\\/g, '/').replace(/^\//, '');
}

function runPrecheck(filePath, codeContent) {
  const relPath = getRelPath(filePath);
  const results = [];

  for (const pattern of patterns) {
    let filterGlob = pattern.file_filter
      .replace(/\./g, '\\.')
      .replace(/\(/g, '\\(').replace(/\)/g, '\\)')
      .replace(/\*/g, '.*')
      .replace(/\{(\w+),(\w+)\}/g, '($1|$2)');
    const fileMatches = new RegExp('^' + filterGlob + '$').test(relPath);
    if (!fileMatches) continue;

    const codeRegex = new RegExp(pattern.regex, 'gi');
    const matches = codeContent.match(codeRegex);
    if (!matches) continue;

    if (pattern.context_pattern) {
      const contextRegex = new RegExp(pattern.context_pattern, 'gi');
      if (!contextRegex.test(codeContent)) continue;
    }

    const mistake = mistakes.find(m => m.id === pattern.mistake_id);
    results.push({
      pattern_id: pattern.id,
      pattern_name: pattern.name,
      severity: pattern.severity,
      action: pattern.action,
      message_ar: pattern.message_ar,
      message_en: pattern.message_en,
      match_count: matches.length,
      mistake: mistake ? {
        id: mistake.id,
        title: mistake.title,
        solution: mistake.solution,
        date_discovered: mistake.date_discovered,
        date_fixed: mistake.date_fixed,
      } : null,
    });
  }

  return results;
}

// ── Main ──
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('🔍 Knowledge Base Precheck');
  console.log('Usage: node scripts/precheck.mjs <filepath> "<code>"');
  console.log('');
  const mode = getMode();
  console.log(`Current mode: ${mode.mode}`);
  process.exit(0);
}

const filePath = args[0];
let codeContent = args.slice(1).join(' ');

if (!codeContent && existsSync(filePath)) {
  codeContent = readFileSync(filePath, 'utf-8');
}

if (!codeContent) {
  console.error('❌ No code provided for precheck');
  process.exit(1);
}

let hasBlockers = false;

// Step 1: Domain boundary check
const domainResult = checkDomainBoundary(filePath);
if (domainResult) {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   🧭 DOMAIN ENFORCEMENT                    ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log(`  ${domainResult.message}`);
  console.log('');
  if (domainResult.action === 'BLOCK') {
    console.log('  ⛔ Domain violation — BLOCKED');
    process.exit(1);
  }
}

// Step 2: Pattern-based precheck
const results = runPrecheck(filePath, codeContent);

if (results.length === 0) {
  console.log('✅ No dangerous patterns detected — code is safe');
  process.exit(0);
}

console.log('');
console.log('╔══════════════════════════════════════════╗');
console.log('║   🧠 Knowledge Base — Precheck Results    ║');
console.log('╚══════════════════════════════════════════╝');
console.log('');

for (const r of results) {
  const icon = r.action === 'BLOCK' ? '⛔' : r.action === 'WARN' ? '⚠️' : '💡';
  const sev = r.severity === 'critical' ? 'Critical' : r.severity === 'high' ? 'High' : r.severity === 'medium' ? 'Medium' : 'Low';
  
  console.log(`  ${icon} [${sev}] ${r.pattern_name}`);
  console.log(`     ${r.message_ar}`);
  
  if (r.mistake) {
    console.log(`     📖 ${r.mistake.id}: ${r.mistake.title}`);
    console.log(`     🛠  Solution: ${r.mistake.solution}`);
    if (r.mistake.date_fixed) {
      console.log(`     ✅ Fixed: ${r.mistake.date_fixed}`);
    } else {
      console.log(`     ⏳ Not yet fixed`);
    }
  }
  console.log('');

  if (r.action === 'BLOCK') hasBlockers = true;
}

if (hasBlockers) {
  console.log('  ⛔ BLOCK patterns detected — must fix code before proceeding');
  process.exit(1);
} else {
  console.log('  ⚠️  Warnings found — review before proceeding');
}
