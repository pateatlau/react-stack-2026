# React Stack - Technology Stack Documentation

## Overview

**react-stack** is a modern, production-ready React 19 project scaffold built with the latest tools and best practices. This document provides a comprehensive overview of the technology stack, including versions, purposes, and key features.

**Project Name:** react-stack  
**Version:** 0.1.0  
**Updated:** November 2025

---

### React 19.2.0

- **Features:**
  - Modern JSX transform (no need to import React)
  - Automatic batching for better performance
  - Built-in hooks like `useActionState`, `useFormStatus`
- **Documentation:** https://react.dev

- **Purpose:** Binds React components to the DOM
- **Key:** Client-side rendering with hydration support

### Vite 7.2.2

- **Purpose:** Lightning-fast build tool and dev server
- **Key Features:**
  - Optimized production builds with code splitting
  - Port: `5173` (dev) / Uses `serve` for production
- **Why Vite?** Significantly faster than webpack/Create React App
- **Documentation:** https://vitejs.dev

### Vite React Plugin 5.1.0

- **Features:**
  - React Fast Refresh for state-preserving HMR
  - JSX transform support

## State Management

### Zustand 5.0.8

- Hooks-based selectors
- **Use Case:** Counter demo in App.tsx
- **Example:**
  ```typescript
    count: 0,
  }));
  ```
- **Documentation:** https://github.com/pmndrs/zustand

---

## Data Fetching & Caching

### TanStack Query (React Query) 5.90.7

- **Purpose:** Server state management and data fetching
- **Key Features:**
  - Automatic caching and synchronization
  - Request deduplication
  - Error handling and retry logic
- **Why TanStack Query?** Eliminates manual loading/error states

### TanStack Query DevTools 5.90.2

- **Features:**
  - Inspect query state
  - Monitor cache updates
  - Included in development builds
- **Access:** Press Alt+Q to toggle DevTools panel

### Tailwind CSS 4.1.17

- **Purpose:** Utility-first CSS framework
- **Key Features:**
  - Dark mode support
- **Version 4 Specifics:**
  - Unified `@import 'tailwindcss'` syntax
  - Built-in CSS nesting
  - Lightning CSS for faster compilation
- **Configuration:** `tailwind.config.cjs`

### @tailwindcss/postcss 4.1.17

- **Enables:** Advanced CSS features with PostCSS processing

### Autoprefixer 10.4.22

- **Purpose:** Adds vendor prefixes to CSS
- **Ensures:** Cross-browser compatibility

## Component Library & UI

- **Purpose:** Copy-paste component library built on Radix UI
- **Features:**
  - Accessibility-first design
  - TypeScript support
  - Components pre-configured with import aliases
- **Usage:** `npx shadcn-ui@latest add [component]`

### Radix UI (via shadcn)

- **Purpose:** Unstyled, accessible component primitives
- **Used By:** Modal, Dialog, and other interactive components

- **Features:**
  - 400+ icons
  - Customizable size, color, stroke-width
  - Tree-shakeable (small bundle size)
- **Documentation:** https://lucide.dev

### class-variance-authority 0.7.1

- **Purpose:** Type-safe variant management for components
- **Use Case:** Creating flexible, maintainable component variations

- **Purpose:** Intelligent Tailwind CSS class merging

### tailwindcss-animate 1.0.7

- **Purpose:** Pre-built animations for Tailwind
- **Features:** Smooth transitions and keyframe animations

## Language & Type Safety

### TypeScript 5.9.3

- **Key Settings:**
  - `strict: true` (all type checking enabled)
  - `target: "ES2021"` (modern JavaScript output)
  - Path aliases: `@/*` → `src/*`
  - Better IDE autocomplete
  - Self-documenting code

## Developer Tools

### ESLint 9.39.1

- **Configuration:** `eslint.config.js` (flat config format)
- **Plugins:**
  - `@eslint/js` - Core ESLint rules
  - `eslint-plugin-react` - React-specific rules
  - `eslint-plugin-react-hooks` - React Hooks linting
  - `@typescript-eslint/eslint-plugin` - TypeScript rules
  - `@typescript-eslint/parser` - TypeScript parser
  - Detects implicit `any` types
  - Enforces best practices
- **Commands:**
  - `npm run lint` - Check for issues
  - `npm run lint:fix` - Auto-fix problems

- **Purpose:** Automatic code formatting
- **Settings:**
  - 100 character line width
  - Trailing commas (ES5 compatible)
  - Semicolons enabled
- **Commands:**

---

## Testing

- **Configuration:** `vitest.config.ts`
- **Features:**
  - ESM support
  - Zero-config compatibility with Vite
  - Watch mode for development
  - Coverage reporting
- **Commands:**
  - `npm run test` - Watch mode

### @testing-library/react 16.3.0

- **Purpose:** User-centric testing utilities
- **Philosophy:** Test components as users interact with them
  - `render()` - Render component
  - `screen.getByRole()` - Query by ARIA role
  - `userEvent` - Simulate user interactions

- **Matchers:**
  - `.toBeInTheDocument()`
  - `.toBeVisible()`
  - `.toHaveClass()`

### happy-dom 20.0.10

- **Purpose:** Lightweight DOM implementation for tests
- **Why Not jsdom?** jsdom had ESM compatibility issues with Node 20.16.0
- **Benefits:**
  - Faster test execution
  - Lower memory usage

### PostCSS 8.5.6

- **Purpose:** Transform CSS with JavaScript plugins
- **Plugins Used:**
  - `@tailwindcss/postcss` - Tailwind CSS processing

---

## Containerization & DevOps

- Base: Node 22-alpine
- Stage 1: Builder (npm ci, npm run build)
- Stage 2: Runtime (serve dist/)
- Port: 3000
- **Development Image:** Dockerfile.dev
  - Mounts source code with volumes
  - HMR enabled for hot reload
  - Port: 5173 (dev) + 24678 (Vitest)

  - Single service configuration
  - Health checks every 30s
  - Automatic restart on failure

- **Development:** `docker-compose.dev.yml`
  - Volume mounts for live code updates
  - HMR WebSocket support
  - Interactive terminal mode
  - Perfect for local development

---

## Project Structure

```
react-stack/
├── src/
│   ├── main.tsx           # Application entry point
│   ├── App.tsx            # Root component
│   ├── styles/
│   │   └── index.css      # Global styles + Tailwind directives
│   ├── components/        # Reusable UI components
│   ├── stores/            # Zustand stores
│   ├── lib/               # Utilities and helpers
│   └── test/              # Test setup files
├── vite.config.ts         # Vite configuration + HMR settings
├── vitest.config.ts       # Vitest configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.cjs    # Tailwind CSS configuration
├── postcss.config.cjs     # PostCSS configuration
├── eslint.config.js       # ESLint configuration (flat config)
├── .prettierrc.json       # Prettier configuration
├── Dockerfile             # Production Docker image
├── Dockerfile.dev         # Development Docker image
├── docker-compose.yml     # Production orchestration
├── docker-compose.dev.yml # Development orchestration
├── .dockerignore          # Docker build context exclusions
└── package.json           # Dependencies and scripts
```

---

## NPM Scripts

### Development

```bash
npm run dev              # Start dev server (port 5173)
npm run build           # Build for production
npm run preview         # Preview production build
```

### Code Quality

```bash
npm run lint            # Check code quality
```

npm run test:ui # Open interactive test dashboard
npm run test:coverage # Generate coverage report

```bash

```

---

## Development Workflow

### Local Development

```bash
# Start dev server with HMR
npm run dev

# Edit files in src/
# Browser automatically refreshes (state preserved!)

# Run tests
npm run test

# Check code quality
npm run lint
npm run format
```

### Docker Development (Recommended for team consistency)

```bash
# Open http://localhost:5173 in browser
# Stop when done (Ctrl+C)
npm run docker:compose:down
```

### Production Build

```bash
# Build optimized bundle
npm run build

# Test production build locally
npm run preview

# Build and run Docker container
npm run docker:run
```

- Full TypeScript strict mode
- Type-aware linting with ESLint
- IDE autocomplete support
- Vite for ultra-fast builds
- Code splitting and lazy loading ready

### ✅ Developer Experience

- Fast Refresh for instant feedback
- TypeScript dev server

- ESLint + Prettier integration
- React Hooks linting

### ✅ Accessibility

- Radix UI accessible primitives
- ARIA role best practices

- Optimized bundle size

## Version Compatibility

| Package        | Version | Status                  |
| -------------- | ------- | ----------------------- |
| React          | 19.2.0  | ✅ Latest               |
| Vite           | 7.2.2   | ✅ Latest               |
| TypeScript     | 5.9.3   | ✅ Latest               |
| TanStack Query | 5.90.7  | ✅ Latest v5            |
| Zustand        | 5.0.8   | ✅ Latest v5            |
| Tailwind CSS   | 4.1.17  | ✅ Latest v4            |
| ESLint         | 9.39.1  | ✅ Latest (flat config) |
| Vitest         | 4.0.8   | ✅ Latest               |

---

## Dependency Management

### Production Dependencies (7)

Slim runtime dependencies focused on core functionality.

### Development Dependencies (24)

Comprehensive tooling for development, testing, and quality assurance.

### Zero Breaking Changes

- All packages use compatible version ranges
- `npm audit` shows 0 vulnerabilities
- Regular updates with semantic versioning

---

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+ (Node 20.16.0+ supported with warnings)
- npm 10.8.1+
- Docker & Docker Compose (for containerized development)

### Installation

```bash
cd react-stack
npm install
```

### Quick Start

```bash
# Development
npm run dev

# Or with Docker
npm run docker:compose:dev
```

### First Build

```bash
npm run build
npm run preview
```

---

## Troubleshooting

### Vite Node Version Warning

If you see: "You are using Node.js 20.16.0. Vite requires Node.js version 20.19+ or 22.12+"

**Solution:** While the warning appears, the project works on 20.16.0. Upgrade to 20.19.0+ for full compatibility.

### Docker Image Not Found

```bash
# Solution: Build image first
npm run docker:build:dev
npm run docker:run:dev
```

### HMR Not Working in Browser

1. Check WebSocket connection in DevTools → Network → WS
2. Verify port 5173 is accessible
3. Review HOT_RELOAD.md for troubleshooting guide

### Tests Failing

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Run tests again
npm run test:ui  # Interactive dashboard
```

---

## Resources

- **React:** https://react.dev
- **Vite:** https://vitejs.dev
- **TypeScript:** https://www.typescriptlang.org
- **TanStack Query:** https://tanstack.com/query/latest
- **Zustand:** https://github.com/pmndrs/zustand
- **Tailwind CSS:** https://tailwindcss.com
- **shadcn/ui:** https://ui.shadcn.com
- **Vitest:** https://vitest.dev
- **Docker:** https://docs.docker.com

---

## Contributing

When adding new dependencies:

1. Prefer modern, well-maintained packages
2. Check compatibility with current stack
3. Run `npm audit` to verify no vulnerabilities
4. Update this documentation

---

## License

This project scaffold is provided as-is for educational and commercial use.

---

**Last Updated:** November 2025  
**Maintainer:** React Stack Team
