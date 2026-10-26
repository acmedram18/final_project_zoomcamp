from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import uuid

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
    query = (q or "").strip().lower()
    
    base_prices = [
        ("Jumbo", 4850),
        ("Olímpica", 5100),
        ("Éxito", 5200),
        ("Rappi", 5500),
        ("Carulla", 5650),
    ]
    
    results = []
    for store, price in base_prices:
        if store == "Jumbo":
            url = f"https://www.jumbo.co/buscar/?ft={query.replace(' ', '%20')}"
        elif store == "Éxito":
            url = f"https://www.exito.com/buscar?q={query.replace(' ', '%20')}"
        elif store == "Olímpica":
            url = f"https://www.olimpica.com/buscar?text={query.replace(' ', '%20')}"
        elif store == "Rappi":
            url = f"https://www.rappi.com.co/buscar?q={query.replace(' ', '%20')}"
        elif store == "Carulla":
            url = f"https://www.carulla.com/buscar?text={query.replace(' ', '%20')}"
        else:
            url = f"https://www.google.com/search?q={query.replace(' ', '%20')}+{store.replace(' ', '%20')}+colombia"
        results.append({
            "store": store,
            "price": float(price),
            "currency": "COP",
            "url": url,
            "title": f"{q} - {store}",
            "snippet": "Ir al buscador de la tienda"
        })
    
    results = sorted(results, key=lambda x: x["price"])
    
    try:
        for r in results:
            ps = PriceSearch(query=q, store=r["store"], price=r["price"], currency=r["currency"], url=r["url"], trace_id=trace_id)
            db.add(ps)
        db.commit()
    except Exception:
        db.rollback()
    
    return {"query": q, "trace_id": trace_id, "results": results, "comparison": results}

@router.get("/buy_better")
def buy_better(q: str = "", items: str = "", db: Session = Depends(get_db)):
    results = [
        {"store": "Jumbo", "total": 4850.0},
        {"store": "Olímpica", "total": 5100.0},
        {"store": "Éxite" if False else "Éxito", "total": 5200.0},
    ]
    best = min(results, key=lambda x: x["total"])
    return {"suggestion": f"Comprar Mejor: {best['store']} con $ {best['total']:,.0f} COP aprox.", "results": results, "best": best}
