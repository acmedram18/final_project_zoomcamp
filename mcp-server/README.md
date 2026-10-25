# MCP Server: price-search

## Purpose
Expose price search tools to the agent for Smart Pantry & Price Comparator.

## Tools
- `search_prices(query: str)`: Search prices across stores, return comparison table (store, price, currency, url)
- `get_best_store(items: list[str])`: Suggest best store based on prices for shopping list items

## Scope
Tools are scoped to price search only. No access to credentials, secrets, or unrelated resources.

## Configuration
Configure via environment variables if needed (e.g., PRICE_SEARCH_API_KEY). Do not log secrets.

## Usage
Add to MCP config as appropriate. Tools return structured data for agent consumption.

## Documentation
English. Tracked via issue [#10].
