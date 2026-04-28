# Payment Domain Security Tests

Use this area for idempotency abuse, replay protection, webhook verification, authorization, rate limiting, and sensitive-data exposure tests.

## Priority Scenarios

- replayed callback or queue message does not double-complete or double-post a payment
- forged webhook signature is rejected before state mutation
- idempotency-key reuse with different payload is rejected
- autocomplete polling cannot expose or mutate unrelated customer payments
