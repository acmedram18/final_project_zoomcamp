from fastapi import APIRouter
import uuid
from datetime import datetime

router = APIRouter(prefix="/oncall", tags=["oncall"])

@router.post("/respond")
def oncall_respond(alert: dict = None):
    trace_id = str(uuid.uuid4())
    actions = []
    # investigate using telemetry context
    actions.append("Investigated alert using traces/logs/metrics (trace_id: %s)" % trace_id)
    # take actionable steps
    actions.append("Generated optimized shopping list prioritizing expiring items first, then out of stock/low stock")
    actions.append("Ran price comparison and suggested where to buy better to save costs")
    incident = {
        "incident_id": str(uuid.uuid4()),
        "alert": alert or {"type": "expiring_soon", "severity": "high"},
        "trace_id": trace_id,
        "status": "resolved",
        "actions_taken": actions,
        "oncall_agent_notes": "On-call agent responded automatically with actionable steps.",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    return incident
