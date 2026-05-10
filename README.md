# FocusFlow (Focus App)

Full-stack productivity app: **NestJS** API + **PostgreSQL** (Prisma) + **Next.js** UI.

## Setup

1. Clone the repo and install dependencies from the **repository root**:

   ```bash
   npm install
   ```

2. Copy environment template and edit secrets:

   ```bash
   cp .env.example .env
   ```

   One `.env` at the repo root is used by both apps (`NEXT_PUBLIC_*` for the frontend, the rest for the API).

3. Start PostgreSQL and ensure `DATABASE_URL` matches. Then apply the schema:

   ```bash
   npm run prisma:push -w backend
   ```

4. Run **API** and **web** together:

   ```bash
   npm run dev
   ```

   - API: [http://localhost:3000/api](http://localhost:3000/api)  
   - App: [http://localhost:3001](http://localhost:3001)  

   Or run separately: `npm run dev:backend` / `npm run dev:frontend`.

## Repo layout

| Path       | Role        |
|-----------|-------------|
| `backend/` | NestJS API, Prisma |
| `frontend/` | Next.js (App Router) |

## License

Private / UNLICENSED (see `backend/package.json`).
