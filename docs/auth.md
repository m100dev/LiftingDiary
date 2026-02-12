# Authentication

## Provider

This application uses **Clerk** (`@clerk/nextjs`) for all authentication. Do not introduce any other auth library or custom auth solution.

## Setup

### ClerkProvider

The root layout (`src/app/layout.tsx`) must wrap the entire app in `<ClerkProvider>`. This is already configured — do not remove it or add a second provider.

### Middleware

Clerk middleware lives at `src/proxy.ts` and uses `clerkMiddleware()` from `@clerk/nextjs/server`. It runs on all routes except static files and Next.js internals. Do not modify the matcher unless a new route pattern genuinely requires it.

### Environment Variables

Clerk requires the following environment variables (stored in `.env.local`, never committed):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

## Server-Side Authentication

### Getting the User ID

In **Server Components** and **Server Actions**, always obtain the authenticated user via Clerk's `auth()` function:

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
```

- `userId` is `string | null` — always check for `null` before proceeding
- If `userId` is `null`, redirect to the home page or return an appropriate response
- **Never** trust a user ID passed from the client — always derive it from `auth()` on the server

### Standard Auth Guard Pattern

Every authenticated page or action must follow this pattern:

```ts
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  // userId is now guaranteed to be a string
  // Pass it to data helpers for user-scoped queries
}
```

## Client-Side Components

Use Clerk's pre-built components for all auth UI. Do not build custom sign-in/sign-up forms.

| Component | Purpose |
|---|---|
| `<SignInButton>` | Triggers the sign-in flow (use `mode="modal"`) |
| `<SignUpButton>` | Triggers the sign-up flow (use `mode="modal"`) |
| `<SignedIn>` | Renders children only when the user is authenticated |
| `<SignedOut>` | Renders children only when the user is not authenticated |
| `<UserButton>` | Displays the user avatar with account management dropdown |

All components are imported from `@clerk/nextjs`:

```ts
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
```

## Prohibited Patterns

```ts
// WRONG: Custom sign-in form
<form onSubmit={handleSignIn}>...</form>

// WRONG: Using a different auth library
import { getSession } from "next-auth/react";

// WRONG: Trusting client-supplied userId
export default async function Page({ searchParams }) {
  const { userId } = await searchParams; // Never do this
}

// WRONG: Skipping the null check
const { userId } = await auth();
const data = await getData(userId); // userId could be null!

// WRONG: Using currentUser() when only the ID is needed
import { currentUser } from "@clerk/nextjs/server";
const user = await currentUser(); // Unnecessary — use auth() instead
```

## Required Patterns

```ts
// CORRECT: Server-side auth guard
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }
  const data = await getData(userId);
  return <ClientComponent data={data} />;
}

// CORRECT: Clerk components for auth UI
<SignedOut>
  <SignInButton mode="modal" />
</SignedOut>
<SignedIn>
  <UserButton />
</SignedIn>
```
