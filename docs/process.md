# Process & Workflow

## Task Tracking (Required)

- **Public tracker**: GitHub Issues + GitHub Projects (publicly accessible)
- **Every issue must have acceptance criteria** defined
- **Agents must use the tracker**: Issues should show activity (comments, status changes, PR references)
- **Linking**: PRs should reference issue IDs (e.g. `#123`)

## Agent Workflow

| Step | Who | Action |
|---|---|---|
| **1. Planning** | Planner | Create issues with clear acceptance criteria, add to project board |
| **2. Design** | Architect | Update docs/architecture.md with relevant design decisions |
| **3. Implementation** | Coder | Implement, follow conventions, reference issues |
| **4. Testing** | Tester | Add unit/integration tests, verify against acceptance criteria |
| **5. Review/Polish** | Team | Ensure docs updated, tracker reflects progress |
| **6. Infra/Deploy** | DevOps | Docker/CI-CD, ensure single-command run |
| **7. Observability** | Observability Engineer | Instrument, create alerts, validate telemetry |
| **8. Response** | On-Call Agent | Handle alerts, act, document incidents |

## Definition of Done (Project Level)

A feature/task is done when:
- [ ] Acceptance criteria from the issue are met
- [ ] Code is implemented and tested (unit + integration as applicable)
- [ ] Tests pass with single command
- [ ] Documentation updated (README/AGENTS/docs as needed)
- [ ] Issue updated on tracker with evidence
- [ ] No secrets committed
- [ ] App remains runnable with `docker compose up --build`

## Evidence for Reviewers

Reviewers need to see:
- Clear problem description in README
- Agent team defined in AGENTS.md
- Modular docs in `docs/` linked from AGENTS.md
- Public GitHub Issues/Projects with acceptance criteria
- Evidence agents used the tracker
- Working full-stack app
- Tests, containerization, deployment, observability, alerts, on-call agent
