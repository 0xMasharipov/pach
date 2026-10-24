# Work log

## 2026-10-24 — Baseline and scope
- Reviewed all supplied materials. Standalone design/positioning/voice files match playbook copies; bundle adds only navigation formatting.
- User approved full testnet MVP, PACH prototype display, English first, portable hosting.
- Source baseline: documents only; `git status` reports no Git repository. Protected `.git` left untouched.
- Installed: Node 26.12.1, pnpm 12.15.0, Foundry 1.5.1.
- Network prerequisite check: shell cannot resolve registry.npmjs.org. npm metadata lookup cannot complete; offline npm metadata absent. Local pnpm caches exist and are being inspected.
- Docker prerequisite check: daemon access denied. No container or database claimed running.
- Created workspace skeleton, shared-package manifest, progress ledger and this log.
- Next: freeze interfaces, implement independent subsystems, assemble dependencies without changing protected host state.

## 2026-10-24 — Monad Testnet readiness
- Resumed after the user's explicit continuation request.
- Confirmed RPC chain ID 10143 and configured token decimals 6 using public JSON-RPC; the prepared deployer had 0 MON at the last balance check.
- Downloaded official Foundry 1.8.6 into ignored `.tools/foundry-v1.8.6` and verified its published SHA-256 checksum. Host-global Foundry was left unchanged.
- Added a constructor check for six-decimal reward tokens and a corresponding regression test. All 34 tests passed with Monad execution enabled; both fuzz properties ran 256 cases. Built and regenerated the real compiler ABI; formatting passed.
- Unified browser and API transaction confirmations. Added startup deployment/signer checks and on-chain expiry/nonce checks before signing approvals.
- Generated separate encrypted project deployer/verifier accounts under ignored `.data/monad`, with restrictive file permissions and refusal to silently replace recorded addresses. No raw private key was printed or committed.
- Added wallet preparation, balance/token preflight, simulation, encrypted-keystore deployment, and testnet application startup commands. Deployment records now also compare the actual immutable verifier/treasury against requested configuration.
- Regenerated the complete dependency lockfile and installed Fastify and other declared dependencies. Frozen installation, all workspace typechecks, nine unit-test files, web build and lint pass. Sharp's optional source-build attempt reports a missing node-addon-api; the web build succeeds.
- Network access inside Node/Foundry orchestration remains restricted in this execution sandbox; direct approved curl RPC reads work. Anvil cannot bind a local socket, and Docker access is denied. Consequently no running-chain/API integration or PostgreSQL rehearsal is claimed.
- Requested 1 test MON for deployment/rehearsal and 20 configured test USDC for a funded campaign. Actual deployment, source verification and live claims remain pending.

## 2026-10-24 — Deployment funding follow-up
- User reported sending 3 test MON. The prepared deployer still returned 0 MON from the testnet RPC; requested the funding transaction hash for confirmation. No deployment was broadcast.
- RPC gas estimation using the exact compiled creation bytecode and intended constructor addresses succeeded at 1,486,698 gas. This is an unsigned estimate, not a deployment receipt.
- Added `pnpm monad:verify` using the official Sourcify route. It checks the successful creation receipt, exact bytecode/constructor input, local source hashes, and a full verification match for the exact address on chain 10143 before recording sourceVerified=true.
- The source verification status regression test and JavaScript syntax checks pass. A false/partial match, wrong chain or different address cannot mark a deployment fully verified.

## 2026-10-24 — Confirmed deployment and live contract rehearsal
- Confirmed 3 MON in the prepared deployer. Node/Forge HTTP calls remain restricted, so the transaction was signed locally with the encrypted deployer and submitted through approved curl JSON-RPC calls. No raw key was written or printed, and no Foundry broadcast file was fabricated.
- Deployed FYXRewardVault at `0xF15Dbc53de06Aaec3de35E4991F67343c7a87F13`, transaction `0x808169930d3128dbeb11dbbf5756a567667ec838f169ce2dda5d35bc73c4496a`, block 73820461. Actual deployment gas cost: 0.189554046 MON.
- Verified canonical successful creation receipt, two confirmations, exact creation input, runtime code, token, verifier, treasury, chain and deposit getters. Recorded deployment evidence.
- Sourcify metadata job 076191a2-8ab4-4c1f-ae6e-45dc6a828a00 completed with exact creation/runtime matches; independent check-by-addresses returned perfect for the exact vault on chain 10143.
- Retrieved the configured token’s fully verified source and ABI. Its public mint function supplied 40 test USDC within the on-chain mint cap; no additional user token transfer was needed.
- Prepared isolated encrypted finder/developer accounts and funded each with 0.1 test MON. Campaign 1 paid finder 4 test USDC and developer 14; the developer claim atomically paid 2 to treasury. Campaign 2 refunded its full 20 after expiry. A repeated finder authorization reverted with NonceUsed in eth_call.
- Verified final totals: deposited 40, claimed 18, fees 2, refunded 20, escrow 0. Token balances and claimed/refunded flags match. Deployment plus all rehearsal gas cost 0.308907 MON.
- Added duplicate-deployment refusal and receipt-backed RPC/rehearsal recorders. Syntax/status tests and the duplicate-deployment guard pass. Existing 34 Monad contract tests remain valid for the exact source-verified deployed bytecode.
- Requested PostgreSQL DATABASE_URL configuration for the application runtime. HTTP/PostgreSQL/browser hosting remains pending; the on-chain rehearsal is explicitly labeled as controlled contract testing.

## 2026-10-24 — Supabase environment integration
- User added Supabase database password and API keys to root `.env.local`. Inspected names/formats only; no credential values were printed. Restricted the local file to mode 0600.
- Identified the project from the existing legacy anon JWT metadata. A credential-private, read-only request for the PACH state table reached PostgREST and returned PGRST205. The direct Postgres hostname could not be resolved from this execution environment. DATABASE_URL is not present, so no remote migration or database write is claimed.
- Requested the Supabase Session pooler connection URI on port 5432 in `.env.local`. API keys and a password alone do not identify the project’s pooler host.
- Added shared `.env` / `.env.local` loading for root launchers, matching package-level Node environment-file loading. Explicit process values take precedence. Supabase, database, signing and unrelated API credentials are removed from the web child environment.
- Added transactional ordered migration execution with an advisory lock, backend-only RLS/grant migration for the aggregate, and prepared-statement disabling for pooler compatibility. Migrations are ready but remain unapplied remotely.
- All ten unit-test files and all workspace typechecks pass, including new environment precedence and credential-isolation tests. Removed temporary credential-bearing probe files; only the original ignored local environment file remains as the Supabase credential source.
