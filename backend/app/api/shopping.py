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


@router.post("/generate")
def generate_shopping(db: Session = Depends(get_db)):
    from app.models.product import Product
    from app.models.shopping import ShoppingListItem
    created = 0
    # from low stock
    products = db.query(Product).all()
    for p in products:
        if p.min_stock and p.quantity < p.min_stock:
            exists = db.query(ShoppingListItem).filter(ShoppingListItem.product_id == p.id, ShoppingListItem.status == "pending").first()
            if not exists:
                item = ShoppingListItem(product_id=p.id, name=p.name, quantity_suggested=p.min_stock - p.quantity, quantity_to_buy=p.min_stock - p.quantity, source="low_stock", status="pending")
                db.add(item)
                created += 1
    db.commit()
    return {"created": created}


@router.post("/buy/{item_id}")
def buy_item(item_id: int, db: Session = Depends(get_db)):
    from app.models.shopping import ShoppingListItem
    from app.models.product import Product
    item = db.query(ShoppingListItem).filter(ShoppingListItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.product_id:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if prod:
            prod.quantity = (prod.quantity or 0) + (item.quantity_to_buy or item.quantity_suggested or 0)
            if prod.quantity > 0:
                prod.status = "in_stock"
    item.status = "bought"
    db.commit()
    return {"ok": True}
