# AGENTS.md - Repository Guidelines for Coding Agents

> **WARNING**: The `main` branch has diverged from production and is currently under active development. The app may be broken. See issue #68.

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
deno task test         # Run all tests (resets DB, requires server running)
deno task replacedb    # Reset database to clean test state
deno task p_g          # Generate Prisma client (output: prisma/client/)
deno task p_m          # Run Prisma migrations
deno task purgecss     # Purge unused CSS from static files
```

### Tool Calls

- **github**: Use the `gh` command, it is authorized.
- **browser**: Use `agent-browser` to test the application (see Browser Testing section below).

### Browser Testing with agent-browser

The app is mounted at `/watchtracker` (not at root `/`). The root path returns 404.

**Setup:**
```bash
# 1. Start Brave with remote debugging (if not already running)
brave-browser --remote-debugging-port=9222

# 2. Connect agent-browser to the running browser
agent-browser connect 9222
```

**Usage:**
```bash
# Open the app (always use /watchtracker path)
agent-browser open http://127.0.0.1:8000/watchtracker

# Get interactive elements
agent-browser snapshot -i

# Click, fill, etc.
agent-browser click @e1
agent-browser fill @e2 "test"
```

### Testing

```bash
deno task test          # Run all tests (resets DB, requires server running)
```

**Test Suite:** Located in `tests/` directory using Deno's built-in testing framework.

**Note:** `deno task test` automatically resets the database before running tests. To manually reset the database, use `deno task replacedb`.

**Before completing any task:**
1. Run `deno task check` - TypeScript type checking
2. Run `deno task lint` - Linting
3. Run `deno task test` - **All tests must pass**

> **IMPORTANT**: Tests require the server to be running (`deno task watch` in another terminal).

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

- **Files**: lowercase (`userservice.ts`, `watchrepository.ts`)
- **Classes**: PascalCase (`UserService`, `WatchRepository`)
- **Functions/Variables**: camelCase (`findUserById`, `userName`)
- **Types**: PascalCase (`SessionData`, `renderData`)

### Frontend Guidelines

- **HTML Styling**: Try hard to avoid HTML inline styles; rather stick to Bootstrap classes
- **JavaScript**: Avoid custom JavaScript as much as possible; try to solve as much as possible with HTMX and Alpine.js

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
const session = getSession(c);
const username = session.get("username");  // string | undefined
session.login(userId);                      // Set userId and createdAt
session.logout();                           // Delete session from Memcached and clear cookie
```

The session middleware is implemented in `middleware/session.ts` with:
- Cookie containing only an encrypted session ID
- Session data stored in Memcached
- Persistence only when session is modified

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
- **Prisma DATABASE_URL**: Prisma resolves relative paths from the `prisma/` folder, NOT the project root. The `DATABASE_URL` in `prisma/.env` uses `file:../watchtracker.db` which resolves to `./watchtracker.db` at project root. The runtime `.env` uses an absolute path for clarity.
- **Sessions**: Custom session middleware in `middleware/session.ts` with Memcached backend. Cookie contains only encrypted session ID.
- **Templates**: Handlebars with partials auto-loaded from `views/`
- **Time Zones**: Use `lib/timeZone.ts` with moment-timezone and luxon for TZ handling
- **Auth**: External API authentication via `lib/auth.ts`, test credentials: user=test, passwd=test
