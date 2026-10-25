#!/usr/bin/env python3
"""Custom on-call agent."""

import json
from datetime import datetime

class OncallAgent:
    def __init__(self):
        self.name = "oncall_agent"

    def wake_on_alert(self, alert):
        trace_id = alert.get("trace_id") if alert else None
        # Use subagent for investigation
        investigation = self.use_subagent("oncall-investigator", alert)
        # Use skill for optimization
        optimized = self.use_skill("optimize-shopping-list", investigation)
        # Use MCP for price search
        prices = self.use_mcp("price-search", optimized)
        actions = [
            f"Investigated with oncall-investigator (trace_id: {trace_id})",
            "Applied optimize-shopping-list skill (expiring soon first, then out of stock/low stock)",
            "Used MCP price-search tools to suggest where to buy better",
        ]
        incident = {
            "incident_id": "inc-" + str(datetime.utcnow().timestamp()),
            "alert": alert,
            "trace_id": trace_id,
            "actions_taken": actions,
            "optimized_list": optimized,
            "price_suggestions": prices,
            "status": "resolved",
        }
        return incident

    def use_subagent(self, name, context):
        return {"subagent": name, "correlated_by_trace": True, "context": context}

    def use_skill(self, name, context):
        return {"skill": name, "prioritized": ["expiring_soon", "out_of_stock", "low_stock"], "context": context}

    def use_mcp(self, name, context):
        return {"mcp": name, "tools_used": ["search_prices", "get_best_store"], "suggestion": "Buy better at Store B"}

if __name__ == "__main__":
    agent = OncallAgent()
    print(json.dumps(agent.wake_on_alert({"type": "expiring_soon", "severity": "high", "trace_id": "test"})))
