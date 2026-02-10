# Watch Deviation Tracker

A multi-tenant web application for tracking the accuracy of mechanical watches over time.

## Overview

Watch Deviation Tracker allows watch enthusiasts to track their mechanical watch accuracy by recording deviation measurements. The application supports multiple users, each with multiple watches, and calculates drift statistics based on measurement history.

## Tech Stack

- **Runtime**: [Deno](https://deno.land/) with TypeScript
- **Web Framework**: [Hono](https://hono.dev/) - Fast, lightweight web framework
- **Database**: SQLite with [Prisma 6](https://www.prisma.io/) ORM
- **Frontend**: [HTMX](https://htmx.org/) + [Handlebars](https://handlebarsjs.com/) templates + [Bootstrap 5](https://getbootstrap.com/)
- **Session Management**: Memcached-backed cookie sessions
- **Authentication**: External API verification (with test users in development)

## Architecture

The application follows a layered architecture pattern:

```text
┌─────────────────────────────────────┐
│  HTTP Requests                      │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  Routes Layer                       │
│  - Request handling                 │
│  - Input validation                 │
│  - HTMX response formatting         │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  Service Layer                      │
│  - Business logic                   │
│  - Data transformation              │
│  - Drift calculations               │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  Repository Layer                   │
│  - Prisma ORM wrappers              │
│  - Database queries                 │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  Database Layer                     │
│  - SQLite                           │
└─────────────────────────────────────┘
```

### Directory Structure

```text
lib/           # Utilities: config, db, auth, hbs, views, session store, types
middleware/    # Session middleware, ownership validation
routers/       # Router setup (sessionRouter, authRouter)
routes/        # Route handlers (watch, measure, login, etc.)
service/       # Business logic layer
repo/          # Data access layer (Prisma wrappers)
prisma/        # Schema, migrations, generated client
static/        # Static assets (CSS, JS, images)
views/         # Handlebars templates (.hbs)
```

## Setup & Installation

### Prerequisites

- [Deno](https://deno.land/) 2.x or later
- [SQLite](https://www.sqlite.org/)
- [Memcached](https://memcached.org/) (for session storage)

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=file:../watchtracker.db

# Server Configuration
APP_HOST=0.0.0.0
APP_PORT=8000
APP_PATH=/watchtracker
APP_URL=http://localhost:8000/watchtracker

# Authentication
AUTH_API_URL=https://your-auth-api.com/verify

# Session Cookies
COOKIE_NAME=watchtracker_sid
COOKIE_SECRET=your-secret-key-here
COOKIE_MAX_AGE="40 weeks"

# Memcached (Session Store)
MEMCACHE_HOST=127.0.0.1
MEMCACHE_PORT=11211
MEMCACHE_PREFIX=watchtracker

# Environment
DENO_ENV=development
```

**Note:** For detailed development guidelines, see [AGENTS.md](./AGENTS.md).

### Database Setup

1. Generate Prisma client:

   ```bash
   deno task pg
   ```

2. Run migrations:

   ```bash
   deno task pmd
   ```

### Development

Start the development server with hot reload:

```bash
deno task watch
```

The server will be available at `http://localhost:8000/watchtracker`

### Available Commands

```bash
deno task pg          # Generate Prisma client
deno task pmd         # Run Prisma migrations (dev)
deno task pms         # Check migration status
deno task pmr         # Reset database
deno task lint        # Run linter
deno task check       # TypeScript type checking
deno task start       # Production server
deno task watch       # Development server with hot reload
deno task purgecss    # Optimize CSS
```

## Authentication

The application supports two authentication modes:

### Development

- Test users: `test/test` and `grafg/grafg`
- Credentials are checked locally before falling back to API

### Production

- All authentication is handled via the external API
- No hardcoded test users

## Data Model

**User**: Application users with timezone preference
**Watch**: Mechanical watches owned by users
**Measurement**: Time deviation recordings for watches

See `prisma/schema.prisma` for the complete schema definition.

## Development Guidelines

For detailed development guidelines, code style, and architecture patterns, please refer to [AGENTS.md](./AGENTS.md).

Key points:

- Follow the layered architecture (routes → service → repo → db)
- Use class-based static methods for Service and Repository layers
- Run `deno task lint` and `deno task check` before committing
- HTMX requests return partials, regular requests return full pages

## Changelog

- Implement environment-based authentication for test users
- Fix lint errors and dev script task name
- upgrades
- fixed
- init migration for prod
- issue #52: Convert measurements table to CSS Grid layout
- Implement typed wrappers for Handlebars templates - issue #63
- Security: Implement resource ownership middleware - issue #76
- UX/Error: Implement centralized HTMX-aware error handler - issue #75
- DevOps: Verify Prisma client generation in dev workflow - issue #74
- Refactor: Consolidate data enrichment logic in WatchService - issue #72
- DX: Monitor static/ directory in deno task watch - issue #73
- Cleanup: Remove obsolete classes_old/ directory - issue #71
- Add pms task for prisma migrate status
- Fix NaN in Entry date: use getWatchForDisplay in user and slash routes - issue #69
- Fix deviation input UX: use placeholder instead of value, add views to watch task - issue #54
- Fix deviation input cursor issue with onfocus select - issue #54
- Fix broken app: routing, session, measurements display - issue #68
- #68 fix routing: trailing slash redirect, static files path, add warning to AGENTS.md
- #67 add agent-browser workflow and dev instructions to AGENTS.md

## Contributing

Please see [AGENTS.md](./AGENTS.md) for contribution guidelines and development workflow.

## License

[Add your license information here]
