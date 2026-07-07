#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const MODE_FILE = join(ROOT, '.agent-mode.json');

const DOMAIN_BOUNDARIES = {
  coordinator: {
    allowed_paths: ['**/*'],
    blocked_paths: [],
    description: 'All domains — general mode',
  },
  frontend: {
    allowed_paths: ['components/', 'app/', 'lib/'],
    blocked_paths: ['app/api/', 'scripts/', 'migration-package/'],
    description: 'UI components, pages, client logic only — NO backend code',
  },
  backend: {
    allowed_paths: ['app/api/', 'lib/'],
    blocked_paths: ['components/', 'app/(auth)/', 'migration-package/'],
    description: 'API routes, server logic, validations — NO UI components',
  },
  database: {
    allowed_paths: ['migration-package/', 'supabase_migration_'],
    blocked_paths: ['components/', 'app/', 'lib/', 'scripts/'],
    description: 'SQL migrations, schema changes only — NO application code',
  },
  security: {
    allowed_paths: [],
    blocked_paths: ['**/*'],
    description: 'READ ONLY — review only, NO code changes',
  },
  'uiux-reviewer': {
    allowed_paths: [],
    blocked_paths: ['**/*'],
    description: 'READ ONLY — review only, NO code changes',
  },
  'qa-tester': {
    allowed_paths: ['__tests__/', '*.test.ts', '*.spec.ts', 'tests/'],
    blocked_paths: ['**/*'],
    description: 'Test files only',
  },
  architect: {
    allowed_paths: [],
    blocked_paths: ['**/*'],
    description: 'READ ONLY — design docs only, NO code changes',
  },
  'code-reviewer': {
    allowed_paths: [],
    blocked_paths: ['**/*'],
    description: 'READ ONLY — review only, NO code changes',
  },
};

function getMode() {
  if (!existsSync(MODE_FILE)) {
    return { mode: 'coordinator', activated_at: null };
  }
  return JSON.parse(readFileSync(MODE_FILE, 'utf-8'));
}

function setMode(mode) {
  const boundaries = DOMAIN_BOUNDARIES[mode];
  if (!boundaries) {
    console.error(`❌ Unknown mode: ${mode}`);
    process.exit(1);
  }
  const data = {
    mode,
    activated_at: new Date().toISOString(),
    allowed_paths: boundaries.allowed_paths,
    blocked_paths: boundaries.blocked_paths,
    description: boundaries.description,
  };
  writeFileSync(MODE_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ Mode set to: ${mode}`);
  console.log(`   ${boundaries.description}`);
}

function clearMode() {
  if (existsSync(MODE_FILE)) {
    writeFileSync(MODE_FILE, JSON.stringify({ mode: 'coordinator', activated_at: null }));
    console.log('✅ Mode reset to coordinator');
  } else {
    console.log('ℹ️  No mode set');
  }
}

function checkFile(filePath) {
  const current = getMode();
  if (current.mode === 'coordinator') {
    console.log(JSON.stringify({ allowed: true, mode: 'coordinator', reason: 'Coordinator mode — all files allowed' }));
    return;
  }

  const normalizedPath = filePath.replace(/\\/g, '/');
  const boundaries = DOMAIN_BOUNDARIES[current.mode];

  // Check blocked paths
  for (const blocked of boundaries.blocked_paths) {
    if (blocked === '**/*') {
      console.log(JSON.stringify({ allowed: false, mode: current.mode, reason: `${current.mode} mode: READ ONLY — no code changes allowed` }));
      return;
    }
    if (normalizedPath.includes(blocked)) {
      console.log(JSON.stringify({ allowed: false, mode: current.mode, reason: `${current.mode} mode: edit to ${blocked} not allowed (blocked path)` }));
      return;
    }
  }

  // Check allowed paths
  for (const allowed of boundaries.allowed_paths) {
    if (normalizedPath.includes(allowed)) {
      console.log(JSON.stringify({ allowed: true, mode: current.mode, reason: `${current.mode} mode: edit allowed` }));
      return;
    }
  }

  console.log(JSON.stringify({ allowed: false, mode: current.mode, reason: `${current.mode} mode: file not in allowed paths (${boundaries.allowed_paths.join(', ')})` }));
}

const args = process.argv.slice(2);
const cmd = args[0];
const val = args[1];

if (!cmd || cmd === 'get') {
  const mode = getMode();
  console.log(JSON.stringify(mode, null, 2));
} else if (cmd === 'set') {
  if (!val) {
    console.error('Usage: node scripts/agent-mode.mjs set <mode>');
    console.error('Modes: coordinator, frontend, backend, database, security, uiux-reviewer, qa-tester, architect, code-reviewer');
    process.exit(1);
  }
  setMode(val);
} else if (cmd === 'clear') {
  clearMode();
} else if (cmd === 'check') {
  if (!val) {
    console.error('Usage: node scripts/agent-mode.mjs check <filepath>');
    process.exit(1);
  }
  checkFile(val);
} else {
  console.error('Usage: node scripts/agent-mode.mjs [get|set|clear|check]');
  process.exit(1);
}
