# Team Task Manager

Premium full-stack team task manager built with Next.js, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## Features

- Signup and login with JWT session cookies
- Role-based access control for Admin and Member users
- Projects, teams, and tasks with Prisma relationships
- Kanban task board with drag-and-drop status updates
- Overdue task detection and productivity analytics
- Responsive dashboard with charts, notifications, activity feed, and search/filter
- Zod and React Hook Form validation
- Shadcn-inspired reusable UI primitives
- Railway deployment configuration

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Prisma 7
- PostgreSQL by default, MySQL-compatible schema if you switch the datasource provider and adapter
- Framer Motion
- Recharts
- dnd-kit
- Sonner

## Getting Started

1. Install dependencies.

```bash
npm install
```

2. Copy `.env.example` to `.env` and set the values for your database and JWT secret.

3. Generate the Prisma client.

```bash
npm run prisma:generate
```

4. Push the schema to your database.

```bash
npm run db:push
```

5. Seed demo data.

```bash
npm run db:seed
```

6. Start the dev server.

```bash
npm run dev
```

## Seed Accounts

Use these demo accounts after seeding:

- Admin: `admin@taskflow.dev` / `Password123!`
- Member: `member@taskflow.dev` / `Password123!`

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Generate Prisma client and create a production build
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run db:push` - Push the schema to the database
- `npm run db:seed` - Seed demo data

## Deployment

The repository includes `railway.toml` for Railway deployment. Configure the following environment variables in Railway:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`

## Prisma Notes

- Prisma 7 uses `prisma.config.ts` for datasource URLs.
- The runtime client uses the PostgreSQL adapter from `@prisma/adapter-pg`.
- If you want to switch to MySQL, update `prisma/schema.prisma`, `prisma.config.ts`, and the adapter used in `src/lib/prisma.ts` and `prisma/seed.mjs`.

## Project Structure

- `src/app` - App Router pages and REST route handlers
- `src/components` - UI, auth, landing, and dashboard components
- `src/lib` - Prisma, auth, validation, permissions, and data mappers
- `prisma` - Schema and seed script
