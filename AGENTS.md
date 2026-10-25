# AGENTS.md

## Purpose

This document defines the agent team responsible for building **Smart Pantry & Price Comparator**. It describes roles, responsibilities, collaboration process, and how agents use the project documentation and task tracker.

## Project Context

All project decisions, requirements and progress must follow:
- `README.md` - Problem description, features, acceptance criteria
- `docs/` - Modular documentation (to be expanded as needed: architecture, testing, observability, etc.)
- **GitHub Issues + GitHub Projects** - Public task tracker with acceptance criteria

## Agent Team

The team works as a coordinated unit. Each agent has a specific role, but they must collaborate through the task tracker and shared context.

| Agent | Role | Responsibilities | Tools/Focus |
|---|---|---|---|
| **Planner** | Orchestrator | Define scope, break down features into tasks, write clear acceptance criteria, keep the task tracker updated, ensure alignment with README requirements. | GitHub Issues/Projects, README, AGENTS.md |
| **Architect** | System Designer | Design the full-stack architecture (frontend/backend/db), API contracts, data models, containerization strategy and integration points for price search. | Architecture docs, diagrams, API design |
| **Coder** | Implementer | Implement features end-to-end (frontend + backend), follow existing patterns, write clean code and update relevant docs when behavior changes. | Codebase, linters, typecheckers |
| **Tester** | QA Engineer | Write and maintain unit and integration tests. Ensure tests run with a single command, cover critical flows (e.g. "mark as out of stock" -> shopping list) and validate acceptance criteria. | Test framework, coverage reports |
| **DevOps** | Deployment/Infra | Handle Docker/Docker Compose, environment variables, CI/CD pipelines, deployments, and rollback paths. Keep the app runnable with a single command. | Docker, GitHub Actions, deployment platform |
| **Observability Engineer** | Telemetry Specialist | Instrument the app with logs, metrics, traces and trace IDs. Ensure no sensitive data goes to telemetry. Make signals viewable in a UI and define user-impact based alerts. | Logging/Tracing/Metrics stack, dashboards |
| **On-Call Agent** | Incident Responder | Wakes up on alerts (user-impact based). Investigates using traces/logs/metrics, takes corrective action when possible (e.g. generate optimized shopping list, prioritize items, suggest actions) and documents the incident. | Alerts, observability UI, task tracker, automation logic |

## How They Work Together

1. **Plan**: Planner creates issues in GitHub Issues with detailed acceptance criteria and adds them to GitHub Projects. Evidence of agent usage of the tracker must be visible (issue comments, links, status changes).
2. **Design**: Architect reviews issues and creates/updates design notes in `docs/architecture.md` (or relevant files). AGENTS.md points to these docs.
3. **Implement**: Coder picks up issues, implements changes, and references the issue ID in commits/PRs.
4. **Test**: Tester validates against acceptance criteria. Unit and integration tests must be added for new functionality.
5. **Containerize & Deploy**: DevOps ensures Docker/Compose and CI/CD work. Tests run on PRs, and deployment is automated as required.
6. **Observe**: Observability Engineer instruments key user journeys (e.g. adding to inventory, marking out of stock, price search, restocking). Creates dashboards and defines alerts based on user impact.
7. **Respond**: On-Call Agent is triggered by alerts. It uses telemetry to understand the issue and takes action (e.g. generate an optimized shopping list prioritizing expiring items + cheapest prices) and updates the incident/task tracker.

## Context Management Rules

- **Single Source of Truth**: Always read `README.md` first to understand requirements.
- **Modular Docs**: Keep detailed docs in `docs/` (architecture, process, testing, observability, alerts). `AGENTS.md` must link to them.
- **Task-Driven**: All work must be tracked as issues with acceptance criteria. No untracked work.
- **Evidence**: Agents must leave traceable evidence (issue updates, PR links, comments) showing they used the tracker.
- **English Documentation**: All project documentation must be in English.
- **No Secrets**: Never log credentials, API keys or personal data. Telemetry must be sanitized.
- **Keep it Runnable**: Any change must keep the project runnable with `docker compose up --build`.

## Documentation Structure (Planned)

- `README.md` - Problem, features, acceptance criteria, run instructions
- `AGENTS.md` - This file (team + process)
- `docs/architecture.md` - System design, components, data model
- `docs/process.md` - Workflow details, DoD, agent collaboration
- `docs/testing.md` - Testing strategy and how to run tests
- `docs/observability.md` - Metrics, traces, logs, alerts
- `docs/alerts-and-oncall.md` - Alert definitions and on-call agent behavior

*(These files will be created as the project evolves.)*
