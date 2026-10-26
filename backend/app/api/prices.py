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
    api_key = os.getenv("SERPER_API_KEY", "").strip()
    results = []
    
    if not api_key:
        return {"query": q, "trace_id": trace_id, "results": [], "message": "No encuentro nada"}
    
    if not q or not q.strip():
        return {"query": q, "trace_id": trace_id, "results": [], "message": "No encuentro nada"}
    
    try:
        response = httpx.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
            json={
                "q": f"{q.strip()} precio",
                "gl": "co",
                "hl": "es",
                "num": 20
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
                bad = ["pdf", "wikipedia", "arxiv", "edu", "gov", "jstor", "scielo", "mercadolibre.com.co/ofertas", "/search?", "/buscar?"]
                if any(b in link.lower() for b in bad):
                    continue
                price_val = None
                m = re.search(r'\$\s*([0-9]{1,3}(?:[.,][0-9]{3})+(?:[.,][0-9]{2})?)', title + " " + snippet)
                if not m:
                    m = re.search(r'([0-9]{1,3}(?:[.,][0-9]{3})+(?:[.,][0-9]{2})?)\s*COP', title + " " + snippet)
                if not m:
                    m = re.search(r'\$\s*([0-9]{4,7})\b', title + " " + snippet)
                if m:
                    raw = m.group(1).replace('.', '').replace(',', '')
                    try:
                        v = float(raw)
                        if v >= 1000:
                            price_val = v
                    except:
                        pass
                if price_val is None:
                    continue
                l = link.lower()
                store_name = "Tienda"
                if "exito.com" in l: store_name = "Éxito"
                elif "jumbo.co" in l: store_name = "Jumbo"
                elif "olimpica.com" in l: store_name = "Olímpica"
                elif "carulla.com" in l: store_name = "Carulla"
                elif "rappi.com.co" in l: store_name = "Rappi"
                elif "mercadolibre.com.co" in l and "/p/" in l: store_name = "MercadoLibre CO"
                elif "alkosto.com" in l: store_name = "Alkosto"
                else:
                    continue
                if not (link.startswith("http://") or link.startswith("https://")):
                    continue
                results.append({"store": store_name, "price": price_val, "currency": "COP", "url": link, "title": title, "snippet": snippet})
    except Exception as e:
        print("ERR", e)
        return {"query": q, "trace_id": trace_id, "results": [], "message": "No encuentro nada"}
    
    # deduplicate by store keeping lowest price
    best = {}
    for r in results:
        s = r["store"]
        if s not in best or r["price"] < best[s]["price"]:
            best[s] = r
    results = list(best.values())
    results = sorted(results, key=lambda x: x["price"])[:5]
    
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
