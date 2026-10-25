from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import crud
from app.schemas import product as product_schema
from app.core import database

router = APIRouter(prefix="/products", tags=["products"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=product_schema.Product)
def create_product(product: product_schema.ProductCreate, db: Session = Depends(get_db)):
    return crud.product.create_product(db=db, product=product)

@router.get("/", response_model=List[product_schema.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = crud.product.get_products(db, skip=skip, limit=limit)
    return products

@router.get("/{product_id}", response_model=product_schema.Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    db_product = crud.product.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.put("/{product_id}", response_model=product_schema.Product)
def update_product(product_id: int, product: product_schema.ProductUpdate, db: Session = Depends(get_db)):
    db_product = crud.product.update_product(db, product_id=product_id, product=product)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = crud.product.delete_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"ok": True}


@router.post("/{product_id}/out_of_stock")
def mark_out_of_stock(product_id: int, db: Session = Depends(get_db)):
    db_product = crud.product.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    db_product.quantity = 0
    db_product.status = "out_of_stock"
    db.commit()
    db.refresh(db_product)
    # auto-add to shopping list
    from app.models.shopping import ShoppingListItem
    existing = db.query(ShoppingListItem).filter(ShoppingListItem.product_id == product_id, ShoppingListItem.status == "pending").first()
    if not existing:
        item = ShoppingListItem(product_id=product_id, name=db_product.name, quantity_suggested=db_product.min_stock or 1, quantity_to_buy=db_product.min_stock or 1, source="out_of_stock", status="pending")
        db.add(item)
        db.commit()
        db.refresh(item)
    return {"ok": True, "product": db_product}


@router.get("/expiring/soon")
def expiring_soon(days: int = 7, db: Session = Depends(get_db)):
    from datetime import date, timedelta
    from app.models.product import Product
    today = date.today()
    limit = today + timedelta(days=days)
    products = db.query(Product).filter(Product.expiration_date != None, Product.expiration_date >= today, Product.expiration_date <= limit).all()
    return [{"id": p.id, "name": p.name, "expiration_date": p.expiration_date.isoformat() if p.expiration_date else None, "quantity": p.quantity} for p in products]


@router.get("/alerts/expiring")
def alerts_expiring(days: int = 3, db: Session = Depends(get_db)):
    from datetime import date, timedelta
    from app.models.product import Product
    import uuid
    today = date.today()
    limit = today + timedelta(days=days)
    products = db.query(Product).filter(Product.expiration_date != None, Product.expiration_date >= today, Product.expiration_date <= limit).all()
    if products:
        trace_id = str(uuid.uuid4())
        return {"alert": True, "severity": "high", "count": len(products), "trace_id": trace_id, "products": [{"id": p.id, "name": p.name, "expiration_date": p.expiration_date.isoformat()} for p in products]}
    return {"alert": False}
