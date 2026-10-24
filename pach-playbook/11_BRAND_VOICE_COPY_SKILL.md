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
