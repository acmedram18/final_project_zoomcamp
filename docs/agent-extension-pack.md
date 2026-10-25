# Agent Extension Pack

## Components
- Skills: agent-capabilities/skills/optimize-shopping-list/
- Subagents: agent-capabilities/subagents/oncall-investigator.md
- MCP: mcp-server/ (price-search tools)
- Custom Agent: custom-agent/oncall_agent.py
- Hooks: agent-hooks/
- Permissions: docs/permissions.md

## Demo Steps
1. Trigger alert via /obs/alert/trigger
2. Custom on-call agent wakes up, uses subagent to investigate (trace ID)
3. Applies optimize-shopping-list skill (expiring soon first)
4. Uses MCP price-search to get best store
5. Creates incident with actions_taken

## Usage
All components integrate with Smart Pantry & Price Comparator observability and on-call flow.

## Documentation
English. Tracked via issue [#12].
