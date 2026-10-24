# Agent 4 — Smart Contracts / Monad / Devnads Agent
**Ownership:** `packages/chain/**`, Solidity contracts, Foundry tests, deployment scripts, ABI/address export. Never use mainnet for this project.

## Read first
- Official current facts: https://docs.monad.xyz/ai/current-facts
- Official Foundry guide: https://docs.monad.xyz/guides/deploy-smart-contract/foundry
- Verification guide: https://docs.monad.xyz/guides/verify-smart-contract/foundry
- Devnads Agents API: https://devnads.com/agents
- Devnads test tokens: https://devnads.com/tokens

## Proposed core contract
A **single-purpose FYXRewardVault** backed by a known allowlisted ERC-20 token (Devsnads test USDC on Testnet). Store funded challenge with `sponsor`, `expiry`, `finderAmount`, `developerAmount`, `platformFee`, `remainingBalance`, and payout flags. Sponsor transfers/deposits via SafeERC20. Authorized verifier signs EIP-712 approvals. Claimant calls `claim` with exact role, amount, recipient, proof hash, unique nonce, signature, expiration. Contract checks all fields/roles and sends funds only once. Sponsor can withdraw unspent funds after expiry, while respecting prior payouts. Separate admin powers carefully; never let the verifier drain escrow through arbitrary amounts or recipients.

### Spec freeze with backend
Use EIP-712 `FYXRewardVault`, version `1`, `chainId=10143`, domain `verifyingContract=deployedVault`. Suggested struct:
```
Claim(uint256 challengeId,uint8 role,address claimant,uint256 amount,bytes32 proofHash,uint256 nonce,uint256 deadline)
```
`role: 0=FINDER, 1=DEVELOPER`. Use exactly this order and types once backend approves. Contract must enforce amount equals prefunded immutable role amount and role not previously paid. Nonce unique, signature valid for designated verifier, deadline not expired, campaign not expired, valid claimant, contract/chain-bound domain. EIP-712 does **not** independently verify the factual accuracy of a bug claim.

### Reward split for presentation
Total sponsor deposit = `20_000_000` base units of 6-decimal test USDC:
- FINDER: `4_000_000`
- DEVELOPER: `14_000_000`
- PLATFORM: `2_000_000`
Pay platform fee **only when** developer claim succeeds, and only once, to immutable authorized treasury; any unspent funds are refundable by sponsor after expiry. Guard fee transfer from reentrancy and zero address. If developer claim fails/never happens, platform fee remains refundable after expiry. All amounts illustrative; none indicate actual funds deposited until tx verified.

## Step-by-step
**1. Environment / chain sanity**
- Install official **Foundry >=1.8**; `forge --version`.
- Use `foundry.toml`:
```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
network = "monad"
eth-rpc-url = "https://testnet-rpc.monad.xyz"
chain_id = 10143
```
- Verify RPC and chain: `cast chain-id --rpc-url https://testnet-rpc.monad.xyz` must return `10143`. Confirm wallet network separately.
- Use audited OpenZeppelin building blocks, pin version; do not start new contracts as an unreviewed reimplementation of ERC-20/EIP-712.

**2. Faucet MON for gas — Devnads agent endpoint**
```bash
curl -fsS https://agents.devnads.com/health
curl -fsS https://agents.devnads.com/v1/faucet/status/10143
curl -sS -X POST https://agents.devnads.com/v1/faucet \
  -H 'Content-Type: application/json' \
  -d '{"chainId":10143,"address":"0xYOUR_TESTNET_WALLET"}'
```
Use only an actual wallet address and inspect returned errors. Alternative official manual faucet: https://faucet.monad.xyz . Documented Devnads dispensation: 1 test MON per request with limits (10/address/day; 50/IP/day; 200/ASN/day; 2000 MON/day overall); these are caps, not entitlements. Do not use wallet farms, retries to evade limits, or mainnet funds.

**3. Obtain *separate* test USDC for reward deposits**
- Visit https://devnads.com/tokens with an authorized demo wallet connected to **Monad Testnet**.
- Mint test USDC; its publicly documented address is `0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73`, decimals **6**; verify chain/address with explorer. Page lists max 10,000 per mint action. These tokens have **zero monetary value**.
- Test USDC minting costs MON gas. Do **not** assume `/v1/faucet` issues USDC: it dispenses MON only.
- Sponsor test wallet approves exact allowance; invoke vault funding from sponsor wallet.

**4. Build vault and events**
Implement `createChallenge`, `claim`, `refundUnspent`, read-only methods, custom errors and events (`ChallengeCreated`, `RewardClaimed`, `UnspentRefunded`). Use AccessControl/Ownable carefully, `ReentrancyGuard`, `SafeERC20`, `EIP712`, `ECDSA`; add `Pausable` only if justified and declare power model. No unilateral sponsor clawback before expiry. No infinite allowances initiated by contract.

**5. Contract tests (before deploy)**
- `forge build` and `forge test -vv` with `network="monad"`.
- Test two claims (finder + developer), fee settlement, refunds, late claims, wrong role/recipient/amount/token/nonce/deadline, signature replay, unauthorized verifier, contract/chain domain mismatch, balance conservation and reentrancy.
- Add invariant: `totalDeposited == totalClaimed + feesPaid + refundsPaid + remainingEscrow` per challenge.

**6. Deploy testnet**
- Store `DEPLOYER_PRIVATE_KEY` in secure env; `source .env` safely after setting file permissions. NEVER commit `.env`, hardcode private key or echo secret in terminal logs.
- Follow current Foundry deployment guide, choose a secure deployment method (hardware wallet/key store if available; disposable testnet key only if necessary). Check gas and chain before broadcasting.
- Capture deployed address and tx hashes **from real output**. Save ABI, chainId, block, source build ID and compiler/optimizer settings in `packages/chain/deployments/10143.json`. Export typed ABI for frontend/backend.

**7. Verify deployed source via Devnads Agents API**
- After deploying, create `verification-payload.json` using the *actual* compiled `standardJsonInput` and matching compiler version, contract name, and constructor args. Do not use `{...}` placeholders or an invented compiler version. Remove secrets before sending.
- Submit (only after real deploy):
```bash
curl -sS -X POST https://agents.devnads.com/v1/verify \
  -H 'Content-Type: application/json' \
  --data-binary @verification-payload.json
curl -sS https://agents.devnads.com/v1/verify/status/10143/0xACTUAL_CONTRACT_ADDRESS
```
- Minimal required verification payload fields: `chainId:10143`, `contractAddress`, `contractName` such as `src/FYXRewardVault.sol:FYXRewardVault`, `compilerVersion`, `standardJsonInput`. The API attempts MonadVision/Sourcify and Monadscan/Etherscan V2; record actual success/failure and explorer links.
- Alternative: official Foundry verification procedure in Monad docs. Source verification is not a security audit.

**8. Publish handoff artifacts**
- ABI JSON and TypeScript ABI export.
- Testnet contract address, verified explorer URL, source compile options, deploy tx, payout tx, sample `cast` reads, token address/decimals.
- Signer EIP-712 exact domain/type/fields and assumptions; backend agent must reproduce exact hash/signing.

## Critical Monad specifics
- Monad Testnet `10143`, Mainnet `143`, public RPC `https://testnet-rpc.monad.xyz`.
- Foundry >=1.8 and `network="monad"` matches Monad local execution, gas and hardfork behaviors.
- Monad charges transaction gas based on **gas limit**, not merely used gas. Use sensible gas limits, adequate testnet MON, estimate/simulate before signing.
- Monad MIP-8 storage paging is a VM storage/gas characteristic, **not** a plug-in identity protocol or game reward verifier. Keep storage packed sensibly and measure rather than claim extra performance.
- x401/x402 and ERC-8004 are optional future integrations only, unrelated to faucet and contract source verification.

## First prompt to contract agent
"Read AGENTS.md, 04_MONAD_CONTRACTS.md, 07_HANDOFF_CONTRACTS.md, 08_SOURCES_AND_NETWORK.md and the linked live Monad/Devnads docs. Implement and test FYXRewardVault with immutable exact funded prizes, safe ERC20 transfers, EIP-712 signer approvals and replay/expiry protections. Request test MON via Devnads only when real wallet available, mint test USDC separately, deploy to chainId 10143, verify source and publish actual deployment/ABI/tx artifacts. Never invent results or use mainnet."


## Copy / brand compatibility notice (v2)
Use `11_BRAND_VOICE_COPY_SKILL.md` for any human-facing status or error text. Business logic, API routes, payloads, on-chain contract names, EIP-712 domains and token/chain identifiers **must not be renamed** for the provisional PACH brand. Return stable machine-readable status codes; UI maps them to accurate human-facing text.
