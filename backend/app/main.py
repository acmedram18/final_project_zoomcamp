from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import traceback

app = FastAPI(title="FiambreApp: La alacena del ahorro")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

from app.api import products, shopping, prices, observability, oncall
from app.core import database
from app.models import base, product, shopping as shopping_model, price as price_model

@app.on_event("startup")
def on_startup():
    try:
        base.Base.metadata.create_all(bind=database.engine)
        print("Database tables verified/created successfully.")
    except Exception as e:
        print("Error during database initialization:", e)
        traceback.print_exc()

app.include_router(products.router)
app.include_router(shopping.router)
app.include_router(prices.router)
app.include_router(observability.router)
app.include_router(oncall.router)
