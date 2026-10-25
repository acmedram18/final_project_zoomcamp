# Testing Strategy

## Goals

- Have both **unit tests** and **integration tests**
- Tests must run with a **single command**
- Tests must pass
- Cover critical user flows that relate to acceptance criteria

## What to Test

| Area | Test Type | Examples |
|---|---|---|
| **Expiration Logic** | Unit | Products expiring in 1, 3, 7 days are correctly flagged as urgent |
| **Mark as "Out of Stock"** | Unit + Integration | Marking out of stock sets quantity to 0 and creates a shopping list item |
| **Shopping List Generation** | Unit | Auto-generate from low stock, expiring, and out of stock items |
| **Restock Flow** | Integration | Moving bought items from shopping list back to pantry updates inventory correctly |
| **Price Comparison Logic** | Unit | "Buy Better" suggests cheapest store / best overall based on totals |
| **Alerts** | Integration | Creating an alert when threshold met and linking to trace ID |

## Test Commands (Planned)

The project should provide a single command to run all tests. Examples:
- `make test` 
- `npm run test` (if monorepo)
- `pytest` from backend with coverage
- Or combined via docker compose

The exact command will be documented in `README.md` once implemented.

## Definition of Done (Testing)

- [ ] Unit tests cover core business logic
- [ ] Integration tests cover the main end-to-end flows
- [ ] All tests pass locally
- [ ] Tests can be run with a single command
- [ ] CI runs tests on every pull request
