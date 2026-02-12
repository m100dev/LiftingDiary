# Data Fetching

## Core Principles

### Server Components Only

ALL data fetching in this application MUST be done via **Next.js Server Components**. This is non-negotiable.

- **NO Route Handlers** (`app/api/*`) for fetching data
- **NO Client Component data fetching** (no `useEffect` + `fetch`, no SWR, no React Query)
- **NO API routes** of any kind for reading data
- Server Components fetch data directly by calling helper functions and pass it down as props

### Data Access Layer (`/data` directory)

All database queries MUST be executed through helper functions located in the `src/data/` directory. These functions serve as the single data access layer for the entire application.

- Every query goes through a dedicated helper function in `/data`
- Helper functions MUST use **Drizzle ORM** to communicate with the Neon database
- **NO raw SQL** — always use Drizzle's query builder or relational query API
- Helper functions are imported and called directly in Server Components

Example structure:
```
src/data/
  workouts.ts    # Workout-related queries
  exercises.ts   # Exercise-related queries
  sets.ts        # Set-related queries
```

Example pattern:
```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWorkouts(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}
```

```tsx
// src/app/workouts/page.tsx (Server Component)
import { getWorkouts } from "@/data/workouts";
import { auth } from "@/lib/auth";

export default async function WorkoutsPage() {
  const session = await auth();
  const workouts = await getWorkouts(session.user.id);
  return <WorkoutList workouts={workouts} />;
}
```

### User Data Isolation (CRITICAL)

Every single data query MUST be scoped to the authenticated user. A user must ONLY be able to access their own data. No exceptions.

- **Every** helper function in `/data` MUST accept a `userId` parameter
- **Every** query MUST include a `WHERE userId = ?` condition (via Drizzle's `eq()`)
- **Never** return data without filtering by the authenticated user's ID
- **Never** trust client-supplied user IDs — always derive the user ID from the server-side session/auth
- The calling Server Component is responsible for obtaining the authenticated `userId` from the session and passing it to the data helper

## Prohibited Patterns

```ts
// WRONG: Route handler for data fetching
// app/api/workouts/route.ts
export async function GET() { ... }

// WRONG: Client-side data fetching
"use client";
useEffect(() => { fetch("/api/workouts") }, []);

// WRONG: Raw SQL
await db.execute(sql`SELECT * FROM workouts`);

// WRONG: Query without user scoping
export async function getWorkouts() {
  return db.select().from(workouts); // Missing userId filter!
}

// WRONG: Trusting client-supplied userId
export async function getWorkouts(userId: string) {
  // userId came from client input, not from server session
}
```

## Required Patterns

```ts
// CORRECT: Drizzle ORM with user scoping
export async function getWorkouts(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

// CORRECT: Server Component calling data helper with session userId
export default async function Page() {
  const session = await auth();
  const data = await getWorkouts(session.user.id);
  return <ClientComponent data={data} />;
}
```
