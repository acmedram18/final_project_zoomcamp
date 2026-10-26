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

@app.get("/debug-db")
def debug_db():
    from app.core import database
    import sqlalchemy
    try:
        engine = database.engine
        with engine.connect() as conn:
            res = conn.execute(sqlalchemy.text("SELECT 1"))
            return {"connected": True, "result": [r[0] for r in res]}
    except Exception as e:
        return {"connected": False, "error": str(e)}

try:
    from app.api import products
    from app.core import database
    from app.models import base, product, shopping
    base.Base.metadata.create_all(bind=database.engine)
    app.include_router(products.router)
except Exception as e:
    print("Products router/db error:", e)

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
    from app.api import observability
    app.include_router(observability.router)
except Exception:
    pass

try:
    from app.api import oncall
    app.include_router(oncall.router)
except Exception:
    pass
