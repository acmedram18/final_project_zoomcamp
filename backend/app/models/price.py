from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from .base import Base

class PriceSearch(Base):
    __tablename__ = "price_searches"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String)
    store = Column(String)
    price = Column(Float)
    currency = Column(String, default="USD")
    url = Column(String)
    found_at = Column(DateTime(timezone=True), server_default=func.now())
    trace_id = Column(String)
from app.models.base import Base
