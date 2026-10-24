# Monad Testnet release — 2026-10-24

The PACH reward vault is deployed on Monad Testnet (`10143`) and has an exact creation/runtime source match on Sourcify/MonadVision. Controlled on-chain settlement and refund tests passed.

**Vault:** [`0xF15Dbc53de06Aaec3de35E4991F67343c7a87F13`](https://testnet.monadscan.com/address/0xF15Dbc53de06Aaec3de35E4991F67343c7a87F13)  
**Compiler:** Solidity 0.8.33+commit.64118f21; optimizer 200 runs; Cancun target.  
**Local execution tests:** official Foundry 1.8.6, Monad network, 34 passing tests including two 256-case fuzz properties.

## Actual transactions

| Action | Transaction | Verified result |
|---|---|---|
| Vault deployment | [`0x80816993…73c4496a`](https://testnet.monadscan.com/tx/0x808169930d3128dbeb11dbbf5756a567667ec838f169ce2dda5d35bc73c4496a) | Confirmed; exact source match |
| Mint test USDC | [`0xc5472a4b…86ff43c1`](https://testnet.monadscan.com/tx/0xc5472a4bd69f8e79ee093b2e40f55776924071b3f5f317e3bd172e4186ff43c1) | 40 test USDC from the public test-token faucet |
| Fund settlement campaign | [`0xac749df4…4a86b6ed`](https://testnet.monadscan.com/tx/0xac749df4e31864c910af8ed93001ec958b3e8ab2fe2fc7a73ce7615e4a86b6ed) | 20 test USDC deposited |
| Finder claim | [`0x81b16726…9dbae6d7`](https://testnet.monadscan.com/tx/0x81b167264a276456ce353fd733c3b12fa8110af81e535e49821eb2ad9dbae6d7) | 4 test USDC paid to the finder |
| Developer claim + fee | [`0x751614ce…db691aea`](https://testnet.monadscan.com/tx/0x751614ceda3c7443ed8564a9cdae75c5341e8e0bb36de1a20fdcc85adb691aea) | 14 to developer + 2 to treasury atomically |
| Fund refund campaign | [`0x22236134…12343c51`](https://testnet.monadscan.com/tx/0x222361349254912eed1e4445d090df14b4986809773a41d4b75ab26b12343c51) | 20 test USDC deposited |
| Expired-campaign refund | [`0x0d5c3ef5…2d408d40`](https://testnet.monadscan.com/tx/0x0d5c3ef54843169601bc4ecbfcd61661f6d0f6da7fe9cb27a7b374002d408d40) | 20 test USDC returned to sponsor |

Every listed transaction has a successful receipt and at least two block confirmations. The developer transaction includes both token transfers and the platform-fee event. The repeated finder claim was checked with `eth_call` and reverted with `NonceUsed`; it was not rebroadcast.

## Accounting after rehearsal

| Counter | Test USDC |
|---|---:|
| Deposited | 40 |
| Finder + developer claims | 18 |
| Treasury fees | 2 |
| Refunded | 20 |
| Remaining escrow | 0 |

The final token balances are 4 for the finder, 14 for the developer, 22 for the sponsor/treasury, and 0 in the vault. The sponsor/treasury balance combines the 20-token refund and the 2-token fee. Both accounting and token balances conserve the minted 40 test USDC.

## Actors and gas

| Role | Address |
|---|---|
| sponsor | `0xD820E76F15dfA5620D2fD152657b7eF4d94273C1` |
| treasury | `0xD820E76F15dfA5620D2fD152657b7eF4d94273C1` |
| finder | `0xc745186799d7bcd239d7CbB79356176484dB07C0` |
| developer | `0xdFFC6beD4031cd60724f2BD3D181430f84C9059d` |
| verifier | `0x578bd633179Df9be8818E506ceFa2F6Fc3613087` |

The owner supplied 3 test MON. Deployment consumed **0.189554046 MON**; deployment plus all nine rehearsal transactions consumed **0.308907 MON**. Remaining balances at the captured head were 2.53866172 MON in the deployer, 0.077272054 in the finder, and 0.075159226 in the developer.

Encrypted accounts remain in the local ignored `.data/monad` directory. Private keys and password files are excluded from Git.

## Scope and remaining work

The rehearsal used isolated test actors and synthetic approvals signed by the dedicated test verifier. It proves contract settlement, authorization and replay handling. It is not evidence of an HTTP/PostgreSQL deployment, a production report review or a real user reward.

PostgreSQL configuration, API runtime, live browser integration and public application hosting remain pending. Test USDC and test MON have no monetary value.

Machine-readable evidence: [deployment](../../packages/chain/deployments/10143.json), [rehearsal](../../packages/chain/deployments/rehearsal-10143.json). The private RPC captures were validated against the signed transaction hashes, exact creation input, canonical receipt block, immutable getters, token events and final state before these records were written.
