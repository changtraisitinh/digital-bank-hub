# Services

First-party deployable backend services belong here.

- Group services by ownership domain.
- Prefer kebab-case directory names.
- Keep generated logs, caches, and build output out of version control.
- Keep business workflow ownership inside the relevant domain, such as `services/payment-domain/` for payment orchestration.

## Current Domains

- `core-banking/`
- `security/`
- `communications/`
- `payment-domain/`
