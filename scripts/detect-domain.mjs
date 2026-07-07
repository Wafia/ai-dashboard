#!/usr/bin/env node

const args = process.argv.slice(2);
const input = args.join(' ').toLowerCase();

const DOMAIN_MAP = [
  {
    agent: 'frontend',
    file: '02-frontend.md',
    keywords: [
      'واجهة', 'frontend', 'ui', 'component', 'component', 'page', 'صفحة',
      'شاشة', 'three', 'three.js', 'r3f', 'react three', '3d',
      'navbar', 'header', 'footer', 'button', 'card', 'form',
    ],
  },
  {
    agent: 'backend',
    file: '03-backend.md',
    keywords: [
      'api', 'backend', 'endpoint', 'route', 'server', 'واجهة خلفية',
      'zod', 'validation', 'business logic', 'data flow',
      'order flow', 'checkout', 'payment',
    ],
  },
  {
    agent: 'database',
    file: '04-database.md',
    keywords: [
      'database', 'db', 'قاعدة بيانات', 'قاعدة البيانات', 'جدول', 'migration', 'sql',
      'schema', 'table', 'index', 'foreign key', 'rls', 'row level',
      'supabase', 'postgres', 'query', 'علاقة',
    ],
  },
  {
    agent: 'security',
    file: '05-security.md',
    keywords: [
      'أمان', 'security', 'ثغرة', 'vulnerability', 'hack', 'اختراق',
      'csrf', 'xss', 'sql injection', 'rate limit', 'صلاحية',
      'role check', 'authorization', 'authentication',
      'secure', 'حماية', 'اختبار أمان', 'audit',
    ],
  },
  {
    agent: 'uiux-reviewer',
    file: '06-uiux-reviewer.md',
    keywords: [
      'ui review', 'ux', 'design', 'تصميم', 'تجربة مستخدم',
      'accessibility', 'a11y', 'responsive', 'rtl', 'arabic',
      'color', 'typography', 'خط', 'لون',
    ],
  },
  {
    agent: 'qa-tester',
    file: '07-qa-tester.md',
    keywords: [
      'test', 'اختبار', 'qa', 'quality', 'unit test', 'integration',
      'e2e', 'vitest', 'playwright', 'coverage',
    ],
  },
  {
    agent: 'architect',
    file: '01-architect.md',
    keywords: [
      'architect', 'architecture', 'design', 'هيكلة', 'معمارية',
      'structure', 'pattern', 'data flow', 'decision',
      'plan', 'خطة', 'system design',
    ],
  },
  {
    agent: 'code-reviewer',
    file: '08-code-reviewer.md',
    keywords: [
      'code review', 'review', 'مراجعة كود', 'مراجعة', 'cr',
      'quality check', 'code quality',
    ],
  },
];

function detect(inputText) {
  const results = [];

  for (const entry of DOMAIN_MAP) {
    const matched = entry.keywords.some((kw) => inputText.includes(kw));
    if (matched) {
      results.push({
        agent: entry.agent,
        file: entry.file,
        confidence: matched ? 'high' : 'low',
      });
    }
  }

  return results;
}

const detected = detect(input);

if (detected.length === 0) {
  console.log(JSON.stringify({ agent: 'coordinator', file: '00-coordinator.md', matches: [] }));
} else {
  console.log(JSON.stringify({ agent: detected[0].agent, file: detected[0].file, matches: detected }));
}
