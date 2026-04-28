# Reconciliation Service

Autocomplete and reconciliation safety net for distributed payment workflows.

## Owns

- polling provider status for payments stuck in non-terminal states
- recovering from missing or delayed callbacks
- detecting ledger-versus-provider mismatches
- routing irreconcilable payments to manual review workflows
- emitting reconciliation outcome and mismatch events

## Does Not Own

- customer-facing API ingress
- payment business decisioning
- direct ledger posting
- provider-specific submission logic

## Triggers

- callback timeout exceeded
- provider request timed out after submission attempt
- queue redelivery without terminal payment status
- scheduled reconciliation windows for provider settlement files or reports

## Expected Outcomes

- move stale payments from `SUBMITTED` or `SETTLING` toward a verified terminal state
- confirm when provider success must be posted by `transaction-service`
- flag mismatches for investigation without losing payment intent

## Local Structure

- `docs/`: polling strategy, retry windows, and operational runbooks.
- `deploy/`: service deployment assets.
