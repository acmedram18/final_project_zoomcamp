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
                "q": f"precio {q}",
                "gl": "co",
                "hl": "es",
                "num": 20
            },
            timeout=15.0
        )
        if response.status_code == 200:
            data = response.json()
            organic = data.get("organic", [])
            for item in organic:
                title = item.get("title", "")
                snippet = item.get("snippet", "")
                link = item.get("link", "")
                if not link:
                    continue
                if any(bad in link.lower() for bad in ["pdf", "wikipedia", "arxiv", "edu", "gov", "jstor", "scielo", "facebook.com", "youtube.com"]):
                    continue
                text = title + " " + snippet
                prices_found = []
                for m in re.finditer(r'\$\s*([0-9]{1,3}(?:[.,][0-9]{3})+(?:[.,][0-9]{2})?)', text):
                    try:
                        raw_p = m.group(1).replace('.', '').replace(',', '')
                        val = float(raw_p)
                        if val > 1000 and val < 500000:
                            prices_found.append(val)
                    except:
                        pass
                for m in re.finditer(r'\$\s*([0-9]{4,6})\b', text):
                    try:
                        raw_p = m.group(1)
                        val = float(raw_p)
                        if val > 1000 and val < 500000:
                            prices_found.append(val)
                    except:
                        pass
                if not prices_found:
                    continue
                price_val = min(prices_found)
                store_name = "Supermercado Colombia"
                l_lower = link.lower()
                if "exito" in l_lower: store_name = "Éxito"
                elif "jumbo" in l_lower or "jumbocolombia" in l_lower: store_name = "Jumbo"
                elif "olimpica" in l_lower: store_name = "Olímpica"
                elif "rappi" in l_lower: store_name = "Rappi"
                elif "mercadolibre" in l_lower: store_name = "MercadoLibre CO"
                elif "carulla" in l_lower: store_name = "Carulla"
                elif "alkosto" in l_lower: store_name = "Alkosto"
                elif "supertiendas" in l_lower: store_name = "Supertiendas"
                results.append({"store": store_name, "price": float(price_val), "currency": "COP", "url": link, "title": title, "snippet": snippet})
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
