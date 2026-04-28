# Transfer Service

Workflow owner for transfer payments.

## Owns

- transfer payment order state machine
- validation and risk orchestration hooks
- reservation, settlement, release, and reversal workflow
- retry and reconciliation rules for transfer flows

## Key States

- `RECEIVED`
- `VALIDATED`
- `FUNDS_RESERVED`
- `SUBMITTED`
- `SETTLING`
- `COMPLETED`
- `FAILED`
- `REVERSED`

## Local Structure

- `api/`: service endpoints and internal event docs.
- `docs/`: flow notes, failure modes, and operational runbooks.
- `deploy/`: service deployment assets.

