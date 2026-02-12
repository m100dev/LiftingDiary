# Data Mutations

## Core Principles

### Server Actions Only

ALL data mutations in this application MUST be done via **Next.js Server Actions**. This is non-negotiable.

- **NO Route Handlers** (`app/api/*`) for mutating data
- **NO Client Component mutation logic** (no `fetch` POST/PUT/DELETE calls)
- **NO API routes** of any kind for writing data
- Server Actions are the sole entry point for all create, update, and delete operations

### Data Access Layer (`/data` directory)

All database mutations MUST be executed through helper functions located in the `src/data/` directory. These functions serve as the single data access layer for the entire application — for both reads AND writes.

- Every mutation goes through a dedicated helper function in `/data`
- Helper functions MUST use **Drizzle ORM** to communicate with the Neon database
- **NO raw SQL** — always use Drizzle's query builder (`.insert()`, `.update()`, `.delete()`)
- Helper functions are imported and called from Server Actions, **never** directly from components

Example structure:
```
src/data/
  workouts.ts    # Workout-related queries AND mutations
  exercises.ts   # Exercise-related queries AND mutations
  sets.ts        # Set-related queries AND mutations
```

### Server Actions in Colocated `actions.ts` Files

All Server Actions MUST live in files named `actions.ts`, colocated with the route segment that uses them. Every `actions.ts` file MUST start with the `"use server"` directive.

- Server Actions are the **only** code that calls data helper functions for mutations
- Each `actions.ts` file lives alongside the `page.tsx` that consumes it
- Server Actions handle validation, auth, calling the data helper, and revalidation

Example structure:
```
src/app/
  workouts/
    page.tsx         # Server Component (UI)
    actions.ts       # Server Actions for this route
  workouts/[id]/
    page.tsx
    actions.ts
```

### Typed Parameters — No FormData

All Server Action parameters MUST be explicitly typed. **Never** use the `FormData` type as a parameter.

- Define a clear TypeScript type or interface for every action's input
- Pass structured, typed objects to Server Actions
- Client Components should collect form data and pass it as a typed object

### Zod Validation (CRITICAL)

Every Server Action MUST validate its arguments using **Zod** before doing anything else. No exceptions.

- Define a Zod schema for every action's input
- Parse the input with `schema.parse()` at the top of every action
- If validation fails, return an error — never proceed with invalid data
- Zod schemas should live in the same `actions.ts` file unless shared across multiple actions

### User Data Isolation (CRITICAL)

Every single data mutation MUST be scoped to the authenticated user. A user must ONLY be able to modify their own data. No exceptions.

- **Every** mutation helper function in `/data` MUST accept a `userId` parameter
- **Every** mutation MUST include a `WHERE userId = ?` condition for updates and deletes (via Drizzle's `eq()`)
- **Every** insert MUST include the authenticated `userId`
- **Never** trust client-supplied user IDs — always derive the user ID from the server-side session/auth inside the Server Action
- The Server Action is responsible for obtaining the authenticated `userId` from the session and passing it to the data helper

## Example Pattern

### Data Helper (mutation)
```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkout(userId: string, name: string) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name })
    .returning();
  return workout;
}

export async function deleteWorkout(userId: string, workoutId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

### Server Action
```ts
// src/app/workouts/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout, deleteWorkout } from "@/data/workouts";
import { revalidatePath } from "next/cache";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function createWorkoutAction(params: { name: string }) {
  const validated = createWorkoutSchema.parse(params);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await createWorkout(userId, validated.name);
  revalidatePath("/workouts");
}

const deleteWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
});

export async function deleteWorkoutAction(params: { workoutId: string }) {
  const validated = deleteWorkoutSchema.parse(params);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await deleteWorkout(userId, validated.workoutId);
  revalidatePath("/workouts");
}
```

### Client Component (calling the action)
```tsx
// src/app/workouts/workout-form.tsx
"use client";

import { createWorkoutAction } from "./actions";

export function WorkoutForm() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = new FormData(form).get("name") as string;
    await createWorkoutAction({ name });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

### No Redirects in Server Actions

**Never** use `redirect()` from `next/navigation` inside a Server Action. All redirects MUST be handled client-side after the Server Action call resolves.

- Use `router.push()` (from `useRouter`) in the Client Component after `await`ing the action
- Server Actions are responsible for data mutations, validation, and revalidation — **not navigation**

## Prohibited Patterns

```ts
// WRONG: Redirecting inside a Server Action
import { redirect } from "next/navigation";
export async function createWorkoutAction(params: { name: string }) {
  // ...mutation logic...
  redirect("/workouts"); // Must be handled client-side!
}

// WRONG: Route handler for mutations
// app/api/workouts/route.ts
export async function POST() { ... }

// WRONG: Using FormData as a parameter type
export async function createWorkoutAction(formData: FormData) {
  const name = formData.get("name");
}

// WRONG: No Zod validation
export async function createWorkoutAction(params: { name: string }) {
  // Directly using params without validation!
  await createWorkout(userId, params.name);
}

// WRONG: Calling data helpers directly from a component
export default async function Page() {
  await createWorkout(userId, "Leg Day"); // Must go through a Server Action!
}

// WRONG: Server Action not in an actions.ts file
// src/app/workouts/page.tsx
export async function createWorkoutAction() { ... } // Must be in actions.ts!

// WRONG: Raw SQL for mutations
await db.execute(sql`INSERT INTO workouts ...`);

// WRONG: Mutation without user scoping
export async function deleteWorkout(workoutId: string) {
  await db.delete(workouts).where(eq(workouts.id, workoutId)); // Missing userId filter!
}
```

## Required Patterns

```ts
// CORRECT: Typed params + Zod validation + auth + data helper
"use server";

const schema = z.object({
  name: z.string().min(1),
});

export async function createWorkoutAction(params: { name: string }) {
  const validated = schema.parse(params);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await createWorkout(userId, validated.name);
  revalidatePath("/workouts");
}

// CORRECT: Data helper with user scoping for mutations
export async function updateWorkout(userId: string, workoutId: string, name: string) {
  await db
    .update(workouts)
    .set({ name })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```
