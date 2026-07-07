#!/usr/bin/env node
// Adds security-audit script to package.json if not already there

const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(process.argv[2] || 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

if (!pkg.scripts) pkg.scripts = {};

let changed = false;
if (!pkg.scripts['security-audit']) {
  pkg.scripts['security-audit'] = 'node scripts/security-audit.mjs';
  changed = true;
}
if (!pkg.scripts['precheck']) {
  pkg.scripts['precheck'] = 'node scripts/precheck.mjs';
  changed = true;
}

if (changed) {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('npm scripts added.');
} else {
  console.log('npm scripts already exist.');
}
