# Testing Suite for WatchTracker

## Overview

This testing suite uses Deno's built-in testing framework to test the backend API endpoints.

## Running Tests

### Prerequisites

1. Start the development server:
   ```bash
   deno task watch
   ```

2. In another terminal, run the tests:
   ```bash
   deno task test
   ```

## Test Structure

### Test Files

- **`helpers.ts`** - Shared test utilities and helper functions
- **`public_routes_test.ts`** - Tests for public routes (/, /login, /logout)
- **`auth_test.ts`** - Tests for authentication and authorization
- **`watch_routes_test.ts`** - Tests for watch CRUD operations
- **`measure_routes_test.ts`** - Tests for measurement CRUD operations

### Test Data

Tests use real data from the production database:

**Test Users:**
- `test` / `test`
- `grafg` / `grafg`

**Test Watches (user: grafg):**
- Noramis (ID: `clwbuij9a000442678gpc27x7`) - used for measurement tests
- Manero (ID: `cm9s81bh3000r13la5wqn10fj`) - used for read-only tests
- And 10 others...

### Helper Functions

#### `fetchWithAuth(path, options?, username?)`
Makes an HTTP request with optional authentication.

#### `loginUser(username, password)`
Logs in a test user and stores the session cookie.

#### `logoutUser(username)`
Logs out a user and clears their session.

#### `assertStatus(response, expected)`
Asserts that the response has the expected status code.

#### `assertBodyContains(response, expected)`
Asserts that the response body contains expected text.

#### `assertHasSessionCookie(response)`
Asserts that the response has a Set-Cookie header.

### Test Organization

Tests are organized by route type:

**Read-Only Tests:** Safe to run anytime, don't modify data
- `GET /` - login page
- `GET /watches` - list watches
- `GET /watch/:id` - watch details
- `POST /measure/:id` - creates measurement (safe with test data)

**Write Operation Tests:** Skipped by default (marked with `.skip()`)
- `POST /watch` - create watch
- `PATCH /watch/:id` - update watch
- `DELETE /watch/:id` - delete watch
- `PATCH /measure/:id` - update measurement
- `DELETE /measure/:id` - delete measurement

## Database Considerations

### ⚠️ Important: Write Operations

The write operation tests (`POST`, `PATCH`, `DELETE`) are **skipped by default** because they modify the database. To run these tests:

1. **Option A: Use a test database**
   - Set up a separate test database
   - Run migrations: `deno task pmr`
   - Run tests against test database

2. **Option B: Reset database after tests**
   - Run `deno task pmr` to reset database
   - Restore from backup: `deno task replacedb`

3. **Option C: Create isolated test data**
   - Modify tests to create test-specific watches/measurements
   - Clean up after test completion

### Running Write Tests

To enable write tests, remove `.skip` from the test definitions:

```typescript
// Change this:
it.skip("POST /watch creates a new watch", async () => {

// To this:
it("POST /watch creates a new watch", async () => {
```

## Test Coverage

### Public Routes
- [x] GET / - returns login page when not authenticated
- [x] POST /login - success with valid credentials
- [x] POST /login - failure with invalid credentials
- [x] POST /logout - clears session

### Authentication
- [x] Protected routes require authentication (401)
- [x] Authenticated access works (200)
- [x] Ownership validation returns 403 for wrong user

### Watch Routes
- [x] GET /watches - returns list of watches
- [x] GET /watches?sort= - sorting works
- [x] GET /watch/:id - returns watch details
- [x] GET /watch/:id - returns 403 for invalid ID
- [ ] POST /watch - creates new watch (skipped)
- [ ] PATCH /watch/:id - updates watch (skipped)
- [ ] DELETE /watch/:id - deletes watch (skipped)

### Measurement Routes
- [x] POST /measure/:id - creates measurement
- [ ] PATCH /measure/:id - updates measurement (skipped)
- [ ] DELETE /measure/:id - deletes measurement (skipped)

## Notes

- Tests require a running server
- Tests use real database with production data
- Session cookies are automatically managed between requests
- Resource sanitization is disabled for HTTP endpoint tests
- Write operations are skipped to protect production data
