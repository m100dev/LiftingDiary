# UI Coding Standards

## Component Library

**Only shadcn/ui components are permitted in this project.** Do not create custom UI components. All UI elements must come from the shadcn/ui library.

- Install shadcn/ui components as needed via the CLI (`npx shadcn@latest add <component>`)
- Compose pages and features by combining shadcn/ui components
- If a UI pattern is not covered by shadcn/ui, combine existing shadcn/ui components to achieve it — do not build custom components

## Date Formatting

Use **date-fns** for all date formatting.

Dates must follow ordinal day format:

```
1st Sep 2025
2nd Sep 2025
3rd Aug 2026
10th Feb 2026
```

Use the date-fns `format` function with a custom ordinal day:

```ts
import { format } from "date-fns";

function formatDate(date: Date): string {
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
  return `${day}${suffix} ${format(date, "MMM yyyy")}`;
}
```
