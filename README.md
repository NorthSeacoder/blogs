# Astro Blog

A static blog site built with [Astro](https://astro.build/) and Tailwind CSS. This project is configured for static output and includes Pagefind for local search after builds.

## Prerequisites

- Node.js 20.3 or newer (the project has been tested on Node 20).
- [pnpm](https://pnpm.io/) as the package manager (specified via `packageManager` in `package.json`).

## Getting started

Install dependencies and start the development server from the project root:

```bash
pnpm install
pnpm dev
```

The dev server binds to `0.0.0.0` for compatibility with containers; visit the printed URL (default `http://localhost:4321`).

If you previously saw an error like `Cannot find module .../src/index.ts`, ensure you are on this version of the code and use the `pnpm dev` script above. The project entry is defined by Astro in `src/pages/`, not `src/index.ts`.

## Building

To generate the static site and build the search index:

```bash
pnpm build
```

The static files are emitted to `dist/` and Pagefind indexes the output.

## Additional scripts

- `pnpm preview` – serve the built site from `dist/`.
- `pnpm lint` – run ESLint across the project.
- `pnpm format` – format files with Prettier.

## Project structure

Key directories include:

- `src/pages/` – page routes (e.g., `index.astro`, `posts/`).
- `src/layouts/` – shared layouts.
- `src/components/` – reusable UI components.
- `src/content/` – content collections.
- `src/styles/` – global styles.

Refer to `astro.config.mjs` and `tsconfig.json` for framework and TypeScript settings.
