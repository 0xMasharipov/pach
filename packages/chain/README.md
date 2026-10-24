# FYXRewardVault

PACH prototype escrow, retaining the frozen FYX contract and EIP-712 names. Test USDC has no monetary value. The contract is restricted to Monad Testnet `10143` and token `0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73`.

Each campaign deposits exactly `20000000` base units (20 test USDC). An authorized finder receives `4000000`; an authorized developer receives `14000000`. The developer claim atomically releases `2000000` to the immutable treasury. The sponsor can refund only the unspent balance after expiry. There is no upgrade, owner withdrawal, pause, verifier rotation or early clawback. Direct token donations are not assigned to campaigns and cannot be recovered.

The immutable verifier is trusted to approve truthful findings and controlled fixes. EIP-712 proves authorization, not the correctness of a report. The server must reserve each campaign/role for one recipient and keep that reservation after an approval expires. Compromising the verifier can misallocate the fixed, funded awards; this prototype has not been audited.

## Local checks

Solidity is pinned to `0.8.33`, optimizer 200 runs, Cancun EVM target. The vendored OpenZeppelin subset is v5.4.0; `lib/openzeppelin-contracts/PROVENANCE.json` records upstream blob hashes. Build/test commands verify that all 24 vendored files match those hashes before proceeding. No forge-std dependency is required.

```sh
pnpm --filter @fyx/chain build
pnpm --filter @fyx/chain test
pnpm --filter @fyx/chain lint
pnpm --filter @fyx/chain typecheck
```

The build/test release commands require official Foundry >=1.8 because the [Monad guide](https://docs.monad.xyz/guides/deploy-smart-contract/foundry) requires Monad execution support. They deliberately reject older versions. On an older Foundry, an explicitly labeled generic EVM regression check is available:

```sh
pnpm --filter @fyx/chain test:baseline
```

This runs offline using `SOLC_PATH`, a cached native compiler in the standard SVM data directory, or an already installed Solidity 0.8.33. It does not install tooling, connect to RPC, broadcast transactions, or establish Monad gas/execution compatibility. Foundry 1.5.1 warns that it ignores `network = "monad"`; that warning is expected for this fallback.

Verified on 2026-10-24 with checksum-verified official Foundry 1.8.6 and `network = "monad"`: **34 contract tests passed**, including two fuzz properties with 256 generated cases each. Coverage includes the 4/14/2 split, token decimals, either claim order, refunds, global nonce replay, modified claim fields, wrong chain/domain, platform transfer rollback, reentrancy, underfunding, and accounting conservation. Build, compiler ABI export and formatting also passed. Deployment, explorer verification and live claims remain pending.

The current workspace keeps the toolchain in ignored `.tools/foundry-v1.8.6`; prepend that directory to `PATH` when running package-level commands. Root `pnpm monad:*` deployment commands select it automatically. See the [testnet guide](../../docs/TESTNET.md).

## ABI and signing

`abi/FYXRewardVault.json` and `abi/index.ts` (`vaultAbi`) are generated from actual solc output; ABI generation makes no deployment claim. Run `pnpm --filter @fyx/chain abi` after compilation. Do not hand-edit these files.

Domain: `{name: "FYXRewardVault", version: "1", chainId: 10143, verifyingContract: <actual vault>}`.

```text
Claim(uint256 challengeId,uint8 role,address claimant,uint256 amount,bytes32 proofHash,uint256 nonce,uint256 deadline)
```

Role `0` is finder and `1` is developer. The transaction sender must equal the signed claimant. The exact fixed amount, domain, expiry, globally unused nonce, and previously unpaid campaign/role are checked on-chain. The backend shared `claimTypes` must retain this field order. JSON APIs encode uint256 values as decimal strings.

## Deployment prerequisites and procedure

No deployment address or transaction is supplied until a real receipt is confirmed. Configure the public addresses in `.env.example`; keep actual local env files outside version control. Use an authorized encrypted Foundry keystore account (`cast wallet import <name> --interactive`) and let Foundry prompt for its password. Do not pass private keys or passwords as command-line arguments. The API verifier private key belongs only in server runtime secrets.

1. Install official Foundry >=1.8 and run the release build/tests above.
2. Confirm the latest [Monad network facts](https://docs.monad.xyz/ai/current-facts) and [Devnads token information](https://devnads.com/tokens). Obtain test MON for deployment and a separate supply of test USDC for the sponsor. The [Devnads MON faucet](https://devnads.com/agents) does not mint USDC.
3. Export `MONAD_RPC_URL`, `FYX_DEPLOYER_ACCOUNT` (or `FYX_DEPLOYER_KEYSTORE`), `FYX_KEYSTORE_PASSWORD_FILE`, `FYX_VERIFIER_ADDRESS` and `FYX_TREASURY_ADDRESS`. The root `pnpm monad:wallets` and `pnpm monad:deploy` commands prepare and use project-local encrypted accounts automatically. Recheck the immutable addresses carefully.
4. Run `pnpm --filter @fyx/chain deploy:simulate`. It checks toolchain and RPC chain ID; the Solidity script also checks chain, token code and token decimals. This command does not broadcast.
5. Run `pnpm --filter @fyx/chain deploy:testnet` to broadcast the reviewed deployment. It reads the real broadcast transaction, queries its successful receipt and deployed getters, and writes `deployments/10143.json`, a hash-named history record, and `deployments/verification-payload.json`. A live broadcast still requires a funded deployment account.
6. Submit the generated verification payload as described below and poll until the explorer confirms the source. `sourceVerified` remains false in the artifact until the actual result is recorded. The payload is rejected locally if compiler source or creation bytecode no longer matches the deployment.
7. Configure the API vault address and verifier secret; have sponsor and claimants sign their own funding/claim transactions through the application. Capture the actual funding, finder, developer and fee receipts for release acceptance.

From `packages/chain`, after a confirmed deployment:

```sh
curl -sS -X POST https://agents.devnads.com/v1/verify \
  -H 'Content-Type: application/json' \
  --data-binary @deployments/verification-payload.json
```

Poll `https://agents.devnads.com/v1/verify/status/10143/<actual vault address>`. API acceptance alone is not successful source verification. The [official verification guide](https://docs.monad.xyz/guides/verify-smart-contract/foundry) provides a Foundry alternative. Verification is not an audit.

Remaining release prerequisites: fund the prepared deployer with test MON; provide 20 configured test USDC for a campaign; provision PostgreSQL for the API; confirm deployment, source verification and both live claims. No deployment artifacts are fabricated.
