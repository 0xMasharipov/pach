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
