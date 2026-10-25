from fastapi import APIRouter
import uuid

router = APIRouter(prefix="/obs", tags=["observability"])

@router.get("/metrics")
def metrics():
    return {"products_expiring_soon": 0, "products_out_of_stock": 0, "shopping_list_items": 0, "price_searches_count": 0, "alerts_triggered": 0}

@router.get("/trace")
def trace():
    trace_id = str(uuid.uuid4())
    return {"trace_id": trace_id, "spans": [{"name": "request", "trace_id": trace_id}]}

@router.post("/alert/trigger")
def trigger_alert():
    from app.core.telemetry import log_event
    trace_id = log_event("alert_triggered", user_impact="high", alert_type="expiring_soon")
    return {"alert": {"type": "expiring_soon", "severity": "high", "trace_id": trace_id, "user_impact": "high"}}
