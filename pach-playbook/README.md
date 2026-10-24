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
