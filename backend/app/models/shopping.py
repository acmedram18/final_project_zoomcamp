from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from .base import Base

class ShoppingListItem(Base):
    __tablename__ = "shopping_list_items"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer)
    name = Column(String, nullable=False)
    quantity_suggested = Column(Float)
    quantity_to_buy = Column(Float)
    source = Column(String)
    status = Column(String, default="pending")
    added_at = Column(DateTime(timezone=True), server_default=func.now())
