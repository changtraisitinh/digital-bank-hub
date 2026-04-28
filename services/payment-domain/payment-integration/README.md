# Payment Integration

Adapter layer for external payment providers and payment rails.

## Owns

- Stripe, VietQR, card-rail, and bank-rail adapters
- provider request signing and credential handling
- webhook ingestion and signature verification
- provider response normalization into internal events

## Does Not Own

- customer workflow state
- payment business decisions
- ledger truth

## Local Structure

- `api/`: webhook contracts, provider callback notes, and example payloads.
- `docs/`: adapter behavior, retry policies, and onboarding notes.
- `deploy/`: service deployment assets.

