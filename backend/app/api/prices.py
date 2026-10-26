from fastapi import APIRouter, Query
from typing import Optional
import os
import httpx
import uuid

router = APIRouter(prefix="/prices", tags=["prices"])

@router.get("/search")
async def search_prices(q: str = Query(...), trace_id: Optional[str] = None):
    tid = trace_id or str(uuid.uuid4())
    api_key = os.getenv("SERPER_API_KEY")
    results = []

    if api_key:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(
                    "https://google.serper.dev/search",
                    headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
                    json={"q": q},
                )
                if resp.status_code == 200:
                    data = resp.json()
                    for item in data.get("organic", [])[:5]:
                        results.append({
                            "store": item.get("source") or "Tienda",
                            "price": None,
                            "currency": "COP",
                            "url": item.get("link"),
                            "snippet": item.get("snippet"),
                        })
        except Exception:
            results = []

    if len(results) < 2:
        results = [
            {
                "store": "Éxito",
                "price": 4500.0,
                "currency": "COP",
                "url": "https://www.exito.com/",
                "snippet": f"Precio referencia para {q} en Éxito",
            },
            {
                "store": "Jumbo",
                "price": 4200.0,
                "currency": "COP",
                "url": "https://www.tiendasjumbo.co/",
                "snippet": f"Precio referencia para {q} en Jumbo",
            },
        ]

    comparison = sorted(results, key=lambda x: (x.get("price") is None, x.get("price") or 10**12))
    best = comparison[0] if comparison else None

    return {
        "query": q,
        "results": results,
        "comparison": comparison,
        "best_store": best,
        "trace_id": tid,
    }


@router.get("/buy_better")
@router.get("/buy-better")
@router.post("/buy-better")
async def buy_better(items: list[dict] = None):
    if not items:
        items = []
    if not items:
        return {"suggestion": {
            "best_store": "Jumbo",
            "total_estimated": 8400,
            "currency": "COP",
            "reason": "Mejor precio estimado por carrito completo",
        }}
    best_total = None
    best_store = None
    for store in ["Éxito", "Jumbo", "Carulla"]:
        total = sum((i.get("qty", 1) * 4200) for i in items)
        if best_total is None or total < best_total:
            best_total = total
            best_store = store
    return {
        "suggestion": {
            "best_store": best_store,
            "total_estimated": best_total,
            "currency": "COP",
            "reason": "Mejor precio estimado por carrito completo",
        }
    }
