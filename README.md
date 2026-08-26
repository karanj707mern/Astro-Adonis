# Astro + Adonis Monorepo

This repository uses [Turborepo](https://turbo.build/) to manage the Astro frontend and AdonisJS backend in a single workspace.

## Structure

```
├── apps/
│   ├── backend/          # AdonisJS v7 API (Prisma + PostgreSQL)
│   └── frontend/         # Astro + React SPA
├── packages/
│   ├── types/            # Shared TypeScript types (Prisma-generated, etc.)
│   ├── eslint-config/    # Shared ESLint flat config base
│   └── tsconfig/         # Shared base TypeScript config
├── package.json
├── turbo.json
└── .gitignore
```

## Prerequisites

- Node.js >= 22
- npm >= 10

## Install

```bash
npm install
```

This installs dependencies for all workspace apps and packages using npm workspaces.

## Scripts

Run any of these from the repo root:

```bash
# Start both apps in dev mode (requires two terminals or a process manager)
npm run dev

# Build all apps
npm run build

# Lint all apps
npm run lint

# Type-check all apps
npm run typecheck

# Format all apps with Prettier
npm run format

# Clean all apps
npm run clean
```

## Running individual apps

```bash
# Backend (AdonisJS)
cd apps/backend
npm run dev

# Frontend (Astro)
cd apps/frontend
npm run dev
```

## Environment variables

- Backend: copy `apps/backend/.env.example` → `apps/backend/.env`
- Frontend: copy `apps/frontend/.env.example` → `apps/frontend/.env`

## Docker

Backend Docker image is built from `apps/backend/Dockerfile`.

## Shared packages

- `packages/types` — central place for types shared between frontend and backend (e.g. Prisma-generated types).
- `packages/eslint-config` — base ESLint flat config extended by individual apps.
- `packages/tsconfig` — base TypeScript config extended by individual apps.
