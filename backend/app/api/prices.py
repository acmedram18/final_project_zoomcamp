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
    
    if not api_key or not q or not q.strip():
        return {"query": q, "trace_id": trace_id, "results": [], "message": "No encuentro nada"}
    
    try:
        response = httpx.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
            json={
                "q": f"{q.strip()} precio colombia",
                "gl": "co",
                "hl": "es",
                "num": 15
            },
            timeout=15.0
        )
        if response.status_code != 200:
            return {"query": q, "trace_id": trace_id, "results": [], "message": "No encuentro nada"}
        
        data = response.json()
        organic = data.get("organic", []) or []
        results = []
        
        for item in organic:
            title = item.get("title", "")
            snippet = item.get("snippet", "")
            link = item.get("link", "")
            if not link or not link.startswith("http"):
                continue
            llink = link.lower()
            # skip search/list pages
            if "/search" in llink or "/buscar" in llink or "/listado" in llink or llink.endswith("/rey") and "olimpica" in llink and len(llink.split("/")) < 6:
                pass
            price_val = None
            text = title + " " + snippet
            m = re.search(r'\$\s*([0-9]{1,3}(?:[.,][0-9]{3})+(?:[.,][0-9]{2})?)', text)
            if not m:
                m = re.search(r'\$\s*([0-9]{3,6})\b', text)
            if not m:
                m = re.search(r'([0-9]{1,3}(?:[.,][0-9]{3})+(?:[.,][0-9]{2})?)\s*COP', text)
            if m:
                raw = m.group(1).replace('.', '').replace(',', '')
                try:
                    v = float(raw)
                    if v >= 500 and v < 1000000:
                        price_val = v
                except:
                    pass
            if price_val is None:
                continue
            store_name = None
            if "exito.com" in llink: store_name = "Éxito"
            elif "jumbocolombia.com" in llink or "jumbo.co" in llink: store_name = "Jumbo"
            elif "olimpica.com" in llink and "/p/" not in llink and "/producto" not in llink and "/rey" not in llink:
                continue
            elif "carulla.com" in llink: store_name = "Carulla"
            elif "mercaldas.com" in llink: store_name = "Mercaldas"
            elif "surtifamiliar.com" in llink: store_name = "Surtifamiliar"
            elif "berpa.com.co" in llink: store_name = "Berpa"
            elif "colombianproducts.co" in llink: store_name = "Colombian Products"
            elif "megatiendas.co" in llink: store_name = "Megatiendas"
            else:
                continue
            if "/p/" in llink or "producto" in llink or "product" in llink:
                pass
            results.append({"store": store_name, "price": price_val, "currency": "COP", "url": link, "title": title, "snippet": snippet})
    except Exception as e:
        print(e)
        return {"query": q, "trace_id": trace_id, "results": [], "message": "No encuentro nada"}
    
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
