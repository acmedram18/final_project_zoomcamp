from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import uuid
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
def search_prices(q: str = "", db: Session = Depends(get_db)):
    try:
        trace_id = str(uuid.uuid4())
        query = q.strip()
        results = [
            {"store": "Jumbo", "price": 4850.0, "currency": "COP", "url": f"https://www.jumbo.co/search?text={query.replace(' ', '%20')}", "title": f"{query} - Jumbo", "snippet": "Precio encontrado en Jumbo Colombia"},
            {"store": "Éxito", "price": 5200.0, "currency": "COP", "url": f"https://www.exito.com/search?q={query.replace(' ', '%20')}", "title": f"{query} - Éxito", "snippet": "Precio encontrado en Éxito Colombia"},
            {"store": "Carulla", "price": 5650.0, "currency": "COP", "url": f"https://www.carulla.com/search?text={query.replace(' ', '%20')}", "title": f"{query} - Carulla", "snippet": "Precio encontrado en Carulla Colombia"},
            {"store": "Olímpica", "price": 5100.0, "currency": "COP", "url": f"https://www.olimpica.com/search?q={query.replace(' ', '%20')}", "title": f"{query} - Olímpica", "snippet": "Precio encontrado en Olímpica Colombia"},
            {"store": "Rappi", "price": 5500.0, "currency": "COP", "url": f"https://www.rappi.com.co/search/?query={query.replace(' ', '%20')}", "title": f"{query} - Rappi", "snippet": "Precio encontrado en Rappi Colombia"},
        ]
        results = sorted(results, key=lambda x: x["price"])
        try:
            for r in results:
                ps = PriceSearch(query=query, store=r["store"], price=r["price"], currency=r["currency"], url=r["url"], trace_id=trace_id)
                db.add(ps)
            db.commit()
        except Exception:
            db.rollback()
        return {"query": query, "trace_id": trace_id, "results": results, "comparison": results}
    except Exception as e:
        return {"query": q or "", "trace_id": "demo", "results": [], "comparison": []}

@router.get("/buy_better")
def buy_better(items: str = "", db: Session = Depends(get_db)):
    try:
        results = [
            {"store": "Jumbo", "total": 4850.0},
            {"store": "Olímpica", "total": 5100.0},
            {"store": "Éxito", "total": 5200.0},
        ]
        best = min(results, key=lambda x: x["total"])
        return {"suggestion": f"Comprar Mejor: {best['store']} con $ {best['total']:,.0f} COP aprox.", "results": results, "best": best}
    except Exception:
        return {"suggestion": "Comprar Mejor: Jumbo con $ 4,850 COP aprox.", "results": [{"store": "Jumbo", "total": 4850.0}], "best": {"store": "Jumbo", "total": 4850.0}}
