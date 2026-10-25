#!/usr/bin/env python3
"""MCP server exposing price search tools (scoped)."""

import json
import sys

def search_prices(query: str):
    """Search prices across stores."""
    results = [
        {"store": "Store A", "price": 3.50, "currency": "USD", "url": "https://store-a.example/item"},
        {"store": "Store B", "price": 2.99, "currency": "USD", "url": "https://store-b.example/item"},
    ]
    return {"query": query, "results": results, "comparison": results}

def get_best_store(items):
    """Suggest best store for items."""
    if isinstance(items, str):
        items = [items]
    return {"suggestion": "Buy better at Store B", "best_store": "Store B", "items": items}

def main():
    # Simple stdio MCP-like interface
    try:
        for line in sys.stdin:
            req = json.loads(line)
            method = req.get("method")
            if method == "search_prices":
                res = search_prices(req.get("params", {}).get("query", ""))
                print(json.dumps({"id": req.get("id"), "result": res}))
            elif method == "get_best_store":
                res = get_best_store(req.get("params", {}).get("items", []))
                print(json.dumps({"id": req.get("id"), "result": res}))
            else:
                print(json.dumps({"id": req.get("id"), "error": "unknown_method"}))
    except EOFError:
        pass
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
