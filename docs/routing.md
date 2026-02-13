# Routing

## Core Principles

### All Routes Live Under `/dashboard`

Every application route MUST be nested under the `/dashboard` path. The only exception is the public home page at `/`.

- **NO top-level routes** outside of `/dashboard` (e.g., never create `/workouts`, `/profile`, `/settings`)
- All new features MUST be added as sub-routes of `/dashboard`
- Use the Next.js App Router directory structure under `src/app/dashboard/`

Route structure:
```
src/app/
├── page.tsx                              # Public home page (/)
└── dashboard/
    ├── page.tsx                          # Dashboard home (/dashboard)
    └── workout/
        ├── new/
        │   └── page.tsx                  # /dashboard/workout/new
        └── [workoutId]/
            └── page.tsx                  # /dashboard/workout/:workoutId
```

### Route Protection via Next.js Middleware

ALL `/dashboard` routes are protected and MUST only be accessible by authenticated users. Route protection is enforced at the middleware level using Clerk's `clerkMiddleware` in `src/proxy.ts`.

- The middleware runs on every request before the page renders
- Unauthenticated users attempting to access `/dashboard` or any sub-route MUST be redirected
- **Never** rely solely on page-level `auth()` checks as the primary protection mechanism — middleware is the first line of defense
- Page-level `auth()` calls in Server Components are used to obtain the `userId` for data queries, not as the primary route guard

### Page-Level Auth for User Identity

Even though middleware protects routes, every protected Server Component page MUST still call `auth()` to obtain the `userId` for data access. This is a defense-in-depth pattern.

```tsx
// src/app/dashboard/example/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  // userId is now guaranteed — use it for data queries
}
```

## Prohibited Patterns

```ts
// WRONG: Route outside of /dashboard
// src/app/workouts/page.tsx
export default function WorkoutsPage() { ... }

// WRONG: Protected route without middleware coverage
// Relying only on page-level auth() with no middleware protection

// WRONG: Public route under /dashboard
// All /dashboard routes MUST require authentication
```

## Required Patterns

```ts
// CORRECT: New feature nested under /dashboard
// src/app/dashboard/exercises/page.tsx
export default async function ExercisesPage() { ... }

// CORRECT: Dynamic route under /dashboard
// src/app/dashboard/workout/[workoutId]/page.tsx
export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) { ... }

// CORRECT: Middleware protects all /dashboard routes
// src/proxy.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
export default clerkMiddleware();
```
