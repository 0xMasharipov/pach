# Development guide

Local setup, verification, and implementation details for the PACH prototype.

## Run locally

Use Node >=22.12 and the pinned pnpm version in `package.json`.

```sh
cp .env.example .env
pnpm install --no-frozen-lockfile
pnpm dev:offline
```

Open `http://localhost:3000/play/checkout`. The offline command uses the real API service through a small Node HTTP transport, with demo-only memory storage. It does not simulate funded campaigns or payments. With Fastify installed, `pnpm dev` starts the standard transport. Both require permission to bind localhost ports. The `.env` loader is in `tools/dev.mjs`; package-level scripts require exported environment variables.

This workspace currently uses cached dependency links because registry access is blocked. The inherited lockfile is incomplete; a fresh install must resolve dependencies and regenerate it. Review and commit the resulting lockfile, then use `pnpm install --frozen-lockfile` in CI. Do not copy the existing `node_modules` to another machine.

## Structure

- `apps/web`: Next.js platform, wallet client, campaign and review flows.
- `packages/game`: accessible React checkout game and practice mode.
- `packages/shared`: wire validators, authoritative game rules, reward constants and EIP-712 types.
- `apps/api`: signed wallet authentication, transactional persistence, deterministic tests, reviewer authorization and receipt reconciliation.
- `packages/chain`: sponsor-funded reward vault, compiler-generated ABI, Foundry tests and deployment tools.
- `tests/e2e`: browser scenarios for game and platform.

The interface baseline and additive decisions are in [INTERFACES.md](INTERFACES.md). PACH is the selected prototype name; internal FYX identifiers and the EIP-712 domain remain unchanged.

## Checks

```sh
pnpm test:unit
pnpm typecheck
pnpm lint
pnpm build:web
pnpm --filter @fyx/chain test:baseline
pnpm --filter @fyx/chain test
pnpm test:e2e
```

The standard contract test command deliberately requires the Monad-capable Foundry version specified in the playbook. `test:baseline` is a separate local EVM check and does not prove Monad compatibility. Full API typechecking requires Fastify. For the cached dependency environment, use `pnpm --filter @fyx/api typecheck:offline`.

For restricted environments that cannot bind ports, `pnpm test:e2e:artifact` tests the compiled `.next` pages and real API service through Playwright request interception. Build the web app first. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` only if using an existing compatible browser. Artifact checks do not verify a running HTTP stack, deployment or chain RPC. Screenshots go to ignored `test-results/`.

## Testnet and portable hosting

Follow [deployment instructions](DEPLOYMENT.md), the [API package](../apps/api) and [contract README](../packages/chain/README.md). The Dockerfile and Compose stack provide web, API, migration and PostgreSQL services; they remain unverified until run on a host with Docker access.

The verifier signing key belongs only in the API runtime. Human wallets sign their own authentication, funding and claim transactions. Testnet mode requires PostgreSQL; it cannot silently fall back to memory. No deployer or verifier key is bundled.

## Trust model

The browser is untrusted. The API validates ordered events, server timestamps, evidence shape and eligibility; an authorized human reviewer reserves each campaign award. Controlled developer patches are fixed allowlisted fixtures, not arbitrary user code. The contract enforces signature authorization, recipient, exact funded amounts, replay protection and expiry. It does not establish whether an off-chain report is true or whether a player is unique.

The example campaign deposits 20 test USDC: 4 for the finder, 14 for the developer, and 2 released to the platform only with the developer claim. Unspent funds are refundable to the sponsor after expiry. A successful browser interaction or signature is never shown as proof of payment. This prototype has not received a production security audit.
