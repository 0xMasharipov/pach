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
