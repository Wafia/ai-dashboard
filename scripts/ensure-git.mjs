#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');

const DEFAULT_GITIGNORE = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Dependencies
node_modules
.pnp
.pnp.js

# Build
dist
dist-ssr
build
.out
.next
coverage

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.DS_Store
Thumbs.db
`;

function run(cmd, cwd) {
  try {
    return execSync(cmd, { cwd, encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch (e) {
    return null;
  }
}

function ensureGit(dir) {
  const gitDir = join(dir, '.git');

  if (existsSync(gitDir)) {
    console.log(`✓ ${dir} — Git already initialized.`);
    return false;
  }

  console.log(`→ ${dir} — Initializing Git repository...`);

  // git init
  run('git init', dir);
  console.log('  ✔ git init');

  // .gitignore
  const gitignorePath = join(dir, '.gitignore');
  if (!existsSync(gitignorePath)) {
    writeFileSync(gitignorePath, DEFAULT_GITIGNORE, 'utf-8');
    console.log('  ✔ .gitignore created');
  } else {
    console.log('  ~ .gitignore already exists, keeping existing');
  }

  // initial commit
  run('git add -A', dir);
  const commitResult = run('git commit -m "🎯 initial commit — auto-initialized by shop-knowledge/ensure-git"', dir);

  if (commitResult) {
    console.log('  ✔ Initial commit created');
  } else {
    // maybe nothing to commit
    console.log('  ~ No files to commit (empty repo or already committed)');
  }

  return true;
}

export default ensureGit;

// CLI mode
const args = process.argv.slice(2);
if (args.length > 0) {
  for (const dir of args) {
    if (existsSync(dir)) {
      ensureGit(dir);
    } else {
      console.error(`✗ Directory not found: ${dir}`);
    }
  }
} else {
  // Use current working directory
  ensureGit(process.cwd());
}
