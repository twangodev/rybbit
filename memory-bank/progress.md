# Progress

This file tracks the project's progress using a task list format.

## Completed Tasks

2025-05-31 13:49:45 - Memory Bank initialization completed

- Created productContext.md with comprehensive project overview
- Created activeContext.md for tracking current status
- Established project context from projectBrief.md

## Current Tasks

- Awaiting specific development tasks or architectural decisions from user
- Ready to analyze codebase and provide architectural guidance
- Prepared to document decisions and track progress

## Next Steps

- Identify current development priorities
- Analyze existing codebase for potential improvements
- Document architectural patterns and decisions
- Support ongoing development and feature implementation

2025-06-01 11:40:32 - Added skeleton loading state to SiteSelector component

- Implemented conditional rendering for loading state when site data is falsy
- Created skeleton with matching dimensions and styling
- Added pulse animation for better UX during data fetching

2025-06-01 11:42:55 - Added skeleton loading state to SiteSelectorContent dropdown items

- Implemented conditional rendering for loading state when sites data is falsy
- Created 3 skeleton dropdown items with matching structure and styling
- Added pulse animation and prevented interactions during loading state

2025-06-01 13:13:52 - Optimized getSitesFromOrg authorization checks for concurrent execution

- Converted sequential admin and member checks to run concurrently using Promise.all()
- Simplified conditional logic while maintaining same authorization behavior
- Improved performance by reducing total execution time for authorization

2025-06-01 13:14:48 - Further optimized getSitesFromOrg by adding sites query to concurrent execution

- Extended Promise.all to include sites data query alongside authorization checks
- Now runs admin check, member check, and sites query all concurrently
- Additional performance improvement by eliminating sequential sites data fetch

2025-06-01 13:16:19 - Completed full optimization of getSitesFromOrg with all 5 database operations concurrent

- Added organization owner query and organization info query to Promise.all
- Removed duplicate sequential queries that were previously executed separately
- Now runs admin check, member check, sites query, owner query, and org info query all concurrently
- Maximum performance optimization achieved - reduced from 5 sequential to 1 concurrent operation

2025-06-06 21:28:35 - Enhanced normalizeOrigin function to remove all subdomain prefixes

- Modified normalizeOrigin function in server/src/utils.ts to handle all subdomains, not just "www"
- Added support for IP addresses and localhost (returned as-is)
- Implemented logic for multi-level TLDs (e.g., .co.uk, .com.au)
- Function now extracts the root domain from any subdomain structure
- Examples: api.example.com → example.com, subdomain.site.co.uk → site.co.uk

2025-06-06 21:29:55 - Updated domain normalization in trackEvent.ts validateOrigin function

- Imported normalizeOrigin function from utils.ts into trackEvent.ts
- Replaced manual www. prefix removal with enhanced normalizeOrigin function
- Now uses consistent subdomain removal logic across both origin and site domain validation
- Ensures proper domain matching for sites with subdomains in tracking validation

2025-06-06 21:33:45 - Improved normalizeOrigin function with Public Suffix List and better input handling

- Added psl (Public Suffix List) dependency for reliable multi-level TLD detection
- Removed unnecessary URL parsing when input is already a hostname
- Function now accepts both URLs and hostnames as input
- Uses PSL to accurately determine registrable domains (handles all TLDs correctly)
- Added robust fallback logic for edge cases
- Eliminates hardcoded TLD list that was incomplete and unreliable

2025-06-06 23:20:00 - Completed creation of new integration guides

- Completed: Create Squarespace integration guide ([`docs/src/content/integrations/squarespace.mdx`](docs/src/content/integrations/squarespace.mdx:1))
- Completed: Create Wix integration guide ([`docs/src/content/integrations/wix.mdx`](docs/src/content/integrations/wix.mdx:1))
- Completed: Create Hugo integration guide ([`docs/src/content/integrations/hugo.mdx`](docs/src/content/integrations/hugo.mdx:1))
- Completed: Create Jekyll integration guide ([`docs/src/content/integrations/jekyll.mdx`](docs/src/content/integrations/jekyll.mdx:1))
- Completed: Create Drupal integration guide ([`docs/src/content/integrations/drupal.mdx`](docs/src/content/integrations/drupal.mdx:1))
- Completed: Create Laravel integration guide ([`docs/src/content/integrations/laravel.mdx`](docs/src/content/integrations/laravel.mdx:1))
- Created: [`docs/src/content/integrations/_meta.json`](docs/src/content/integrations/_meta.json:1) to include new guides in sidebar.

2025-06-07 00:16:00 - Completed review and standardization of integration guides

- Standardized script tags (URL, `async defer`) across all relevant guides in `docs/src/content/guides/`.
- Updated Next.js guide ([`docs/src/content/guides/react/next-js.mdx`](docs/src/content/guides/react/next-js.mdx:1)) with SPA page view tracking callout and custom event tracking section.
- Significantly expanded Shopify guide ([`docs/src/content/guides/shopify.mdx`](docs/src/content/guides/shopify.mdx:1)) with e-commerce event tracking.
- Expanded Framer guide ([`docs/src/content/guides/framer.mdx`](docs/src/content/guides/framer.mdx:1)) and Webflow guide ([`docs/src/content/guides/webflow.mdx`](docs/src/content/guides/webflow.mdx:1)) with notes on SPA behavior and custom event tracking.
- Corrected minor inconsistencies in Hugo and Jekyll guides.

2025-06-08 19:13:40 - Added past 24-hour mode support to performance analytics hooks

- Modified [`useGetPerformanceTimeSeries.ts`](client/src/api/analytics/useGetPerformanceTimeSeries.ts:1) to support last-24-hours mode
- Modified [`useGetPerformanceOverview.ts`](client/src/api/analytics/useGetPerformanceOverview.ts:1) to support last-24-hours mode
- Implemented conditional query parameter logic using pastMinutesStart/pastMinutesEnd for 24-hour mode
- Updated query keys to differentiate between "past-minutes" and "date-range" modes
- Maintained backward compatibility with existing date-range based queries
- Achieved consistency across all performance analytics hooks

[2025-01-08 19:23:28] - **COMPLETED: Analytics Hooks Code Deduplication**

- **Task**: Eliminate duplicated query parameter logic across analytics hooks
- **Status**: ✅ COMPLETED
- **Work Done**:
  - Created centralized [`getQueryParams`](client/src/api/utils.ts:1) utility function
  - Refactored 7 analytics hook files to use the new utility
  - Reduced code duplication from ~20 lines per file to 3 lines
  - Enhanced utility to support custom past minutes parameters for complex cases
- **Files Modified**:
  - [`client/src/api/utils.ts`](client/src/api/utils.ts:1) - Added `getQueryParams` utility
  - [`useGetPerformanceTimeSeries.ts`](client/src/api/analytics/useGetPerformanceTimeSeries.ts:1) - Refactored
  - [`useGetPerformanceOverview.ts`](client/src/api/analytics/useGetPerformanceOverview.ts:1) - Refactored
  - [`useGetPerformanceByDimension.ts`](client/src/api/analytics/useGetPerformanceByDimension.ts:1) - Refactored
  - [`useSingleCol.ts`](client/src/api/analytics/useSingleCol.ts:1) - Refactored with custom params
  - [`usePaginatedSingleCol.ts`](client/src/api/analytics/usePaginatedSingleCol.ts:1) - Refactored
  - [`useInfiniteSingleCol.ts`](client/src/api/analytics/useInfiniteSingleCol.ts:1) - Refactored
  - [`useGetPageTitles.ts`](client/src/api/analytics/useGetPageTitles.ts:1) - Refactored
- **Impact**: Significantly improved code maintainability and reduced duplication across analytics layer

[2025-01-08 19:31:22] - **COMPLETED: Additional Hook Consolidation - useGetOverview**

- **Task**: Combine `useGetOverview` and `useGetOverviewPastMinutes` functions
- **Status**: ✅ COMPLETED
- **Work Done**:
  - Enhanced [`useGetOverview`](client/src/api/analytics/useGetOverview.ts:1) to accept optional `pastMinutesStart` and `pastMinutesEnd` parameters
  - Integrated with [`getQueryParams`](client/src/api/utils.ts:1) utility for consistent query parameter handling
  - Maintained backward compatibility by keeping `useGetOverviewPastMinutes` as a wrapper function
  - Implemented intelligent query key generation based on parameters used
- **Benefits**:
  - Eliminated code duplication between two similar hooks
  - Simplified API while maintaining backward compatibility
  - Consistent with other refactored analytics hooks
  - Single source of truth for overview data fetching
- **Total Refactoring Summary**: 8 analytics hook files now use the centralized `getQueryParams` utility, significantly reducing code duplication across the entire analytics layer

[2025-01-08 19:37:23] - **COMPLETED: Bug Fix and Callsite Updates for useGetOverview**

- **Task**: Fix TypeScript error and update all callsites to use consolidated `useGetOverview` hook
- **Status**: ✅ COMPLETED
- **Bug Fixed**:
  - TypeScript error: "Argument of type 'number' is not assignable to parameter of type 'Record<string, any>'"
  - Root cause: Incorrect function call signature for [`getQueryParams`](client/src/api/utils.ts:38)
  - Solution: Fixed parameter structure in [`useGetOverview`](client/src/api/analytics/useGetOverview.ts:1)
- **Callsites Updated**: 4 files updated to use consolidated hook
  - [`useGetOverviewWithInView.ts`](client/src/api/analytics/useGetOverviewWithInView.ts:1) - Updated import and comment
  - [`SiteCard.tsx`](client/src/components/SiteCard.tsx:1) - Replaced `useGetOverviewPastMinutes` with `useGetOverview`
  - [`Overview.tsx`](client/src/app/[site]/main/components/MainSection/Overview.tsx:1) - Replaced 2 instances with `useGetOverview`
- **Final Status**: All TypeScript errors resolved, hook consolidation complete across entire codebase
- **Total Impact**: 9 analytics hook files now use centralized patterns, eliminating 100+ lines of duplicated code

[2025-06-08 22:08:11] - **COMPLETED: SiteSelector UI Enhancement - Dropdown to Popover Conversion**

- **Task**: Convert SiteSelector from dropdown menu to popover with enhanced functionality
- **Status**: ✅ COMPLETED
- **Work Done**:
  - Replaced [`DropdownMenu`](client/src/components/ui/dropdown-menu.tsx:1) components with [`Popover`](client/src/components/ui/popover.tsx:1) components
  - Enhanced site display to show sessions in past 24 hours using [`sessionsLast24Hours`](client/src/api/admin/sites.ts:60) field
  - Integrated [`AddSite`](client/src/app/components/AddSite.tsx:1) component at bottom of popover for new site creation
  - Added [`ChevronDown`](https://lucide.dev/icons/chevron-down) icon to trigger button
  - Implemented scrollable container (`max-h-96 overflow-y-auto`) for better UX with many sites
  - Enhanced skeleton loading states to match new layout structure
- **Files Modified**:
  - [`client/src/app/[site]/components/Sidebar/SiteSelector.tsx`](client/src/app/[site]/components/Sidebar/SiteSelector.tsx:1) - Complete UI transformation
- **Features Added**:
  - Site domain display with sessions count (e.g., "example.com - 42 sessions (24h)")
  - Inline new site creation capability
  - Improved visual hierarchy and spacing
  - Better responsive design with scrolling support
- **Impact**: Enhanced user experience for site management with richer information display and streamlined site creation workflow

[2025-06-10 23:34:29] - **COMPLETED: Enhanced 404 Not Found Page**

- **Task**: Create a basic 404 page for [`client/src/app/not-found.tsx`](client/src/app/not-found.tsx:1)
- **Status**: ✅ COMPLETED
- **Work Done**:
  - Replaced basic "404" text with comprehensive, user-friendly 404 page
  - Added analytics-themed icon using [`BarChart3`](https://lucide.dev/icons/bar-chart3) from Lucide React
  - Implemented responsive design with proper spacing and typography
  - Added actionable navigation buttons using [`Button`](client/src/components/ui/button.tsx:1) component
  - Included "Go to Dashboard" and "Go Back" options for user convenience
  - Added help links to documentation and GitHub repository
  - Maintained consistency with project's design system (Tailwind CSS, Shadcn UI)
  - Updated page title to "Rybbit · Page Not Found" for better SEO
- **Design Features**:
  - Centered layout with proper vertical spacing
  - Dark mode support using Tailwind's dark: variants
  - Responsive button layout (stacked on mobile, side-by-side on desktop)
  - Professional error messaging with helpful context
  - Brand-consistent styling matching the analytics platform theme
- **Impact**: Users encountering 404 errors now have a professional, helpful experience with clear navigation options and access to support resources

[2025-06-12 21:10:00] - **COMPLETED: Web Vitals Opt-in Flag Implementation**

- **Task**: Add web vitals flag to disable Web Vitals collection unless explicitly enabled
- **Status**: ✅ COMPLETED
- **Work Done**:
  - Added `data-web-vitals` attribute support to [`server/public/script-full.js`](server/public/script-full.js:1)
  - Web Vitals library loading now conditional based on flag setting
  - Modified `initWebVitals()` function to respect the enableWebVitals flag
  - Updated documentation in [`docs/src/content/script.mdx`](docs/src/content/script.mdx:1)
  - Added comprehensive Web Vitals section with usage examples
  - Added `data-track-outbound` to documentation table for completeness
- **Key Changes**:
  - Web Vitals are now **disabled by default** (opt-in behavior)
  - Users must set `data-web-vitals="true"` to enable performance metrics collection
  - Reduced default script overhead by not loading Web Vitals library unless needed
  - Enhanced documentation with clear usage examples and explanations
- **Impact**: Improved default performance while giving users explicit control over Web Vitals collection

[2025-06-13 23:46:38] - **COMPLETED: Added Web Vitals Option to ScriptBuilder Component**

- **Task**: Add Web Vitals toggle option to the ScriptBuilder component in site settings
- **Status**: ✅ COMPLETED
- **Work Done**:
  - Added `webVitals` state variable (defaults to `false` to match opt-in behavior)
  - Added `data-web-vitals="true"` attribute to generated script when enabled
  - Created Web Vitals toggle section in the UI with proper labeling and description
  - Positioned the option logically after the track query parameters section
  - Used consistent styling and layout patterns matching existing options
- **Files Modified**:
  - [`client/src/components/SiteSettings/ScriptBuilder.tsx`](client/src/components/SiteSettings/ScriptBuilder.tsx:1) - Added Web Vitals configuration option
- **Features Added**:
  - Toggle switch for enabling/disabling Web Vitals collection
  - Clear description explaining what metrics are collected (LCP, CLS, INP, FCP, TTFB)
  - Conditional script attribute generation (`data-web-vitals="true"` only when enabled)
  - Consistent with existing opt-in behavior (disabled by default)
- **Impact**: Users can now easily enable Web Vitals performance metrics collection through the ScriptBuilder UI, matching the functionality documented in the script documentation

[2025-06-19 19:28:32] - **COMPLETED: API Documentation Language Examples Fixes**

- **Task**: Fix potential issues in language examples in API documentation
- **Status**: ✅ COMPLETED
- **Issues Fixed**:
  1. **Screen Pixel Type Clarification**: Updated API documentation to specify "logical pixels (density-independent pixels)" for screenWidth/screenHeight parameters
  2. **Swift Example Modernization**:
     - Replaced deprecated `UIScreen.main` with modern `UIWindowScene.screen` approach
     - Added proper API key validation to prevent empty string errors
     - Updated example data to match server-side examples for consistency
  3. **Kotlin Example Consistency**:
     - Changed from physical pixels to logical pixels using density conversion
     - Updated example data to match server-side examples
  4. **Flutter Example Improvements**:
     - Changed from physical pixels to logical pixels using devicePixelRatio
     - Moved app launch tracking from `build()` method to `initState()` to prevent multiple triggers
     - Updated example data to match server-side examples
     - Changed from StatelessWidget to StatefulWidget for proper lifecycle management
- **Files Modified**:
  - [`docs/src/content/api.mdx`](docs/src/content/api.mdx:78) - API parameter documentation and all mobile platform examples
- **Impact**: Improved consistency across platform examples, modernized deprecated APIs, and clarified pixel type expectations for mobile developers
