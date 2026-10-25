# Observability, Alerts & On-Call

## Observability Requirements

The app must instrument a key user journey with **metrics, traces and structured logs** sharing a **trace ID**. No customer data or credentials may be sent to telemetry.

### What to Instrument

| Signal | What | Purpose |
|---|---|---|
| **Logs (structured)** | Key actions (add product, mark out of stock, search prices, restock) with trace_id, user_action, entity_id | Debugging and incident investigation |
| **Metrics** | `products_expiring_soon`, `products_out_of_stock`, `shopping_list_items`, `price_searches_count`, `alerts_triggered` | Monitor system health and user-impact |
| **Traces** | End-to-end trace for critical flows (e.g. "out of stock" -> shopping list generation, price search flow) | Correlate logs/metrics across components |

### Visibility

Telemetry must be **collected, stored, and viewable in a UI**. This can be a simple dashboard in the app or an integrated observability UI - as long as signals are viewable.

## Alerts (User-Impact Based)

Alerts must be based on **user impact**, not just CPU/memory.

| Alert | Condition | User Impact | Severity |
|---|---|---|---|
| **Expiring Soon** | >= 1 product expiring in next 48 hours (or configurable threshold) | Food waste / need to consume now | High |
| **Critical Shopping Needed** | Multiple items out of stock OR low stock of essentials + nothing in pantry | User can't cook / needs to buy now | High |
| **Price Opportunity** | Significant price difference found across stores for items in shopping list | User overpaying if they buy now | Medium |

## On-Call Agent

The **On-Call Agent** wakes up when an alert is triggered.

### Responsibilities
- **Investigate**: Use trace ID, logs, metrics and traces to understand the full context of the alert
- **Act**: Take corrective/actionable steps when possible
- **Document**: Record actions in an incident record

### Example Actions for This Project
- Generate an **optimized shopping list** prioritizing items expiring soon first, then items out of stock/low stock
- Run/suggest price comparison for items in the optimized list and recommend **where to buy better**
- Suggest concrete next steps (e.g. "Use X product today", "Buy Y at Store Z to save $W")
- Update alert status and create an incident with `actions_taken` and notes

### Requirements
- [ ] At least **one alert** defined
- [ ] **On-call agent** exists and can respond to an alert
- [ ] Agent uses telemetry (traces/logs/metrics) to investigate
- [ ] Agent takes **actionable steps** (not just a report)
- [ ] Incident is documented
