# Service Layer

This directory contains the business logic layer for the WatchTracker application. The service classes provide a clean API for business operations while using the repository classes for data access.

## Architecture

```
Routes -> Services -> Repositories -> Database
```

- **Routes**: Handle HTTP requests/responses and validation
- **Services**: Business logic and orchestration 
- **Repositories**: Data access and database operations
- **Database**: Prisma with SQLite

## Services

### UserService (`userService.ts`)
Handles user-related business operations:
- User creation and management
- User authentication workflows
- User preferences and settings
- Last watch tracking

### WatchService (`watchService.ts`)
Manages watch-related business logic:
- Watch creation and management
- Watch ownership validation
- Watch statistics and analytics
- User-watch relationships

### MeasurementService (`measurementService.ts`)
Handles measurement business operations:
- Measurement creation and validation
- Timing operations (start/stop)
- Measurement statistics
- Drift calculations
- Running measurement tracking

### WatchTrackerService (`watchTrackerService.ts`)
High-level orchestration service that combines operations across entities:
- Complete measurement recording workflow
- Dashboard data preparation
- Complex analytics and reporting
- Cross-entity operations

## Key Features

### Type Safety
All services use TypeScript with proper Prisma types to ensure type safety throughout the application.

### Error Handling
Services include proper error handling and validation, especially for user ownership and access control.

### Business Logic Separation
Complex business logic like drift calculations and multi-entity operations are centralized in services rather than scattered across routes.

### Reusable Operations
Common patterns like "get or create" and "ensure user owns resource" are encapsulated in service methods.

## Usage Examples

### Recording a Measurement
```typescript
import { WatchTrackerService } from "./service/index.ts";

const result = await WatchTrackerService.recordMeasurement({
    userName: "john_doe",
    watchName: "Rolex Submariner",
    value: 5, // seconds fast/slow
    isStart: false,
    comment: "After regulation"
});
```

### Getting User Dashboard
```typescript
import { WatchTrackerService } from "./service/index.ts";

const dashboard = await WatchTrackerService.getUserDashboard(userId);
// Returns: user info, watches with recent measurements, statistics
```

### Managing Watches
```typescript
import { WatchService } from "./service/index.ts";

// Create or get existing watch
const watch = await WatchService.getOrCreateWatch("Omega Speedmaster", userId);

// Get watch with all measurements and calculated drifts
const watchData = await WatchService.getUserWatchWithMeasurements(userId, watchId);
```

## Integration with Existing Code

The services are designed to work alongside the existing `classes/` proxy-based entities. The classes in `classes/` provide the proxy functionality for the dbEntity pattern, while these services provide clean business logic APIs that routes can use.

The services use the repositories in `repo/` for all database access, maintaining clean separation of concerns.