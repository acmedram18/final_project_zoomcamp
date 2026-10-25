from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class ProductBase(BaseModel):
    name: str
    category: Optional[str] = None
    quantity: float = 0
    unit: Optional[str] = None
    expiration_date: Optional[date] = None
    min_stock: float = 0

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    expiration_date: Optional[date] = None
    min_stock: Optional[float] = None
    status: Optional[str] = None

class Product(ProductBase):
    id: int
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
