from sqlalchemy import Column, Integer, String, Date, DateTime, Float
from sqlalchemy.sql import func
from .base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String)
    quantity = Column(Float, default=0)
    unit = Column(String)
    expiration_date = Column(Date)
    min_stock = Column(Float, default=0)
    status = Column(String, default="in_stock")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
