# Payment Domain AsyncAPI Contracts

Store event contracts for durable payment workflows such as:

- `PaymentRequested`
- `FundsReserved`
- `PaymentSubmitted`
- `PaymentCompleted`
- `PaymentFailed`
- `PaymentReversed`
- `ReconciliationMismatchDetected`

## Current Files

- `payment-domain.asyncapi.yaml`: canonical domain events for request, validation, settlement, completion, failure, reversal, and reconciliation mismatch detection.

## Event Families

- ingress and workflow events such as `payment.requested` and `payment.validated`
- autocomplete events such as `payment.autocomplete-requested`
- posting engine events such as `payment.posting-requested` and `payment.posted`
