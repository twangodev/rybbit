# Rybbit Analytics

Rybbit is an open source web analytics platform that is meant to be a more intuitive but still extremely powerful alternative to Google Analytics. It launched in May 2025 and has 6k Github stars.

See README.md for a general overview and docs/src/content for more info

- docker-compose.yml is the docker setup for Rybbit
- frontend lives in /client and uses Next.js, Tailwind, Shadcn, Nivo.rocks, Tanstack Query, Tanstack Table, Zustand and Luxon
- backend lives in /server and uses Fastify, Luxon, Drizzle, and Stripe
- documentation and landing page live in /docs and uses Nextra
- we use Postgres for all relational data and Clickhouse for events data
