# Implementation Readiness Checklist: Moonu Chatwoot Omnichannel MVP

**Purpose**: Validate requirements quality across spec, plan, tasks, and contracts before `/speckit-implement` (Slice 1 gate)  
**Created**: 2026-06-10  
**Reviewed**: 2026-06-10  
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [tasks.md](../tasks.md)

**Note**: This checklist tests whether requirements are well-written, complete, and consistent — not whether code works.

## Requirement Completeness

- [x] CHK001 Are exit criteria defined with measurable outcomes for all four implementation slices? [Completeness, Spec §Implementation Slices]
- [x] CHK002 Are Slice 1 in-scope and out-of-scope boundaries explicit enough to prevent agent UI, real Chatwoot, and tenant-isolation work from entering the MVP checkpoint? [Completeness, Spec §Slice 1]
- [x] CHK003 Are all seven required screens (FR-015) mapped to slice delivery so Slice 1 scope does not implicitly require agent management UI? [Completeness, Spec §FR-015, Spec §Slice 1]
- [x] CHK004 Are manual workspace link requirements (`PATCH .../omnichannel/link`) documented with preconditions, body schema, and error semantics in the API contract? [Completeness, Contract §Omnichannel/link]
- [x] CHK005 Are agent manual-link requirements (name, email, role, `chatwootUserId`) specified separately from workspace account-link requirements? [Completeness, Spec §FR-006]
- [x] CHK006 Are investigation deliverables (FR-020, tenant isolation, Platform API, white-label) tied to named documentation artifacts rather than open-ended prose? [Completeness, Spec §Investigation Deliverables, Spec §FR-020]
- [x] CHK007 Are seed customer requirements (names, count, slice timing) documented consistently across constitution, plan, and tasks? [Completeness, Constitution §Product & Demo Standards, tasks.md T040/T054]

## Requirement Clarity

- [x] CHK008 Is FR-005 phased behavior unambiguous across mock assignment (Slice 1), manual ID link (Slice 2), and optional API automation (Slice 3) with retained fallback? [Clarity, Spec §FR-005]
- [x] CHK009 Does SC-003 define what "accurate status" means in objectively verifiable terms (fields, allowed enums, test data reference)? [Clarity, Spec §SC-003]
- [x] CHK010 Are adapter evolution stages (`mock` → `real-url` → `platform-api`) named consistently between plan §9, FR-012, and factory/env requirements? [Clarity, Spec §FR-012, Plan §9]
- [x] CHK011 Is the omnichannel enable failure edge case clear about which slice owns retry UI vs manual completion instructions? [Clarity, Spec §Edge Cases, tasks.md T065]
- [x] CHK012 Are "manual setup required" and "mocked" checklist labels defined so stakeholders cannot confuse simulated vs real WhatsApp progress? [Clarity, Spec §FR-010, Spec §Slice 1]
- [x] CHK013 Is SC-001's 15-minute completion target scoped to documented prerequisites per slice (no hidden Chatwoot setup in Slice 1)? [Clarity, Spec §SC-001, quickstart.md §3]

## Requirement Consistency

- [x] CHK014 Do slice exit criteria in spec.md align with plan.md §9 task ranges and tasks.md phase checkpoints without off-by-one or misplaced gates? [Consistency, Plan §9, tasks.md]
- [x] CHK015 Are tenant isolation requirements consistent between US4, FR-014, SC-006, and Slice 2 exit (including T075 as SC-006 gate)? [Consistency, Spec §Slice 2, Spec §SC-006]
- [x] CHK016 Are the six WhatsApp checklist step names identical across FR-008, User Story 3, and data-model/checklist references? [Consistency, Spec §FR-008, Spec §US3]
- [x] CHK017 Do telephony independence requirements (FR-003, Key Entities) consistently state no Chatwoot coupling for phone numbers and extensions? [Consistency, Spec §FR-003]
- [x] CHK018 Are subscription inactive requirements consistent between edge case, assumptions (display-only MVP), and FR-016 (no enforcement)? [Consistency, Spec §Assumptions, Spec §Edge Cases]

## Acceptance Criteria Quality

- [x] CHK019 Can SC-006 tenant isolation be objectively demonstrated using distinct `chatwootAccountId` values and per-customer open-inbox URL targets? [Measurability, Spec §SC-006]
- [x] CHK020 Is Slice 1's constitution Principle XII quality gate expressed as a requirements-level gate (tests pass before MVP sign-off), not only as implementation tasks? [Acceptance Criteria, Spec §Slice 1 Quality gate, tasks.md T041–T043]
- [x] CHK021 Does Slice 4 exit require evidence-backed checklist states (`connected` or `failed`) rather than vague "setup attempted"? [Measurability, Spec §Slice 4 Exit]
- [x] CHK022 Is SC-005's automated/manual/unknown classification requirement scoped to a deliverable matrix with no undocumented integration steps? [Measurability, Spec §SC-005]

## Scenario Coverage

- [x] CHK023 Are primary administrator journeys (create customer → telephony → enable omnichannel → dashboard → open inbox) specified with slice-appropriate variants? [Coverage, Spec §US1, Spec §US2]
- [x] CHK024 Are alternate flows defined for open-inbox when omnichannel is not yet enabled (unavailable or explanatory state)? [Coverage, Spec §US2 scenario 2]
- [x] CHK025 Are recovery/fallback requirements specified when Platform API automation is partial or unknown (manual UI retained)? [Recovery, Spec §FR-005, Spec §FR-012, Spec §Slice 3]
- [x] CHK026 Are exception-flow requirements defined for agent email conflicts in Chatwoot (conflict status vs silent failure)? [Exception Flow, Spec §Edge Cases]

## Edge Case Coverage

- [x] CHK027 Are unreachable Chatwoot service requirements specified with cached linkage visibility and connection health signaling? [Edge Case, Spec §Edge Cases, Contract §connectionHealth]
- [x] CHK028 Is omnichannel-enabled-but-WhatsApp-unconfigured behavior defined without blocking telephony or agent management? [Edge Case, Spec §Edge Cases]
- [x] CHK029 Is disable-omnichannel-after-enable behavior either fully specified or explicitly deferred with documented MVP messaging stance? [Edge Case, Spec §Edge Cases, Spec §Assumptions]
- [x] CHK030 Are idempotent re-link rules for the same `chatwootAccountId` documented in API requirements where duplicate-link conflicts apply? [Edge Case, Contract §Omnichannel/link]

## Non-Functional Requirements

- [x] CHK031 Are secrets and credential handling requirements explicit (no source control, env/local config only)? [Non-Functional, Spec §FR-019]
- [x] CHK032 Are production security gaps expected to be documented rather than silently assumed acceptable for demo? [Non-Functional, Constitution §VIII, tasks.md T077]
- [x] CHK033 Is simplified admin authentication documented as a demo assumption with stated production upgrade expectations? [Non-Functional, Spec §Assumptions]

## Dependencies & Assumptions

- [x] CHK034 Are per-slice external dependencies (Chatwoot runtime, Platform API tokens, WhatsApp Cloud API) documented without conflating Slice 1 prerequisites? [Dependency, Spec §Dependencies]
- [x] CHK035 Is the shared Chatwoot deployment / one-account-per-customer assumption stated clearly enough to ground tenant isolation requirements? [Assumption, Spec §Assumptions]
- [x] CHK036 Does the spec mandate that later slices MUST NOT block earlier slice exit criteria, and is that reflected in task ordering notes? [Dependency, Spec §Implementation Slices intro, tasks.md]

## Ambiguities & Conflicts

- [x] CHK037 Are strategic open questions (shared vs per-customer Chatwoot, subscription-driven access disable) explicitly excluded from MVP blocking requirements? [Ambiguity, Spec §Out of Scope]
- [x] CHK038 Is there any conflict between FR-011 (adapter introduced Slice 2) and Slice 1 mock adapter requirements (FR-012 mock in Slice 1)? [Conflict, Spec §FR-011, Spec §FR-012]
- [x] CHK039 Are retry provisioning requirements (`POST .../omnichannel/retry`) scoped to Slice 3+ without implying Slice 1/2 must implement full retry UX? [Ambiguity, Contract §Omnichannel/retry, tasks.md T065]

## Notes

- **Status**: 39/39 passed (2026-06-10 review)
- **Minor fixes applied during review**:
  - `data-model.md` seed section aligned to constitution names (Escritório Contábil Alfa, Loja Boa Luz; was Tech Solutions Ltd)
  - `spec.md` edge case: slice-phased retry (Slice 3) vs manual link (Slice 2)
  - `spec.md` FR-015: explicit Slice 1 screen delivery excludes agent management (Slice 2 / T052)
- **CHK038 finding**: No conflict — FR-011 already qualifies "mock implementation Slice 1"
- **CHK009 note**: SC-003 measurability reinforced by tasks T043 (seeded test data verification)
- **CHK006 note**: White-label findings fold into Investigation Deliverables + `docs/chatwoot-investigation.md` (T056); no separate decision doc required for Slice 1 gate
- Complements [requirements.md](./requirements.md) (initial spec validation — already passed)
- **Ready for** `/speckit-implement` Slice 1 (T001–T043)
