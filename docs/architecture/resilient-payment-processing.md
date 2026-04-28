# Resilient Payment Processing Architecture

## Objective

Move payment workflows out of generic integration code and into a dedicated `payment-domain/` with clear ownership, durable state, and provider isolation.

## Scope

This architecture covers customer-initiated transfers, bill payments, provider callbacks, ledger posting, and reconciliation workflows. It excludes core ledger implementation details inside `Midaz` and non-payment customer journeys.

## Bounded Contexts

- `services/payment-domain/payment-gateway/`
- `services/payment-domain/transfer-service/`
- `services/payment-domain/bill-payment-service/`
- `services/payment-domain/payment-integration/`
- `services/core-banking/transaction-service/` as the ledger boundary

## Core Principles

- Every payment write uses an idempotency key.
- Every payment has a durable state machine.
- External provider calls are isolated behind adapters.
- Financial truth is recorded through the ledger layer.
- Reconciliation is a first-class workflow, not an afterthought.

## Ownership Model

- `payment-gateway` owns synchronous API concerns: authentication, authorization, idempotency enforcement, request validation, and correlation.
- `transfer-service` owns transfer workflow state, business validation, risk hooks, reserve/settle/release/reverse orchestration, and transfer reconciliation.
- `bill-payment-service` owns biller workflows, due-date scheduling, autopay, retries, and bill-payment reconciliation.
- `payment-integration` owns provider adapters, signing, webhook verification, and normalization of provider responses into internal events.
- `services/operations/reconciliation-service/` owns autocomplete polling, stale-payment recovery, and mismatch investigation workflows.
- `transaction-service` remains the posting engine and ledger boundary that records confirmed financial effects in `Midaz`.

## Distributed System Roles

- **Ingress**: `payment-gateway` returns `202 Accepted` with a stable `paymentId` after validation and durable persistence of intent.
- **Transactional Outbox**: the domain service writes the payment state change and outbound event in one local transaction.
- **Message Queue**: brokers payment work between domain services, provider adapters, reconciliation, notifications, and posting.
- **Execution Workers**: `payment-integration` and payment-domain workers submit to external rails and normalize provider outcomes.
- **Autocomplete Safety Net**: `services/operations/reconciliation-service/` polls providers for stuck or missing callbacks.
- **Posting Engine**: `services/core-banking/transaction-service/` posts only verified outcomes to the core ledger.
- **Observability**: correlation IDs, event IDs, and idempotency keys flow through every step.

## Canonical Payment States

- `RECEIVED` — request accepted and assigned a stable `paymentId`.
- `VALIDATED` — business and account checks passed.
- `FUNDS_RESERVED` — funds hold succeeded where applicable.
- `SUBMITTED` — external provider or rail submission completed.
- `SETTLING` — callback or settlement confirmation is pending.
- `COMPLETED` — payment reached terminal success.
- `FAILED` — payment reached terminal failure without settlement.
- `REVERSED` — settled or reserved funds were reversed.

Only domain services may move a payment between states. Provider-specific statuses must be translated into this canonical state model.

## Recommended Flow

1. `payment-gateway` accepts a payment request and returns a stable `paymentId`.
2. A domain service persists the payment order and emits an outbox event.
3. The domain service performs validation, fraud/risk hooks, and account checks.
4. The domain service asks the ledger boundary to reserve or settle funds.
5. `payment-integration` submits to external providers and receives callbacks/webhooks.
6. The domain service finalizes the payment as `COMPLETED`, `FAILED`, or `REVERSED`.
7. Notifications, audit, reporting, and reconciliation consume emitted events.

## Execution Phases

| Phase | Owner | Responsibility |
| --- | --- | --- |
| Ingress | `payment-gateway` | Validate input, resolve account/payment identifiers, enforce idempotency, and accept the request. |
| Persistence | `transfer-service` or `bill-payment-service` | Persist intent, state, and outbox event in one transaction. |
| Execution | `payment-integration` | Submit to banks, card processors, and payment rails with retry-safe adapters. |
| Resolution | Callbacks or `reconciliation-service` | Resolve payment outcome via push callback or pull status polling. |
| Finalization | `transaction-service` | Post only confirmed outcomes to the core ledger and emit final bookkeeping events. |

## Partial Failure Handling

- If a provider call times out after submission, keep the workflow in a non-terminal state and schedule autocomplete instead of failing blind.
- If callbacks never arrive, `reconciliation-service` queries provider status until the workflow becomes terminal or requires manual review.
- If queue delivery repeats, consumers rely on idempotency keys, event IDs, and provider references to prevent double execution.
- If posting fails after confirmation, retry posting independently without resubmitting the external payment.
- If provider and ledger facts diverge, emit a reconciliation mismatch event and hold customer-visible status in `PENDING` or `SETTLING` until resolved.

## Reliability Controls

- Use idempotency keys on every write endpoint and webhook ingestion path.
- Persist workflow state and outbound events in the same transaction using the outbox pattern.
- Make provider adapters retry-safe and drive retry policy from domain state, not transport errors alone.
- Require ledger posting and reversal operations to carry correlation IDs and immutable reference data.
- Schedule reconciliation jobs to compare internal state, provider reports, and ledger movements.
- Expose customer-facing `PENDING` and `SETTLING` states until posting is confirmed.
- Track outbox lag, callback lag, autocomplete retry counts, and posting failures as first-class metrics.

## Shared Assets

- REST contracts live in `shared/api-contracts/openapi/payment-domain/`.
- Async event contracts live in `shared/api-contracts/asyncapi/payment-domain/`.
- Cross-service tests live in `tests/integration/payment-domain/`, `tests/e2e/payment-domain/`, and `tests/security/payment-domain/`.

## Initial Contracts

- `shared/api-contracts/openapi/payment-domain/payment-gateway.openapi.yaml` defines the edge API for initiation, lookup, reversal, and webhook ingestion.
- `shared/api-contracts/asyncapi/payment-domain/payment-domain.asyncapi.yaml` defines the canonical domain events emitted across the workflow.

## Migration Direction

- Move Stripe and VietQR adapter responsibilities out of `services/core-banking/banking-integration/` and into `services/payment-domain/payment-integration/`.
- Keep `services/core-banking/transaction-service/` focused on ledger interaction with `Midaz`.
- Route new mobile and channel payment APIs through `services/payment-domain/payment-gateway/`.

## Delivery Phases

1. Stand up `payment-gateway` with idempotent initiation and status endpoints.
2. Implement transfer orchestration with outbox events and ledger reservation/settlement integration.
3. Move provider adapters and webhook ingestion into `payment-integration`.
4. Add bill-payment scheduling, autopay, and reconciliation workflows.
5. Expand cross-system integration, security, and end-to-end tests under `tests/payment-domain/`.
