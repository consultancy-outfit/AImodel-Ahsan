# Project: NexusAI Dashboard

## Stack
- Frontend: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- Backend: NestJS + Mongoose (MongoDB ODM)
- Database: MongoDB Atlas (cloud) or local MongoDB
- Auth: JWT + Passport.js (NestJS Guards)
- API: REST (NestJS controllers) or GraphQL optional
- Deployment: Vercel (frontend) + Railway or Render (backend)

## Monorepo Structure
nexus-app/
├── frontend/        → Next.js app
├── backend/         → NestJS app
├── CLAUDE.md
└── .claude/

## Backend Conventions (NestJS)
- Modules: feature-based (agents/, users/, skills/)
- Each feature: module.ts, controller.ts, service.ts, schema.ts, dto/
- Use class-validator for all DTOs
- Use @nestjs/mongoose with Mongoose schemas (not TypeORM)
- MongoDB document IDs: always use _id as string
- Use NestJS Guards for auth, never raw middleware

## Frontend Conventions (Next.js)
- Use App Router (not Pages Router)
- Server Components by default, Client Components only when needed
- API calls via /lib/api.ts using fetch with base URL from .env
- Use shadcn/ui components
- TypeScript strict mode on

## Environment Variables
Backend (.env):
  MONGODB_URI=mongodb+srv://...
  JWT_SECRET=...
  PORT=3001

Frontend (.env.local):
  NEXT_PUBLIC_API_URL=http://localhost:3001

## What NOT to do
- Never use TypeORM (use Mongoose only)
- Never put DB logic in controllers (use services)
- Never use `any` in TypeScript
- Don't mix App Router and Pages Router