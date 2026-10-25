# Skill: optimize-shopping-list

## Goal
Generate an optimized shopping list for Smart Pantry & Price Comparator.

## When to use
When the on-call agent or any agent needs to prioritize purchases based on urgency and savings.

## Inputs
- Pantry inventory (expiring soon, low stock, out of stock)
- Current shopping list
- Price comparison data (from price search / MCP)

## Steps
1. **Prioritize urgency**: Sort items by expiration date (expiring soon first), then by out of stock status, then by low stock.
2. **Consolidate**: Merge duplicates and suggest quantities to buy.
3. **Price comparison**: For each prioritized item, fetch prices from available stores (via price search/MCP) and identify cheapest options.
4. **Suggest where to buy better**: Recommend store(s) to minimize total cost or per-item cost.
5. **Output**: Produce an optimized list with priorities, suggested quantities, prices, and recommendation.

## Example Output
- Priority 1: Yogurt (expires in 2 days) - Buy at Store B ($2.99)
- Priority 2: Milk (out of stock) - Buy at Store B ($3.49)
- Total estimated: $6.48 (vs $7.20 elsewhere) - Save $0.72

## Integration
- Used by On-Call Agent when responding to alerts
- Can leverage MCP server `search_prices` and `get_best_store` tools
- References trace IDs for observability

## Documentation
English. Tracked via issue [#8].
