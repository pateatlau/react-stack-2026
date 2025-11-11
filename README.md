# React Stack Scaffold

# React Stack Scaffold

A modern React 19 scaffold powered by Vite, TanStack Query v5, Zustand v5, Tailwind CSS v4, and shadcn/ui.

## Features

- **Vite + TypeScript + React 19**
- **TanStack Query v5**: QueryClient setup in `src/lib/queryClient.ts`
- **Zustand v5**: Example store in `src/stores/useCounter.ts`
- **Tailwind CSS v4**: Configured via `tailwind.config.cjs` and `postcss.config.cjs`
- **shadcn/ui**: Ready for component templates (integrates with Tailwind and Radix UI)
- **Sample Components**: Minimal `Button` and `App.tsx` demonstrating Zustand + TanStack Query

## Quick Start

1. **Install dependencies**
   ```sh
   npm install
   ```
2. **Start the development server**
   ```sh
   npm run dev
   ```

## shadcn/ui Integration

- `shadcn` provides UI component templates that work with Tailwind and Radix UI.
- To initialize shadcn and add components:
  ```sh
  npx shadcn@latest init
  ```
  Follow the prompts to add desired components. Files will be added under `src/components` and Tailwind config will be updated as needed.
- The scaffold includes Radix UI and helper dependencies in `package.json` for easy integration.

## Internal Links

Documentation files:

- [TECH_STACK.md](docs/TECH_STACK.md)
- [DOCKER.md](docs/DOCKER.md)
- [HOT_RELOAD.md](docs/HOT_RELOAD.md)

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
