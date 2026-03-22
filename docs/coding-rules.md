# One Technology ERP Coding Rules

## General Rules
- Use TypeScript everywhere
- Keep code modular
- Do not mix backend business logic into frontend UI
- Prefer small focused files over giant files
- Use clear names that match business meaning
- Avoid hidden magic and hardcoded business rules

## Frontend Rules
- Use App Router patterns in Next.js
- Keep pages thin
- Extract reusable components
- Handle loading and error states
- Do not place inventory or pricing logic directly inside components

## Backend Rules
- Keep business logic in service-style modules
- Validate input before database actions
- Return structured JSON responses
- Separate routing from business logic
- Use explicit status handling

## Database Rules
- Use migrations
- Keep naming consistent
- Prefer explicit foreign keys
- Preserve historical snapshot data where required
- Never model stock only at product level when position-level data is needed

## Audit / Safety Rules
- Log sensitive actions
- Protect owner-only data
- Preserve role boundaries
- Never silently modify stock-sensitive records