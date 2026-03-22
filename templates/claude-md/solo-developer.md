# CLAUDE.md — Solo Developer

## Who I Am

Solo developer shipping products. I wear every hat — frontend, backend, deployment, support. Time is my scarcest resource. Prioritize speed and pragmatism over perfection.

## Communication

- Short and direct. Skip preamble.
- Show me the code, not the explanation of the code.
- If something is a bad idea, say so before doing it. Don't execute a bad plan politely.
- When I ask "should I X?" give me a recommendation, not a list of tradeoffs.

## Universal Rules

- NEVER push without explicit permission.
- NEVER commit .env files, API keys, or credentials.
- Use TodoWrite for any task with 3+ steps.
- Commit message format: `type: short description` (feat, fix, refactor, docs, chore, test)

## Development Preferences

- **Stack**: [YOUR STACK HERE — e.g., "Next.js 14, TypeScript, Tailwind, Prisma, PostgreSQL"]
- **Package manager**: [npm/yarn/pnpm/bun]
- **Testing**: Write tests for business logic and API endpoints. Skip tests for simple CRUD and UI components unless I ask.
- **Error handling**: Handle errors at the boundary (API routes, form submissions). Don't wrap every function in try/catch.
- **Types**: Strict TypeScript. No `any` unless there's a documented reason.

## Workflow

- Read the relevant code before suggesting changes. Don't guess at the structure.
- Prefer editing existing files over creating new ones.
- When adding a feature: implement it, then run the existing tests, then tell me what to test manually.
- Don't refactor code you weren't asked to touch.
- Don't add comments to code that's self-explanatory.

## Deployment

- [YOUR DEPLOYMENT APPROACH — e.g., "Vercel for frontend, Railway for backend" or "Self-hosted on VPS with Docker Compose"]
- Always check that environment variables are documented in `.env.example` when adding new ones.

## When I Say...

- "ship it" → commit and push
- "looks good" → proceed with next step
- "hold on" → stop and wait for further input
- "clean this up" → refactor for readability, don't change behavior
