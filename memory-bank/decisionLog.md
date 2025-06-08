# Decision Log

This file records architectural and implementation decisions using a list format.

## Decision

2025-05-31 13:49:52 - Memory Bank Architecture Implementation

## Rationale

Implemented a comprehensive Memory Bank system to maintain project context across different modes and sessions. This decision was made to:

- Ensure continuity of project understanding across different development sessions
- Provide a centralized location for tracking architectural decisions and progress
- Enable better collaboration and knowledge transfer
- Support the complex, multi-component architecture of Rybbit Analytics

## Implementation Details

- Created five core Memory Bank files: productContext.md, activeContext.md, progress.md, decisionLog.md, and systemPatterns.md
- Established initial project context based on projectBrief.md
- Set up tracking mechanisms for ongoing development activities
- Prepared framework for documenting future architectural decisions and patterns

[2025-06-08 06:53:49] - Docker Build Context Fix: Changed all build contexts from subdirectory (./client, ./server) to monorepo root (.) in docker-compose.cloud.yml and GitHub Actions workflow. Updated Dockerfiles to use correct paths from monorepo root (e.g., COPY client/package.json instead of COPY package.json). This resolves the shared package access issue while maintaining compatibility between local and CI builds.

[2025-06-08 11:54:00] - TRPC Authentication Integration Fix

## Decision

Fixed TRPC authentication integration to resolve "Unauthorized onrequest" error.

## Rationale

The TRPC client was not configured to include authentication headers/cookies, causing the server's onRequest hook to reject all TRPC requests as unauthorized. This prevented proper authentication flow between client and server.

## Implementation Details

- Updated TRPC client configuration in QueryProvider.tsx to include `credentials: 'include'` for cookie-based authentication
- Modified server-side TRPC context to integrate with existing auth system using `getSessionFromReq()`
- Added TRPC authentication middleware with `isAuthed` middleware for protected procedures
- Created `publicProcedure` and `protectedProcedure` for different authentication requirements
- Added `/trpc` to PUBLIC_ROUTES to allow TRPC to handle its own authentication instead of the global onRequest hook
- Enhanced error handling in TRPC context creation

## Impact

- TRPC requests now properly include authentication cookies
- Server can validate user sessions for TRPC procedures
- Proper separation between public and protected TRPC procedures
- Eliminates "Unauthorized onrequest" errors for authenticated users
