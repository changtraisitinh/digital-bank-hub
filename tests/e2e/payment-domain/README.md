# Payment Domain End-to-End Tests

Use this area for channel-to-payment end-to-end scenarios, including transfer, bill payment, retry, reversal, and reconciliation flows.

## Priority Scenarios

- channel sees `Accepted` immediately and later observes `PENDING`, `SETTLING`, and final status transitions
- transfer completes via provider callback and final ledger posting
- bill payment completes via autocomplete when callback is absent
- reversal flow updates customer-visible state without duplicate posting
