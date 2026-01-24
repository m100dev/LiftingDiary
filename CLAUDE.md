# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Next.js 16.1.4** with App Router (not Pages Router)
- **React 19.2.3** with React Compiler enabled for automatic optimization
- **TypeScript** with strict mode
- **Tailwind CSS 4** via PostCSS
- **ESLint 9** with Next.js core-web-vitals and TypeScript rules

## Architecture

### Directory Structure

- `src/app/` - App Router pages and layouts
- `public/` - Static assets

### Key Patterns

- **Path Alias**: Use `@/*` to import from `src/*` (e.g., `import { Component } from '@/components/Component'`)
- **Styling**: Tailwind CSS with dark mode support via `prefers-color-scheme`
- **Fonts**: Geist and Geist Mono loaded via `next/font/google` in root layout
