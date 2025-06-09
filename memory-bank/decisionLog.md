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

[2025-06-08 16:43:52] - Enhanced authedFetchWithError to use axios with query parameter support

## Rationale

User requested to replace all instances of authedFetch with authedFetchWithError and wanted to use axios specifically for its params support. This decision was made to:

- Provide clean object-based query parameter support instead of manual string template literals
- Maintain consistency with axios patterns for HTTP requests
- Prepare for eventual replacement of all authedFetch instances
- Leverage axios's built-in parameter serialization and error handling

## Implementation Details

- Added axios dependency to client package.json
- Modified authedFetchWithError to accept query parameters as objects
- Maintained overloaded function signature for backward compatibility
- Used axios withCredentials: true to maintain authentication behavior
- Function now supports both query params as objects and full axios config objects

[2025-06-08 16:46:58] - Simplified authedFetchWithError function signature

## Rationale

User feedback indicated they didn't like the overloading behavior and wanted the 2nd argument to always be params instead of config. This decision was made to:

- Provide a cleaner, more predictable API
- Remove complexity from function signature detection
- Make the second parameter always represent query parameters
- Keep axios configuration as the third parameter for advanced use cases

## Implementation Details

- Removed overloaded function signature detection logic
- Second parameter is now always `params?: Record<string, any>`
- Third parameter remains `config: AxiosRequestConfig = {}` for advanced axios options
- Simplified function body to always treat second argument as query parameters
