# Payment Domain

This area contains first-party payment services for a resilient payment processing architecture.

## Service Responsibilities

- `payment-gateway/`: edge API for payment initiation, idempotency, authentication, request validation, and payment status lookup.
- `transfer-service/`: orchestration for internal and external transfer flows, including holds, settlement, reversal, and reconciliation state.
- `bill-payment-service/`: bill presentment, bill execution, scheduling, and autopay workflows.
- `payment-integration/`: provider adapters and webhook ingestion for Stripe, VietQR, card processors, and external payment rails.

## How This Domain Fits the Target Architecture

- `payment-gateway` is the synchronous ingress and should return `202 Accepted` once intent is durably recorded.
- `transfer-service` and `bill-payment-service` are workflow owners and should implement the transactional outbox pattern.
- `payment-integration` performs external execution asynchronously behind queue-driven workers.
- `services/operations/reconciliation-service/` acts as the autocomplete safety net for missing callbacks and stale pending payments.
- `services/core-banking/transaction-service/` acts as the posting engine and should only record confirmed financial outcomes.

## Structural Principles

- Keep customer-facing workflow logic inside `payment-domain/`, not inside `core-banking/` adapter services.
- Treat `services/core-banking/transaction-service` as a ledger boundary into `Midaz`, not as the owner of payment orchestration.
- Store API contracts under `shared/api-contracts/` and cross-service tests under `tests/`.
- Keep deploy manifests and local service docs close to each service.

## Target Event Flow

1. `payment-gateway` accepts a request and enforces an idempotency key.
2. A domain service persists the payment order and emits a durable event.
3. `transfer-service` or `bill-payment-service` orchestrates validation, reservation, execution, and settlement.
4. `payment-integration` talks to external providers and normalizes callbacks/webhooks.
5. `reconciliation-service` polls for missing outcomes when callbacks are late or absent.
6. `transaction-service` records only verified financial effects in the ledger.

## Core Non-Functional Requirements

- Every write path must be idempotent.
- Every payment state change must be durable before external execution.
- External retries must not create duplicate money movement.
- Pending states must be visible to channels until final posting completes.
