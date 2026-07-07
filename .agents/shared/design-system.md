# Project Design System & Architecture

## Tech Stack
- **Framework:** Next.js 15 App Router + Turbopack
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **UI Library:** shadcn/ui (Radix primitives)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (OTP via Resend)
- **Forms:** react-hook-form + zod
- **Charts:** recharts
- **3D:** React Three Fiber, Three.js, @react-three/drei

## File Naming Conventions
- Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
- Pages: `kebab-case/page.tsx` (e.g., `product/[slug]/page.tsx`)
- API Routes: `kebab-case/route.ts` (e.g., `orders/create/route.ts`)
- Utilities: `camelCase.ts` (e.g., `pixelTracker.ts`)
- Types: `camelCase.ts` (e.g., `types.ts`)
- Context: `PascalCase.tsx` (e.g., `CartContext.tsx`)

## Component Architecture
- **Server Components by default** — only use `'use client'` when needed
- **Client Components** — only for interactivity (forms, animations, context)
- **UI Components** — in `components/ui/` (shadcn/ui)
- **Feature Components** — in `components/shop/`, `components/admin/`, `components/layout/`

## State Management
- **Server State:** Supabase queries (server components)
- **Client State:** React context (CartContext)
- **URL State:** searchParams for filters, pagination

## Error Handling Pattern
```typescript
// ✅ CORRECT:
try {
  // ...
} catch (err) {
  console.error('Operation failed:', err);
  return NextResponse.json({ error: 'حدث خطأ أثناء المعالجة' }, { status: 500 });
}

// ❌ WRONG:
return NextResponse.json({ error: err.message }, { status: 500 });
```

## API Route Pattern
```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';

const Schema = z.object({ /* ... */ });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 });
    }
    // ... logic
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
```

## Admin Auth Pattern
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

const { data: employee } = await supabase
  .from('employees')
  .select('role')
  .eq('id', user.id)
  .single();

if (!employee || employee.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```
