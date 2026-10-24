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
