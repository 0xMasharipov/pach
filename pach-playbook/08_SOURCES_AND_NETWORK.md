# Verified resources / network checklist (checked 2026-10-24)

## Canonical facts (review live before any deployment)
| Item | Value / URL | Source |
|---|---|---|
| Monad Testnet chain ID | `10143` | https://docs.monad.xyz/ai/current-facts |
| Monad Mainnet chain ID (**DO NOT USE**) | `143` | https://docs.monad.xyz/ai/current-facts |
| Testnet native asset | MON | https://docs.monad.xyz/developer-essentials/testnet |
| Testnet RPC | `https://testnet-rpc.monad.xyz` | https://docs.monad.xyz/ai/current-facts |
| Testnet explorer | https://testnet.monadscan.com / https://testnet.monadvision.com | https://docs.monad.xyz/ai/current-facts |
| Official MON faucet | https://faucet.monad.xyz | https://docs.monad.xyz/ai/current-facts |
| Devnads agent API reference | https://devnads.com/agents | official Devnads site |
| Agent API base | `https://agents.devnads.com` | https://devnads.com/agents |
| Devnads test-token mint UI | https://devnads.com/tokens | official Devnads site |
| Test USDC contract | `0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73` | https://devnads.com/tokens |
| Test USDC decimals | 6 | https://devnads.com/tokens |
| Official Monad Foundry deployment | https://docs.monad.xyz/guides/deploy-smart-contract/foundry | Monad |
| Official Monad Foundry verification | https://docs.monad.xyz/guides/verify-smart-contract/foundry | Monad |
| Monad current fact index for agents | https://docs.monad.xyz/ai/developers | Monad |
| Blitz builder resources | https://blitz.devnads.com/resources | Devnads |
| Blitz event platform | https://blitz.devnads.com | Devnads |
| Monad AI skills | https://skills.devnads.com | Devnads community |

## Devnads Agents API exact documented endpoints
```
GET  https://agents.devnads.com/health
GET  https://agents.devnads.com/v1/faucet/status/10143
POST https://agents.devnads.com/v1/faucet
POST https://agents.devnads.com/v1/verify
GET  https://agents.devnads.com/v1/verify/status/10143/{address}
```
### Faucet examples
```
curl -fsS https://agents.devnads.com/health
curl -fsS https://agents.devnads.com/v1/faucet/status/10143
curl -sS -X POST https://agents.devnads.com/v1/faucet \
  -H "Content-Type: application/json" \
  -d '{"chainId":10143,"address":"0xYOUR_REAL_TESTNET_WALLET"}'
```
1 test MON per successful request is the listed amount. Limits currently documented: 10 requests per address/day, 50 per IP/day, 200 per ASN/day, 2000 MON/day total, with additional anti-abuse checks. Availability not guaranteed. Endpoint funds MON, **not USDC**.

### Test tokens
Devnads Test Tokens page is a wallet-connected minting **UI**, not the documented `/v1/faucet` API. ERC20 test token addresses are ecosystem/demo contracts, not canonical production stablecoins. Do not send real funds to them.
- test USDC: `0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73` (6 decimals; EIP-2612; UI max 10,000 per transaction)
- test USDT: `0x42D54D7aE6776D309363e650fBcbF93D961D8b58` (6 decimals)
- test WETH: `0x05bE0A4Bc7848424029B75d51565A34e17802D2d` (18 decimals)
- test WBTC: `0x596886d5875D73cC9bCEC4fAf1EE54e4B8af3d6a` (8 decimals)

### Verify API
A valid POST `/v1/verify` needs `chainId`, actual `contractAddress`, `contractName` (e.g. `src/FYXRewardVault.sol:FYXRewardVault`), compiler version matching build, and `standardJsonInput` object (preferred) or flattened `sourceCode`. Optional constructor args and EVM/optimizer values must match actual compilation. API attempts both MonadVision/Sourcify and Monadscan/Etherscan V2. Always check status; request acceptance does not equal verification success.

## Monad development gotchas
- Monad docs recommend **Foundry >=1.8.0** with `network="monad"`, plus `viem >=2.40.0` for current Monad-specific chain support.
- When using standard `forge test` without Monad execution configuration, gas estimates and VM behavior may be mismatched.
- Monad gas is charged by transaction **gas limit**; maintain an adequate MON buffer and estimate conservatively without absurd limits.
- MIP-8 organizes storage in 128-slot pages; not a separate contract opt-in, payout system or security algorithm.
- Docs note testnet was reset from genesis on 2025-12-16; do not copy old deployment addresses/chain IDs from earlier hackathon projects.

## Optional technology — later roadmap, not MVP dependency
- x401: credential / access verification is independent of FYX's core reward engine; requires issuer/trust design.
- x402: HTTP payment-gated APIs on Monad, useful if FYX later sells access to machine-readable developer tools: https://docs.monad.xyz/guides/x402
- ERC-8004: registered AI agent identity/reputation, not needed to make the game playable: https://docs.monad.xyz/guides/erc-8004
- Corporate KYB, sophisticated anti-Sybil, centralized verifier alternatives and audit are post-hackathon requirements for real-world value.

## Helpful official templates / agent skills
- Devnads monskills: `npx skills add therealharpaljadeja/monskills` (review the third-party source/install instructions and security first): https://skills.devnads.com
- Monad Foundry template (official guide): `forge init --template monad-developers/foundry-monad <project_name>`
- Devnads builder resources link official Foundry deployment, wallets, verification, PWA templates, account abstraction and sponsor transactions. Optional gas sponsoring is explicitly stretch scope for a one-day hackathon.

## Verification discipline
Sources and APIs evolve. Before an action that moves funds or deploys code, check official pages for recent changes; compare chain ID from RPC, wallet, ABI and code. Do not claim any address has been deployed, source verified, or faucet granted until actual results demonstrate it.
