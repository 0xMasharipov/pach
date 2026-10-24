# PACH implementation progress

Updated: 2026-10-24. Local verification and public-chain evidence are tracked separately.

| ID | Milestone | Status | Evidence / remaining work |
|---|---|---|---|
| M0 | Scope and product direction | Verified | PACH prototype, playable product testing, testnet settlement. |
| M1 | Workspace and shared interfaces | Verified | Private GitHub repository created; complete dependency lockfile regenerated; frozen install succeeds. |
| M2 | Playable guest game | Partially verified | Game and authoritative rule tests pass; current browser runtime remains unverified. |
| M3 | Platform and wallet flows | Partially verified | Typechecks and web build pass; wallet/API now use the same two-confirmation policy. Live wallet flow pending. |
| M4 | API, persistence and review | Partially verified | API, auth, review, signing and Fastify injection tests pass. PostgreSQL runtime not provisioned here. |
| M5 | Reward vault and tests | Verified locally | Official Foundry 1.8.6 with Monad execution: 34 tests, two 256-case fuzz properties, compiler ABI export and format check. |
| M6 | Integration and automated QA | Partially verified | All workspace typechecks, nine unit-test files, web build and lint pass. Live HTTP/browser and PostgreSQL checks remain. |
| M7 | Portable hosting | Implemented—unverified | Docker/Compose configuration exists; Docker socket access is denied in this environment. |
| M8 | Testnet deployment and both claims | Pending funding | Separate encrypted deployer/verifier prepared. Deployer balance was 0 MON at last check; deployment and payout receipts do not yet exist. |
| M9 | Public hosting and actual demo recording | Pending | No verified public application deployment or live demo recording. |

See [TESTNET.md](TESTNET.md) for addresses and executable setup commands, and [WORK_LOG.md](WORK_LOG.md) for evidence and environment limits.
