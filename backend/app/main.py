from fastapi import FastAPI

app = FastAPI(title="Smart Pantry & Price Comparator")

@app.get("/health")
def health():
    return {"status": "ok"}

try:
    from app.api import products
    from app.core import database
    from app.models import base, product, shopping
    try:
        base.Base.metadata.create_all(bind=database.engine)
    except Exception:
        pass
    app.include_router(products.router)
except Exception:
    pass

try:
    from app.api import shopping
    app.include_router(shopping.router)
except Exception:
    pass

try:
    from app.api import prices
    app.include_router(prices.router)
except Exception:
    pass

try:
    from app.models import price
    base.Base.metadata.create_all(bind=database.engine)
except Exception:
    pass

try:
    from app.api import observability
    app.include_router(observability.router)
except Exception:
    pass
