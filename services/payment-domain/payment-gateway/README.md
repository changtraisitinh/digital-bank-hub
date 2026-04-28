# Payment Gateway

Edge service for synchronous payment APIs.

## Owns

- request authentication and authorization
- idempotency key validation
- correlation IDs and tracing headers
- request schema validation
- payment initiation and status lookup endpoints

## Does Not Own

- provider-specific logic
- business workflow orchestration
- ledger posting

## Local Structure

- `api/`: OpenAPI fragments, example payloads, and edge endpoint docs.
- `docs/`: operational notes and API behavior.
- `deploy/`: service deployment assets.

