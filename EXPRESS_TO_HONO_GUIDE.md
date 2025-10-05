# Express to Hono Quick Reference

## Request Object

| Express | Hono |
|---------|------|
| `req.params.id` | `c.req.param("id")` |
| `req.query.param` | `c.req.query("param")` |
| `req.body` | `await c.req.parseBody()` |
| `req.headers["name"]` | `c.req.header("name")` |
| `req.session` | `c.get("session")` |

## Response Object

| Express | Hono |
|---------|------|
| `res.send("text")` | `c.text("text")` |
| `res.status(404).send("Not Found")` | `c.text("Not Found", 404)` |
| `res.json({data})` | `c.json({data})` |
| `res.render("template", data)` | `c.get("render")("template", data)` |
| `res.locals.key = value` | `c.set("key", value)` |
| `res.cookie("name", "value", opts)` | `setCookie(c, "name", "value", opts)` |

## Middleware

**Express:**
```typescript
function middleware(req, res, next) {
    // do something
    next();
}
```

**Hono:**
```typescript
import { createMiddleware } from "hono/factory";

const middleware = createMiddleware(async (c, next) => {
    // do something
    await next();
});
```

## Router

**Express:**
```typescript
import express from "express";
const router = express.Router();
router.get("/path", handler);
export default router;
```

**Hono:**
```typescript
import { Hono } from "hono";
const router = new Hono();
router.get("/path", handler);
export default router;
```

## Route Handler

**Express:**
```typescript
router.get("/user/:id", (req, res) => {
    const id = req.params.id;
    const data = req.body;
    res.json({ id, data });
});
```

**Hono:**
```typescript
router.get("/user/:id", async (c) => {
    const id = c.req.param("id");
    const data = await c.req.parseBody();
    return c.json({ id, data });
});
```

## Session Access

**Express:**
```typescript
const user = req.session.user;
req.session.user = newUser;
req.session.destroy();
```

**Hono:**
```typescript
const session = c.get("session");
const user = session.user;
session.user = newUser;
await session.destroy();
```

## Error Handling

**Express:**
```typescript
app.use((err, req, res, next) => {
    res.status(err.status || 500).send(err.message);
});
```

**Hono:**
```typescript
app.onError((err, c) => {
    const status = (err as any).status || 500;
    return c.text(err.message, status);
});
```

## Context Variables (Hono)

Access custom context variables:
```typescript
// Get
const value = c.get("variableName");

// Set
c.set("variableName", value);
```

Common context variables in this app:
- `session` - Session data with destroy/save methods
- `user` - Current authenticated user
- `appPath` - Application base path
- `render` - Template rendering function
- `watch`, `userWatches`, `timeZones`, `edit`, `errors` - View data
