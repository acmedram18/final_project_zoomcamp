from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
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
def search_prices(q: str, db: Session = Depends(get_db)):
    trace_id = str(uuid.uuid4())
    results = [
        {"store": "Store A", "price": 3.50, "currency": "USD", "url": "https://store-a.example/item"},
        {"store": "Store B", "price": 2.99, "currency": "USD", "url": "https://store-b.example/item"},
    ]
    for r in results:
        ps = PriceSearch(query=q, store=r["store"], price=r["price"], currency=r["currency"], url=r["url"], trace_id=trace_id)
        db.add(ps)
    db.commit()
    return {"query": q, "trace_id": trace_id, "results": results, "comparison": results}
