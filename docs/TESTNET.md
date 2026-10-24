# Monad Testnet

PACH uses Monad Testnet (`10143`), test MON for gas, and the configured six-decimal test token at `0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73`. These tokens have no monetary value.

## Current state

- Reward vault implemented and tested using official Foundry 1.8.6 with `network = "monad"`.
- Project deployer: `0xD820E76F15dfA5620D2fD152657b7eF4d94273C1`.
- Separate authorization signer: `0x578bd633179Df9be8818E506ceFa2F6Fc3613087`.
- Test deployment treasury defaults to the deployer. Set `FYX_TREASURY_ADDRESS` before deployment to use another treasury; it is immutable afterward.
- Deployment, explorer verification, real funding and live reward claims are still pending. No vault address or transaction is claimed yet.

## Prepare and deploy

Use official Foundry >=1.8. The current workspace has checksum-verified v1.8.6 binaries under ignored `.tools/foundry-v1.8.6`; the wrapper uses these automatically when present. On a fresh clone, install Foundry following the [official Monad guide](https://docs.monad.xyz/guides/deploy-smart-contract/foundry).

```sh
pnpm install --frozen-lockfile
pnpm monad:wallets
pnpm monad:check
pnpm monad:simulate
pnpm monad:deploy
pnpm monad:verify
```

`monad:wallets` creates or reuses two encrypted Foundry keystores. Addresses in a fresh clone will differ from this workspace. Back up `.data/monad` privately: it contains the encrypted accounts and their local password file. The directory is excluded from Git. Existing addresses are never silently replaced when wallet files are missing.

Send test MON to the displayed deployer before broadcasting. The initial funding request is 1 test MON for deployment and rehearsal transactions; actual gas usage is recorded in receipts. Creating a funded campaign separately requires 20 configured test USDC. Run `monad:check` again to inspect balances and token compatibility. The verifier signs approvals off-chain and does not need gas.

`monad:simulate` makes no broadcast. `monad:deploy` verifies the network, token, encrypted sender and public immutable addresses, broadcasts through Foundry, and records only a confirmed matching receipt under `packages/chain/deployments/10143.json`. `monad:verify` submits the exact deployed source to the Sourcify service used by MonadVision, then checks for a full source match on chain 10143 before marking the deployment verified. No explorer API key is needed for this route. See the [official verification guide](https://docs.monad.xyz/guides/verify-smart-contract/foundry) and [contract guide](../packages/chain/README.md).

## Connect the application

Provision PostgreSQL, set `DATABASE_URL` and `PUBLIC_ORIGIN` in the root `.env`, then apply the migration with the same environment:

```sh
node --env-file=.env --import tsx apps/api/src/migrate.ts
pnpm monad:dev
```

The testnet wrapper reads the confirmed vault address, unlocks the encrypted verifier into the API process environment, and starts the API and web app. It does not write the raw verifier key to disk. The web child does not inherit the verifier key, database credentials or deployment keystore settings.

`SPONSOR_ADDRESSES` and `VERIFIER_ADDRESSES` default to the project deployer for this local prototype. Override them in `.env` to let your own browser wallet sponsor campaigns and review contributions. The reviewer wallet is distinct from the server authorization signer. PostgreSQL, vault and matching signer are required; testnet mode cannot fall back to demo memory storage.

## Verify settlement

1. Sponsor creates and funds a campaign with exactly 20 test USDC.
2. A player completes the challenge and submits evidence; an authorized reviewer approves it.
3. The player claims 4 test USDC through their wallet.
4. A developer submits the passing controlled patch; a reviewer approves it.
5. The developer claims 14 test USDC and the treasury receives 2 in the same transaction.
6. Confirm receipts and balances, then rehearse expiry/refund on a separate campaign.

The browser and API both require two block confirmations. The signer checks chain timestamps, fixed awards, claimed roles and used nonces before producing an EIP-712 authorization. The contract enforces settlement independently. Record actual hashes in a release report; local tests do not establish a live payout.
