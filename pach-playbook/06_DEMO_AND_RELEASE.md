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
