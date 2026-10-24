# Spot the Glitch

React game module for the fictional Broken Checkout challenge. The player has 60 active seconds to reproduce a duplicate 60-unit coupon against a 100-unit cart and submit an observation. One hint costs 20 potential XP. Pausing does not extend the five-minute absolute session limit.

Import `SpotTheGlitch` and `@fyx/game/style.css`. With no adapter, the game runs in explicitly labeled practice mode, with no claim eligibility. Supply the shared `GameAdapter` to use server-owned sessions, ordered actions and reports. The module never authenticates wallets or signs transactions.

The API supplies `serverNow` with event/recovery state to keep the visible timer aligned after a failed request. Recovering an action uses server state; submitting a report again is idempotent. A rejected campaign report closes that round and offers a new round. Refresh starts a new session rather than trusting stored browser state.

The game pauses on backgrounding (or after an in-flight action completes), supports keyboard controls, disables sound initially, and respects reduced motion. Server expiry remains authoritative if a background pause cannot reach the API.

Checks: `pnpm --filter @fyx/game typecheck`, shared rule tests, and `pnpm test:e2e` with the web and API running. Browser tests cover the actual game at mobile and desktop widths. No chain payout is proven by practice gameplay.
