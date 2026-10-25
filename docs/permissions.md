# Permissions & Security

## Agents
- Orchestrator: coordinates issues, commits with signatures, tracks progress
- Coder: implements features, limited to codebase changes
- Tester: runs tests, read/write test files
- DevOps: manages docker/compose
- Observability: telemetry instrumentation (no secrets)
- On-Call: responds to alerts with actionable steps

## Subagents
- oncall-investigator: read-only access to telemetry/inventory/shopping, no secret access
- Limited context window, trace ID correlation only

## MCP Servers
- price-search: scoped to search_prices and get_best_store only, no filesystem/network beyond price search scope

## Hooks/Guardrails
- Pre-commit: prevent .env/secrets
- No logging of credentials/PII
- All actions tracked via issues

## Documentation
English. Tracked via issue [#12].
