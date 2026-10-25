import json
import uuid
from datetime import datetime

def log_event(action: str, trace_id: str = None, **kwargs):
    if trace_id is None:
        trace_id = str(uuid.uuid4())
    event = {"timestamp": datetime.utcnow().isoformat(), "trace_id": trace_id, "action": action, **kwargs}
    print(json.dumps(event))
    return trace_id
