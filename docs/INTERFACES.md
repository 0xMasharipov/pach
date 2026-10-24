# Interface freeze v1

Canonical baseline: pach-playbook/07_HANDOFF_CONTRACTS.md. This file records approved implementation resolutions.
- Packages: @fyx/shared, @fyx/game, @fyx/web, @fyx/api. Game is packages/game.
- API origin: web proxies /api to API_URL (default http://127.0.0.1:3001). Browser uses same-origin cookies.
- Game wire kinds: start, coupon_applied, hint_opened, paused, resumed. Report is a separate endpoint.
- Game time: 60 seconds active time and 300 seconds absolute lifetime. Server owns timestamps. Hint cost: 20 XP; valid report awards max(10, 100 - hints*20 + floor(remainingMs/1000)); one credited result per wallet/campaign.
- Guest preview is local only. Authenticated game requires a confirmed funded, open campaign; no guest payout or automatic adoption of preview history.
- Shared GameAdapter: createSession(), event(sessionId,seq,kind), report(sessionId,bugCode,evidence). Game API calls supplied by web; no wallet in game.
- API extension: GET /api/game/sessions/:id for safe recovery; GET /api/rewards for wallet entitlements; GET /api/verifier/queue; POST /api/verifier/reports/:id/approve; POST /api/profile for optional handle/leaderboard consent; POST /api/auth/logout.
- Claims prepare adds claimId to baseline response. All uint256 fields in JSON are decimal strings; role is numeric 0 or 1 in signed approval.
- GET /api/config returns mode, chainId, tokenAddress, vaultAddress (null until deployed), explorerUrl. No secrets.
- POST /api/sponsor/challenges uses title, description, expiry (Unix seconds), immutable fixed 4/14/2 test USDC split. POST /api/sponsor/challenges/:id/funding takes txHash; backend verifies receipt and event ownership/terms before opening.
- GET /api/challenges/:id supplies detail. GET /api/dev/submissions lists authenticated user's submissions; known patch IDs broken-v1 and fixed-v1, commitRef fixture-v1.
- POST /api/claims/:id/transaction takes txHash as a reconciliation hint, never as proof of payment.
- Only authorized reviewer approval reserves one entitlement per campaign/role; reservations persist after signature expiry to prevent competing signatures. Reissuance stays bound to the same recipient.
- Frontend must tolerate API unavailable with explicit preview/error states. No demo data mixed into live leaderboard or funds.

## Resume integration additions
- Game event and recovery responses include `serverNow` (epoch milliseconds), so recovery does not reset the client clock to the previous event time.
- A rejected campaign report closes its round; the game offers a new session. Retrying the same report remains idempotent.
- POST /api/sponsor/challenges/:id/refund takes `{txHash}`; the server verifies the contract refund event before persisting `refunded`.
