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
