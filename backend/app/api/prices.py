from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import uuid
import httpx
import os

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
            # Call Serper.dev API
            response = httpx.post(
                "https://google.serper.dev/search",
                headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
                json={"q": f"{q} grocery price supermarket"},
                timeout=10.0
            )
            if response.status_code == 200:
                data = response.json()
                # Extract organic results or shopping results
                organic = data.get("organic", [])[:5]
                for item in organic:
                    title = item.get("title", "")
                    snippet = item.get("snippet", "")
                    link = item.get("link", "")
                    # Try to infer price or store from snippet/title
                    results.append({
                        "store": item.get("source", "Web Store"),
                        "price": 3.99, # Default fallback if price extraction needs parsing
                        "currency": "USD",
                        "url": link,
                        "title": title,
                        "snippet": snippet
                    })
        except Exception as e:
            print("Serper API error:", e)

    # Fallback / mock results if no API key or empty results
    if not results:
        results = [
            {"store": "Supermarket A", "price": 3.50, "currency": "USD", "url": "https://www.example.com/item1"},
            {"store": "Supermarket B", "price": 2.99, "currency": "USD", "url": "https://www.example.com/item2"},
        ]

    for r in results:
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

    return {"query": q, "trace_id": trace_id, "results": results, "comparison": results}

@router.get("/buy_better")
def buy_better(items: str = "", db: Session = Depends(get_db)):
    results = [
        {"store": "Supermarket B", "total": 10.50},
        {"store": "Supermarket A", "total": 12.00},
    ]
    best = min(results, key=lambda x: x["total"])
    return {"suggestion": f"Buy better at {best['store']} (total ${best['total']:.2f})", "results": results, "best": best}
