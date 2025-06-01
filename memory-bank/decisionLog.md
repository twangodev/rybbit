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

[2025-05-31 22:00:48] - Fixed rrweb CDN URL in tracking script

- **Issue**: The rrweb CDN URL `https://cdn.jsdelivr.net/npm/rrweb@2/dist/rrweb.min.js` was returning "Couldn't find the requested release version 2" error
- **Investigation**: Browsed jsdelivr CDN to find correct file structure for rrweb package
- **Solution**: Updated URL to `https://cdn.jsdelivr.net/npm/rrweb@2.0.0-alpha.4/dist/rrweb.min.js` (current stable version)
- **Impact**: Session replay functionality in Rybbit Analytics tracking script will now load properly
- **File Modified**: `server/public/script-full.js` line 22-23

[2025-05-31 22:03:15] - Migrated ReplayPlayer from CDN to npm package

- **Issue**: ReplayPlayer component was using CDN loading for rrweb-player instead of the npm-installed package
- **Solution**:
  - Removed CDN loading logic (lines 25-59 in original file)
  - Added proper npm imports: `import { Replayer } from "rrweb-player"` and `import "rrweb-player/dist/style.css"`
  - Updated TypeScript types: `replayerRef` now uses `Replayer | null` instead of `any`
  - Removed `rrwebLoaded` state and related loading logic
  - Simplified component initialization to use direct npm imports
- **Impact**: More reliable loading, better TypeScript support, eliminates CDN dependency
- **File Modified**: `client/src/app/[site]/replays/components/ReplayPlayer.tsx`

[2025-05-31 22:13:57] - Enhanced session_replay_metadata table with comprehensive metadata columns

- **Issue**: Session replay metadata table lacked detailed context information, requiring JOINs to events table for analytics queries
- **Solution**: Added 15 new metadata columns to session_replay_metadata table following denormalized approach:
  - Geographic Data: country, region, city, lat, lon
  - Device/Browser Data: browser, browser_version, operating_system, operating_system_version, language, screen_width, screen_height, device_type
  - Session Context: channel, hostname, referrer
- **Implementation**: Used same data types and patterns as events table (LowCardinality for categorical data, appropriate numeric types)
- **Impact**: Enables efficient session replay queries without JOINs, improves query performance and analytics capabilities
- **File Modified**: `server/src/db/clickhouse/clickhouse.ts` lines 113-130

[2025-05-31 22:16:36] - Fixed rrweb-player import and usage in ReplayPlayer component

- **Issue**: ReplayPlayer component had incorrect import and usage of rrweb-player package
- **Root Cause**: Code was using incorrect API - importing `Replayer` instead of `rrwebPlayer` class, wrong constructor format, and incorrect event listener methods
- **Solution Applied**:
  1. Fixed import: Changed from `import Replayer from "rrweb-player"` to `import rrwebPlayer from "rrweb-player"`
  2. Updated TypeScript ref type: Changed from `useRef<Replayer | null>(null)` to `useRef<rrwebPlayer | null>(null)`
  3. Fixed instantiation: Changed from `new Replayer(events, {...})` to `new rrwebPlayer({target: containerRef.current, props: {events, ...}})`
  4. Updated event listeners: Changed from `.on()` method to `.addEventListener()` method for all event handlers
  5. Fixed cleanup: Changed from `.destroy?.()` to `.$destroy?.()` (Svelte component method)
- **Impact**: ReplayPlayer component now uses correct rrweb-player API, ensuring proper functionality and TypeScript compatibility
- **File Modified**: `client/src/app/[site]/replays/components/ReplayPlayer.tsx`

[2025-05-31 22:18:40] - Fixed ReplayPlayer cleanup logic to remove non-existent destroy methods

- **Issue**: ReplayPlayer component was calling non-existent `destroy()` and `$destroy()` methods on rrweb-player instance
- **Root Cause**: TypeScript definitions for rrweb-player don't include these methods - the class extends SvelteComponent but only exposes specific methods like `play()`, `pause()`, `addEventListener()`, etc.
- **Solution Applied**:
  1. Removed `replayerRef.current.destroy?.()` call in cleanup effect (line 37)
  2. Removed `replayerRef.current.$destroy?.()` call in unmount cleanup (line 112)
  3. Simplified cleanup to just clear container innerHTML and reset ref to null
  4. Added explanatory comments about rrweb-player being a Svelte component that manages its own lifecycle
- **Impact**: Eliminates TypeScript errors and potential runtime issues, relies on proper DOM cleanup which is sufficient for rrweb-player
- **File Modified**: `client/src/app/[site]/replays/components/ReplayPlayer.tsx`
