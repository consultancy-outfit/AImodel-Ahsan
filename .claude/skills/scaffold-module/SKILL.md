---
name: scaffold-module
description: Use when creating a new NestJS feature module from scratch
---
# Scaffold NestJS Module

Steps:
1. Create folder: backend/src/{module-name}/
2. Generate files: module, controller, service, schema, DTOs
3. Register module in app.module.ts
4. Add Mongoose.forFeature([{ name: X.name, schema: XSchema }])
5. Write basic CRUD endpoints: GET /, GET /:id, POST /, PATCH /:id, DELETE /:id
6. Test with: cd backend && npm run start:dev