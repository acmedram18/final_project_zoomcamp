# Hooks & Guardrails

## Purpose
Prevent mistakes and enforce safety checks for the agent team.

## Guardrails
- **No secrets**: Prevent committing .env files, API keys, passwords, or personal data
- **No sensitive logs**: Telemetry must not contain credentials/PII
- **Scope enforcement**: MCP tools and subagents operate with limited permissions
- **Evidence required**: All work tracked via issues with acceptance criteria

## Hooks (Conceptual)
- **pre-commit**: Check for .env, credentials patterns
- **pre-push**: Validate tests pass if configured
- **post-action**: Log actions with trace_id for observability

## Implementation Notes
Add .gitignore entries for .env, secrets. Document behavior in English.

## Tracked
Issue [#11].
