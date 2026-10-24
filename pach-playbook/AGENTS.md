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
