# Server Components

## Core Principles

### Async by Default

All Server Components that access dynamic data MUST be `async` functions. This includes any component that:

- Reads route `params` or `searchParams`
- Fetches data from the database
- Calls `auth()` for session information

### Params and SearchParams Are Promises (CRITICAL)

In Next.js 15+, `params` and `searchParams` are **Promises** and MUST be awaited before use. This is non-negotiable.

- **Always** type `params` as `Promise<{ ... }>` in the component props
- **Always** `await params` before accessing any value
- **Never** destructure `params` synchronously

```tsx
// CORRECT: Await params before use
export default async function Page({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  // Now use workoutId
}
```

```tsx
// WRONG: Synchronous destructuring — will break at runtime
export default async function Page({
  params: { workoutId },
}: {
  params: { workoutId: string };
}) {
  // This will NOT work in Next.js 15+
}
```

The same rule applies to `searchParams`:

```tsx
// CORRECT
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
}
```

## Prohibited Patterns

```tsx
// WRONG: Synchronous params access
export default async function Page({ params }: { params: { id: string } }) {
  const data = await getData(params.id);
}

// WRONG: Synchronous searchParams access
export default async function Page({ searchParams }: { searchParams: { q: string } }) {
  const query = searchParams.q;
}

// WRONG: Non-async Server Component that needs dynamic data
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  // Cannot await without async
}
```

## Required Patterns

```tsx
// CORRECT: Full Server Component with params, auth, and data fetching
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const { workoutId } = await params;
  const workout = await getWorkoutById(userId, workoutId);

  if (!workout) {
    notFound();
  }

  return <div>{workout.name}</div>;
}
```
