# Feature Specification: Moonu-style Chatwoot Omnichannel Plugin MVP

**Feature Branch**: `001-chatwoot-omnichannel-mvp`

**Created**: 2026-06-10

**Status**: Draft

**Input**: User description: "Build a Moonu Simulator that provisions and manages Chatwoot omnichannel access for simulated Moonu PBX customers, demonstrating WhatsApp-ready workspace setup while Moonu remains system of record for telephony, subscriptions, and billing."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Provision Customer Telephony and Omnichannel (Priority: P1)

A Moonu administrator logs into the Moonu Simulator, creates a new customer (e.g., "Clínica Exemplo"), adds a simulated phone number (+55 11 4000-0000), creates PBX extensions (100 Reception, 101 Sales, 102 Support), enables the Omnichannel add-on, and sees the system create or link a dedicated Chatwoot workspace for that customer. The administrator then adds support agents (e.g., Maria Silva and João Souza) and sees them reflected in the omnichannel setup with sync status visible on the dashboard.

**Why this priority**: This is the core product hypothesis—Moonu provisions telephony and omnichannel as an add-on while Chatwoot handles conversations. Without this flow, the MVP cannot demonstrate the integration model.

**Independent Test**: Can be fully tested by creating one customer end-to-end and verifying telephony data, omnichannel enablement, workspace linkage, and agent records appear correctly without requiring a second customer or live WhatsApp traffic.

**Acceptance Scenarios**:

1. **Given** an administrator is logged into the Moonu Simulator, **When** they create a customer with company name and country, **Then** the customer appears in the customer list with subscription status visible.
2. **Given** a customer exists, **When** the administrator adds a phone number and three extensions with labels and display names, **Then** the phone numbers and extensions are listed on the customer detail view and remain independent of omnichannel configuration.
3. **Given** a customer with telephony configured, **When** the administrator enables the Omnichannel add-on, **Then** the system creates or links a Chatwoot workspace for that customer and records the linkage status.
4. **Given** omnichannel is enabled, **When** the administrator adds two agents with name, email, and role, **Then** each agent is created or linked in the corresponding Chatwoot workspace and sync status is shown.
5. **Given** omnichannel setup is complete, **When** the administrator views the omnichannel dashboard, **Then** they see workspace status, agent sync status, WhatsApp inbox status, and a link to open Chatwoot.

---

### User Story 2 - Open Omnichannel Inbox from Customer Context (Priority: P2)

A support agent (or administrator acting on behalf of a customer) opens the customer page in the Moonu Simulator and clicks "Open Omnichannel Inbox" to reach the correct Chatwoot workspace where they can view and handle customer conversations.

**Why this priority**: Demonstrates the handoff from Moonu as control plane to Chatwoot as conversation workspace—the secondary value proposition for day-to-day agent use.

**Independent Test**: Can be tested once one customer has omnichannel enabled and a linked workspace; does not require WhatsApp to be fully connected.

**Acceptance Scenarios**:

1. **Given** a customer with omnichannel enabled and a linked Chatwoot workspace, **When** a user clicks "Open Omnichannel Inbox" from the customer page, **Then** they are directed to the correct Chatwoot workspace for that customer only.
2. **Given** omnichannel is not yet enabled for a customer, **When** a user views the customer page, **Then** the open-inbox action is unavailable or clearly explains that setup is required first.

---

### User Story 3 - Guided WhatsApp Setup with Clear Status (Priority: P3)

An administrator follows a guided WhatsApp setup checklist for a customer and sees honest status for each step—including steps that require manual completion outside the simulator when full automation is not yet available.

**Why this priority**: WhatsApp is the first omnichannel channel; transparent setup status builds trust and documents integration boundaries for stakeholders and developers.

**Independent Test**: Can be tested by enabling omnichannel for a customer and walking through checklist UI states without sending a real WhatsApp message (statuses can be simulated or manually updated for demo).

**Acceptance Scenarios**:

1. **Given** omnichannel is enabled for a customer, **When** the administrator opens the WhatsApp setup checklist, **Then** they see steps for Meta Business account, WhatsApp number, workspace creation, inbox creation, test message received, and agent reply tested.
2. **Given** a checklist step cannot be automated, **When** the administrator views that step, **Then** it is marked as manual setup required with guidance on what to do next.
3. **Given** WhatsApp setup progresses, **When** status changes (not started, manual setup required, pending, connected, or failed), **Then** the omnichannel dashboard and checklist reflect the current status consistently.

---

### User Story 4 - Demonstrate Multi-Customer Tenant Isolation (Priority: P2)

An administrator creates at least two simulated customers, enables omnichannel for each, and can verify that each customer maps to a separate Chatwoot workspace with no cross-customer visibility in the simulator or linked workspaces.

**Why this priority**: Validates the SaaS multi-tenant model central to Moonu's business—each paying customer must have isolated omnichannel access.

**Independent Test**: Can be tested by provisioning two customers and comparing workspace identifiers and open-inbox links; does not require live WhatsApp on both.

**Acceptance Scenarios**:

1. **Given** two customers exist with omnichannel enabled, **When** the administrator views each customer's omnichannel dashboard, **Then** each shows a distinct linked workspace identifier and status.
2. **Given** two customers with agents, **When** the administrator opens Chatwoot from each customer page, **Then** each link targets a different workspace with only that customer's agents and inboxes.

---

### Edge Cases

- What happens when enabling omnichannel fails to create or link a Chatwoot workspace? The UI must show a failed status with a clear message and allow retry or manual completion instructions.
- What happens when an agent email already exists in Chatwoot? The system must surface a conflict status rather than silently failing or duplicating users.
- What happens when omnichannel is enabled but WhatsApp is not configured? The dashboard shows "manual setup required" or equivalent without blocking telephony or agent management.
- What happens when a customer's simulated subscription is inactive? Subscription status is visible; omnichannel access behavior is documented (see Assumptions)—MVP may display status only without enforcing access revocation.
- What happens when the external Chatwoot service is unreachable? Connection status shows unavailable; cached linkage data remains visible with last-known status.
- What happens when an administrator disables omnichannel after it was enabled? Behavior is documented; MVP may prevent disable or show a warning that workspace linkage persists (see Assumptions).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Moonu Simulator MUST allow administrators to create, view, and list simulated customers with company name, country, and subscription status.
- **FR-002**: The Moonu Simulator MUST allow administrators to add, view, and manage simulated phone numbers per customer (E.164 format, label, status).
- **FR-003**: The Moonu Simulator MUST allow administrators to add, view, and manage simulated PBX extensions per customer (extension number, display name, assigned user name, status) without coupling extensions to Chatwoot.
- **FR-004**: The Moonu Simulator MUST allow administrators to enable an Omnichannel add-on per customer and record whether omnichannel is enabled.
- **FR-005**: When omnichannel is enabled, the system MUST create or link a dedicated Chatwoot workspace for that customer and persist the workspace identifier.
- **FR-006**: The Moonu Simulator MUST allow administrators to create and manage support agents per customer (name, email, role, status) and create or link corresponding users in the customer's Chatwoot workspace.
- **FR-007**: The system MUST expose an omnichannel dashboard per customer showing workspace connection status, agent sync status, WhatsApp inbox status, and a link to open the Chatwoot workspace.
- **FR-008**: The system MUST present a WhatsApp setup checklist with steps: Meta Business account available, WhatsApp number available, Chatwoot workspace created, WhatsApp inbox created, test message received, agent reply tested.
- **FR-009**: Each WhatsApp setup step and overall inbox status MUST support statuses: not_started, manual_setup_required, pending, connected, and failed.
- **FR-010**: Steps that cannot be automated MUST be clearly labeled as manual with instructions; the project MUST document which operations are automated, manual, or unknown.
- **FR-011**: The system MUST integrate with Chatwoot through a dedicated integration layer that hides Chatwoot-specific details from the rest of the simulator application logic.
- **FR-012**: The integration layer MUST support (automated or mocked where necessary): workspace creation, user creation, adding users to a workspace, listing inboxes, storing workspace/user/inbox identifiers, and generating workspace access URLs.
- **FR-013**: Users MUST be able to open the correct Chatwoot workspace from the Moonu Simulator customer context via a clearly labeled action.
- **FR-014**: The MVP MUST support at least two simulated customers with demonstrable separation of Chatwoot workspace linkage per customer.
- **FR-015**: The MVP MUST include screens for: customer list, customer detail, phone numbers and extensions, omnichannel setup, agent management, Chatwoot connection status, and WhatsApp setup checklist.
- **FR-016**: Subscription and billing status MUST be simulated only; no real payment processing is required.
- **FR-017**: The MVP MUST NOT implement real telephony (SIP, call routing, recording, IVR, or browser calling).
- **FR-018**: The MVP MUST NOT replace Moonu PBX functionality; telephony data remains simulated and separate from Chatwoot.
- **FR-019**: Secrets and credentials MUST NOT be stored in source control; local configuration is used for sensitive values.
- **FR-020**: The project MUST document investigation findings on whether Chatwoot's account/workspace model provides sufficient tenant isolation for Moonu-style multi-tenant SaaS.

### Key Entities

- **Customer**: A simulated Moonu tenant representing a business using Moonu PBX and optional omnichannel. Key attributes: company name, country, subscription status, omnichannel enabled flag, linked Chatwoot workspace identifier, created/updated timestamps.
- **PhoneNumber**: A simulated telephony number assigned to a customer. Key attributes: E.164 number, label, status; belongs to one customer; not mapped into Chatwoot.
- **Extension**: A simulated PBX extension for a customer. Key attributes: extension number, display name, assigned user name, status; belongs to one customer; remains outside Chatwoot.
- **Agent**: A support user for a customer who may access Chatwoot conversations. Key attributes: name, email, role, linked Chatwoot user identifier, status; belongs to one customer.
- **OmnichannelSetup**: Per-customer record of omnichannel provisioning state. Key attributes: Chatwoot workspace status, WhatsApp setup status, WhatsApp phone number (when known), linked inbox identifier, setup mode (automated vs manual), notes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can run the Moonu Simulator locally and complete the primary admin journey (create customer, add telephony, enable omnichannel, add agents, view dashboard) in under 15 minutes following project documentation.
- **SC-002**: A developer can connect the simulator to a local or self-hosted Chatwoot instance and successfully demonstrate workspace linkage for at least two distinct customers.
- **SC-003**: 100% of omnichannel dashboard views show accurate status for workspace connection, agent sync, and WhatsApp setup for the selected customer (verified against known test data).
- **SC-004**: Users can open the correct Chatwoot workspace from the simulator in one click without manually searching for workspace identifiers.
- **SC-005**: The project deliverable includes documentation that classifies every Chatwoot-related operation as automated, manual, or unknown—with no undocumented integration steps.
- **SC-006**: Tenant isolation is demonstrable: two test customers show different workspace identifiers and opening omnichannel from each customer never lands in the other customer's workspace.
- **SC-007**: WhatsApp setup checklist displays all six defined steps with a valid status from the allowed set on first omnichannel enablement.
- **SC-008**: Stakeholders can watch a live demo of the primary user journey without requiring real WhatsApp message delivery (manual-setup states are acceptable).

## Assumptions

- The Moonu Simulator is a standalone demonstration application, not the production Moonu codebase.
- Chatwoot is treated as an external omnichannel engine; Moonu remains system of record for customers, telephony, subscriptions, and billing.
- One shared Chatwoot deployment serves multiple Moonu customers, with each customer mapped to a separate Chatwoot workspace (account) for tenant isolation in this MVP.
- Full automated WhatsApp provisioning (including Meta Embedded Signup from Moonu-owned UI) is out of scope for the first iteration; guided checklist with manual steps is acceptable.
- Chatwoot source code will not be forked unless investigation proves API-based integration is insufficient; this MVP prefers configuration and API integration.
- Local-first development is sufficient; production deployment patterns are out of scope.
- Moonu Simulator administrator access uses a simple local authentication model suitable for demo (single admin role); agent users reach Chatwoot directly rather than authenticating separately through the simulator for conversation handling.
- Inactive or unpaid subscriptions are displayed as simulated status only in the MVP; automatic revocation of Chatwoot access is documented as a future concern, not implemented.
- Disabling omnichannel after enablement is not a primary MVP flow; if attempted, the system may show informational messaging rather than full de-provisioning.
- Phone numbers and extensions are illustrative of Moonu telephony; they do not trigger real calls or messages.
- Branding and white-label constraints for Chatwoot depend on license/edition and will be captured in investigation documentation, not resolved in this MVP.

## Out of Scope

- Real SIP, call routing, call recording, IVR, and browser-based calling.
- Replacing or reimplementing Moonu PBX features.
- Forking or modifying Chatwoot unless later investigation requires it.
- Full automated WhatsApp channel provisioning in the first iteration.
- Real billing, payment processing, or subscription enforcement against Chatwoot access.
- Production-grade security hardening, high availability, or multi-region deployment.
- Resolving all open strategic questions (shared vs per-customer Chatwoot deployment, subscription-driven access disable); these are captured for follow-on investigation.

## Dependencies

- A runnable local or self-hosted Chatwoot instance available for integration testing and demos.
- Local runtime environment capable of running the Moonu Simulator and its dependencies together for development.
- Credentials and connection settings for Chatwoot supplied via local configuration (not committed to version control).
- Documentation of manual WhatsApp/Meta setup steps where automation is not available.

## Investigation Deliverables (MVP Documentation)

The following open questions MUST be addressed in project documentation (not necessarily fully resolved in code):

- Whether Chatwoot's account/workspace model provides sufficient tenant isolation for Moonu's SaaS use case.
- Which Chatwoot capabilities can create workspaces, users, roles, and inboxes in a self-hosted deployment.
- Feasibility of initiating WhatsApp Embedded Signup from a Moonu-owned UI in a future iteration.
- Allowed Chatwoot branding changes under the selected license or edition.
- Long-term deployment model: one shared Chatwoot instance for all customers vs one instance per large customer.
- How inactive or unpaid Moonu subscriptions should disable Chatwoot access in production.
