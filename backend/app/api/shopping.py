from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.models.shopping import ShoppingListItem
from app.core import database

router = APIRouter(prefix="/shopping", tags=["shopping"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[dict])
def list_shopping(db: Session = Depends(get_db)):
    items = db.query(ShoppingListItem).all()
    return [{"id": i.id, "product_id": i.product_id, "name": i.name, "quantity_suggested": i.quantity_suggested, "quantity_to_buy": i.quantity_to_buy, "source": i.source, "status": i.status} for i in items]
