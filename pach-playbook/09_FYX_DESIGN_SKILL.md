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
