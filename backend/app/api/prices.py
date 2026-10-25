from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import uuid
import httpx
import os
import re

from app.core import database
from app.models.price import PriceSearch

router = APIRouter(prefix="/prices", tags=["prices"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/search")
def search_prices(q: str, db: Session = Depends(get_db)):
    trace_id = str(uuid.uuid4())
    api_key = os.getenv("SERPER_API_KEY", "")
    
    results = []
    
    if api_key:
        try:
            # Enhanced query for Colombian / supermarket grocery search
            response = httpx.post(
                "https://google.serper.dev/search",
                headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
                json={"q": f"precio {q} supermarket store supermarket online"},
                timeout=10.0
            )
            if response.status_code == 200:
                data = response.json()
                organic = data.get("organic", [])
                for item in organic:
                    title = item.get("title", "")
                    snippet = item.get("snippet", "")
                    link = item.get("link", "")
                    
                    # Skip academic/pdf/wikipedia
                    if any(bad in link.lower() for bad in ["pdf", "wikipedia", "arxiv", "edu", "jstor", "scielo"]):
                        continue

                    # Try to extract price from snippet or title (e.g. $4.500 or $5.99 or 4,500)
                    price_val = 3.99
                    price_match = re.search(r'\$?\s*([\d.,]+)', title + " " + snippet)
                    if price_match:
                        raw_p = price_match.group(1).replace(',', '')
                        try:
                            val = float(raw_p)
                            if val > 0 and val < 1000000:
                                price_val = val
                        except:
                            pass

                    store_name = "Supermarket Web"
                    if "exito" in link.lower(): store_name = "Éxito"
                    elif "carrefour" in link.lower(): store_name = "Carrefour"
                    elif "walmart" in link.lower(): store_name = "Walmart"
                    elif "rappi" in link.lower(): store_name = "Rappi"
                    elif "jumbo" in link.lower(): store_name = "Jumbo"
                    elif "olimpica" in link.lower(): store_name = "Olímpica"

                    results.append({
                        "store": store_name,
                        "price": price_val,
                        "currency": "COP" if "colombia" in link.lower() or "exito" in link.lower() else "USD",
                        "url": link,
                        "title": title,
                        "snippet": snippet
                    })
        except Exception as e:
            print("Serper API error:", e)

    # Fallback if no results
    if not results:
        results = [
            {"store": "Supermarket A", "price": 4500.0, "currency": "COP", "url": "https://www.example.com/item1"},
            {"store": "Supermarket B", "price": 4800.0, "currency": "COP", "url": "https://www.example.com/item2"},
        ]

    for r in results[:5]:
        ps = PriceSearch(
            query=q, 
            store=r["store"], 
            price=r["price"], 
            currency=r["currency"], 
            url=r["url"], 
            trace_id=trace_id
        )
        db.add(ps)
    db.commit()

    return {"query": q, "trace_id": trace_id, "results": results[:5], "comparison": results[:5]}

@router.get("/buy_better")
def buy_better(items: str = "", db: Session = Depends(get_db)):
    results = [
        {"store": "Supermarket B", "total": 10500.0},
        {"store": "Supermarket A", "total": 12000.0},
    ]
    best = min(results, key=lambda x: x["total"])
    return {"suggestion": f"Buy better at {best['store']} (total ${best['total']:.2f})", "results": results, "best": best}
