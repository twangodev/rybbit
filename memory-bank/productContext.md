# Product Context

This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md (if provided) and all other available project-related information in the working directory. This file is intended to be updated as the project evolves, and should be used to inform all other modes of the project's goals and context.

## Project Overview

**Rybbit Analytics** is an open source web analytics platform designed to be a more intuitive but still extremely powerful alternative to Google Analytics. The project launched in May 2025 and has achieved 6k GitHub stars, indicating strong community adoption.

## Project Goal

Create and maintain a comprehensive, user-friendly web analytics platform that provides powerful insights while remaining more intuitive than existing solutions like Google Analytics.

## Key Features

- Open source web analytics platform
- Intuitive user interface with powerful analytics capabilities
- Real-time analytics and performance monitoring
- User behavior tracking and analysis
- Event tracking and goal conversion
- Multi-site management with organizational structure
- Subscription-based business model with Stripe integration

## Overall Architecture

**Frontend (/client):**

- Next.js framework with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- Nivo.rocks for data visualization
- Tanstack Query for data fetching
- Tanstack Table for data tables
- Zustand for state management
- Luxon for date/time handling

**Backend (/server):**

- Fastify web framework
- Luxon for date/time operations
- Drizzle ORM for database operations
- Stripe for payment processing
- TypeScript throughout

**Documentation (/docs):**

- Nextra framework for documentation and landing page

**Data Storage:**

- PostgreSQL for relational data (users, organizations, sites, etc.)
- ClickHouse for high-volume events data and analytics
- Docker Compose for orchestration

**Infrastructure:**

- Docker containerization
- Self-hosting capabilities
- Cloud deployment options

2025-05-31 13:49:27 - Initial Memory Bank creation with project context from projectBrief.md
