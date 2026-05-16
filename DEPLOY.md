Deployment checklist and local setup notes

This branch adds a small deployment checklist and local dev fallback notes.

Steps to run locally:

- Copy `.env.example` to `.env.local` and set:
  - `DATABASE_URL` — a reachable Postgres URL for production; for local dev you can use `file:./dev.db`.
  - `MONGO_URL` — your MongoDB Atlas connection string.
  - `JWT_SECRET` — a random secret.

- For local SQLite fallback:
  - If `DATABASE_URL` is `file:./dev.db`, run `npx prisma generate` and `npx prisma db push`.
  - Then run `npm run dev`.

Health checks:

- `GET /api/health` reports whether Postgres and Mongo connections succeed.

Notes:

- The production schema uses PostgreSQL. Switching to SQLite is intended for local development only.
