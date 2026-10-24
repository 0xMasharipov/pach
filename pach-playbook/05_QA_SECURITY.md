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
