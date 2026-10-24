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
