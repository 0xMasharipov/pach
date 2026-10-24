# PACH — Complete Multi-Agent Playbook (v2)

This document combines all agent instructions into one offline-readable Markdown file. Each section starts with its source filename. Internal references such as AGENTS.md refer to sections below.

## Contents

- [00_ORCHESTRATOR](#00-orchestrator)
- [01_KIMI_GAME](#01-kimi-game)
- [02_PLATFORM_UI](#02-platform-ui)
- [03_BACKEND_VERIFIER](#03-backend-verifier)
- [04_MONAD_CONTRACTS](#04-monad-contracts)
- [05_QA_SECURITY](#05-qa-security)
- [06_DEMO_AND_RELEASE](#06-demo-and-release)
- [07_HANDOFF_CONTRACTS](#07-handoff-contracts)
- [08_SOURCES_AND_NETWORK](#08-sources-and-network)
- [09_FYX_DESIGN_SKILL](#09-fyx-design-skill)
- [10_POSITIONING_NAMING_SKILL](#10-positioning-naming-skill)
- [11_BRAND_VOICE_COPY_SKILL](#11-brand-voice-copy-skill)
- [AGENTS](#agents)
- [BRAND_DECISION_TEMPLATE](#brand-decision-template)
- [CHANGELOG_V2](#changelog-v2)
- [ENV_EXAMPLE](#env-example)
- [README](#readme)


---

<a id="00-orchestrator"></a>

## File: `00_ORCHESTRATOR.md`

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



---

<a id="01-kimi-game"></a>

## File: `01_KIMI_GAME.md`

# Agent 1 — Kimi Code / Interactive Game Engineer
**Ownership:** `apps/game/**`, `packages/game/**` only. **Do not implement wallets, blockchain, payouts or backend authentication.**

## Public brand vs. game title and voice
Read `10_POSITIONING_NAMING_SKILL.md`. Product brand **PACH** is only proposed and pending clearance; use configurable wordmark. The game itself remains **Spot the Glitch**. Read `11_BRAND_VOICE_COPY_SKILL.md` for all level narration, success/error, hints and rewards copy. Do not rebrand internal packages or break integration contracts for cosmetic reasons.

## Goal
Produce one delightful, **actually playable** Spot the Glitch: *Broken Checkout*. The user explores a fictional shopping checkout, deliberately applies the same 60-unit coupon twice to a 100-unit cart, and discovers a negative total. This is a **fictional sandbox**. It must be entertaining without being an uncontrolled exploit tool.

**Visual source of truth:** `09_FYX_DESIGN_SKILL.md` supersedes this file's older neon-heavy aesthetic guidance; use dark navy PLAY styling and restrained lime accents.

## Game design spec
- Theme: shared PACH-candidate dark navy gameplay with trust-blue controls and restrained lime XP accents, clean typography, responsive to 360px phones and wide desktops; reduced-motion support per `09_FYX_DESIGN_SKILL.md`.
- Input: touch, mouse, keyboard where practicable. Explicit sound toggle and reduced-motion fallback.
- Game loop: `start` → interact with checkout → discover defect → choose report category + concise proof → validated success/error → XP animation → replay.
- Visible 60-second countdown; start only when player enters challenge, pause on background tab, use server-relative timestamps in integrated version.
- Browser remains fast: primarily React/TypeScript and CSS; Phaser only if it produces tangible benefit for an arcade layer. Do NOT create a 3D/WebGL dependency for a simple checkout interface.
- Distinguish XP (off-chain entertainment progression) from test USDC (separate validated contract rewards).
- Avoid a hardcoded 'complete' flag controlled by UI alone; events must tell the authoritative verifier *what happened*.

## Step by step
**1. Inspect interfaces:** Read `packages/shared` and `07_HANDOFF_CONTRACTS.md`. Define a `GameAdapter` that emits typed `start`, `coupon_applied`, `report_submitted`, `pause`, `resume` events, monotonically increasing `seq`, and a sessionId given by API.
**2. Design states:** `idle | playing | report | validating | won | lost | error`. Include explicit retry and timeout behavior; preserve session id on transient network errors.
**3. Implement the scene:** Product price 100 demo units, coupon 60 demo units, bug allows second application, checkout total becomes -20 demo units. Label this as fictional, not a real shop.
**4. Build reporting:** Player selects `negative_total_due_to_duplicate_coupon` from plausible options and submits a concise observation. Do not submit confidential data. The client cannot approve payouts.
**5. Score:** Local preview can show a prospective score, but authoritative XP comes from API response. Include hints that reduce *potential* score; server must validate hint usage.
**6. Animations:** Intro, short particle win, timer urgency, clear hover/tap affordances, compact sound effects with mute. Avoid seizure-inducing flashes.
**7. Copy and integration:** Use short, matter-of-fact game prompts such as `Something is wrong with this checkout. Can you figure out what?` and `That report doesn’t match what happened. Try again.` Never use forced three-beat slogans or imply XP equals real money. Export `<SpotTheGlitch sessionId onEvent onReport onExit />` or equivalent agreed interface. Emit events; API client and signing are provided by platform/backend.
**8. Test:** Vitest for pure game rules, React Testing Library for controls, Playwright simulated touch; timeout, duplicate event, report incorrect answer, refresh should fail safely.
**9. Deliver:** Runnable module, package scripts, screenshots, automated test output, no dead buttons, one-minute gameplay capture instructions.

## Gameplay acceptance criteria
- Two taps produce visible wrong total -20, but only correct bug report qualifies.
- Random clicking / submitting the report early does not pass.
- Score is bounded and deterministic; event order cannot be freely forged by changing query parameters.
- A report contains `sessionId`, chosen `bugCode`, and evidence (e.g. event seq / derived calculation) for server-side review.
- On disconnected API, show `Preview only — rewards unavailable`; not false winning/payout banner.

## Exact starting prompt for Kimi Code
"You own only the FYX playable game module. Read AGENTS.md, 01_KIMI_GAME.md, 07_HANDOFF_CONTRACTS.md, 09_FYX_DESIGN_SKILL.md, 10_POSITIONING_NAMING_SKILL.md and 11_BRAND_VOICE_COPY_SKILL.md. Build the complete playable Broken Checkout mini-game with premium mobile-first arcade UX, typed game events, accurate countdown, actual game logic, bug reporting, disabled fake payout functionality, accessibility and automated tests. Do not touch authentication, platform layout, smart contracts or secrets. Output exact changed paths, commands run, and the API adapter/handoff expected from the backend."



---

<a id="02-platform-ui"></a>

## File: `02_PLATFORM_UI.md`

# Agent 2 — Platform UI / Product Frontend (Codex)
**Ownership:** `apps/web/**`; may consume but not edit `packages/shared/**` without orchestrator approval.

## Goal
A modern, unmistakably useful product (PACH candidate / legacy FYX internals), not a landing page masquerading as a web app. Mobile-first playable game, developer mission, corporate funding and verifiable reward history. Human-friendly onboarding for youth, credible details for corporate users.

## Step by step
**1. Read frozen contract:** `AGENTS.md`, `07_HANDOFF_CONTRACTS.md`. Confirm Auth, Wallet, Challenge, Game and Claims interfaces with backend/chain owners.
**2. Bootstrap:** Next.js + TypeScript + Tailwind (or existing framework; don't rewrite unnecessarily). Reusable primitives, global error boundary, loading skeletons, accessible controls, SEO social metadata.
**3. Build routes:** `/` hero + featured Arena; `/arenas` challenge cards; `/arena/[id]` terms/prizes/status; `/play/[levelId]` embedded Kimi game; `/build` developer work queue; `/leaderboard` ranked players/devs; `/rewards` wallet balances/pending/claimed; `/corporate` new campaign and existing campaigns; `/about` transparent trust model.
**4. Implement auth & wallet:** Wallet connection with supported EVM connector; SIWE-like nonce-sign flow controlled by API. Ensure chain ID `10143` and user-facing wallet switch instructions. Guest may play a preview but cannot request cash-like reward claims. Never send user private key to server.
**5. Challenge card:** Sponsor, problem statement, required authorization, explicit scope, prize split (4/14/2 **test USDC**), open/closed/expired, and tx-funded indicator from chain receipts. A simulated campaign has a `Demo` label.
**6. Player workflow:** Challenge → wallet/guest choice → real game → report → API verdict → XP → reward eligibility → prepare claim → wallet-signed tx → wait receipt → explorer link. Make error messages actionable.
**7. Developer workflow:** Browse sample defect, clone/use controlled fix branch; submit known patch/commit through secure mechanism; show verification steps/test output; authenticated approval yields developer claim, not automatic money after a text description.
**8. Corporate workflow:** Create draft campaign, verify wallet, submit on-chain `createChallenge` with exact ERC20 allowance/deposit; show transaction confirmation; configure prize split and expiry before funding. Hide production business claims. For hackathon restrict access to allowlisted demo sponsor to prevent misleading public offers.
**9. Copy gates:** No fabricated sponsor logos, player counts, testimonial blocks, verified badges, artificial timers or payment implications. Labels for `Demo`, `Pending review`, `Accepted`, `Eligible to claim`, `Claimed` are distinct.
**10. Live leaderboards:** Pull authoritative server results, with modest polling and cached queries; never show fictitious names unless labeled seeded demo content. Provide separate player XP and developer accepted fixes metrics.
**11. Mobile and presentation QA:** 360/390/768/1280/1920 breakpoints, reduced motion, portrait, keyboard, event QR link, immediate action above fold.

## Positioning and public naming
Read `10_POSITIONING_NAMING_SKILL.md` and `11_BRAND_VOICE_COPY_SKILL.md` before hero copy, navigation labels, and marketing claims. Use a single `brandConfig` with `displayName`, `hero`, `subhead`, `category`, `ctaPrimary` and `nameStatus`. Recommended hero: `Found something? Make it count.`; subhead: `PACH makes product testing playable. Try a challenge, report what you find, and see what gets fixed.` The label on the actual game remains `Spot the Glitch`. PACH is proposed, not yet approved; centralize public brand strings to enable a safe migration. Lead with playable product testing, not blockchain jargon. Never automatically rename backend contracts or ABI identifiers.

## Design direction
**Canonical style guide:** `09_FYX_DESIGN_SKILL.md` supersedes earlier black/neon styling below. Prefer trust-first blue/navy/light platform, dark navy PLAY, sparing lime for XP; honor accessibility and accurate proof labels.

- Configurable short wordmark (PACH proposed), trust-first blue/navy and light-neutral surfaces; dark-navy PLAY stage; lime accent reserved for XP and limited game highlights. Thin borders, technical but playful typography. Do not imitate another site's logo.
- Make gameplay the main call to action, not a hidden tab. For institutions: business dashboard is calm, clean, credible.
- Never say “real USDC earned” for testnet; use “test USDC (no monetary value).”

## Acceptance criteria
- No dead tabs/buttons; loading, empty, error, wrong-chain and claim-pending states exist.
- Can use local demo game before contracts deployed; clearly marked.
- Deployed testnet payment shows actual explorer transaction link; no fake data.
- Frontend compiles/typechecks, smoke tests pass, wallet disconnect and switching handled.

## First prompt
"Act as FYX platform UI agent. Read AGENTS.md, 02_PLATFORM_UI.md, 07_HANDOFF_CONTRACTS.md, 09_FYX_DESIGN_SKILL.md, 10_POSITIONING_NAMING_SKILL.md and 11_BRAND_VOICE_COPY_SKILL.md. Own apps/web only. Build high-quality responsive product routes and integrate an independently built game package through the shared adapter. Connect to typed API clients, show appropriate wallet/testnet errors and verified transaction states. Do not simulate real funding or modify other agents’ modules."



---

<a id="03-backend-verifier"></a>

## File: `03_BACKEND_VERIFIER.md`

# Agent 3 — Backend / Validation / Game State Agent
**Ownership:** `apps/api/**`, database migrations, backend tests. Consume shared Zod schemas.

## Goal
Implement the trust boundary. Browsers can render gameplay, but only server-verified events and authorized outcomes may result in on-chain claim authorizations. DB/Redis are not blockchain: record them honestly.

## Step by step
**1. Choose stack:** Fastify + TypeScript + Zod; PostgreSQL + Prisma/Drizzle (choose one compatible with existing repo). Redis optional for leaderboard/rate limits; use simple in-process/local DB for hackathon only if documented.
**2. Auth:** Implement challenge nonce tied to domain, wallet, chainId, issuedAt, expiration, unique nonce; verify wallet signature and issue short-lived, httpOnly, secure sameSite session cookie. Nonce one-use, server store hashed if appropriate. Role grants for sponsor/verifier only via allowlist/approved setup.
**3. Database:** wallets/users, sponsor orgs (demo), challenges, server-signed game sessions, ordered game events, reports, developer submissions, verification decisions, claim authorizations and transaction receipts. Write migrations.
**4. Game sessions:** server issues unpredictable sessionId and authoritative start time, challengeId/levelId, expiration and event sequence; rate limit create/report. Do not take `score` or `winning=true` from client as truth.
**5. Validator:** Apply deterministic state transition rules: 100 base, coupon 60, duplicate application shows -20, correct report category, plausible order/timing, constraints on hint use and report count. Detect replays, forged session IDs and impossible event sequences. Remember: client telemetry can still be fabricated; for live monetary value, require more robust issuer/anti-Sybil assurance.
**6. XP + leaderboard:** Calculate server-side XP from validated state, normalized bounded timer, hint usage. Store idempotently keyed by session/challenge/wallet; minimize PII, implement public profile opt-in.
**7. Developer fix:** For hackathon implement a predetermined code patch challenge with **restricted allowlisted commits or known solution fixture**, an isolated automated test runner plus authorized reviewer. Never execute arbitrary PR code on API host. Store test version, SHA-256 digest/evidence and approval.
**8. Claims:** Only an accepted finder/developer result grants a claim. Backend prepares EIP-712 approval for the correct role/challenge/wallet/amount/proofHash/unique nonce/deadline and chain `10143`, verifying contract address from deployment artifacts. Keep the verifier signing key in server-only secret manager/env; never return the private key.
**9. Pending/confirmed:** Index or reconcile `RewardClaimed`, `ChallengeCreated`, `Refunded` events with receipt checks. Idempotent reconciliation; final display must come from confirmed chain data. RPC errors must not silently mark paid.
**10. Security:** Validate payload size and origin, CSRF/session policy, request rate limiting, role restrictions, safe logs, audit logs, CORS allowlist, webhook signing where relevant. Report remaining issues plainly.

## Anti-cheat caveat
A game client in a browser can be reverse engineered. Server validation of client events helps but does not prove a genuine human interaction. Hackathon Testnet payouts are not proof of a secure future real-money system. Add sponsor approval / validated human participation before future mainnet rollout.

## Endpoint contract
Use exact objects in `07_HANDOFF_CONTRACTS.md`. Implement `POST /auth/nonce`, `POST /auth/verify`, `GET /me`, `GET /challenges`, `POST /game/sessions`, `POST /game/events`, `POST /game/reports`, `POST /dev/submissions`, `GET /leaderboard`, `POST /claims/prepare`, `GET /claims/:id`. Corporate endpoints admin/sponsor gated.

## Tests
Valid and invalid report, backdated events, expired session, duplicated event seq, altered wallet, nonce replay, wrong chain ID, unauthorized developer approval, claim recipient replacement, concurrent duplicate claim request, gas/RPC unavailable.

## First prompt
"Act as FYX backend agent. Read AGENTS.md, 03_BACKEND_VERIFIER.md, and 07_HANDOFF_CONTRACTS.md. Implement trustworthy session/auth/event state and signed EIP-712 claim authorization. All score, payment and reviewer decisions must be server-verifiable, rate-limited, idempotent and test-covered. Own apps/api and DB only; coordinate EIP-712 exact struct with the chain agent before shipping."


## Copy / brand compatibility notice (v2)
Use `11_BRAND_VOICE_COPY_SKILL.md` for any human-facing status or error text. Business logic, API routes, payloads, on-chain contract names, EIP-712 domains and token/chain identifiers **must not be renamed** for the provisional PACH brand. Return stable machine-readable status codes; UI maps them to accurate human-facing text.



---

<a id="04-monad-contracts"></a>

## File: `04_MONAD_CONTRACTS.md`

# Agent 4 — Smart Contracts / Monad / Devnads Agent
**Ownership:** `packages/chain/**`, Solidity contracts, Foundry tests, deployment scripts, ABI/address export. Never use mainnet for this project.

## Read first
- Official current facts: https://docs.monad.xyz/ai/current-facts
- Official Foundry guide: https://docs.monad.xyz/guides/deploy-smart-contract/foundry
- Verification guide: https://docs.monad.xyz/guides/verify-smart-contract/foundry
- Devnads Agents API: https://devnads.com/agents
- Devnads test tokens: https://devnads.com/tokens

## Proposed core contract
A **single-purpose FYXRewardVault** backed by a known allowlisted ERC-20 token (Devsnads test USDC on Testnet). Store funded challenge with `sponsor`, `expiry`, `finderAmount`, `developerAmount`, `platformFee`, `remainingBalance`, and payout flags. Sponsor transfers/deposits via SafeERC20. Authorized verifier signs EIP-712 approvals. Claimant calls `claim` with exact role, amount, recipient, proof hash, unique nonce, signature, expiration. Contract checks all fields/roles and sends funds only once. Sponsor can withdraw unspent funds after expiry, while respecting prior payouts. Separate admin powers carefully; never let the verifier drain escrow through arbitrary amounts or recipients.

### Spec freeze with backend
Use EIP-712 `FYXRewardVault`, version `1`, `chainId=10143`, domain `verifyingContract=deployedVault`. Suggested struct:
```
Claim(uint256 challengeId,uint8 role,address claimant,uint256 amount,bytes32 proofHash,uint256 nonce,uint256 deadline)
```
`role: 0=FINDER, 1=DEVELOPER`. Use exactly this order and types once backend approves. Contract must enforce amount equals prefunded immutable role amount and role not previously paid. Nonce unique, signature valid for designated verifier, deadline not expired, campaign not expired, valid claimant, contract/chain-bound domain. EIP-712 does **not** independently verify the factual accuracy of a bug claim.

### Reward split for presentation
Total sponsor deposit = `20_000_000` base units of 6-decimal test USDC:
- FINDER: `4_000_000`
- DEVELOPER: `14_000_000`
- PLATFORM: `2_000_000`
Pay platform fee **only when** developer claim succeeds, and only once, to immutable authorized treasury; any unspent funds are refundable by sponsor after expiry. Guard fee transfer from reentrancy and zero address. If developer claim fails/never happens, platform fee remains refundable after expiry. All amounts illustrative; none indicate actual funds deposited until tx verified.

## Step-by-step
**1. Environment / chain sanity**
- Install official **Foundry >=1.8**; `forge --version`.
- Use `foundry.toml`:
```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
network = "monad"
eth-rpc-url = "https://testnet-rpc.monad.xyz"
chain_id = 10143
```
- Verify RPC and chain: `cast chain-id --rpc-url https://testnet-rpc.monad.xyz` must return `10143`. Confirm wallet network separately.
- Use audited OpenZeppelin building blocks, pin version; do not start new contracts as an unreviewed reimplementation of ERC-20/EIP-712.

**2. Faucet MON for gas — Devnads agent endpoint**
```bash
curl -fsS https://agents.devnads.com/health
curl -fsS https://agents.devnads.com/v1/faucet/status/10143
curl -sS -X POST https://agents.devnads.com/v1/faucet \
  -H 'Content-Type: application/json' \
  -d '{"chainId":10143,"address":"0xYOUR_TESTNET_WALLET"}'
```
Use only an actual wallet address and inspect returned errors. Alternative official manual faucet: https://faucet.monad.xyz . Documented Devnads dispensation: 1 test MON per request with limits (10/address/day; 50/IP/day; 200/ASN/day; 2000 MON/day overall); these are caps, not entitlements. Do not use wallet farms, retries to evade limits, or mainnet funds.

**3. Obtain *separate* test USDC for reward deposits**
- Visit https://devnads.com/tokens with an authorized demo wallet connected to **Monad Testnet**.
- Mint test USDC; its publicly documented address is `0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73`, decimals **6**; verify chain/address with explorer. Page lists max 10,000 per mint action. These tokens have **zero monetary value**.
- Test USDC minting costs MON gas. Do **not** assume `/v1/faucet` issues USDC: it dispenses MON only.
- Sponsor test wallet approves exact allowance; invoke vault funding from sponsor wallet.

**4. Build vault and events**
Implement `createChallenge`, `claim`, `refundUnspent`, read-only methods, custom errors and events (`ChallengeCreated`, `RewardClaimed`, `UnspentRefunded`). Use AccessControl/Ownable carefully, `ReentrancyGuard`, `SafeERC20`, `EIP712`, `ECDSA`; add `Pausable` only if justified and declare power model. No unilateral sponsor clawback before expiry. No infinite allowances initiated by contract.

**5. Contract tests (before deploy)**
- `forge build` and `forge test -vv` with `network="monad"`.
- Test two claims (finder + developer), fee settlement, refunds, late claims, wrong role/recipient/amount/token/nonce/deadline, signature replay, unauthorized verifier, contract/chain domain mismatch, balance conservation and reentrancy.
- Add invariant: `totalDeposited == totalClaimed + feesPaid + refundsPaid + remainingEscrow` per challenge.

**6. Deploy testnet**
- Store `DEPLOYER_PRIVATE_KEY` in secure env; `source .env` safely after setting file permissions. NEVER commit `.env`, hardcode private key or echo secret in terminal logs.
- Follow current Foundry deployment guide, choose a secure deployment method (hardware wallet/key store if available; disposable testnet key only if necessary). Check gas and chain before broadcasting.
- Capture deployed address and tx hashes **from real output**. Save ABI, chainId, block, source build ID and compiler/optimizer settings in `packages/chain/deployments/10143.json`. Export typed ABI for frontend/backend.

**7. Verify deployed source via Devnads Agents API**
- After deploying, create `verification-payload.json` using the *actual* compiled `standardJsonInput` and matching compiler version, contract name, and constructor args. Do not use `{...}` placeholders or an invented compiler version. Remove secrets before sending.
- Submit (only after real deploy):
```bash
curl -sS -X POST https://agents.devnads.com/v1/verify \
  -H 'Content-Type: application/json' \
  --data-binary @verification-payload.json
curl -sS https://agents.devnads.com/v1/verify/status/10143/0xACTUAL_CONTRACT_ADDRESS
```
- Minimal required verification payload fields: `chainId:10143`, `contractAddress`, `contractName` such as `src/FYXRewardVault.sol:FYXRewardVault`, `compilerVersion`, `standardJsonInput`. The API attempts MonadVision/Sourcify and Monadscan/Etherscan V2; record actual success/failure and explorer links.
- Alternative: official Foundry verification procedure in Monad docs. Source verification is not a security audit.

**8. Publish handoff artifacts**
- ABI JSON and TypeScript ABI export.
- Testnet contract address, verified explorer URL, source compile options, deploy tx, payout tx, sample `cast` reads, token address/decimals.
- Signer EIP-712 exact domain/type/fields and assumptions; backend agent must reproduce exact hash/signing.

## Critical Monad specifics
- Monad Testnet `10143`, Mainnet `143`, public RPC `https://testnet-rpc.monad.xyz`.
- Foundry >=1.8 and `network="monad"` matches Monad local execution, gas and hardfork behaviors.
- Monad charges transaction gas based on **gas limit**, not merely used gas. Use sensible gas limits, adequate testnet MON, estimate/simulate before signing.
- Monad MIP-8 storage paging is a VM storage/gas characteristic, **not** a plug-in identity protocol or game reward verifier. Keep storage packed sensibly and measure rather than claim extra performance.
- x401/x402 and ERC-8004 are optional future integrations only, unrelated to faucet and contract source verification.

## First prompt to contract agent
"Read AGENTS.md, 04_MONAD_CONTRACTS.md, 07_HANDOFF_CONTRACTS.md, 08_SOURCES_AND_NETWORK.md and the linked live Monad/Devnads docs. Implement and test FYXRewardVault with immutable exact funded prizes, safe ERC20 transfers, EIP-712 signer approvals and replay/expiry protections. Request test MON via Devnads only when real wallet available, mint test USDC separately, deploy to chainId 10143, verify source and publish actual deployment/ABI/tx artifacts. Never invent results or use mainnet."


## Copy / brand compatibility notice (v2)
Use `11_BRAND_VOICE_COPY_SKILL.md` for any human-facing status or error text. Business logic, API routes, payloads, on-chain contract names, EIP-712 domains and token/chain identifiers **must not be renamed** for the provisional PACH brand. Return stable machine-readable status codes; UI maps them to accurate human-facing text.



---

<a id="05-qa-security"></a>

## File: `05_QA_SECURITY.md`

# Agent 5 — QA, Security, and End-to-End Reviewer
**Ownership:** `tests/e2e/**`, `tests/security/**`, QA docs. Never quietly change another agent's source without review.

**Design, copy and ethical UX checks:** Read `09_FYX_DESIGN_SKILL.md` and `11_BRAND_VOICE_COPY_SKILL.md` and test contrast, fabricated-proof prevention, testnet monetary disclaimers, reduced-motion behavior, and corporate/game visual coherence.

## Objective
Test the *actual product*, not a storyboard. FYX's weakest links are client event forgery, fraudulent claims, contract replay, mismatched chain config, sponsor accounting and user-controlled developer code. The trust model must be visible to judges.

## Step-by-step
**1. Establish repeatable environment:** Local web + API + DB + Monad-execution Foundry tests, stubbed chain adapters for deterministic CI, one live Testnet smoke run at the end.
**2. Build a matrix:** desktop/mobile, wallet connected/disconnected/wrong network, guest preview vs eligible wallet user, correct/incorrect report, first claim/replay, sponsor approved/underfunded, expiry/refund, pending/confirmed chain tx.
**3. Gameplay tests:** On 360px viewport the game works by touch; coupon twice shows -20 demo units; correct bug report accepted; early/random/wrong report rejected; timeout and pause/resume handled; reduced-motion experience remains understandable.
**4. Server adversarial tests:** POST score=999999 ignored; forged sessionId or out-of-order seq rejected; same report resubmitted idempotently; session/report beyond expiry blocked; rate limit/cookie/nonce failures; untrusted GitHub URL never executed outside isolated test runner.
**5. Contract security tests:** Double claim, tamper amount/recipient/role, wrong verifying contract/chainId, expired EIP-712 proof, unauthorized verifier/owner, fee double-pay, sponsor refund accounting and token transfer failures.
**6. Chain integration tests:** Wrong chainId UI warning, RPC rate-limit/backoff, gas estimation failure, user rejects wallet tx, tx pending and reverted, explorer links correspond to actual receipt, decimals are 6 and not misformatted.
**7. Fallback operational tests:** Backend offline, faucet rate limited, 0 MON, no test USDC minted, contract unverified, testnet congestion/Explorer unavailable: UI shows precise limitation, backup recorded demo uses **real recorded transactions** with clearly dated evidence.
**8. Accessibility and content:** Verify the recommended copy is consistent and readable aloud; no AI-style repetitive three-verb hero slogan; no fabricated reward/verification claims. Check player, developer and sponsor copy with the same evidence standard. Labels for every icon button, focus ring/keyboard, ARIA announcements for timer, no flashing, screen-size and contrast checks. "Test USDC — no monetary value" clearly shown.
**9. Final bug triage:** P0 loss or forgery / dangerous RCE, P1 broken user path / payouts, P2 polish; freeze P2 while P0/P1 open.
**10. Sign-off package:** exact test commands/results and failures; verified network and contract address; honest list of MVP limitations; proof clip of one finder and one developer claim if both feasible.

## Security truths judges should hear
- Backend verification of browser events is not unforgeable proof of humanity.
- An authorized off-chain judge/verifier decides whether a report is valid; Monad enforces agreed funding and who can release it.
- Contract source verification on an explorer does not prove a security audit.
- Contracts deployed for hackathon are testnet prototypes and must not accept mainnet assets.

## First prompt
"Act as FYX QA/security agent. Read AGENTS.md, 05_QA_SECURITY.md, 07_HANDOFF_CONTRACTS.md, 09_FYX_DESIGN_SKILL.md and 11_BRAND_VOICE_COPY_SKILL.md. Run negative and positive tests across game, backend, UI and Monad contract. Prioritize client-forged-score defenses, EIP-712 replay/recipient manipulation, reward accounting, wrong chain and privilege escalation. Deliver an actionable reproducible bug report, not cosmetic praise."



---

<a id="06-demo-and-release"></a>

## File: `06_DEMO_AND_RELEASE.md`

# Agent 6 — Demo, Release, Pitch and Submission
**Role:** Compose a live audience experience from features the build really supports. No fabricated deploys, sponsorships, prizes or traction.

## Judging priorities supplied by team
Execution 24%, Monad fit/on-chain necessity 20%, community vote 20%, problem/promise 16%, originality 12%, presentation 8%. Treat as event-slide context from the team, re-check official event rules and current submission deadline on Blitz before citing publicly.

## Core live demo (goal: ~2 minutes, adjustable)
**1. Hook — 10 seconds:** "Ever found something wrong in an app and just moved on? We built PACH for that moment. Found something? Make it count." (PACH is a proposed name; use the approved fallback if clearance remains pending.)
**2. Sponsor — 20 seconds:** Demo sponsor deposits **20 test USDC** into the FYXRewardVault; show explorer-backed campaign funded. Do this ahead of time if live contract creation is too slow; show exact existing tx and explain it.
**3. Play — 40 seconds:** Audience scans QR to open `/play/checkout`, tries Broken Checkout. First valid deterministic demo report is shown; screen clearly says demo/testnet and indicates what proof validation checks.
**4. Dev fix — 25 seconds:** Controlled developer branch is submitted, prebuilt test suite runs, authorized reviewer records acceptance. Explain trust model.
**5. On-chain — 25 seconds:** Wallet claims approved 4 test USDC finder reward and 14 test USDC developer reward. Show actual on-chain tx in explorer, not a fake balance toast. Do not show anyone's private keys.
**6. Why Monad — 10 seconds:** Prize escrow and claims are neutral enforceable settlement; off-chain gameplay remains instantaneous. Mention that the protocol prevents double payouts and preserves sponsor-funded accounting, not that it independently detects all fraud.

## Audience QR / hype checklist
- Working public HTTPS page with mobile navigation, unique QR link, server warm, concise instructions and sound off by default.
- Guest preview available even without a wallet; no promise of monetary reward for guest play.
- One public game level; separate admin/verification tools never exposed to spectators.
- Leaderboard may show participants but protect their privacy and display verified vs demo data distinctly.
- For simultaneous crowd load, cap concurrent sessions and queue gently; avoid faucet requests per user. Sponsor/developer/finder test wallets are pre-funded.

## Demo hardening
1. Lock code/deploy SHA and runtime env. Verify same chainId, token and ABI across all services.
2. Run end-to-end at least once with real Testnet receipts and save hashes.
3. Record a backup demo from the **actual functioning system**, date/time visible or documented; use video only if live RPC/UI fails.
4. Prepare public GitHub README, verifiable contract source, site URL, team description, one screenshot, short product video and precisely scoped roadmap.
5. Verify actual submission mechanism/rules on https://blitz.devnads.com/ ; don't invent a form path or criteria not confirmed by official page.
6. Distinguish current delivery from roadmap (agent marketplace, x401 identity, more games, SDK, true corporate verification, audits).

## Product pitch details
Before recording the pitch, read `10_POSITIONING_NAMING_SKILL.md` and `11_BRAND_VOICE_COPY_SKILL.md`. Do not turn technical steps into a repetitive slogan. Use one spoken-language opening and show the playable screen immediately.
**Name:** PACH (proposed, subject to founder decision and legal/domain clearance; FYX is the legacy implementation label).
**Main brand line:** Found something? Make it count.
**Category:** Playable product challenges.
**One-sentence explanation:** People play through product challenges; developers work on accepted findings; sponsors fund specific outcomes under transparent rules.
**User:** Learn by playing, spot the glitch, earn XP and eligible testnet prizes.
**Developer:** Solve verified authorized bug tasks; earn accepted-fix awards and visible experience.
**Institution:** Sponsor a challenge with predefined funds, transparent payouts and evidence of completed work.
**Core moat thesis (hypothesis, not proven):** One connected workflow from playful discovery → controlled fix verification → cryptographically enforceable reward settlement. Existing bug bounties, questing and escrow products overlap; don't claim category invention.

## Delivery acceptance
- `RELEASE_CHECKLIST.md` with all items checked or marked blocked.
- Actual live URL and current Github commit; Testnet vault address + 1/2 tx links as available.
- 3 demo questions answered: Why blockchain? Who verifies truth? How do companies get measurable results?
- Presentation has no unverified numbers or claims and can be demonstrated from a mobile device.

## First prompt
"Read AGENTS.md, 06_DEMO_AND_RELEASE.md, 10_POSITIONING_NAMING_SKILL.md, 11_BRAND_VOICE_COPY_SKILL.md and the complete FYX feature/contract handoffs. Prepare a realistic 2-minute live demo runbook with QR audience flow, explorer-backed testnet transactions, explicit verifier trust assumptions, backup recording checklist and official Blitz submission prerequisites. Never invent successful contract deployment or live traction."



---

<a id="07-handoff-contracts"></a>

## File: `07_HANDOFF_CONTRACTS.md`

# Shared interfaces — freeze before agents begin
**Status:** Proposed MVP contract. Orchestrator is responsible for locking changes and announcing a single shared version.

## One project, three bounded systems
```
apps/web  --> packages/game (player UI, event emitter)
    |             |
    +----------> apps/api (sessions, game authority, auth, claims)
                       |
                     viem (reads/indexing / verifier signing)
                       |
        packages/chain: FYXRewardVault (Monad Testnet 10143)
```
Never call smart contracts directly from game engine for every movement/click. Wallet client sends transaction only when funding or claiming on chain.

## Paths and file ownership
```
apps/web/                       # UI agent
apps/game/ or packages/game/    # Kimi game agent
apps/api/                       # Backend agent
packages/chain/                 # Solidity agent
packages/shared/                # Orchestrator only, frozen Zod/TS types
packages/config/                # Orchestrator only, RPC env and addresses
tests/e2e/ tests/security/      # QA agent
docs/                           # Orchestrator, release agents (separate files)
```

## Shared enums
```
role: 'player' | 'developer' | 'sponsor' | 'verifier' | 'admin'
challenge.status: 'draft' | 'funding' | 'open' | 'expired' | 'settled' | 'refunded'
session.status: 'created' | 'running' | 'submitted' | 'accepted' | 'rejected' | 'expired'
claim.role: 'FINDER' | 'DEVELOPER'
claim.status: 'eligible' | 'approval_prepared' | 'tx_pending' | 'claimed' | 'rejected' | 'expired'
```

## API V1 — POSTs require auth except where stated
- `POST /api/auth/nonce` `{address, chainId:10143}` → `{nonce, message, expiresAt}`
- `POST /api/auth/verify` `{message, signature}` → session cookie + `{user:{id,address,role}}`
- `GET /api/me` → user/session or 401.
- `GET /api/challenges` → `{items:[{id,slug,title,description,status,chainId,tokenAddress,prizes:{finder,developer,platform},contractChallengeId?,fundingTxHash?}]}`; use base-unit strings on chain-facing API.
- `POST /api/game/sessions` `{challengeId,levelId}` → `{sessionId,startedAt,expiresAt,levelConfig,version}`.
- `POST /api/game/events` `{sessionId,seq,kind,payload,clientTimestamp?}` → `{accepted,nextSeq,serverState}`. Allowed MVP kinds: `start`, `coupon_applied`, `hint_opened`, `paused`, `resumed`.
- `POST /api/game/reports` `{sessionId,bugCode,evidence}` → `{reportId,status:'accepted'|'rejected',xp,reason?}`. MVP correct code: `negative_total_due_to_duplicate_coupon`.
- `POST /api/dev/submissions` `{challengeId,commitRef,patchId}` → `{submissionId,status:'queued'|'passed'|'failed'|'needs_review'}`; only allowlisted controlled repo/patches, authorized reviewer decision required.
- `GET /api/leaderboard` → `{players:[{handle,xp,rank}],developers:[{handle,acceptedFixes,rank}]}`; only opted-in public handles.
- `POST /api/claims/prepare` `{challengeId,role}` → `{approval:{challengeId,role,claimant,amount,proofHash,nonce,deadline},signature,chainId,verifyingContract}` or reject. Backend derives claimant from verified session, not caller-provided address.
- `GET /api/claims/:claimId` → persisted status + confirmed `txHash?`.
- `POST /api/sponsor/challenges` → `draft` data for an approved sponsor; on-chain funding is signed by sponsor wallet client, not API.
- `POST /api/verifier/submissions/:id/approve` → controlled test evidence + reviewer session required; issues developer entitlement once.

### Standard API error shape
`{error:{code:string,message:string,details?:Record<string,unknown>,requestId:string}}`; no secrets, stack traces, raw credentials or private keys in client errors.

## Gameplay event validation — deterministic MVP
Base price `100` demo units, 60-unit coupon, max 2 coupon events. The *intentional bug* permits repeated application yielding `-20`; acceptance requires replayable ordered events, nonexpired session, correct report category, rate/timing checks and user eligibility. **No score-based payout solely based on client event field**. Player testnet reward only after authorized verifier approval. Additional anti-Sybil required before real money.

## On-chain value model
- Token: Devnads test USDC `0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73` on 10143 (6 decimals).
- Example challenge deposit 20 USDC = `20000000` base units.
- Finder `4000000`, developer `14000000`, platform `2000000`. Never use JS floating point for amounts. Render with `formatUnits(bigint,6)`.
- Platform fee settles once with developer claim only. Unspent funds refundable to sponsor after expiry. Contract enforces immutability/actual balance; backend must not assume escrow funded until chain receipt.

## EIP-712 frozen proposal
```
Domain:
  name: FYXRewardVault
  version: '1'
  chainId: 10143
  verifyingContract: <actual deployed contract>
Types:
  Claim:
    challengeId: uint256
    role: uint8        # 0 FINDER, 1 DEVELOPER
    claimant: address
    amount: uint256
    proofHash: bytes32
    nonce: uint256
    deadline: uint256
```
If the contract agent chooses `claimant` as msg.sender, verify both claimant and msg.sender match the signed value. `nonce` must be consumed globally per verifying signature or scoped so it cannot replay; contract also prevents repeat per role/challenge. Contract must derive/token check the exact fixed amount independently of signature. `proofHash` is evidence commitment, not PII/raw bug report or proof of truth. Contract emits `RewardClaimed(challengeId, role, claimant, amount, proofHash)` and other events with stable indexed fields. Make any signed `role` encoding unambiguous.

## Signer trust boundary
The backend/verifier signing key signs only after allowed evidence + approved review, never based on arbitrary request. Signer address configured in vault; no app client signing key. For hackathon, verifier remains trusted. Production roadmap: independent multi-party attestations/dispute resolution, audit, user uniqueness and real sponsor KYB.

## Deployment artifact schema
```
{
  "chainId": 10143,
  "rpc": "https://testnet-rpc.monad.xyz",
  "vaultAddress": "<actual deployed>",
  "testUsdcAddress": "0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73",
  "decimals": 6,
  "deployTxHash": "<actual tx hash>",
  "explorerUrl": "<actual verified explorer link>",
  "abiPath": "<actual local path>"
}
```
Until deployment, absent fields should be empty/unset; **never commit placeholder addresses as if valid**.

## Integration sequence
1. Shared types and mocked API. 2. Game + platform UI. 3. Backend events and auth. 4. Chain contract tests. 5. Testnet deploy + verify. 6. Wallet funding. 7. Backend EIP-712 signing. 8. Live claims. 9. QA/release. Interface changes require signed-off handoff and re-testing all dependent layers.


## Copy / brand compatibility notice (v2)
Use `11_BRAND_VOICE_COPY_SKILL.md` for any human-facing status or error text. Business logic, API routes, payloads, on-chain contract names, EIP-712 domains and token/chain identifiers **must not be renamed** for the provisional PACH brand. Return stable machine-readable status codes; UI maps them to accurate human-facing text.



---

<a id="08-sources-and-network"></a>

## File: `08_SOURCES_AND_NETWORK.md`

# Verified resources / network checklist (checked 2026-10-24)

## Canonical facts (review live before any deployment)
| Item | Value / URL | Source |
|---|---|---|
| Monad Testnet chain ID | `10143` | https://docs.monad.xyz/ai/current-facts |
| Monad Mainnet chain ID (**DO NOT USE**) | `143` | https://docs.monad.xyz/ai/current-facts |
| Testnet native asset | MON | https://docs.monad.xyz/developer-essentials/testnet |
| Testnet RPC | `https://testnet-rpc.monad.xyz` | https://docs.monad.xyz/ai/current-facts |
| Testnet explorer | https://testnet.monadscan.com / https://testnet.monadvision.com | https://docs.monad.xyz/ai/current-facts |
| Official MON faucet | https://faucet.monad.xyz | https://docs.monad.xyz/ai/current-facts |
| Devnads agent API reference | https://devnads.com/agents | official Devnads site |
| Agent API base | `https://agents.devnads.com` | https://devnads.com/agents |
| Devnads test-token mint UI | https://devnads.com/tokens | official Devnads site |
| Test USDC contract | `0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73` | https://devnads.com/tokens |
| Test USDC decimals | 6 | https://devnads.com/tokens |
| Official Monad Foundry deployment | https://docs.monad.xyz/guides/deploy-smart-contract/foundry | Monad |
| Official Monad Foundry verification | https://docs.monad.xyz/guides/verify-smart-contract/foundry | Monad |
| Monad current fact index for agents | https://docs.monad.xyz/ai/developers | Monad |
| Blitz builder resources | https://blitz.devnads.com/resources | Devnads |
| Blitz event platform | https://blitz.devnads.com | Devnads |
| Monad AI skills | https://skills.devnads.com | Devnads community |

## Devnads Agents API exact documented endpoints
```
GET  https://agents.devnads.com/health
GET  https://agents.devnads.com/v1/faucet/status/10143
POST https://agents.devnads.com/v1/faucet
POST https://agents.devnads.com/v1/verify
GET  https://agents.devnads.com/v1/verify/status/10143/{address}
```
### Faucet examples
```
curl -fsS https://agents.devnads.com/health
curl -fsS https://agents.devnads.com/v1/faucet/status/10143
curl -sS -X POST https://agents.devnads.com/v1/faucet \
  -H "Content-Type: application/json" \
  -d '{"chainId":10143,"address":"0xYOUR_REAL_TESTNET_WALLET"}'
```
1 test MON per successful request is the listed amount. Limits currently documented: 10 requests per address/day, 50 per IP/day, 200 per ASN/day, 2000 MON/day total, with additional anti-abuse checks. Availability not guaranteed. Endpoint funds MON, **not USDC**.

### Test tokens
Devnads Test Tokens page is a wallet-connected minting **UI**, not the documented `/v1/faucet` API. ERC20 test token addresses are ecosystem/demo contracts, not canonical production stablecoins. Do not send real funds to them.
- test USDC: `0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73` (6 decimals; EIP-2612; UI max 10,000 per transaction)
- test USDT: `0x42D54D7aE6776D309363e650fBcbF93D961D8b58` (6 decimals)
- test WETH: `0x05bE0A4Bc7848424029B75d51565A34e17802D2d` (18 decimals)
- test WBTC: `0x596886d5875D73cC9bCEC4fAf1EE54e4B8af3d6a` (8 decimals)

### Verify API
A valid POST `/v1/verify` needs `chainId`, actual `contractAddress`, `contractName` (e.g. `src/FYXRewardVault.sol:FYXRewardVault`), compiler version matching build, and `standardJsonInput` object (preferred) or flattened `sourceCode`. Optional constructor args and EVM/optimizer values must match actual compilation. API attempts both MonadVision/Sourcify and Monadscan/Etherscan V2. Always check status; request acceptance does not equal verification success.

## Monad development gotchas
- Monad docs recommend **Foundry >=1.8.0** with `network="monad"`, plus `viem >=2.40.0` for current Monad-specific chain support.
- When using standard `forge test` without Monad execution configuration, gas estimates and VM behavior may be mismatched.
- Monad gas is charged by transaction **gas limit**; maintain an adequate MON buffer and estimate conservatively without absurd limits.
- MIP-8 organizes storage in 128-slot pages; not a separate contract opt-in, payout system or security algorithm.
- Docs note testnet was reset from genesis on 2025-12-16; do not copy old deployment addresses/chain IDs from earlier hackathon projects.

## Optional technology — later roadmap, not MVP dependency
- x401: credential / access verification is independent of FYX's core reward engine; requires issuer/trust design.
- x402: HTTP payment-gated APIs on Monad, useful if FYX later sells access to machine-readable developer tools: https://docs.monad.xyz/guides/x402
- ERC-8004: registered AI agent identity/reputation, not needed to make the game playable: https://docs.monad.xyz/guides/erc-8004
- Corporate KYB, sophisticated anti-Sybil, centralized verifier alternatives and audit are post-hackathon requirements for real-world value.

## Helpful official templates / agent skills
- Devnads monskills: `npx skills add therealharpaljadeja/monskills` (review the third-party source/install instructions and security first): https://skills.devnads.com
- Monad Foundry template (official guide): `forge init --template monad-developers/foundry-monad <project_name>`
- Devnads builder resources link official Foundry deployment, wallets, verification, PWA templates, account abstraction and sponsor transactions. Optional gas sponsoring is explicitly stretch scope for a one-day hackathon.

## Verification discipline
Sources and APIs evolve. Before an action that moves funds or deploys code, check official pages for recent changes; compare chain ID from RPC, wallet, ABI and code. Do not claim any address has been deployed, source verified, or faucet granted until actual results demonstrate it.



---

<a id="09-fyx-design-skill"></a>

## File: `09_FYX_DESIGN_SKILL.md`

---
name: fyx-trust-first-ui-design
version: 2.0.0
project: PACH (candidate public brand) / FYX (legacy internal identifiers)
scope: apps/web, apps/game, shared-ui, copy-and-content
owners: Orchestrator, Platform UI Agent, Kimi Game Agent, QA Agent
priority: required
---

# FYX Design Skill — Trust-First, Playful, Ethical Product UI

> **BRAND UPDATE:** `FYX` is the *legacy internal name*. The proposed name is `PACH` (pending legal and founder approval). Read `10_POSITIONING_NAMING_SKILL.md` for Al Ries and Jack Trout-inspired positioning, and `11_BRAND_VOICE_COPY_SKILL.md` before writing any public copy. Preserve shared APIs and internal identifiers until approved.
>
> **MANDATORY FOR ALL UI-CONTRIBUTING AGENTS.** Read this file **after** `AGENTS.md` and `07_HANDOFF_CONTRACTS.md`, and **before** creating components, themes, or pages. If another prompt asks for conflicting colors or UI behavior, this file supersedes older aesthetic suggestions. Do not change security, protocol, reward, or data contracts using a visual brief.

## 0. Mission, audience, product truth

**FYX (legacy working title; PACH proposed)** is one integrated product for three audiences:

1. **Players (youth):** discover intentionally planted bugs inside authorized, fun, accessible mini-games; receive verified XP, and when eligible claim **testnet** prizes.
2. **Developers:** inspect controlled developer challenges, submit fixes, receive verified credit and eligible rewards after tests and authorization.
3. **Sponsors (corporate):** create/fund transparent campaigns, observe verified results, and understand the cost and conditions of rewards.

**Product promise:** *Fun to join. Serious about proof.* The product must feel approachable without sacrificing institutional credibility.

**Brand position:** trusted infrastructure meets challenge arcade. Not a casino. Not a bank impersonation. Not an opaque crypto yield scheme. Not an unsafe hacking playground.

**Core brand language:** trustworthy, clear, competitive, human, verifiable, modern, rewarding.

**Recommended public-facing line (PACH candidate):** `Found something? Make it count.` Avoid the retired triad `Spot it. Fix it. Earn it.` and the internal shorthand `Find. Fix. Earn.` in visible marketing. Read `11_BRAND_VOICE_COPY_SKILL.md` for complete voice guidance. PACH remains legally unapproved; internal FYX identifiers are kept for stability.

**Supporting copy:** `Real challenges. Verifiable results. Transparent rewards.`

### Non-negotiables

- Never invent or imply real participants, logos, customer testimonials, transaction hashes, sponsor partners, prize pools, earnings, or on-chain verification.
- **Every monetary value in the current hackathon environment must be labeled `test USDC (no monetary value)`** or an equally clear localization. XP is **not** currency.
- An on-chain deposit is not a guarantee of bug validity; authorized off-chain verification is required. Display this honestly.
- A `Verified` state must have the actual evidence required by that type of verification (on-chain receipt, server adjudication, official sponsor authorization); do not conflate them.
- No dark patterns: deceptive scarcity, coercive countdowns, hidden fees, preselected consent, fake social proof, or fabricated authority.
- Accessible by default. Do not sacrifice contrast, motion comfort, readability, or keyboard navigation for visual novelty.

## 1. Visual DNA

**Design concept:** `Trust-first gamified product interface`.

- Layout: clear hierarchy, generous breathing room, task-first navigation.
- Brand: blue/navy establishes confidence; teal signals verified activity; electric lime adds restrained play energy.
- Shape: 12–16px card radius; smaller 8–12px controls; restrained shadows; thin borders.
- Typography: precise and modern, with a slightly expressive display face.
- Motion: meaningful, brief, and optional. Polished microinteractions instead of endless animation.
- Imagery: product demonstrations, abstract geometric forms, human-centered but never fake corporate photography. Use no unauthorized corporate marks.
- Style boundary: not exaggerated neon cyberpunk, RGB casino, meme-only, or sterile financial terminal.

### Surfaces by context

| Product surface | Default mode | Emotional tone | Accent usage |
|---|---|---|---|
| Public landing and arenas | Light | Welcoming, energetic, credible | Blue primary, teal confirmations, lime small highlights |
| Player dashboard | Light | Friendly progress, clear next action | Blue CTA, lime XP only on suitable contrast surface |
| PLAY stage / game HUD | Dark | Immersive, playful, focused | Blue actions, lime time/score highlights, success green for confirmed wins |
| Developer BUILD | Light with optional code-dark panels | Precise, efficient | Blue actions, teal validated tests |
| Corporate dashboard | Light | Calm, auditable, professional | Navy headings, blue CTAs, minimal lime |
| Rewards / wallet | Light | Transparent, reassuring | Semantically accurate green/amber/red only for state |

**Rule:** Use one recognizable FYX design system across all surfaces. A dark game is a themed experience within the same app, not an unrelated second website.

## 2. Foundation color tokens

### Brand and semantic colors

| Token | Hex | Usage |
|---|---|---|
| `brand.primary` | `#2563EB` | Primary CTAs, selected navigation, links, focus emphasis |
| `brand.primaryHover` | `#1D4ED8` | Hover/pressed primary |
| `brand.navy` | `#0F172A` | Primary headings, premium dark backgrounds |
| `brand.softBlue` | `#DBEAFE` | Selected background, soft info surfaces |
| `brand.teal` | `#14B8A6` | Decorative/brand accent, not small text on white |
| `brand.lime` | `#A3E635` | XP, small game emphasis, limited decorative highlights |
| `state.success` | `#15803D` | Success text/icons on light surfaces |
| `state.successSoft` | `#DCFCE7` | Success backgrounds |
| `state.warning` | `#92400E` | Warning text on light surfaces |
| `state.warningSoft` | `#FEF3C7` | Warning backgrounds |
| `state.danger` | `#DC2626` | Error messages |
| `state.dangerSoft` | `#FEE2E2` | Error backgrounds |
| `surface.canvas` | `#F8FAFC` | Default app background |
| `surface.card` | `#FFFFFF` | Cards, dialogs, panels |
| `surface.subtle` | `#F1F5F9` | Secondary panels |
| `surface.border` | `#E2E8F0` | Borders and separators |
| `text.primary` | `#111827` | Body/headings on light |
| `text.secondary` | `#475569` | Secondary explanatory copy |
| `text.muted` | `#64748B` | Captions, with verified contrast |
| `game.bg` | `#0B1220` | Dark PLAY canvas |
| `game.panel` | `#111C2F` | Dark game panels |
| `game.border` | `#26344B` | Dark outlines |
| `game.text` | `#F8FAFC` | Game foreground |
| `game.muted` | `#CBD5E1` | Game secondary foreground |

### Usage ratios (guidance, not a rigid formula)

- **Platform:** approximately 70% warm white/off-white, 20% navy/slate, 8% blue, 2% teal/lime accents.
- **PLAY:** predominantly dark navy, balanced with legible bright foreground and sparing lime.
- **Corporate:** rely on white/navy/blue; avoid lime on invoices, authorization, or payout controls.
- The lime `#A3E635` and teal `#14B8A6` have **poor contrast as small text on white**. Never use them as a substitute for dark text on light backgrounds. For successful states on white, use `#15803D` text.
- No gradients over paragraphs, and no status communicated by hue alone.

### CSS design tokens — canonical starting point

Use or adapt to the project's installed Tailwind version. **Do not assume Tailwind v3 vs v4 or overwrite an existing theme without inspecting the repository.** A shared CSS token source should be consumed by both web and game.

```css
:root {
  color-scheme: light;
  --fyx-primary: #2563eb;
  --fyx-primary-hover: #1d4ed8;
  --fyx-navy: #0f172a;
  --fyx-blue-soft: #dbeafe;
  --fyx-teal: #14b8a6;
  --fyx-lime: #a3e635;

  --fyx-canvas: #f8fafc;
  --fyx-surface: #ffffff;
  --fyx-surface-subtle: #f1f5f9;
  --fyx-border: #e2e8f0;
  --fyx-text: #111827;
  --fyx-text-secondary: #475569;
  --fyx-text-muted: #64748b;

  --fyx-success: #15803d;
  --fyx-success-soft: #dcfce7;
  --fyx-warning: #92400e;
  --fyx-warning-soft: #fef3c7;
  --fyx-danger: #dc2626;
  --fyx-danger-soft: #fee2e2;

  --fyx-radius-sm: 8px;
  --fyx-radius-md: 12px;
  --fyx-radius-lg: 16px;
  --fyx-radius-xl: 20px;
  --fyx-shadow-card: 0 6px 24px rgb(15 23 42 / 0.05);
  --fyx-focus-ring: 0 0 0 3px rgb(37 99 235 / 0.24);
}

[data-fyx-theme="play"] {
  color-scheme: dark;
  --fyx-canvas: #0b1220;
  --fyx-surface: #111c2f;
  --fyx-surface-subtle: #18263e;
  --fyx-border: #26344b;
  --fyx-text: #f8fafc;
  --fyx-text-secondary: #cbd5e1;
  --fyx-text-muted: #94a3b8;
}

.fyx-focusable:focus-visible {
  outline: 2px solid var(--fyx-primary);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Accessibility note:** A focus-ring outline or text color must be checked against its *actual surrounding surface*, including the dark game. Use a high-contrast alternative if blue is insufficient there.

## 3. Typography and information density

- **Body / UI:** `Inter` (fallback: system UI sans-serif).
- **Display / brand:** `Space Grotesk` or `Inter` bold; keep the logo an original FYX wordmark rather than text pretending to be an existing trademark.
- **Code, transaction IDs:** `JetBrains Mono` or a system monospace stack.
- Load fonts efficiently, locally when licensing permits, and provide proper fallbacks.

| Token | Desktop | Mobile | Intent |
|---|---|---|---|
| Hero | 48–64px / 1.05–1.15 | 36–44px | Single clear product promise |
| H1 | 34–40px | 28–32px | Page title |
| H2 | 24–30px | 22–26px | Section title |
| H3 | 18–22px | 18–20px | Card/challenge headings |
| Body | 16px / 1.5–1.65 | 16px | Product information |
| Secondary | 14px / 1.5 | 14px | Supporting descriptions |
| Caption | 12–13px | 12–13px | Short metadata only; not essential disclosures |
| Game counter | 24–40px tabular | 24–32px tabular | Timer, points |

Rules: sentence-case navigation; limited all-caps for small eyebrow labels; readable line lengths (approx. 55–75 characters on editorial surfaces); consistent tabular numbers for scores, balances, countdowns; no long animations delaying core actions.

## 4. Spacing, layout, and responsiveness

- Spacing scale: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64` px.
- Card padding: 16px mobile, 20–24px desktop.
- App content max-width: 1200–1280px; long-form/readability panels narrower.
- Global app shell: sidebar on wide desktop when useful; bottom navigation only for the player experience on narrow mobile.
- Responsive checkpoints to test: **360, 390, 768, 1024, 1280, 1920px**.
- Minimum touch target **44×44px** wherever possible; comfortable gaps between targets.
- Safe-area-aware game and bottom navigation; no horizontal scrolling for core flows.
- Embed PLAY through an agreed `GameAdapter`; it must resize cleanly rather than show a tiny desktop iframe.

## 5. Required product components

### Navigation and shell

- FYX wordmark + key paths: `Play`, `Build`, `Leaderboard`, `Rewards`, `For Teams`.
- Wallet/account in top-right on desktop; always show connected chain and wallet state where relevant.
- Mobile: a simple menu or bottom nav; clear active state, never nav items that lead nowhere.
- Public/guest experience should lead quickly to one playable level. Signing in must not be mandatory for the preview.

### Buttons

- **Primary:** solid trust blue, white readable text, clear verb, strong keyboard focus; never put a prize promise on a generic CTA.
- **Secondary:** subtle blue/neutral border with readable text.
- **Destructive:** red only for irreversibility such as removal; require confirmation for irreversible actions.
- **Disabled:** visually and semantically disabled with clear reason where useful.
- **Loading:** preserve width; label `Checking eligibility…` / `Waiting for confirmation…` instead of indefinite spinner-only states.

### Challenge cards

Each card displays: real title, type (PLAYER / DEV / BOTH), sponsor name **only if legitimately associated**, participation scope, difficulty, status, deadline if real, prize denomination (`test USDC`), source-of-truth funding status, and one next action. Badges must not replace explicit terms.

### Status badges — controlled vocabulary

- `Demo` — seeded or sample content, not a real verified integration.
- `Funded on Monad Testnet` — only after confirmed escrow deposit + correct network/contract evidence.
- `Finding under review` — report received, not an approved reward.
- `Verified finding` — server/adjudicator accepted the defined evidence.
- `Fix accepted` — tests plus authorized approval complete.
- `Reward eligible` — verified and claim authorization exists, funds not necessarily transferred.
- `Claim pending` — transaction submitted, not confirmed.
- `Claimed on testnet` — receipt confirms successful claim; offer explorer link.
- `Expired` / `Rejected` — clear cause and next step.

**Never** collapse `submitted`, `verified`, `eligible`, and `paid` into a single green check.

### Wallet, rewards, payouts

- Show wallet address truncated with copy, chain label, and explorer link from actual data.
- Always show asset + amount + network: e.g. `4 test USDC · Monad Testnet`.
- Show fee information when known, sponsor reward splits, deadlines, eligibility conditions, and transparent claim status.
- Provide an `About rewards` explanation: test tokens have no monetary value in the demo.
- Distinguish wallet disconnection, wrong chain, insufficient MON for gas, empty balance, failed signature, pending transaction, and reverted transaction.

### Feedback and empty states

Each route includes meaningful loading, empty, error, offline, and permission-restricted states. Avoid fake social counters or decorative fake analytics. Use actual data, or clearly mark a mock environment as demo.

## 6. PLAY experience: fun but structured

**Core game:** `Spot the Glitch: Broken Checkout`.

**Visual goals:** focus and clarity first, arcade flavor second. The gameplay interaction must be enjoyable even if monetized rewards are disabled.

1. **Entry:** short mission briefing (what to find, rules, time limit, authorization sandbox) and `Start challenge` CTA.
2. **Active gameplay:** main shopping UI takes priority; timer, XP potential, and one unobtrusive hint control occupy a compact HUD.
3. **Discovery:** user interacts with the fictional 100-unit cart; two 60-unit coupons produce a negative total. The UI intentionally demonstrates the bug, but the user must submit the actual bug type/observation.
4. **Report:** plain-language bug identification and optional short evidence; player knows that a report is *not* payment approval.
5. **Validation:** UI clearly differentiates `Your report was received`, `Correct finding`, and `Reward eligible`.
6. **Victory:** brief (≤700ms) non-flashing celebratory microinteraction and concise explanation of the finding.
7. **Next step:** `Try another challenge`, `See leaderboard`, or `Connect wallet to check eligibility` depending on session state.

**Game UI palette:** dark navy panels; bright light text; blue interaction CTA; lime used sparingly for XP or decorative focus, **not** for red/green approval meaning. No flashing strobes; respect reduced motion; sound off by default or under explicit control.

**No fake suspense:** Countdown must represent the actual game timer; no fabricated 'only 2 winners left'. Avoid dark patterns that push children/players toward wallet connections or payments.

**Example microcopy:**

- Mission: `Something is wrong with this checkout. Can you find it?`
- Hint: `Try applying the same coupon again.`
- Report: `What did you notice?`
- Success: `Nice catch. The final price should never be negative.`
- Verification: `Your finding was validated. Reward eligibility is checked separately.`
- Offline: `Play preview only — network rewards are unavailable.`

## 7. Developer BUILD UX

- Developer queue is a practical workbench, not a duplicate game carousel.
- Show defect context, reproducible steps, relevant test status, reward eligibility rules, reviewer status, and accepted result.
- Technical panels may use dark code surfaces with readable typography; the rest stays in the shared light product shell.
- No implication that passing arbitrary client-side tests guarantees payment. Official review/adjudication must be visible.
- Expose fix status clearly: `Submitted → Test running → Tests passed/failed → Awaiting approval → Accepted → Claim eligible`.
- Show transparent reason when a fix is declined; no fabricated reputation scores.

## 8. Corporate / sponsor UX

- Use calm, information-rich but not cluttered visual hierarchy: light panels, crisp navy headings, blue CTAs, audit-ready statuses.
- Prioritize `Campaign terms → Prize split → Sponsor funding → Receipt → Reports → Authorized approval → Settlement`.
- Show **exact** award categories, prize split and testnet disclosures before confirming funding; no hidden fees.
- Verified sponsor identities require actual evidence. Otherwise use `Demo sponsor` or a plainly fictional entity.
- Clearly distinguish off-chain business approval from on-chain escrow execution. Blockchain does not independently prove a real-world bug or company identity.
- Zero unnecessary animation on treasury-sensitive confirmation screens.

## 9. Ethical influence: Robert Cialdini-inspired principles

This is a **design application inspired by** *Influence: The Psychology of Persuasion* (`Психология влияния`) rather than a quotation or exact summary of any particular edition. Use it to make legitimate value easier to understand, **not to manipulate**.

| Principle | Appropriate FYX application | Prohibited misuse |
|---|---|---|
| **Social proof** | Show accurate participation counts, independently sourced cases, real accepted fixes with consent. | Fake players, fake live activity, invented logos/testimonials. |
| **Authority** | Actual explorer receipts, transparent smart contract links, verifiable sponsor role/approval, clear methodology. | False 'audited'/'official'/'guaranteed secure' badges. |
| **Reciprocity** | Useful free preview, explanations, meaningful XP and fair agreed rewards. | Opaque lock-in, surprise fees, emotional pressure to spend. |
| **Commitment/consistency** | Small steps with visible progress: preview → report → verify → claim (if eligible). | Forced sign-ups, confusing opt-outs, preselected financial consent. |
| **Liking** | Friendly plain-English writing, useful celebrations, empathy in errors. | Fake friendship, manipulative guilt or shame. |
| **Scarcity** | Real ending times, legitimate fixed prize budgets and eligibility slots. | Artificial countdown resets, fake low-stock notices. |
| **Unity** | Genuine teams, peer learning, open community progress. | Exclusionary group pressure, inflated social identity signals. |

**Clarity is a separate trust-centered design principle**, not an additional named Cialdini principle. Make fees, risks, consent, conditions and verification visible at the moment a user decides.

### Copy rules

- Prefer clear action language: `Play a challenge`, `Submit a finding`, `View testnet reward`, `See transaction`.
- Prefer earned proof: `Confirmed on Monad Testnet` **only when the actual receipt exists**.
- Never say `Earn real money`, `Guaranteed reward`, `Secure by blockchain`, `Instant riches`, `Hack any app`, or imply real-world bug exploits are allowed.
- Explain uncertainty: `Pending reviewer approval`, `Testnet only`, `Rewards not available in preview mode`.
- Corporate copy: precise and calm. Player copy: friendly and concise. Developer copy: technical and direct. Same product truth everywhere.

## 10. Screen-by-screen specification

### `/` — Landing / product entrance

- Above the fold: one-sentence FYX definition, `Play demo` primary action, `Explore challenges` secondary action.
- Below: real/clearly labeled demo challenge, user/developer/sponsor value explanation, `How reward verification works` with understandable stages, transparent trust statement.
- Hero can be visually expressive but must not obscure functionality or performance.

### `/arenas` and `/arena/[id]`

- Filters `Player`, `Developer`, `Both`, `Active`, `Completed`.
- Every challenge displays real status and testnet prize disclosure.
- Detail page: scope, conditions, reporting guidelines, funding status, start action, rules.

### `/play/[levelId]`

- Focus mode: game-first view; compact HUD; no distracting platform navigation during timer.
- Accessible controls, touch responsiveness, real timer, report dialog, outcomes, clear exit.

### `/build`

- Developer-focused challenge listings, reproducible test cases, patch submission flow, clear adjudication timeline/status.

### `/leaderboard`

- Separate player XP from developer accepted fixes. Never equate them to earnings.
- Show authoritative values with time window and source. Fake seeded entries labeled demo.

### `/rewards`

- Wallet/network banner, `Pending eligibility`, `Claim available`, `Claim submitted`, `Claim confirmed`; explorer receipts; test-token explanation.

### `/corporate`

- Campaign management and on-chain funding, fully visible reward split, review queue and funding receipts. Trust-heavy, not hype-heavy.

### `/about`

- One short paragraph: what runs on-chain, what is verified off-chain, what's experimental, what is **not** audited or guaranteed.

## 11. Motion and interaction rules

- Standard hover/focus transitions: **120–180ms**.
- Drawer/dialog open/close: **180–260ms**.
- Victory celebration: **≤700ms**.
- Use transform/opacity where practical; avoid layout-shifting animation.
- Never delay form submission or transaction confirmation for a cinematic effect.
- If system prefers reduced motion, disable transforms/particles and use clear static confirmation.
- Never use strobing, simulated gambling mechanics, deceptive near misses, forced reward loops, or sensory overload.
- The first meaningful interaction should work on a mid-range phone on ordinary mobile bandwidth.

## 12. Accessibility and security signaling

Minimum acceptance target: **WCAG 2.2 AA** for implemented user-facing flows, with documented deviations where genuinely blocked. In particular:

- Small text / normal text: target minimum **4.5:1** contrast; large text: **3:1**; essential controls and icons: **3:1** against adjacent surfaces.
- Keyboard path to core interaction where feasible; clear visible focus and accessible labels.
- ARIA live status only for meaningful results; avoid announcing every countdown tick.
- No flashing gameplay; respect reduced motion and high zoom levels.
- Do not present color alone as the proof of approved/rejected states.
- Never make wallet signature look like a normal continue click; accurately name authorization and signing.
- Real danger: spoofed approvals, wrong network, replayed claims, fake test token vs real assets. Distinguish these with both text and visual hierarchy.

## 13. Deliverables / agent execution procedure

**Orchestrator:**
1. Read this skill and resolve conflicts with earlier visual hints (this file is the UI source of truth).
2. Place canonical shared tokens in the existing design-system or styles package; do not duplicate independent theme systems.
3. Freeze components interface and route requirements before parallel development.
4. Ask agents for screenshots at 390px and 1440px for review plus results of accessibility checks.

**Platform UI Agent:**
1. Read `AGENTS.md`, `02_PLATFORM_UI.md`, `07_HANDOFF_CONTRACTS.md`, and **this file**.
2. Implement shared token CSS and reusable `Button`, `Card`, `Badge`, `StatusBanner`, `ChallengeCard`, `WalletStatus`, `RewardState`, `EmptyState`.
3. Build landing, arenas, reward, developer, leaderboard, sponsor routes based on real API contracts.
4. Respect state truth for demo vs funded vs verified vs claimed.
5. Provide mobile + desktop screenshots, keyboard checks, and no-dead-control validation.

**Kimi Game Agent:**
1. Read `AGENTS.md`, `01_KIMI_GAME.md`, `07_HANDOFF_CONTRACTS.md`, and **this file**.
2. Consume **shared tokens** but apply `[data-fyx-theme="play"]` in the game root; do not globally override platform styles.
3. Build the functional Broken Checkout interaction and evidence report first; add feedback and polish afterwards.
4. Keep HUD compact, responsive and reduced-motion friendly; never use a neon-themed fake prize animation.
5. Supply real screenshots and event-adapter tests to Orchestrator.

**QA / Security Agent:**
1. Run mobile, contrast, keyboard, font-loading, reduced-motion, fake-proof and payout-label test cases.
2. Confirm that no fake participants, fake transactions, unverifiable claims, or hidden fee language exists.
3. Verify wallet signature prompts and actual on-chain receipt labels are not misleading.
4. Flag contradictory visual treatments (for example lime used to indicate payment success).

### Acceptance checklist

- [ ] UI is unmistakably FYX across landing, dashboard and PLAY.
- [ ] Platform predominantly light/blue/navy; PLAY predominantly dark/navy with restrained lime.
- [ ] All critical color combinations satisfy accessibility contrast requirements.
- [ ] Typography, spacing and controls work at 360px and 390px mobile widths.
- [ ] Play experience runs without wallet; preview mode clearly states rewards are unavailable.
- [ ] Every `Demo`, `Verified`, `Funded`, `Eligible`, `Claimed` label is supported by its corresponding state.
- [ ] All test USDC is expressly labeled as no-monetary-value testnet currency.
- [ ] No fabricated social proof, countdown, corporate endorsements or financial-security claims.
- [ ] No fake buttons, broken flows, unnecessary force-auth gates, or inaccessible modals.
- [ ] Responsive, reduced-motion and keyboard smoke tests are passing or explicitly documented.

## 14. Ready-to-paste agent prompt

> You are a FYX product designer and frontend engineer. Read `AGENTS.md`, `07_HANDOFF_CONTRACTS.md`, and `09_FYX_DESIGN_SKILL.md` before editing any UI. Apply the trust-first FYX visual system precisely: blue #2563EB, navy #0F172A, light neutral canvas #F8FAFC, teal #14B8A6 as an accent, lime #A3E635 sparingly for playful XP. Keep the platform and corporate experiences clean/light, the playable mini-game dark and immersive, and the interactions accessible. Apply Cialdini-inspired social proof, authority, reciprocity, commitment, liking, scarcity and unity **ethically**, using only real, verified data. Never invent sponsors, prizes, users, financial outcomes, audits, or on-chain proofs. Always label test USDC as no-monetary-value Testnet currency. Follow the shared APIs and ownership boundaries, build working functional states rather than static mockups, and provide changed files, tests, screenshots, limitations and integration handoff when done.

---

**Conflict-resolution order:** (1) actual security and protocol contracts, (2) `AGENTS.md`, (3) `11_BRAND_VOICE_COPY_SKILL.md` for public wording plus this skill for the UI system, (4) agent-specific aesthetic suggestions, (5) improvisation. If a conflict affects a shared interface, consult Orchestrator; never silently break contracts.



---

<a id="10-positioning-naming-skill"></a>

## File: `10_POSITIONING_NAMING_SKILL.md`

---
name: pach-positioning-and-brand-strategy
version: 2.0.0
project: FYX / PACH (proposed rebrand)
scope: product strategy, naming, marketing copy, onboarding, IA, UI/UX, pitch
owners: Orchestrator, Product/Brand Agent, UI Agent, Kimi Game Agent, Copy Agent
priority: required for brand/copy decisions; rename provisional
---

# PACH — Positioning & Naming Skill

> **STATUS: BRAND RECOMMENDATION, NOT AN APPROVED OR LEGALLY CLEARED NAME.** The hackathon project is currently known internally as **FYX**. **PACH** (pronounced "patch") is the recommended replacement, subject to founder approval, trademark/domain screening and quick user pronunciation testing. Do not rename packages, database tables, contract identifiers, domains, repository, import paths or deployed artifacts until the Orchestrator issues a controlled migration decision.
>
> Read together with `AGENTS.md`, `07_HANDOFF_CONTRACTS.md`, and `09_FYX_DESIGN_SKILL.md`. Product behavior, security, testnet labeling, and interfaces remain unchanged. This document governs **positioning, category focus, naming, content hierarchy and outward-facing messaging**.

## 1. Intellectual foundation: *Positioning: The Battle for Your Mind*

Al Ries and Jack Trout, *Positioning: The Battle for Your Mind* (original 1981; updated editions). This is an **original, applied synthesis**, not excerpts reproduced from the book. Primary publisher overview: https://www.mheducation.com/highered/mhp/product/positioning-battle-your-mind.html ; book chapter 9 about naming: https://www.oreilly.com/library/view/positioning-the-battle/9780071705875/ch09.html

The project should apply these principles:

1. **Win a specific mental category:** People remember a category before they remember feature lists. Establish **playable product testing**, not "the all-in-one Web3 everything platform."
2. **Start with the audience's existing mental model:** Begin with "spot an error in a game-like app" and "fix a reported problem," not wallets, RPC endpoints, smart contracts or protocol acronyms.
3. **Prefer a memorable name with a conceptual hook:** A short pronounceable name linked to the act of patching a problem, then consistently repeat the same explanation. Avoid meaningless letter combinations or "X" added for novelty.
4. **Position *against* a familiar alternative, without false comparisons:** Traditional bug trackers are for internal teams; classic bug bounties can be intimidating to everyday users. This product aims to turn authorized testing into accessible playable challenges, then link genuine findings to real developer fixes.
5. **Focus before expanding:** Start with one well-executed checkout problem. No gaming/metaverse/world identity/agent economy claims on the hero. Only expand into accessibility, localization and other product challenges when a working product supports them.
6. **Make a singular promise:** "Turn product problems into playable challenges." That message should survive homepage, product demo, pitch and corporate proposal.
7. **Sustain the same position:** A design refresh or token integration must not change what this brand stands for.

## 2. Product position: one sentence, one category

**Suggested brand:** `PACH` (pronounced *patch*).

**Category to own:** `Playable Product Challenges` (simple public phrasing: **playable product testing**).

**Positioning sentence (internal):**

> For people who want to make digital products better, PACH is a playful product-testing arena where everyday players spot problems, developers build verified fixes, and sponsoring teams fund defined outcomes — unlike a conventional bug tracker or developer-only bounty board.

**Primary homepage headline:** `Found something? Make it count.`

**Brand line:** `Found something? Make it count.`

**Copy principle:** One spoken-language thought; no three-part verb lists, rhyming-for-the-sake-of-rhyming, or guaranteed-income framing. The line describes the value of noticing and contributing, not a promise that every report pays.

**Clear explanatory subheadline:** `PACH makes product testing playable. Try a challenge, report what you find, and see what gets fixed.`

**Category label (not another slogan):** `Playable product challenges`.

**One-sentence explainer for a skeptical visitor:** `Players try short, intentionally buggy product demos. Developers work on accepted issues, and sponsors fund rewards under published rules.`

**Enterprise framing:** `Turn product testing into playable, measurable challenges.`

**On-chain value statement:** `Transparent testnet reward settlement on Monad, with verified off-chain results.` (only when true; do not conflate an on-chain transaction with a verified bug.)

**What it is NOT:** another generic Web3 quests site; a speculative token; a software vulnerability marketplace without testing permissions; a gambling game; a replacement for a professional penetration test; a promise of guaranteed earnings.

## 3. Why PACH — and what could go wrong

### Rationale

- **Four letters**, easy to display on app icons and in a fast event presentation.
- Evokes the familiar developer word *patch* (a fix), while remaining friendlier than a cybersecurity term.
- Fits player discovery (find a patch-worthy issue), developer fixing (make a patch), and corporate value (a better product).
- Can label cohesive offerings: `PACH Play`, `PACH Build`, `PACH Studio` (sponsors), `PACH Rewards`. These are **sections**, not independent new brands.
- Allows growth beyond strictly code bugs, but retain the same core mental category: *product improvement challenges*.

### Risks / non-clearance

- `PACH` is **not confirmed trademark-clear or domain-available**. Other uses of PACH exist, including a public organization using pach.org and a token ticker PACH; these do not by themselves establish infringement or freedom to operate. Similar-sounding `PATCH` marks and app names also require professional clearance.
- English pronunciation is intuitive to some but **not guaranteed**; Turkish speakers may pronounce it "paç." Test it with real Turkish- and English-speaking participants before confirming.
- Proposed taglines and names also need originality/trademark review.
- **FYX is higher-risk:** a separate blockchain/e-sports brand FYX Gaming has publicized a closely related platform, and FYX is a US registered mark for esports/online competitions: https://trademarks.justia.com/903/87/fyx-90387499.html ; https://www.prnewswire.com/news-releases/fyx-announces-blockchain-based-competitive-esports-platform-301222162.html . Do not assume FYX is available because the original hackathon prototype used it.

### Candidate comparison (qualitative, NOT legal clearance)

| Name | Clear category hook | Youth + enterprise tone | Preliminary overlap risk | Decision |
| --- | --- | --- | --- | --- |
| PACH | Patch / fixes | Balanced | Other `PACH` uses; patch-like names | **Preferred for testing** |
| BUFIX | Bug + fix | Functional, slightly utilitarian | Existing BUFIX products/mark in unrelated classes; insurance/accounting brands | Backup only |
| BIXO | Less obvious; needs explanation | Balanced | Existing software/CRM uses | Avoid |
| FYX | Fix-like but non-obvious | Energetic | **Direct blockchain gaming brand and US registration** | Avoid as public brand |
| GLITCH | Extremely clear bug reference | More youth than enterprise | Generic, crowded and narrower | Keep as game/challenge descriptor |

**Naming validation gate:** before public logo/domain/press: (a) USPTO, EUIPO, TURKPATENT and WIPO searches for exact and confusingly similar names in relevant classes, (b) domain and social handle search, (c) Turkish/English pronunciation and recall test with 10–15 people, (d) legal review where commercial launch is planned. Search results do NOT confer trademark rights.

## 4. Which audience gets priority?

This is a three-sided product, but **not three equal hero messages**.

**Primary entry audience (hackathon):** players — young people who can start in one click, preferably before wallet connection. Anchor on **playable product challenges**, not income.

**Secondary product audience:** developers — make accepted fixes and build credible portfolios, with reward conditions explained.

**Economic buyer / long-term sponsor:** digital product companies, student-community sponsors and app studios — fund authorized product-improvement campaigns, review actionable findings, measure real outcomes.

### Message hierarchy

| Audience | Their question | First answer | Proof to show | CTA |
| --- | --- | --- | --- | --- |
| Player | Is this fun and simple? | Find a bug in a 60-second challenge | Real playable level | `Play a challenge` |
| Developer | Is my effort worth it? | Fix a clearly scoped issue; show verified results | Repro steps, tests, review and reward conditions | `Explore fixes` |
| Sponsor | Will we get useful product outcomes? | Defined testing campaign with reviewable evidence | Scope, approvals, deposit status, verified outcome history | `Create a campaign` |

Do not put "PLAY × BUILD × EARN × BLOCKCHAIN × AI × DAO" as simultaneous hero claims. The homepage should sell **one category** first, then reveal the three-sided workflow.

## 5. Product naming and information architecture

- **Main brand:** PACH (proposed). Never force an acronym.
- **Public category description:** Playable product challenges.
- **Player area:** `Play` (Spot the Glitch = the name of the first game, not the company).
- **Developer area:** `Build`.
- **Sponsor area:** `Studio` or `For Teams` (choose one and use consistently; `For Teams` is clearer in hackathon pitch).
- **Shared mechanics:** `Challenges`, `Findings`, `Verified Fixes`, `Rewards`, `Leaderboard`.
- **On-chain functionality:** `Reward Vault` (implementation feature, not top-level homepage category).

Routes, schema, on-chain ABI, package names and environment keys **do not change** until authorized migration. Present marketing copy via typed configuration to allow a safe late rebrand.

## 6. UI design implications (apply alongside 09_FYX_DESIGN_SKILL.md)

The trust-first palette remains: `#2563EB` primary, `#0F172A` navy, `#F8FAFC` background, `#14B8A6` accent, `#A3E635` sparingly for game excitement. Colors are a UI hypothesis, not a universal psychological guarantee.

**Landing structure:**
1. Clear headline about the user outcome; one primary `Play a challenge` CTA.
2. Immediate playable teaser / authentic capture of the first level.
3. Three-step explanation: **Spot → Fix → Verify**.
4. Separate player/developer/teams links, not three competing giant hero CTAs.
5. Verifiable, labeled demo facts only (no invented sponsor marks, participant totals or success rates).
6. Monad as evidence and an infrastructure differentiator **below** the core problem, not the first sentence.

**Game screen:** playable in a click, accessible, obvious goal, no wallet required for practice, responsive, no casino language or fake reward scarcity.

**Developer screen:** issue reproducibility, acceptance criteria and actual automated test results. Talk in terms of "accepted fixes," not "instant guaranteed payment."

**Sponsor screen:** tested audiences, review and fraud controls, authorization scope, exact reward conditions and proof transparency. Do not portray testnet demo as enterprise-ready audited payment infrastructure.

**Narrative balance:** start with the player's fun, earn developer seriousness with tests, earn corporate trust with traceable evidence.

## 7. Ethical influence + positioning (Cialdini x Ries/Trout)

Use the two frameworks for different jobs:

- **Positioning** controls *what category and promise occupy the user's mind*.
- **Ethical influence** helps *make the experience credible and understandable after they arrive*.

Examples: show a real accepted fix instead of a fabricated authority badge; show an actual verified deposit only after blockchain confirmation; show limited entries only when a real eligibility constraint exists; offer a frictionless game preview before registration; explain exact review rules before asking for a developer submission.

**Never:** invent social proof, use fake timers/earnings, imply security audit without one, equate a smart contract receipt with product correctness, or present demo test USDC as cash.

## 8. Example copy bank

- **Homepage hero:** `Found something? Make it count.`
- **Subhero:** `PACH makes product testing playable. Try a challenge, report what you find, and see what gets fixed.`
- **Player card:** `Your next challenge starts in 60 seconds.`
- **Developer card:** `Real issues. Clear tests. Verified contributions.`
- **Sponsor card:** `Your next product insight could come from your own community.`
- **PLAY loading:** `Something is wrong with this checkout. Can you figure out what?`
- **Report action:** `Submit finding` (never `Claim payment` before verification).
- **Finder verdict:** `Your finding was accepted.` (only after actual server review).
- **Rewards status:** `Claimable: 4 test USDC (no monetary value)` (only after authorized, chain-bound claim conditions are met).
- **Sponsor trust text:** `Testnet rewards are settled on Monad after off-chain verification.`
- **Pitch hook:** `Most people notice problems with the apps they use. PACH gives them a place to do something about it.`

## 9. Brand decision & research workflow for Agent teams

1. **Brand/Product Agent:** Interview 5 players, 5 developers, 3 sponsor/product people; listen for category language. Do not fabricate results. Test one-sentence recall after 15 minutes.
2. **Orchestrator:** Run legal/domain screening, decide whether `PACH` is approved. Publish `BRAND_DECISION.md` with date, owner, approved name, sign-off, risks.
3. **Frontend Agent:** Keep wordmark/tagline/OG metadata in a centralized `brandConfig`, not copied throughout JSX.
4. **Kimi Game Agent:** The mini-game can remain "Spot the Glitch" regardless of parent brand. Consume shared brandConfig where possible; don't re-skin the entire game arbitrarily.
5. **Backend/Chain Agents:** Keep protocols, contract names, DB migrations and ABIs **stable**. Rebranding does not change deployed contract code; no reason to redeploy only to update text.
6. **QA Agent:** Flag usage of FYX as public-facing brand after approval; verify actual evidence for every trust claim, all mobile layouts, CTA comprehension and two-language pronunciation.
7. **Pitch Agent:** Present category and live play first; explain Monad's verifiable escrow and payout after players understand the use case.

### Brand migration acceptance tests (ONLY after approval)

- [ ] Brand decision documented and public name screened, or explicit risk acceptance noted.
- [ ] All public wordmarks, titles, metadata, images and copy use approved name.
- [ ] Demo scripts and QR codes refer to current brand.
- [ ] Game remains functionally identical; no ABI or balance/regression failures.
- [ ] Existing package/repo `fyx` identifiers may stay internal where renaming poses risk; no silent global search-and-replace.
- [ ] All legal/financial/reward claims continue to be accurate.

## 10. Ready-to-paste agent brief

> You are the product positioning and brand agent. Read `AGENTS.md`, `09_FYX_DESIGN_SKILL.md`, `10_POSITIONING_NAMING_SKILL.md`, and `11_BRAND_VOICE_COPY_SKILL.md`. Apply Al Ries and Jack Trout's positioning ideas: choose a defensible narrow mental category, explain the product in the user's vocabulary, lead with a single outcome, and make the name support the concept. Our current proposed rebrand is **PACH** (pronounced "patch"), subject to legal/domain and human pronunciation validation; FYX is a legacy working title with a known gaming-brand collision. Prioritize "playable product challenges" for youth; demonstrate verified fixes and transparent sponsored outcomes for developers and corporate teams. Keep UX ethical and all testnet rewards correctly labeled. Do not alter protocol, wallet, smart-contract, shared schema or package identifiers solely for marketing without Orchestrator approval. Deliver copy aligned with the canonical voice guide, updated hero, clear route labels, and the results of any *actual* user validation performed; do not invent survey results.

## Reference URLs (background sources; verify again at launch)

- Publisher summary: https://www.mheducation.com/highered/mhp/product/positioning-battle-your-mind.html
- Book, naming chapter: https://www.oreilly.com/library/view/positioning-the-battle/9780071705875/ch09.html
- FYX Gaming release: https://www.prnewswire.com/news-releases/fyx-announces-blockchain-based-competitive-esports-platform-301222162.html
- FYX Gaming mark listing: https://trademarks.justia.com/903/87/fyx-90387499.html
- Other use of PACH: https://www.pach.org/
- Token ticker PACH (not an ownership determination): https://bscscan.com/token/0x053e83d8ae58598a0adf2f3b57834d7e811751ec
- Official USPTO search: https://www.uspto.gov/trademarks/search
- WIPO Global Brand Database: https://branddb.wipo.int/
- EUIPO search: https://www.euipo.europa.eu/
- TURKPATENT: https://www.turkpatent.gov.tr/



---

<a id="11-brand-voice-copy-skill"></a>

## File: `11_BRAND_VOICE_COPY_SKILL.md`

---
name: pach-voice-and-product-copy
version: 2.0.0
project: PACH (public-brand candidate); FYX (legacy code identifiers)
scope: product voice, marketing copy, UX microcopy, gameplay, corporate trust, accessibility, localization
owners: product, frontend, game, backend notifications, pitch, QA
priority: canonical for all public-facing text; preserve factual and legal accuracy
---

# PACH — Brand Voice & Product Copy Skill

> **Read first:** `AGENTS.md`, `09_FYX_DESIGN_SKILL.md`, `10_POSITIONING_NAMING_SKILL.md`. This document replaces the old marketing line `Spot it. Fix it. Earn it.` and the old public-facing `Find. Fix. Earn.` shorthand. Neither should appear in public marketing, app UI, game HUD, social copy, SEO, or pitch.
>
> **Brand safety:** `PACH` is a **proposed name**, not trademark/domain-cleared. Copy is approved as a **creative direction**, not proof of legal availability. Do not mass rename internal code, contract IDs, EIP-712 domains, `fyx` CSS vars, database keys, or env variables.

## 1. The positioning we want to own

**Human category:** playable product challenges.

**The problem:** Most people notice frustrating little things in digital products but have nowhere useful—or enjoyable—to take that observation. Existing issue trackers are made for product teams, not regular users. Most bug bounties assume security knowledge.

**What this product offers:** A short, intentionally buggy game to introduce the experience; a route for validated observations to become scoped developer tasks; and sponsor-funded rewards with clear acceptance rules. The on-chain vault holds and settles the **testnet** reward funds; it does not decide whether a browser claim is true.

**One idea to keep in people's heads:** Noticing a problem can lead to a real contribution.

**Canonical brand line:**

> Found something? Make it count.

**Canonical explanatory line for homepage:**

> PACH makes product testing playable. Try a challenge, report what you find, and see what gets fixed.

**Category label:** `PLAYABLE PRODUCT CHALLENGES` (small, editorial; not a second slogan).

**Primary CTA:** `Play a challenge`

**Secondary CTA:** `See how it works`

This is deliberately not a three-part imperative slogan. The line sounds like something a person would say; the explanation does the informational work.

## 2. How we sound

| Trait | Write this way | Avoid |
|---|---|---|
| Observant | `Something seems off here.` | `Unleash your investigative potential.` |
| Conversational | `Try the checkout. Tell us what went wrong.` | `Discover. Solve. Conquer.` |
| Confident | `Your report is under review.` | `Our revolutionary AI-powered verification ecosystem is evaluating...` |
| Fair | `Rewards require an accepted report.` | `Play and get paid instantly.` |
| Playful | `That's not how discounts should work.` | `Epic bug hunters level up into a decentralized future.` |
| Calm on money | `Claim 4 test USDC on Monad Testnet.` | `You've won real USDC!` |
| Respectful to teams | `See what testers noticed before your next release.` | `Your QA team missed everything.` |

**Writing tests:**
1. Does this sentence sound natural read aloud in Turkish-accented or global English?
2. Could a smart human explain it in one breath, without Web3 jargon?
3. Does it make a specific claim we can support in the live product?
4. Can we remove one adjective and improve it? Usually yes.
5. Did we accidentally build a 3-part rhythmic slogan? If so, rewrite.

**Avoid stock phrasing:** `revolutionary`, `next-gen`, `unlock limitless potential`, `powered by innovation`, `disrupt`, `earn effortlessly`, `guaranteed rewards`, `secure by blockchain`, `fully verified by AI`, `community-first ecosystem`, `the future of everything`.

## 3. Preferred copy by screen

### Landing page
- **Small category:** `Playable product challenges`
- **H1:** `Found something? Make it count.`
- **Lead:** `PACH makes product testing playable. Try a challenge, report what you find, and see what gets fixed.`
- **CTA:** `Play a challenge`
- **Secondary:** `See how it works`
- **Trust note under play CTA:** `Start with a demo. No wallet needed to try it.` (only while true)
- **Section heading:** `A product can look finished and still have problems.`
- **Body:** `Sometimes you notice them in seconds. Sometimes you need another pair of eyes. PACH turns that curiosity into a practical challenge.`
- **Developer link:** `Have a fix in mind? Browse open issues.`
- **Teams link:** `Let people test before your next release.`

### PLAY / Broken Checkout
- **Game title:** `Spot the Glitch`
- **Briefing:** `There's something wrong with this checkout. Find it before the timer runs out.`
- **Start:** `Start challenge`
- **Hint:** `Try applying the same coupon again.`
- **Report prompt:** `What went wrong?`
- **Report placeholder:** `I used the coupon twice and the total dropped below zero.`
- **Incorrect:** `Not quite. Check what happened to the total.`
- **Time up:** `Time's up. Try again?`
- **Correct finding in local demo:** `You found it. This checkout can go below zero.`
- **With API review:** `Report received. We'll check the game events before awarding XP.`
- **Guest offline:** `Practice mode. Rewards aren't available here.`
- **No wallet:** `Connect a wallet to claim an approved testnet reward.`
- **Note:** Keep the game's errors lighthearted, but NEVER call an actual vulnerability funny or publicly reveal details outside an authorized scope.

### BUILD / developer
- **Heading:** `Someone found the issue. Can you fix it?`
- **Intro:** `Open a scoped task, see how to reproduce the problem, and submit a fix against the test suite.`
- **Issue card:** `Coupon can be applied twice`
- **Issue detail:** `The checkout total goes below zero if the same discount is used twice.`
- **Acceptance:** `The total must stay at zero or above. The coupon should apply only once.`
- **Submitted:** `Fix submitted. Waiting for test results.`
- **Failed test:** `The duplicate-coupon case still fails. See test output.`
- **Accepted:** `Fix accepted. Your testnet claim is ready.` (only after authorized acceptance)

### FOR TEAMS / sponsor
- **Heading:** `Get a clearer picture of what's not working.`
- **Lead:** `Create a controlled testing challenge, review reproducible findings, and put a defined budget behind accepted contributions.`
- **CTA:** `Create a challenge`
- **Fund state, pre-confirmation:** `Deposit submitted. Waiting for network confirmation.`
- **Fund state, post-confirmation:** `Challenge funded on Monad Testnet.` (show verifiable tx hash)
- **Verification:** `A reviewer checks the report and the test result before a claim can be issued.`
- **Scope:** `Only test apps and assets your team authorizes.`
- **No enterprise bluffing:** Do not say `trusted by companies`, `SOC 2 compliant`, `audited`, `secure vault`, or `partnered with Monad` without documentary proof.

### REWARDS / sensitive states
- **Pre-review:** `Under review`
- **Accepted:** `Finding accepted`
- **Eligible:** `4 test USDC available to claim`
- **Wallet step:** `Confirm claim in your wallet`
- **Waiting:** `Transaction pending. This can take a moment.`
- **Confirmed:** `Claim confirmed on Monad Testnet. View transaction.`
- **Rejected:** `Claim didn't go through. Your reward hasn't moved.` (only if contract balance/tx outcome supports it)
- **Expiration:** `This claim expired. Ask for a new authorization.`
- **Always-visible note:** `Test USDC has no monetary value. Demo only.`
- **No fake success:** A server acceptance is NOT a blockchain payment. A submitted tx is NOT a confirmed tx.

### Loading / errors / empty
- `Checking your report…`
- `Can't reach the server right now. Your result hasn't been submitted.`
- `Switch to Monad Testnet to continue.`
- `No issues open yet. Check back after the next challenge.`
- `No confirmed claims on this wallet.`
- `This campaign is a demo and isn't funded on-chain.`

## 4. How to speak to each audience

**Players (young, mobile):** Immediate task + first-person clarity. Show the product to be tested, one goal, and a visible next step. Never lead with wallet, yield or revenue.

**Developers:** Reproduction steps, clean acceptance rules, test result, scope, review authority, compensation conditions. No hype about infinite earning; show actual reward type and chain.

**Corporate teams:** Business outcome, controlled test scope, authorization, review pipeline and transparent funding. Don't infantilize this audience with arcade slang or pretend production security audits.

**Shared voice across all three:** Direct, curious and useful. The game has more energy, not a different personality.

## 5. Ethical persuasion (Cialdini-inspired)

- **Social proof:** only genuine participant counts, completed challenge totals or consented testimonials; no seeded numbers disguised as live activity.
- **Authority:** identify actual verifier/issuer and proof status; do not use fake `Verified by Monad` badges.
- **Reciprocity:** offer a fun practice round and actionable feedback before registration; never condition access on a hidden fee.
- **Commitment:** prompt the next *reasonable* step; allow the player to stop without guilt or streak penalties.
- **Scarcity:** show deadlines/slot limits only if enforced by server and actually relevant.
- **Liking/Unity:** make contribution feel welcoming without fabricating community identity or affiliations.

Every money-related CTA must disclose testnet status and claim conditions clearly, not hide them under a tooltip.

## 6. Use of the visual system

- Primary `#2563EB` (Trust Blue); deep navy `#0F172A`; light background `#F8FAFC`.
- Teal `#14B8A6` = secondary accent; success semantics use accessible dark green `#15803D` on light surfaces.
- Lime `#A3E635` = occasional XP/time flourish **on dark PLAY surfaces**, never the main payment-green or small text on white.
- Keep typography readable: Inter for copy, Space Grotesk or Inter for large heading, JetBrains Mono for short code/tx fragments.
- Apply WCAG 2.2 AA intentions; clear focus indicator, reduced motion, adequate target sizes, mobile 360px support.

## 7. Localization notes

**Do NOT word-for-word translate an English slogan.** Keep the speaker's voice natural and test with real Turkish speakers.

| Context | English | Suggested Turkish (adapt freely) |
|---|---|---|
| Brand line | Found something? Make it count. | `Bir sorun mu gördün? Boşa gitmesin.` |
| Category | Playable product challenges | `Oynanabilir ürün testleri` |
| Hero lead | PACH makes product testing playable. | `PACH, ürün testini oynanabilir hâle getiriyor.` |
| Player CTA | Play a challenge | `Oyuna başla` |
| Report CTA | Submit finding | `Bildirimi gönder` |
| Review pending | Your report is under review. | `Bildirimin inceleniyor.` |
| Teams CTA | Create a challenge | `Görev oluştur` |
| Testnet note | Test USDC has no monetary value. | `Test USDC'nin parasal değeri yoktur.` |

Avoid odd literal phrases such as `Bul. Düzelt. Kazan.` for the main brand line. Also avoid confusing `glitch` with cybersecurity exploits. `Hata`, `sorun`, `test` and `düzeltme` are more accessible to players and companies.

## 8. Engineering integration (no global rename)

Create or update **one** typed UI copy source in `apps/web/src/config/brand.ts` (adapt to actual repo):

```ts
export const brand = {
  id: 'fyx', // legacy internal; do not rename ABI/env identifiers in a UI pass
  displayName: 'PACH', // candidate until sign-off
  legalStatus: 'candidate',
  category: 'Playable product challenges',
  hero: 'Found something? Make it count.',
  subhead: 'PACH makes product testing playable. Try a challenge, report what you find, and see what gets fixed.',
  primaryCta: 'Play a challenge',
  secondaryCta: 'See how it works',
  gameName: 'Spot the Glitch',
} as const;
```

For unapproved public demonstrations, use a non-commercial provisional label if required by the organizer / counsel; keep copy and display-name configuration separate from runtime environment and contract logic. Game packages receive `displayName` from props or config rather than hard-coding PACH/FYX. The backend may send message codes; frontend localizes them.

## 9. Copy quality gate — run before publishing

- [ ] Public hero is one sentence, not a motivational word salad.
- [ ] No use of `Spot it. Fix it. Earn it.` or `Find. Fix. Earn.` in any public-facing string.
- [ ] The category `Playable product challenges` is explained in ordinary English.
- [ ] Wallet not required for demo practice where preview is available.
- [ ] Money and XP never conflated.
- [ ] No fabricated popularity, verifications, security audits, sponsor relationships, deadlines, or results.
- [ ] Game messages explain what just happened and what the player can do next.
- [ ] Sponsor copy explains authorization, review and funding conditions.
- [ ] Existing EIP-712/ABI env and chain settings untouched by a brand copy change.
- [ ] English and Turkish versions have been read aloud by an actual human, or flagged `Needs language review`.
- [ ] Screens and meta tags use one shared `brandConfig` rather than duplicating strings across apps.

## 10. Prompt for any writing/UI agent

> Read `AGENTS.md`, `09_FYX_DESIGN_SKILL.md`, `10_POSITIONING_NAMING_SKILL.md`, and `11_BRAND_VOICE_COPY_SKILL.md`. Use PACH as the proposed display brand and FYX as internal legacy identifiers pending clearance. Our canonical creative direction is `Found something? Make it count.` The category is `playable product challenges`. Write like a clear-headed product team, not an AI-generated slogan machine. No three-beat verb taglines; no empty Web3 hype; no fabricated proof or prize claims. Lead with what users can actually do. Implement strings in a shared config and preserve all technical contracts and APIs. Record any brand/legal uncertainties and user validation as unresolved if not done.



---

<a id="agents"></a>

## File: `AGENTS.md`

# AGENTS.md — PACH candidate brand / FYX internal implementation rules

Read `README.md`, `07_HANDOFF_CONTRACTS.md`, `08_SOURCES_AND_NETWORK.md`, and **`09_FYX_DESIGN_SKILL.md` (UI/copy)** plus **`10_POSITIONING_NAMING_SKILL.md` (brand strategy)** and **`11_BRAND_VOICE_COPY_SKILL.md` (human copy)** before changing code. You are working in a shared monorepo. Protect other agents' work and make every output integratable.

## Branding / name protection
- **FYX is an internal working title only**: public research shows an FYX Gaming blockchain/e-sports brand and US registration. `10_POSITIONING_NAMING_SKILL.md` proposes **PACH** as a replacement, but it is **not yet legally cleared or founder-approved**. Do not launch public branding as FYX or globally rename internal identifiers without a recorded brand decision.
- Product positioning: **playable product challenges**. Lead with the player problem, not blockchain terminology. The actual game is still named *Spot the Glitch*. Recommended brand line: **“Found something? Make it count.”** This is candidate brand copy, not trademark clearance.

## Mission
Build the PACH-concept product (legacy technical name FYX) on Monad Testnet: a mobile-first web platform and a *real playable* intentionally broken checkout mini-game. Player finds an app bug; developer supplies a verified fix; sponsor funds a campaign; accepted finder/developer rewards are paid out by a contract. Make all trust assumptions explicit.

## Non-negotiable behavior
1. Work only in your allocated paths. Never delete/overwrite files outside ownership; request interface changes through `07_HANDOFF_CONTRACTS.md` and alert the orchestrator.
2. Validate the repository and actual versions before installing or editing. Prefer existing package manager/lockfile; pnpm when starting fresh. Do not make unsupported version claims.
3. Keep security-sensitive values only in `.env` and server-side runtime. Never hardcode deployer keys, verifier keys, API tokens, recovery phrases, or cookies in client files, screenshots, logs, commits or chat.
4. Use Monad **Testnet chainId 10143**. Reject wallet and server chainId mismatches. Never deploy to mainnet unless owner explicitly changes the scope.
5. Reward tokens are **test USDC with no monetary value**; always label all funds accordingly. Do not imply real-money earning in this demo.
6. Never use fake transaction hashes, hardcoded on-chain success, simulated balances labeled real, or unverifiable payouts. A demo fixture must be labeled `Demo`.
7. Do not treat client-side success/score as authoritative. Never accept a request that simply states `completed:true` and pays funds.
8. Do not run users' untrusted code on the host or a privileged container. Hackathon developer check uses a controlled, predetermined patch/test fixture; unrestricted GitHub PR execution is future scope.
9. Use vetted libraries (OpenZeppelin for ERC-20 transfer, ECDSA/EIP-712 and reentrancy protection); pin/record versions. Tests should prove negative as well as positive paths.
10. **No payments based only on LLM judgment.** Signed award approvals follow deterministic tests and authorized review. An on-chain signature proves who authorized a payment, not that a bug was real.
11. Use client-side wallet signatures for human authentication and transactions; sponsor approval and chain receipts must be visible. No user private keys in the server.
12. Avoid oversized scope. Optimize for stable mobile interaction, demoable transaction and traceable verification. If blocked, report exact blocker and implement a narrow reversible workaround, not fabricated integrations.

## Exit/acceptance for every agent
- Code compiles, typechecks, lint passes as configured; relevant tests run and outputs are reported honestly.
- A README subsection describes setup, env vars, steps, assumptions, and known limitations.
- Changed paths + integration dependencies + test commands + test results + blockers summarized for the orchestrator.
- No production-security claims without an audit. No assumptions that API endpoints or faucets are unlimited.
- Each meaningful chain action has tx hash / explorer link from actual runtime output.

## Writing and positioning gate
- Before editing landing, banners, game prompts, pitch or transactional UI, read `11_BRAND_VOICE_COPY_SKILL.md`. Do not use the retired `Spot it. Fix it. Earn it.` or the old public `Find. Fix. Earn.` sequence.
- Prefer concrete, conversational sentences to stacked imperatives, AI-style triads and generic hype. Validate every sponsorship, proof, scarcity and earnings claim against actual state.
- Keep all current internal `fyx` env names, CSS variable prefixes, EIP-712 contract names, ABI and endpoints until an authorized migration plan is recorded.

## Communication template
```
AGENT: <name>
COMPLETED: <short list>
FILES CHANGED: <paths>
COMMANDS RUN / RESULTS: <exact commands and outcomes>
INTERFACES ADDED/CHANGED: <types/routes/events>
BLOCKERS/RISKS: <none or exact issue>
HANDOFF TO: <other agent + required actions>
```

## Master integration tests
1. Sponsor actually approves and deposits 20 test USDC into escrow on Testnet.
2. Player's session/report is validated on server; a finder claim authorization is prepared.
3. Claim function pays 4 test USDC to the *claimant* via contract; a repeated claim fails.
4. Controlled developer patch passes predefined tests, is approved by authorized role, claim pays 14 test USDC.
5. Exactly 2 test USDC fee is released under the documented settlement rule; the contract never creates unfunded value.
6. Incorrect network, wrong token, signature replay, modified recipient/amount and unauthorized admin actions are rejected.
7. Leaderboard and UI reflect confirmed results rather than invented results.



---

<a id="brand-decision-template"></a>

## File: `BRAND_DECISION_TEMPLATE.md`

# Brand Decision Record — template

**Current state:** NOT APPROVED / PROPOSED
**Candidate:** PACH (pronounced “patch”)
**Legacy technical project:** FYX
**Proposed line:** Found something? Make it count.
**Category:** Playable product challenges
**Date of decision:** TBD
**Decision owner:** TBD

## Required checks before public commercial use

- [ ] Exact and confusingly similar marks checked in TURKPATENT, EUIPO, WIPO and relevant target markets, including `PACH`, `PATCH` and phonetic equivalents.
- [ ] Trademark counsel or owner recorded risk decision.
- [ ] Domain status independently checked, with exact domain and date. Do not claim any domain is available without live registrar evidence.
- [ ] Social handle checks completed.
- [ ] 5+ Turkish speakers and 5+ English speakers asked to pronounce/recall the name. Record actual responses without fabricating data.
- [ ] Logo and tagline collision search completed.
- [ ] Product screenshots, legal claims, testnet notices reviewed.
- [ ] Public brand approval signed by responsible owner.

**Decision:** Pending / Approve / Approve with conditions / Reject
**Reason:** TBD
**Sign-off:** TBD
**Decision date:** TBD

## Migration if approved

1. Change `brandConfig.displayName` and metadata; do not rename API routes, chain contracts or package identifiers.
2. Check routes, in-game wordmarks, social previews, pitch and QR demo assets.
3. Keep `fyx` internals where changing names risks import, EIP-712 and deployed-contract compatibility.
4. Run all tests. Record deployment artifacts and actual transaction links separately.



---

<a id="changelog-v2"></a>

## File: `CHANGELOG_V2.md`

# Change Log — PACH Agent Playbook v2 (2026-10-24)

## What changed

- Selected a more conversational **candidate** brand line: **“Found something? Make it count.”**
- Retired `Spot it. Fix it. Earn it.` and public `Find. Fix. Earn.` from all active public-copy instructions.
- Revised homepage explanation, player game messages, developer acceptance messages, and corporate/reward trust copy.
- Added `11_BRAND_VOICE_COPY_SKILL.md`: voice principles, complete UX copy examples, ethical influence boundaries, EN/TR guidance, centralized configuration, review checklist.
- Updated `10_POSITIONING_NAMING_SKILL.md`, `09_FYX_DESIGN_SKILL.md`, `README.md`, `AGENTS.md`, orchestrator, Kimi, platform, QA and demo instructions to enforce consistent public copy.
- Added `BRAND_DECISION_TEMPLATE.md` for founder/domain/trademark approval.
- **No change** to backend API contracts, smart-contract ABI/EIP-712 domain, Foundry/Monad configs, Devnads faucet details or tokens. They are intentionally stable.

## Important distinction

`PACH` is **not verified to be globally available** or legally cleared. It is a creative candidate. The implementation still uses legacy FYX code identifiers, not a new deployment.

## Recommended use

1. Give agents `AGENTS.md`, `09_FYX_DESIGN_SKILL.md`, `10_POSITIONING_NAMING_SKILL.md`, and `11_BRAND_VOICE_COPY_SKILL.md`.
2. Orchestrator owns `brandConfig`, brand approval gate and copy acceptance.
3. Kimi follows game-specific microcopy; platform follows homepage, team and rewards sections; QA tests evidence behind every trust statement.
4. Keep test USDC labeled as test-only, no monetary value.



---

<a id="env-example"></a>

## File: `ENV_EXAMPLE.md`

# Suggested `.env.example` (documentation — copy values to actual local `.env` only)

```dotenv
# Browser-exposed, safe to publish
NEXT_PUBLIC_MONAD_CHAIN_ID=10143
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_TEST_USDC_ADDRESS=0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73
NEXT_PUBLIC_FYX_VAULT_ADDRESS=
NEXT_PUBLIC_API_URL=http://localhost:3001

# Server-only: never prefix with NEXT_PUBLIC
DATABASE_URL=postgresql://fyx:local-development-only@localhost:5432/fyx
SESSION_SECRET=replace_with_strong_random_secret
VERIFIER_PRIVATE_KEY=
DEPLOYER_PRIVATE_KEY=
CORS_ALLOWED_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Never commit a populated `.env`. `.env.example` must contain **no usable secret**. The server-only verifier key must never reach a browser bundle. Store actual deployed addresses only after chain verification; false placeholders should prevent chain writes rather than route funds to wrong addresses.



---

<a id="readme"></a>

## File: `README.md`

# PACH — Multi-Agent Implementation Playbook (v2; candidate public brand)
**Prepared:** 2026-10-24 | **Target:** Monad Blitz Ankara | **Project:** PACH (proposed public brand; pending clearance) / FYX (legacy internal identifiers)

**Brand line:** Found something? Make it count.

**What it actually does:** PACH makes product testing playable. Try a challenge, report what you find, and see what gets fixed. Players test an intentionally broken demo, developers address approved findings, and sponsors fund clearly defined testnet rewards. Never describe play alone as a guarantee of payment.

## Start here
1. Read `AGENTS.md` (global implementation rules), `00_ORCHESTRATOR.md` (ownership + coordination) and `07_HANDOFF_CONTRACTS.md` (interfaces before coding).
2. Assign agents with non-overlapping file ownership. Share the updated `AGENTS.md` and `07_HANDOFF_CONTRACTS.md` with **every agent**.
3. Run: Platform (Codex), Game (Kimi Code), Backend (Codex/backend agent), Chain (Solidity agent), QA (review agent).
4. Integrate via shared contract types, mocked APIs first, then testnet APIs and transactions.
5. Use `06_DEMO_AND_RELEASE.md` to prepare one **verified end-to-end transaction** and a reproducible backup video.

## Agent files
| File | Agent | Focus |
| --- | --- | --- |
| `00_ORCHESTRATOR.md` | Lead/Codex | Order of execution, contracts, integration, merge rules |
| `01_KIMI_GAME.md` | Kimi Code | One *fully playable* Spot the Glitch game |
| `02_PLATFORM_UI.md` | Frontend/Codex | Platform website, player/developer/corporate views |
| `03_BACKEND_VERIFIER.md` | Backend agent | Auth, sessions, event verification, claims, leaderboards |
| `04_MONAD_CONTRACTS.md` | Smart-contract agent | Escrow, tests, faucet, deploy, verify, ABI |
| `05_QA_SECURITY.md` | QA/security agent | Test matrix, abuse defenses, deploy validation |
| `06_DEMO_AND_RELEASE.md` | Demo/release agent | Live pitch, scripts, backups, submission |
| `07_HANDOFF_CONTRACTS.md` | Everyone | API, events, EIP-712 typed data, DB, ownership |
| `08_SOURCES_AND_NETWORK.md` | Everyone | Official resources, addresses, commands, constraints |
| `AGENTS.md` | Everyone | Universal rules and stop conditions |
| `09_FYX_DESIGN_SKILL.md` | UI/Kimi/QA | Trust-first design, Cialdini influence, accessibility |
| `10_POSITIONING_NAMING_SKILL.md` | Orchestrator/Product/UI/Kimi | Ries & Trout positioning, naming checks, message hierarchy |
| `11_BRAND_VOICE_COPY_SKILL.md` | All user-facing agents | Voice, approved copy, non-AI-sounding writing rules, error/reward states |
| `BRAND_DECISION_TEMPLATE.md` | Orchestrator/Product | Name screening and founder approval record |
| `CHANGELOG_V2.md` | Everyone | What changed in this revision |

## Required MVP — no more, no less
- Player arrives via QR link, connects a wallet (or uses clearly labeled demo identity for an off-chain gameplay preview), plays one functional level, and files a verifiable report.
- Corporate sponsor creates one challenge with a deposit in test USDC.
- Developer submits one controlled demo fix; an authorized verifier checks a predefined test, records a result, and issues claim authorization.
- Finder and developer each claim their individual test USDC award on **Monad Testnet**; show the explorer transactions.
- The UI shows actual data when connected. Mock data is conspicuously labeled and never shown as a genuine payout.

## Non-goals for hackathon
No mainnet; no real user money; no unapproved penetration testing; no general-purpose arbitrary code execution service; no reusable Globalist ID network; no x401/x402 dependency; no ERC-8004 dependency; no MIP-8 optimization marketing claim; no token launch; no multi-game engine. Make one scenario reliable and enjoyable.

**Important:** These are implementation instructions; they do not claim the platform has already been built, deployed, audited, funded or approved by an event organizer. Project/contract addresses and transaction hashes must come from actual deployments.


## Design and voice skills
Read [`09_FYX_DESIGN_SKILL.md`](09_FYX_DESIGN_SKILL.md) before implementing UI, PLAY, reward copy, corporate pages, or conducting UX reviews. It is the canonical trust-first blue/navy palette, ethical influence guidance, components and acceptance checklist.


## Brand and copy update (proposed)
**FYX must not be assumed brand-safe** due to an existing blockchain gaming company and registered US mark. **PACH** is a shortlisted rebrand; do not rename code or promote as legally cleared before explicit approval. Read [`10_POSITIONING_NAMING_SKILL.md`](10_POSITIONING_NAMING_SKILL.md) for category and naming decisions, and [`11_BRAND_VOICE_COPY_SKILL.md`](11_BRAND_VOICE_COPY_SKILL.md) before writing any public text. The recommended line is **“Found something? Make it count.”** It replaces the repetitive previous slogan without touching the game/contracts.

