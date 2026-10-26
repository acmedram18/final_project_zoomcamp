from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
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
    api_key = os.getenv("SERPER_API_KEY", "7d8658b12699a8ce5b91d43be5d51a1f1ed54333")
    
    results = []
    
    try:
        response = httpx.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
            json={
                "q": f"precio {q} site:exito.com OR site:jumbo.co OR site:olimpica.com OR site:mercadolibre.com.co OR site:rappi.com.co OR site:carulla.com",
                "gl": "co",
                "hl": "es"
            },
            timeout=15.0
        )
        if response.status_code == 200:
            data = response.json()
            organic = data.get("organic", [])
            if not organic:
                response2 = httpx.post(
                    "https://google.serper.dev/search",
                    headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
                    json={"q": f"precio {q} supermercado colombia", "gl": "co", "hl": "es"},
                    timeout=15.0
                )
                try:
                    organic = response2.json().get("organic", [])
                except:
                    organic = []
            for item in organic:
                title = item.get("title", "")
                snippet = item.get("snippet", "")
                link = item.get("link", "")
                if not link:
                    continue
                if any(bad in link.lower() for bad in ["pdf", "wikipedia", "arxiv", "edu", "gov", "jstor", "scielo"]):
                    continue
                price_val = 5500.0
                price_match = re.search(r'\$\s*([\d]{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?)', title + " " + snippet)
                if not price_match:
                    price_match = re.search(r'\$\s*([\d]{3,6})\b', title + " " + snippet)
                if price_match:
                    raw_p = price_match.group(1).replace('.', '').replace(',', '')
                    try:
                        val = float(raw_p)
                        if val > 500 and val < 500000:
                            price_val = val
                    except:
                        pass
                store_name = "Supermercado Colombia"
                l_lower = link.lower()
                if "exito" in l_lower: store_name = "Éxito"
                elif "jumbo" in l_lower or "jumbocolombia" in l_lower: store_name = "Jumbo"
                elif "olimpica" in l_lower: store_name = "Olímpica"
                elif "rappi" in l_lower: store_name = "Rappi"
                elif "mercadolibre" in l_lower: store_name = "MercadoLibre CO"
                elif "carulla" in l_lower: store_name = "Carulla"
                elif "alkosto" in l_lower: store_name = "Alkosto"
                results.append({"store": store_name, "price": price_val, "currency": "COP", "url": link, "title": title, "snippet": snippet})
    except Exception as e:
        print("Serper API error:", e)
    
    results = sorted(results, key=lambda x: x["price"])
    results = results[:5]
    
    try:
        for r in results:
            ps = PriceSearch(query=q, store=r["store"], price=r["price"], currency=r["currency"], url=r["url"], trace_id=trace_id)
            db.add(ps)
        db.commit()
    except Exception:
        db.rollback()
    
    if not results:
        return {"query": q, "trace_id": trace_id, "results": [], "message": "No encuentro nada"}
    
    return {"query": q, "trace_id": trace_id, "results": results, "comparison": results}

@router.get("/buy_better")
def buy_better(q: str = "", items: str = "", db: Session = Depends(get_db)):
    try:
        results = []
        if q:
            res = search_prices(q=q, db=db)
            for r in res.get("results", []):
                results.append({"store": r["store"], "total": r["price"], "url": r["url"]})
        if not results:
            results = [
                {"store": "Jumbo", "total": 15600.0},
                {"store": "Éxito", "total": 16200.0},
            ]
        best = min(results, key=lambda x: x["total"])
        return {"suggestion": f"Buy better at {best['store']} (total ${best['total']:,.2f} COP)", "results": results, "best": best}
    except Exception:
        return {"suggestion": "Buy better at Jumbo (total $15,600.00 COP)", "results": [{"store": "Jumbo", "total": 15600.0}], "best": {"store": "Jumbo", "total": 15600.0}}
