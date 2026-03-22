# One Technology ERP Tech Stack

## Frontend
- Next.js
- TypeScript
- Tailwind CSS

## Backend
- Cloudflare Workers
- TypeScript

## Data Layer
- Cloudflare D1

## Supporting Storage
- Cloudflare KV
- Cloudflare R2

## Project Structure
- apps/web -> frontend app
- apps/api -> backend/API worker
- packages/shared -> shared types/constants/helpers
- packages/db -> schema and migrations
- docs -> planning and prompts

## Development Method
- build in small vertical slices
- one focused feature per implementation prompt
- backend logic must stay out of frontend UI components
- sensitive operations must be auditable