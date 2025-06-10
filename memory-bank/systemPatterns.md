# System Patterns

This file documents recurring patterns and standards used in the project.
It is optional, but recommended to be updated as the project evolves.

## Coding Patterns

**Frontend Patterns:**

- Next.js App Router for routing and page structure
- TypeScript throughout for type safety
- Tailwind CSS for utility-first styling
- Shadcn components for consistent UI elements
- Tanstack Query for server state management
- Zustand for client state management
- Luxon for date/time operations

**Backend Patterns:**

- Fastify for high-performance HTTP server
- Drizzle ORM for type-safe database operations
- TypeScript for consistent typing across frontend and backend
- API route organization under `/api` directory structure

## Architectural Patterns

**Data Architecture:**

- PostgreSQL for relational data (users, organizations, sites, configurations)
- ClickHouse for high-volume analytics events and time-series data
- Clear separation between operational and analytical data stores

**Service Architecture:**

- Microservice-oriented with clear separation of concerns
- Docker containerization for consistent deployment
- Environment-based configuration management

**Authentication & Authorization:**

- Organization-based multi-tenancy
- Role-based access control
- Stripe integration for subscription management

## Testing Patterns

2025-05-31 13:49:59 - Initial system patterns documented based on project structure analysis
