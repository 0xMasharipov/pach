# Portable deployment

Status: packaging prepared; Docker execution, PostgreSQL runtime, public hosting and Testnet settlement remain unverified in this sandbox. No live URL or contract address exists in this handoff.

## Dependency and runtime preparation

1. Run `pnpm install --frozen-lockfile` with the pinned package manager. The full dependency lockfile was regenerated on 2026-10-24.
2. Run unit tests, full typechecks, lint and web build. Install a Playwright browser and run the HTTP browser checks with the application started.
3. Pin tested container image digests. The supplied `node:24-bookworm-slim` and `postgres:17-alpine` tags are packaging choices, not verified image availability or reproducibility evidence.

For project-local encrypted Monad wallets, preflight, deployment and application startup, see [TESTNET.md](TESTNET.md).

## Local Compose rehearsal

Copy `.env.example` to `.env`. Set a strong `POSTGRES_PASSWORD` and `DATABASE_URL=postgres://fyx:<URL-encoded-password>@db:5432/fyx`. Keep `FYX_MODE=demo`, `NODE_ENV=development`, and `PUBLIC_ORIGIN=http://localhost:3000` for the localhost rehearsal. The web build embeds the API proxy target `http://api:3001` through Compose build args.

```sh
docker compose build
docker compose up -d
```

The database healthcheck precedes migrations. The API starts after successful migration and the web starts after API health. Only the web port is bound to localhost. The database volume persists across restarts. Back up the database before schema changes; never use `down -v` against records you need.

## Testnet release configuration

- Review live official Monad network/toolchain facts before deployment. Required application chain is 10143; mainnet is out of scope.
- Run the contract package's gated Monad test/build and simulation steps. Configure sponsor, finder, developer, reviewer, verifier signing key and treasury from operator-controlled wallets. Supply secrets via the host's secret manager or private environment file.
- Deploy and source-verify the vault using the contract README. Record only actual receipt-backed addresses/hashes. Check the configured test token address and decimals on-chain.
- Set `FYX_MODE=testnet`, `DATABASE_URL`, `FYX_VAULT_ADDRESS`, `VERIFIER_PRIVATE_KEY`, and role address allowlists. The deployed verifier must match the signing account.
- Put the web behind HTTPS, set the exact `PUBLIC_ORIGIN`, and set `NODE_ENV=production` in API runtime. Browser API traffic stays same-origin through the web proxy. Keep the API and PostgreSQL private.
- The request limiter is in-process and uses the immediate peer address. Behind the Next proxy it is an aggregate cap; tune edge controls for crowd traffic. Do not blindly trust forwarded IP headers.

## Required live rehearsal

Sponsor creates a draft, approves exactly 20 test USDC and funds the vault. Attach the real deposit hash and wait for server confirmation. Player completes a funded session, files evidence and receives authorized reviewer approval. Claim 4 test USDC through the player's wallet. Submit the controlled fixed fixture as developer; reviewer approves and the developer claims 14, releasing the 2 fee. Confirm receipt-backed amounts and repeat-claim rejection. Rehearse expiry and refund on a separate campaign.

Record deployment transaction, source verification result, deposit, finder claim, developer claim and optional refund in a dated release record. Never substitute local Anvil or fixture hashes for Monad Testnet evidence.
