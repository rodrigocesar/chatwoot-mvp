<!--
Sync Impact Report
==================
Version change: 1.0.0 → 1.1.0
Modified principles:
  - I. Simplicity & Demo-First MVP → I. Simplicity First (expanded)
  - III. Clean Architecture → VI. Clear Architectural Boundaries (expanded)
  - IV. API-Based Chatwoot Integration → II + III (split: external engine + upgradeability ladder)
  - VII. Security, Secrets & Cost Awareness → VIII + XIV (split: security/privacy vs cost)
  - VIII. Documentation & Visible Demo Value → IX + XIII (split: visible MVP vs decision docs)
Added sections:
  - Project Purpose
  - Integration & Adapter Policy (all external systems)
  - Product & Demo Standards (seed data, spike discipline, PT-BR context)
  - Definition of Done
  - Principles V, X–XII, XV–XVIII (new)
  - Expanded Development Workflow (7 steps)
  - Operational Clarity (Principle XV) embedded in principles + workflow
Removed sections: none (content reorganized and expanded)
Templates:
  - .specify/templates/plan-template.md — ✅ updated (Constitution Check v1.1.0)
  - .specify/templates/tasks-template.md — ✅ updated (seed data, spikes, DoD tasks)
  - .specify/templates/spec-template.md — ✅ no change required
Runtime guidance:
  - .cursor/rules/moonu-chatwoot-mvp.mdc — ✅ updated (adapter-first, seed data, spikes)
  - specs/001-chatwoot-omnichannel-mvp/plan.md — ✅ updated (Constitution Check v1.1.0)
Follow-up TODOs: none
-->

# Moonu Chatwoot MVP Constitution

## Project Purpose

This project evaluates whether Chatwoot can be used as a **white-label or embedded
omnichannel layer** on top of a Moonu-like cloud telephony and virtual PBX platform.

The MVP MUST simulate enough of Moonu's customer, subscription, phone number, and extension
management to demonstrate how a PBX customer could be provisioned into Chatwoot for
omnichannel support, starting with WhatsApp.

The project MUST prioritize **learning, architectural clarity, and a demoable product**
over premature production completeness.

## Core Principles

### I. Simplicity First

The system MUST prefer the simplest solution that proves the product and technical hypothesis.

- Avoid unnecessary microservices, complex infrastructure, premature abstractions, and
  over-engineered automation.
- A single application with clear internal boundaries is preferred over multiple services
  unless a specific technical reason is documented in the plan.
- When choosing between a complete but complex solution and a smaller demoable vertical
  slice, choose the vertical slice.
- Every feature MUST answer: *"Does this help us validate Chatwoot as a Moonu omnichannel
  plugin?"*

**Rationale**: The repository is an evaluation vehicle, not a production platform.

### II. Chatwoot Is an External Omnichannel Engine

The project MUST NOT start by forking Chatwoot.

Chatwoot MUST be treated as an external self-hosted service controlled through
configuration, APIs, links, and integration adapters.

**Moonu Simulator owns**:

- Customers
- Subscriptions
- Simulated phone numbers
- Simulated PBX extensions
- Billing status (simulated in MVP)
- Chatwoot mapping metadata
- Omnichannel activation state

**Chatwoot owns**:

- Conversations
- Inboxes
- Contacts
- Agent conversation handling
- WhatsApp message workflows
- Omnichannel support UI

Any direct dependency on Chatwoot internals MUST be avoided unless explicitly documented
and approved via decision record.

**Rationale**: Moonu remains the control plane; Chatwoot remains the conversation engine.

### III. Upgradeability Over Deep Customization

The MVP MUST preserve the ability to follow upstream Chatwoot releases.

Customization MUST prefer this order:

1. Configuration
2. API integration
3. Theming or light branding
4. External wrapper UI
5. Small isolated patch
6. Forking Chatwoot

Forking Chatwoot is a **last resort** and requires a written decision record in
`docs/decisions/` explaining why API-based or configuration-based integration is
insufficient. Any customization MUST be evaluated against future upgrade cost.

**Rationale**: Deep customization destroys the primary benefit of adopting Chatwoot.

### IV. Local-First and Easy to Run

A developer MUST be able to run the MVP locally with minimal setup.

The project MUST provide:

- Clear README instructions
- Docker Compose where useful
- Environment variable examples (`.env.example`)
- Seed data for demo customers
- Mock mode for Chatwoot integration
- No requirement for real WhatsApp credentials for the first demo

The local development path MUST work before AWS deployment is attempted.

The project MUST support a **demo mode** that works when Chatwoot APIs or WhatsApp
credentials are not yet configured.

**Rationale**: Learning and demos happen on laptops first.

### V. Deployable by Design

The MVP MUST be designed so it can later be deployed to AWS without a major rewrite.

- Runtime configuration MUST come from environment variables, not hardcoded values.
- Secrets MUST NEVER be committed to Git.
- The application MUST separate build, configuration, and runtime concerns.
- Deployment MUST start simple: a single VM or simple container deployment is acceptable
  for MVP. ECS, Kubernetes, RDS, or ElastiCache MUST be considered only after the local
  PoC is validated.

**Rationale**: Local-first does not mean deployment-hostile; env-based config enables
later cloud migration.

### VI. Clear Architectural Boundaries

The system MUST have explicit boundaries between:

- Moonu simulation domain
- Chatwoot integration
- UI
- Persistence
- Configuration
- Deployment infrastructure

All Chatwoot operations MUST go through a `ChatwootAdapter` interface. The rest of the
application MUST NOT call Chatwoot APIs directly.

The adapter MUST support at least two modes: **mock** and **real Chatwoot API**.

When Chatwoot behavior is unknown, the implementation MUST mark the operation as
**manual**, **mocked**, or **pending research**—never invent undocumented behavior.

**Rationale**: Boundaries keep the simulator maintainable and testable.

### VII. Tenant Isolation Is a First-Class Concern

The MVP MUST model multiple Moonu customers from the beginning.

- A Moonu customer MUST map to a Chatwoot account, workspace, or equivalent tenant
  boundary.
- Tenant boundaries MUST be visible in the UI and data model.
- The MVP MUST include at least two simulated customers to test separation of data,
  users, agents, inboxes, and access.
- Uncertainty around Chatwoot multi-tenancy MUST be documented as a risk in
  `docs/chatwoot-investigation.md` or `research.md`.

**Rationale**: SaaS viability depends on provable isolation.

### VIII. Security and Privacy by Default

The project MUST assume customer communication data is sensitive.

- MUST avoid leaking data between tenants.
- Secrets, tokens, API keys, webhook secrets, and WhatsApp credentials MUST NEVER be
  stored in plaintext source files.
- Configuration examples MUST use placeholders only.
- Authentication MAY be simplified for MVP, but security shortcuts MUST be explicitly
  marked as **MVP-only** in documentation.
- The project MUST document what would need to change before production use in
  `docs/production-gaps.md` (or equivalent).

**Rationale**: Integration experiments still handle realistic tenant and credential data.

### IX. Visible, Interactable MVP Over Backend-Only Work

Every major feature MUST have visible user-facing behavior.

The MVP MUST demonstrate a Moonu admin enabling omnichannel for a customer. The UI MUST
show:

- Customer list
- Customer detail
- Simulated phone numbers
- Simulated PBX extensions
- Omnichannel status
- Chatwoot account linkage
- Agent linkage
- WhatsApp setup status
- Link to open Chatwoot

Backend work that does not support a visible product flow MUST be postponed unless it is
necessary infrastructure.

**Rationale**: Stakeholders evaluate the hypothesis by using the product, not reading code.

### X. Manual First, Automate Later

The MVP MAY start with guided manual steps for Chatwoot and WhatsApp setup.

Automation MUST be added incrementally only after the manual workflow is understood.

The UI MUST clearly distinguish:

- `automated`
- `manual_setup_required`
- `mocked`
- `not_implemented`
- `failed`
- `connected`

The goal is NOT to automate everything immediately. The goal is to identify which parts
can be automated safely and which require operational or product decisions.

**Rationale**: Honest status builds trust and guides incremental automation.

### XI. Test the Business Hypothesis, Not Only the Code

The project MUST validate whether Chatwoot can support a Moonu-style omnichannel add-on.

Each implementation phase MUST answer at least one product or architecture question, such as:

- Can a Moonu customer be represented cleanly in Chatwoot?
- Can agents be linked to Chatwoot users?
- Can two customers be isolated?
- Can WhatsApp setup be guided or automated?
- Can Chatwoot be opened from a Moonu-like dashboard?
- Can the integration work without modifying Chatwoot?

**Rationale**: Code that passes tests but does not answer product questions wastes effort.

### XII. Testing Is Required for Core Behavior

Core domain behavior MUST have automated tests.

The project MUST test:

- Customer creation
- Phone number creation
- Extension creation
- Omnichannel activation
- Chatwoot mapping creation
- Mock Chatwoot adapter behavior
- Tenant isolation rules

For UI behavior, test the most important user flows rather than every visual detail.

Untested code is acceptable ONLY for clearly marked prototypes or temporary spikes.

**Rationale**: Core provisioning paths are the integration contract; they must not regress.

### XIII. Document Decisions and Unknowns

The project MUST maintain architecture notes and decision records in `docs/decisions/`.

Important decisions MUST be documented, especially:

- Whether to fork Chatwoot
- Shared vs per-customer Chatwoot instances
- WhatsApp setup: manual, semi-automated, or automated
- Tenant isolation approach
- White-labeling approach
- Deployment evolution

Unknowns MUST NOT be hidden; track them explicitly in specs, research, or decision docs.

**Rationale**: This project is a research instrument; undocumented unknowns become false
certainty.

### XIV. Cost Awareness

The MVP MUST avoid expensive infrastructure by default.

- Local development SHOULD be free except for optional external services.
- AWS deployment MUST start with the lowest reasonable cost option.
- Managed services MAY be introduced only when operational burden reduction justifies cost.
- Paid external dependencies (WhatsApp, telephony, hosting, managed databases) MUST be
  documented with cost implications.

**Rationale**: Evaluation projects die when infra cost exceeds learning value.

### XV. Operational Clarity

The system MUST be easy to operate.

The project MUST provide:

- Startup instructions
- Shutdown instructions
- Environment variable documentation
- Database setup instructions
- Seed data instructions
- Troubleshooting notes
- Deployment notes

The application MUST produce useful logs for important integration events, especially
Chatwoot provisioning and WhatsApp setup state changes.

**Rationale**: Unoperable demos cannot be repeated or handed to stakeholders.

### XVI. Prefer Reversible Decisions

The MVP MUST avoid decisions that are hard to undo.

The system MUST make it easy to switch:

- Mock Chatwoot adapter ↔ real adapter
- SQLite ↔ PostgreSQL
- Local deployment ↔ AWS deployment
- Manual WhatsApp setup ↔ automated setup
- External Chatwoot link ↔ embedded experience (future)

Irreversible architectural decisions REQUIRE explicit justification in plan
`Complexity Tracking` or a decision record.

**Rationale**: Early PoC choices should not lock in expensive paths.

### XVII. No Real PBX Implementation in the MVP

The MVP MUST NOT implement SIP, WebRTC calling, call routing, call recording, IVR,
queues, or real browser calling.

PBX concepts MUST be simulated only to provide context for omnichannel integration.
Moonu's telephony platform remains outside the MVP.

**Rationale**: Scope creep into telephony invalidates the integration experiment.

### XVIII. White-Labeling Is a Product Hypothesis

White-labeling means the customer experiences omnichannel as part of Moonu through
Moonu branding, navigation, domain, and commercial packaging.

The MVP MUST explore white-label feasibility but MUST NOT make deep branding changes to
Chatwoot in the first iteration.

Evaluate white-labeling through:

- User experience
- Branding options
- Licensing constraints
- Upgrade impact
- Required code changes
- Operational complexity

**Rationale**: White-label viability is a core evaluation outcome, separate from fork depth.

## Integration & Adapter Policy

**Adapter-first integration** applies to ALL external systems, not only Chatwoot:

- Chatwoot (required now)
- Meta / WhatsApp (future)
- Future telephony APIs
- Future billing providers

Rules:

- Domain and UI layers MUST depend on adapter interfaces, not vendor SDKs or raw HTTP.
- New external integrations MUST ship with a mock implementation when credentials or APIs
  are unavailable.
- **No fake certainty**: when an agent or developer cannot verify an external API, they
  MUST write a `TODO` or research note with outcome pending—never invent behavior.
- **Spike discipline**: research spikes are allowed; every spike MUST produce a written
  result: `works`, `does not work`, `unknown`, or `requires production credentials`.

## Product & Demo Standards

### Seed data (required)

The project MUST include realistic seed customers for fast demos:

- **Clínica Exemplo** (healthcare SMB, Brazil)
- **Escritório Contábil Alfa** (accounting office, Brazil)
- **Loja Boa Luz** (retail SMB, Brazil)

Seed data MUST include enough telephony and omnichannel variety to demonstrate tenant
isolation and different setup states.

### Locale and language

- **Product context**: Brazilian SMB customers using WhatsApp heavily—labels, examples,
  and demo flows SHOULD reflect this (Portuguese copy in UI examples and seed data).
- **Codebase**: English-first for identifiers, code, comments, and technical documentation
  to maximize maintainability.

## MVP Scope Boundaries

**In scope**:

- Moonu Simulator web app with admin-oriented screens (see Principle IX)
- Simulated customers, phone numbers, PBX extensions, subscriptions, agents
- Omnichannel enablement and Chatwoot linkage (mock or real adapter)
- Guided WhatsApp checklist with honest status labels (Principle X)
- Tenant isolation with multiple customers and seed data
- Local Docker Compose; simple future AWS deployment path

**Out of scope** (unless future spec + constitution amendment):

- Real PBX, SIP, call routing, recording, IVR, browser calling (Principle XVII)
- Real billing, payment processing, subscription enforcement against Chatwoot
- Full automated WhatsApp / Embedded Signup in first iteration
- Chatwoot forks or undocumented internal patches
- Deep Chatwoot white-label branding changes in first iteration
- Production HA, multi-region, or enterprise security hardening

## Development Workflow & Quality Gates

### Required workflow

All work MUST follow this spec-driven sequence:

1. **Constitution** — comply with this document
2. **Feature specification** — `/speckit-specify`
3. **Technical plan** — `/speckit-plan` with Constitution Check
4. **Task breakdown** — `/speckit-tasks`
5. **Implementation** — vertical slices only
6. **Validation** — tests + `quickstart.md`
7. **Decision / update notes** — ADRs and research updates

Agents MUST NOT implement broad features directly from vague prompts. Every task MUST be
traceable to a spec acceptance criterion, FR-xxx, or documented plan item.

### Quality gates (MUST pass before merge)

| Gate | Requirement |
|------|-------------|
| Constitution | Applicable principles satisfied or justified in Complexity Tracking |
| Spec traceability | Changes map to spec/plan; no orphan features |
| Adapter boundary | No direct external API calls outside adapter packages |
| Tenant scoping | Customer-scoped APIs/UI; ≥2 customers for isolation features |
| Secrets | No credentials in diff; `.env.example` updated |
| Tests | Core behaviors in Principle XII covered |
| Demo value | User-visible outcome per Principle IX |
| Manual honesty | Integration ops labeled per Principle X |
| Documentation | README, quickstart, or `docs/decisions/` updated |
| Reversibility | Env-driven config; no hardcoded deployment assumptions |

### Testing expectations

- Mock adapter contract tests are mandatory.
- Real adapter tests are optional and run when Chatwoot compose profile is enabled.
- Primary user journeys MUST run in mock/demo mode without external credentials.

## Definition of Done

A feature is **done** only when ALL of the following are true:

- [ ] User-facing behavior works as specified
- [ ] Data model changes are clear and migrated
- [ ] Relevant automated tests pass
- [ ] Local setup still works (`quickstart.md` or README)
- [ ] Documentation is updated
- [ ] Manual steps are documented and surfaced in UI where applicable
- [ ] Open questions are recorded (not silently deferred)
- [ ] No secrets are committed
- [ ] Chatwoot and other external behavior goes through adapters
- [ ] Implementation does not unnecessarily increase future maintenance or upgrade cost

## Governance

This constitution supersedes conflicting ad hoc practices. `.cursor/rules/moonu-chatwoot-mvp.mdc`
and Spec Kit artifacts (`spec.md`, `plan.md`, `tasks.md`) MUST align with these principles.

### Amendment procedure

1. Propose change with rationale and impact on active specs/plans.
2. Update this file with semantic version bump:
   - **MAJOR**: Principle removal or incompatible governance change
   - **MINOR**: New principle or materially expanded guidance
   - **PATCH**: Clarifications and non-semantic edits
3. Propagate to templates, cursor rules, and active feature plans.
4. Update Sync Impact Report comment and `LAST_AMENDED_DATE`.

### Compliance review

- `/speckit-plan` Constitution Check MUST record pass/fail against applicable principles.
- Complexity Tracking is REQUIRED for irreversible or simplicity-straining choices.
- Reviewers MUST reject adapter bypasses, cross-tenant leaks, invented API behavior, and
  committed secrets.

**Version**: 1.1.0 | **Ratified**: 2026-06-10 | **Last Amended**: 2026-06-10
