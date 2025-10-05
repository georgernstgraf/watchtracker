# Migration from Express to Hono

## Overview
Successfully migrated the watchtracker application from Express.js to Hono framework.

## Changes Made

### 1. Dependencies (`deno.json`)
**Removed:**
- `express` (npm:express@^5.1.0)
- `express-handlebars` (npm:express-handlebars@^8.0.3)
- `express-session` (npm:express-session@^1.18.2)
- `express-static-gzip` (npm:express-static-gzip@^3.0.0)
- `body-parser` (npm:body-parser@^2.2.0)
- `connect-memcached` (npm:connect-memcached@^2.0.0)
- `http-errors` (npm:http-errors@^2.0.0)

**Added:**
- `hono` (npm:hono@^4.9.9)
- `@hono/node-server` (npm:@hono/node-server@^1.13.7)

### 2. Main Application (`main.ts`)
- Replaced Express app initialization with Hono
- Converted Express middleware to Hono middleware
- Implemented custom Handlebars rendering within Hono context
- Replaced `express-handlebars` with direct Handlebars integration
- Changed server startup from Express's `app.listen()` to `@hono/node-server`'s `serve()`
- Updated error handling to use Hono's `app.onError()`
- Replaced static file serving with `@hono/node-server/serve-static`

### 3. Session Middleware (`middleware/session.ts`)
- Complete rewrite from Express-session to custom Hono middleware
- Implemented session management using:
  - Hono's `createMiddleware` factory
  - Cookie handling with `hono/cookie` (`getCookie`, `setCookie`)
  - Custom session store integration (memcached)
  - Session object with `destroy()` and `save()` methods
- Added TypeScript declarations for session in Hono context

### 4. Authentication Middleware (`middleware/enforceUser.ts`)
- Converted from Express middleware to Hono middleware using `createMiddleware`
- Changed from `req.session` to `c.get("session")`
- Changed from `res.locals.user` to `c.set("user", ...)`
- Updated error responses from `res.status().send()` to `c.text(..., status)`

### 5. Routers
**Session Router (`routers/sessionRouter.ts`):**
- Changed from `express.Router()` to `new Hono()`
- Removed `bodyParser` middleware (Hono handles this natively)
- Changed from `router.use()` to `router.route()`

**Auth Router (`routers/authRouter.ts`):**
- Changed from `express.Router()` to `new Hono()`
- Removed `bodyParser` and `session` middleware
- Updated middleware attachment to use Hono's pattern

### 6. Routes
All route files were updated with the following pattern changes:

**General Changes:**
- `express.Router()` → `new Hono()`
- `req` → `c` (Hono context)
- `res` → context methods
- `req.params.id` → `c.req.param("id")`
- `req.query.id` → `c.req.query("id")`
- `req.body` → `await c.req.parseBody()`
- `req.session` → `c.get("session")`
- `res.locals.x` → `c.set("x", ...)`
- `res.render()` → `c.get("render")()`
- `res.status().send()` → `c.text(..., status)`
- `req.headers["hx-request"]` → `c.req.header("hx-request")`

**Updated Files:**
- `routes/slash.ts`
- `routes/login.ts`
- `routes/logout.ts`
- `routes/watch.ts`
- `routes/measure.ts`
- `routes/caption.ts`
- `routes/user.ts`

### 7. Session Store (`lib/memcachedSessionStore.ts`)
- Removed dependency on `express-session`
- Created custom `SessionData` interface
- Removed inheritance from `express_session.Store`
- Maintained same functionality with memcached backend

### 8. Cookie Options (`lib/cookieOptions.ts`)
- No changes needed - still exports same options
- Used by both session middleware and logout route

### 9. Services (`service/userService.ts`)
- Updated `validateSessionUser()` parameter from `express_session.Session` to `SessionData`
- Removed `session.destroy()` call (not applicable in new pattern)
- Updated error messages accordingly

### 10. Type Definitions (`lib/types.ts` - NEW)
- Created new file to augment Hono's type system
- Declared custom context variables:
  - `session`: Session data with helper methods
  - `appPath`: Application path
  - `user`: Current user object
  - `watch`: Current watch data
  - `userWatches`: User's watches
  - `timeZones`: Available timezones
  - `edit`: Edit mode flag
  - `errors`: Error messages
  - `render`: Template rendering function

## Key Differences: Express vs Hono

### Middleware
- **Express**: `(req, res, next) => { ... }`
- **Hono**: `createMiddleware(async (c, next) => { ... })`

### Request/Response
- **Express**: Separate `req` and `res` objects
- **Hono**: Single `Context` object (`c`)

### Body Parsing
- **Express**: Requires `body-parser` middleware
- **Hono**: Built-in `c.req.parseBody()`

### Route Parameters
- **Express**: `req.params.id`, `req.query.id`
- **Hono**: `c.req.param("id")`, `c.req.query("id")`

### Response Methods
- **Express**: `res.render()`, `res.status().send()`, `res.json()`
- **Hono**: `c.html()`, `c.text()`, `c.json()` with status as parameter

### Sessions
- **Express**: Built-in with `express-session`
- **Hono**: Custom implementation required

## Benefits of Migration

1. **Lighter Dependencies**: Removed multiple Express-specific packages
2. **Better Type Safety**: Hono has excellent TypeScript support out of the box
3. **Modern API**: Cleaner, more intuitive API design
4. **Performance**: Hono is generally faster than Express
5. **Flexibility**: More control over middleware and request handling
6. **Edge-Ready**: Hono can run in various environments (Node.js, Deno, Cloudflare Workers, etc.)

## Testing Checklist

- [x] Server starts successfully
- [ ] Login functionality works
- [ ] Session management works correctly
- [ ] All routes respond correctly
- [ ] Static files are served
- [ ] Templates render properly
- [ ] Authentication/authorization works
- [ ] Watch CRUD operations work
- [ ] Measurement CRUD operations work
- [ ] User profile updates work

## Notes

- The custom session middleware maintains compatibility with the existing memcached session store
- Handlebars templates require no changes - only the rendering mechanism changed
- All business logic in services and repositories remains unchanged
- Database interactions via Prisma remain unchanged
