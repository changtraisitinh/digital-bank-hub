# Payment Domain Integration Tests

Use this area for cross-service tests covering payment workflow coordination across gateway, domain services, integrations, and ledger adapters.

## Priority Scenarios

- accepted request persists payment intent and outbox event atomically
- duplicate idempotency key does not create a second payment
- provider callback completes a payment and triggers posting once
- missing callback triggers autocomplete polling and eventual completion
- confirmed provider success with posting failure retries ledger posting without resubmitting externally
- reconciliation mismatch emits an investigation event and holds terminal posting
