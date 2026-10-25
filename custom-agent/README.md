# Custom Agent: oncall_agent

## Purpose
Custom on-call agent for Smart Pantry & Price Comparator.

## Behavior
- Wakes up on alerts (user-impact based)
- Uses subagent oncall-investigator for investigation
- Uses skill optimize-shopping-list for prioritization
- Uses MCP server for price search tools
- Takes actionable steps and documents incidents

## Usage
Triggered by alerts via observability system or manually.

## Tracked
Issue [#12].
