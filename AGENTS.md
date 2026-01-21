# AGENTS.md - Repository Guidelines for Coding Agents

## Project Overview

- **Runtime**: Deno with TypeScript
- **Framework**: Hono web framework
- **Database**: SQLite with Prisma 6 ORM
- **Frontend**: Handlebars templates + Bootstrap 5 + HTMX
- **Session**: Memcached-backed cookie sessions
- **Architecture**: Layered (middleware → routers → routes → service → repo → database)

## Build & Development Commands

```bash
deno task watch        # Development server with file watching
deno task start        # Production server
deno task check        # TypeScript checking across all modules
deno task lint         # Lint all TypeScript files
deno task p_g          # Generate Prisma client (output: prisma/client/)
deno task p_m          # Run Prisma migrations
deno task purgecss     # Purge unused CSS from static files
```

### Tool Calls

- **github**: Use the `gh` command, it is authorized.
- **browser**: Use `agent-browser` command on `http://localhost:8000/watchtracker` to test the application.

### Testing

No formal test framework configured. Use browser or REST client (`route.rest`) for testing.

## Code Style Guidelines

### Formatting (from deno.json)

- **Indentation**: 4 spaces (for .ts, .hbs, .html, .css files)
- **Line width**: 150 characters max
- **Semicolons**: Required
- **Quotes**: Double quotes
- **File extensions**: Always include `.ts` for local imports

### Import Organization

```typescript
// 1. External dependencies
import { Hono, Context } from "hono";
// 2. Prisma types (via import map)
import type { Prisma, User, Watch } from "generated-prisma-client";
// 3. Local lib imports
import { prisma } from "../lib/db.ts";
import * as config from "../lib/config.ts";
// 4. Service/repository imports
import { UserService, WatchService } from "../service/index.ts";
```

### Naming Conventions

- **Files**: lowercase (`userService.ts`, `watchRepository.ts`)
- **Classes**: PascalCase (`UserService`, `WatchRepository`)
- **Functions/Variables**: camelCase (`findUserById`, `userName`)
- **Types**: PascalCase (`SessionData`, `renderData`)

## Architecture Patterns

### Route Handler Structure

```typescript
export default function serve_under_for(path: string, router: typeof authRouter) {
    router.get(`${path}/:id`, async (c) => {
        const session = c.get("session");
        const username = session.username;
        return c.html(render("templateName", Object.assign({ data }, renderData)));
    });
}
```

### Service Layer (Class-based Static Methods)

```typescript
export class UserService {
    static async ensureUserExists(userName: string): Promise<User> {
        const existing = await UserRepository.findByName(userName);
        return existing ?? await UserRepository.create({ name: userName });
    }
}
```

### Repository Layer (Prisma Wrapper)

```typescript
export class WatchRepository {
    static async findUnique(where: Prisma.WatchWhereUniqueInput): Promise<Watch | null> {
        return await prisma.watch.findUnique({ where, include: { user: true } });
    }
}
```

### Session Middleware

```typescript
const session = c.get("session");
const username = session.username;  // string | undefined
session.login(userName);            // Set username
session.logout();                   // Clear session
```

## Error Handling

```typescript
try {
    const result = await someOperation();
    return c.html(render("template", { data: result }));
} catch (e: unknown) {
    const error = e as Error;
    console.log("Error:", error.message);
    return c.text(error.message, 500);
}
```

HTTP status codes: 401 (unauthorized), 403 (forbidden), 422 (validation), 500 (server error).

## Directory Structure

```
lib/           # Utilities: config, db, hbs, auth, session store, types
middleware/    # Session middleware
routers/       # Router setup (sessionRouter, authRouter)
routes/        # Route handlers (watch, measure, login, etc.)
service/       # Business logic layer (class-based)
repo/          # Data access layer (Prisma wrappers)
prisma/        # Schema, migrations, generated client
static/        # Static assets (CSS, JS, images)
views/         # Handlebars templates (.hbs)
```

## Development Workflow

1. **Before coding**: Run `deno task check` to ensure type safety
2. **During development**: Use `deno task watch` for auto-reload
3. **After changes**: Run `deno task check && deno task lint`
4. **Database changes**: Run `deno task p_g` after schema changes
5. **Handling git**: Never commit or push unless asked to do so
6. **Working on issues**: If work on an issue is completed, make a comment on it

> **IMPORTANT**: Linting must always succeed before completion of any task. Run `deno task lint` and fix all issues before marking work as complete.

> **IMPORTANT**: Every commit message must include a reference to the GitHub issue it addresses (e.g., "issue #13"). If there is no existing issue, ask the user to create one or provide the issue number.

## Special Notes

- **Prisma Client**: Generated to `prisma/client/`, imported via `generated-prisma-client` alias
- **Sessions**: Cookie-based with memcached backend (see `lib/memcachedSessionStore.ts`)
- **Templates**: Handlebars with partials auto-loaded from `views/`
- **Time Zones**: Use `lib/timeZone.ts` with moment-timezone and luxon for TZ handling
- **Auth**: External API authentication via `lib/auth.ts`, test credentials: user=test, passwd=test
