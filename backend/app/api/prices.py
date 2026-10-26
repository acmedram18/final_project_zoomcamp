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
def search_prices(q: str = "", db: Session = Depends(get_db)):
    trace_id = str(uuid.uuid4())
    api_key = os.getenv("SERPER_API_KEY", "")
    results = []
    
    if api_key and q.strip():
        try:
            response = httpx.post(
                "https://google.serper.dev/search",
                headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
                json={
                    "q": f"{q} precio colombia site:exito.com OR site:jumbo.co OR site:olimpica.com OR site:carulla.com OR site:rappi.com.co OR site:mercadolibre.com.co",
                    "gl": "co",
                    "hl": "es",
                    "num": 10
                },
                timeout=15.0
            )
            if response.status_code == 200:
                data = response.json()
                organic = data.get("organic", []) or []
                for item in organic:
                    title = item.get("title", "")
                    snippet = item.get("snippet", "")
                    link = item.get("link", "")
                    if not link:
                        continue
                    if any(bad in link.lower() for bad in ["pdf", "wikipedia", "arxiv", "edu", "gov", "jstor", "scielo"]):
                        continue
                    price_val = None
                    m = re.search(r'\$\s*([\d]{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?)', title + " " + snippet)
                    if not m:
                        m = re.search(r'([\d]{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?)\s*(?:COP|pesos)', title + " " + snippet)
                    if m:
                        raw = m.group(1).replace('.', '').replace(',', '')
                        try:
                            v = float(raw)
                            if v > 1000:
                                price_val = v
                        except:
                            pass
                    if price_val is None:
                        continue
                    l = link.lower()
                    store_name = "Supermercado Colombia"
                    if "exito" in l: store_name = "Éxito"
                    elif "jumbo" in l: store_name = "Jumbo"
                    elif "olimpica" in l: store_name = "Olímpica"
                    elif "rappi" in l: store_name = "Rappi"
                    elif "mercadolibre" in l: store_name = "MercadoLibre CO"
                    elif "carulla" in l: store_name = "Carulla"
                    elif "alkosto" in l: store_name = "Alkosto"
                    results.append({"store": store_name, "price": price_val, "currency": "COP", "url": link, "title": title, "snippet": snippet})
        except Exception as e:
            print("ERR", e)
    
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
