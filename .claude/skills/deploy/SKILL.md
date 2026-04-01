---
name: deploy
description: Use when deploying the app
---
# Deploy Skill

Backend (Railway):
1. cd backend && npm run build → check for errors
2. Confirm MONGODB_URI and JWT_SECRET are in Railway env vars
3. Push to main

Frontend (Vercel):
1. cd frontend && npm run build → check for errors
2. Confirm NEXT_PUBLIC_API_URL points to Railway backend URL
3. Push to main
```

---

## 🚀 Step-by-Step Build Prompts

Once your `.claude/` folder is ready, use these prompts **in order**:
```
# 1. Scaffold the monorepo
"Create a monorepo with a NestJS backend in /backend and 
Next.js 14 frontend in /frontend. Add shared tsconfig."

# 2. MongoDB connection
"In the backend, set up @nestjs/mongoose connection using 
MONGODB_URI from .env. Add to app.module.ts."

# 3. First feature module
"Use backend-architect subagent to scaffold the full 
agents module with CRUD endpoints and MongoDB schema."

# 4. Auth system
"Use backend-architect subagent to add JWT auth — 
register, login endpoints, JwtAuthGuard, and user schema."

# 5. Frontend dashboard
"Use frontend-builder subagent to create the agents 
dashboard page in /frontend/app/dashboard/agents/page.tsx 
fetching from the NestJS API."

# 6. Review before shipping
"Use mongodb-optimizer subagent to review all schemas.
Then use security-reviewer subagent to check auth routes."