# Bill Payment Service

Workflow owner for bill and autopay processing.

## Owns

- bill catalog and biller-specific execution rules
- bill presentment and payment instruction creation
- due-date scheduling and autopay orchestration
- bill retry, fallback, and reconciliation behavior

## Local Structure

- `api/`: service endpoints and biller-facing contract notes.
- `docs/`: provider mapping, cutoffs, retries, and operational runbooks.
- `deploy/`: service deployment assets.

