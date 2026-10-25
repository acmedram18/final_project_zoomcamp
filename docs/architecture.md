# Architecture

## Overview

Smart Pantry & Price Comparator is a full-stack web app composed of a frontend, backend API, database, and external price search integration. The system is designed to be containerized and observable end-to-end.

## Components

| Component | Purpose | Notes |
|---|---|---|
| **Frontend** | User interface for pantry, shopping list, price comparison and dashboard | Will consume the backend REST API |
| **Backend (API)** | Business logic: inventory, shopping list, expiration rules, price search orchestration, alerts | Must expose trace IDs and emit telemetry |
| **Database** | Persistent storage for products, shopping list items, price history, alerts/incidents | PostgreSQL recommended |
| **Price Search Service** | Integrates with a web search API to fetch prices from stores | Configurable via env vars, results normalized and stored in price history |
| **Observability Stack** | Collects logs, metrics and traces | Must be viewable in a UI (e.g. simple dashboard/endpoint or integrated tool) |

## Core Data Model (Draft)

| Entity | Fields (Key) | Description |
|---|---|---|
| `products` | id, name, category, quantity, unit, expiration_date, min_stock, status, created_at, updated_at | Pantry inventory items |
| `shopping_list_items` | id, product_id, name, quantity_suggested, quantity_to_buy, source (low_stock/expiring/out_of_stock/manual), status, added_at | Items to buy |
| `price_searches` | id, query, store, price, currency, url, found_at, trace_id | History of price comparisons |
| `alerts` | id, type (expiring/out_of_stock/price_threshold), severity, message, trace_id, created_at, resolved_at | Alerts based on user impact |
| `incidents` | id, alert_id, status, actions_taken, oncall_agent_notes, created_at, updated_at | Tracked by on-call agent |

## Key Flows

1. **Mark as "Out of Stock"** -> Backend updates product quantity/status, creates a shopping list item with suggested quantity.
2. **Expiration Alerts** -> Background/job logic checks products expiring in next N days and creates alerts when threshold is met.
3. **Price Search** -> Frontend requests prices for a product/shopping list; backend calls price search API, normalizes results, stores in `price_searches`, returns comparison table.
4. **Restock** -> User marks items as bought in shopping list -> backend moves them to pantry inventory (updates quantities) or creates new entries.
5. **On-Call Response** -> On alert, on-call agent uses traces/logs/metrics to generate an optimized shopping list (prioritize expiring + cheapest prices) and records actions in `incidents`.

## Non-Functional Requirements

- **Single Command Run**: Full system via `docker compose up --build`
- **Traceability**: Every user journey must have a trace ID propagated across logs/metrics/traces
- **No Sensitive Data**: Do not log API keys, passwords or PII
- **Testability**: Logic must be unit-testable (expiration rules, "out of stock" logic, buy-better logic)
- **Public Tracking**: All tasks tracked in GitHub Issues/Projects
