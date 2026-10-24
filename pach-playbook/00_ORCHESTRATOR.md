# Agent 0 — Lead Orchestrator (Codex)
**Role:** Own architecture, sequence, shared APIs, integration, final build, and release. Do not independently rewrite files owned by the Game/Contracts agent.

**Design system source of truth:** `09_FYX_DESIGN_SKILL.md`; **public voice source of truth:** `11_BRAND_VOICE_COPY_SKILL.md`. Read `10_POSITIONING_NAMING_SKILL.md` before approving launch copy.

## Product freeze (read first)
FYX is a mobile-first challenge platform for users, developers and sponsors. MVP = one playable **Broken Checkout** level + one controlled developer-fix case + one funded 20-test-USDC campaign on Monad Testnet. Illustrative allocation: 4 finder / 14 developer / 2 platform. This is a proposed contract parameter, not an actual deposited balance.

## Step-by-step work
**STEP 0 — Inspect and protect repository and approve copy boundaries**
- Treat PACH as a proposed public name and FYX as the stable internal code identity. Use a centralized `brandConfig` for display name, brand line and description. A mass rename is out of scope.
- Use the v2 hero line only after recording internal design approval; domain/trademark approval is a separate gate before commercial launch.
- Identify current repo state, git branch, installed packages, package manager, and deploy availability. Save a baseline log; never clobber user modifications.
- Create `apps/web`, `apps/api`, `apps/game` (or `packages/game`), `packages/shared`, `packages/chain`, `docs`. If existing structure differs, update docs once before agents start.
- Set `pnpm-workspace.yaml`, TS project references as appropriate; run a fresh baseline build.

**STEP 1 — Freeze shared interfaces before parallel coding**
- Adopt definitions in `07_HANDOFF_CONTRACTS.md` for game events, levels, claim signatures, testnet address schema and API error envelopes.
- Put shared Zod validators, inferred TS types and exported constants in `packages/shared`. If changing one interface, update shared package and notify all agents.
- Pin Node/runtime and package versions in project files; use install logs, no speculative version assumptions.

**STEP 2 — Delegate with boundaries**
- Kimi Code owns `apps/game/**` and optionally `packages/game/**`; game emits typed events and a report object but never calls the contract.
- Platform owns `apps/web/**`; consumes shared package and API client.
- Backend owns `apps/api/**`, data schema and integrations; is authoritative for session validation.
- Chain owns `packages/chain/**`, scripts, tests, ABI export and deployment artifacts.
- QA owns e2e tests in `tests/e2e/**`, load/error checks and fixes only by approved PRs.

**STEP 3 — Start mock-first**
- For the first integration, run a local deterministic challenge fixture with `VITE/FYX_MODE=demo` (choose real env prefix per bundler). All placeholders conspicuously say `Demo`.
- UI and game should work without Monad RPC or deployed contracts, but a working local-only game **must not count as completed blockchain integration**.

**STEP 4 — Wire real backend and chain**
- Ingest Game Agent's typed game event/report; backend independently validates intended defect.
- Wait for Chain Agent to publish ABI, addresses, chainId, expiry and EIP-712 domain/version.
- Wire wallet → sponsor deposit → approved claims → confirmed receipts. Never mutate authoritative score on unconfirmed tx.
- Build `/play/checkout`, `/build`, `/arena/[id]`, `/leaderboard`, `/rewards`, `/corporate`, `/docs`.

**STEP 5 — Run tests and stabilize**
- Test phone viewport, wallet switch, refresh, claim replay, sponsor underfunding, API retry, RPC failure and mobile Safari/Chrome.
- Explicitly display pending, failed, rejected, refunded and claimed states.
- At least one complete real Testnet claim + real tx hash required for demo-ready.

**STEP 6 — Release**
- Run the `11_BRAND_VOICE_COPY_SKILL.md` copy acceptance checklist across metadata, CTAs, empty states, errors, game HUD, rewards, and the live pitch.
- Publish/complete `BRAND_DECISION.md` using `BRAND_DECISION_TEMPLATE.md` before public-facing naming is locked.
- Prepare public testnet contract, source verification, GitHub repository, stable live URL, event submission details, 90-second demo, backup video.
- Confirm live site/transactions at handoff; do not make up deployment status.

## Suggested assignment plan
- Stage A (parallel): Chain contract design + Game gameplay prototype + Shared API spec.
- Stage B (parallel): Backend verifier & auth + Platform UI + Contract unit/invariant tests.
- Stage C (gated): Chain deploy, API integration, wallet flow and e2e tests.
- Stage D (gated): Testnet happy-path replay, documentation, demo rehearsal.

## Definition of done
A visitor can play a genuinely interactive level; an evaluator can inspect signed approvals, verified game state, real chain code and real Testnet payout without asking for a demo simulation. Every artifact and limitation documented.

## First prompt to Codex
"Read AGENTS.md, 10_POSITIONING_NAMING_SKILL.md, 11_BRAND_VOICE_COPY_SKILL.md and all numbered instruction files. You are the FYX lead orchestrator. First inspect the existing repository and report a conflict-free monorepo plan. Create frozen shared types and a handoff checklist before assigning or editing other agents' files. Prioritize one end-to-end testnet path. Do not claim deployment unless you actually deploy and capture transactions."
