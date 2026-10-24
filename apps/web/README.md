# PACH web prototype

Next.js App Router frontend for practice gameplay, funded campaigns, controlled developer submissions, reviewer approval, sponsor deposits/refunds and wallet claims. Public branding is centralized in `src/config/brand.ts`; FYX package, contract and environment identifiers remain unchanged.

From the workspace root:

```sh
pnpm --filter @fyx/web dev
pnpm --filter @fyx/web build
pnpm --filter @fyx/web start
pnpm --filter @fyx/web typecheck
pnpm --filter @fyx/web test
pnpm --filter @fyx/web lint
```

`API_URL` is a server-side Next rewrite destination, defaulting to `http://127.0.0.1:3001`. Set it before building a deployment. Set the API's `PUBLIC_ORIGIN` to the actual frontend origin; JSON POST requests use same-origin cookies and the API enforces that origin. No private key belongs in web environment variables. The UI reads public mode/network/vault settings from `/api/config`.

## Routes and behavior

- `/`, `/arenas`, `/arena/[id]`: introductory content and authoritative campaign data. The preview is conspicuously labeled, available offline and never counted as funded.
- `/play/checkout`: guest practice; `?challenge=<id>` selects a funded campaign. Wallet authentication and confirmed funding are required for server-backed play.
- `/build`: controlled `fixture-v1` submissions using only `fixed-v1` or `broken-v1`. Actual server test output and review status are shown.
- `/leaderboard`: API results only; optional public handles. No seeded rankings.
- `/rewards`: entitlement state, claim transactions, receipt recovery, optional profile consent and sign-out.
- `/corporate`: allowlisted sponsor drafts, exact token approval/deposit, refunds after expiry, and receipt recovery.
- `/review`: reviewer/admin gate; inspect report evidence and test output before awarding one entitlement per campaign/role.
- `/about`, `/docs`: trust assumptions, rules and currently configured network.

Injected EIP-1193 browser wallets are supported; WalletConnect/mobile universal links are not implemented. Users without an injected wallet can play practice. Before transactions, the client checks the account, chain 10143, expected test token, configured vault and RPC chain. Transactions are simulated before wallet submission; API receipt verification remains authoritative. Claim hashes are attached immediately after submission, with recovery forms for network interruptions.

The wallet and server must both stay on Monad Testnet. All USDC is **test USDC with no monetary value**. Verified off-chain events and reviewer signatures are distinct from confirmed on-chain payouts. Signing an authentication message does not grant token approval. Funding and claim flows require test MON for gas.

## Verification and limits

Production build and TypeScript checks passed in the implementation environment. Tests cover precise amount formatting, API transport errors, wallet chain switching/rejection and the public-copy gate. The root project's browser verification records cover responsive routes/gameplay. Live wallet transactions, real testnet funding, live receipt confirmation and deployment require configured services and credentials; local compilation does not prove them.

The frontend exposes transaction recovery after a connection failure. If a browser closes before the hash is recorded, retrieve the actual hash from wallet history. Dynamic campaign IDs are server-renderable; only practice IDs are prebuilt for offline artifact QA. Testnet contract verification requires the server; this frontend cannot independently authorize rewards.

No external font fetches or fabricated social proof are used. The design uses the supplied blue/navy palette, keyboard focus, labeled form controls, reduced motion and mobile navigation. Human language/pronunciation review and commercial brand clearance remain pending.
