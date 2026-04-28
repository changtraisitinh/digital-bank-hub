# Transfer Workflow Lifecycle

## Intent

Use a transactional outbox so transfer state and outbound events are committed together before any external side effect begins.

## Lifecycle

1. Validate the request, idempotency key, and account references.
2. Persist the transfer order as `RECEIVED` or `VALIDATED`.
3. Persist an outbox event in the same database transaction.
4. Publish the event to the queue asynchronously.
5. Execute provider or ledger actions in workers.
6. Resolve the final state from callbacks or autocomplete polling.
7. Request ledger posting only after the payment outcome is verified.

## Design Rules

- Never post to the queue without the matching state change committed.
- Never call an external provider from the synchronous ingress path.
- Never post to the core ledger from a non-terminal or unverified state.
- Use event IDs, provider references, and idempotency keys to de-duplicate retries.
