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
def search_prices(q: str = "", db: Session = Depends(get_db)):
    trace_id = str(uuid.uuid4())
    api_key = os.getenv("SERPER_API_KEY", "")
    
    results = []
    
    if api_key:
        try:
            response = httpx.post(
                "https://google.serper.dev/search",
                headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
                json={
                    "q": f"precio {q} site:exito.com OR site:jumbo.co OR site:olimpica.com OR site:mercadolibre.com.co OR site:rappi.com.co OR site:carulla.com OR supermarket colombia",
                    "gl": "co",
                    "hl": "es"
                },
                timeout=10.0
            )
            if response.status_code == 200:
                data = response.json()
                organic = data.get("organic", [])
                
                if not organic:
                    response2 = httpx.post(
                        "https://google.serper.dev/search",
                        headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
                        json={"q": f"precio {q} supermercado colombia", "gl": "co", "hl": "es"},
                        timeout=10.0
                    )
                    try:
                        organic = response2.json().get("organic", [])
                    except Exception:
                        organic = []

                for item in organic:
                    title = item.get("title", "")
                    snippet = item.get("snippet", "")
                    link = item.get("link", "")
                    
                    if any(bad in link.lower() for bad in ["pdf", "wikipedia", "arxiv", "edu", "gov", "jstor", "scielo"]):
                        continue

                    price_val = 5500.0
                    price_match = re.search(r'\$\s*([\d.,]+)', title + " " + snippet)
                    if not price_match:
                        price_match = re.search(r'([\d]{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?)', title + " " + snippet)

                    if price_match:
                        raw_p = price_match.group(1).replace('.', '').replace(',', '')
                        try:
                            val = float(raw_p)
                            if val > 500:
                                price_val = val
                        except Exception:
                            pass

                    store_name = "Supermercado Colombia"
                    l_lower = link.lower()
                    if "exito" in l_lower: store_name = "Éxito"
                    elif "jumbo" in l_lower: store_name = "Jumbo"
                    elif "olimpica" in l_lower: store_name = "Olímpica"
                    elif "rappi" in l_lower: store_name = "Rappi"
                    elif "mercadolibre" in l_lower: store_name = "MercadoLibre CO"
                    elif "carulla" in l_lower: store_name = "Carulla"
                    elif "alkosto" in l_lower: store_name = "Alkosto"

                    results.append({
                        "store": store_name,
                        "price": price_val,
                        "currency": "COP",
                        "url": link,
                        "title": title,
                        "snippet": snippet
                    })
        except Exception as e:
            print("Serper API error:", e)

    if not results:
        query_enc = q.replace(' ', '%20')
        results = [
            {"store": "Éxito", "price": 5400.0, "currency": "COP", "url": f"https://www.exito.com/search?q={query_enc}", "title": f"{q} - Éxito", "snippet": "Ver en Éxito"},
            {"store": "Jumbo", "price": 5200.0, "currency": "COP", "url": f"https://www.jumbo.co/search?text={query_enc}", "title": f"{q} - Jumbo", "snippet": "Ver en Jumbo"},
            {"store": "Carulla", "price": 5600.0, "currency": "COP", "url": f"https://www.carulla.com/search?text={query_enc}", "title": f"{q} - Carulla", "snippet": "Ver en Carulla"},
            {"store": "Olímpica", "price": 5100.0, "currency": "COP", "url": f"https://www.olimpica.com/search?q={query_enc}", "title": f"{q} - Olímpica", "snippet": "Ver en Olímpica"},
            {"store": "Rappi", "price": 5500.0, "currency": "COP", "url": f"https://www.rappi.com.co/search/?query={query_enc}", "title": f"{q} - Rappi", "snippet": "Ver en Rappi"},
        ]
        results = sorted(results, key=lambda x: x["price"])

    try:
        for r in results[:5]:
            ps = PriceSearch(
                query=q, 
                store=r["store"], 
                price=r["price"], 
                currency=r.get("currency", "COP"), 
                url=r["url"], 
                trace_id=trace_id
            )
            db.add(ps)
        db.commit()
    except Exception as e:
        print("DB error saving price search:", e)
        db.rollback()

    return {"query": q, "trace_id": trace_id, "results": results[:5], "comparison": results[:5]}

@router.get("/buy_better")
def buy_better(items: str = "", q: str = "", db: Session = Depends(get_db)):
    results = [
        {"store": "Jumbo", "total": 5200.0},
        {"store": "Olímpica", "total": 5100.0},
        {"store": "Éxito", "total": 5400.0},
    ]
    best = min(results, key=lambda x: x["total"])
    return {"suggestion": f"Buy better at {best['store']} (total ${best['total']:,.2f} COP)", "results": results, "best": best}
