# Shared interfaces — freeze before agents begin
**Status:** Proposed MVP contract. Orchestrator is responsible for locking changes and announcing a single shared version.

## One project, three bounded systems
```
apps/web  --> packages/game (player UI, event emitter)
    |             |
    +----------> apps/api (sessions, game authority, auth, claims)
                       |
                     viem (reads/indexing / verifier signing)
                       |
        packages/chain: FYXRewardVault (Monad Testnet 10143)
```
Never call smart contracts directly from game engine for every movement/click. Wallet client sends transaction only when funding or claiming on chain.

## Paths and file ownership
```
apps/web/                       # UI agent
apps/game/ or packages/game/    # Kimi game agent
apps/api/                       # Backend agent
packages/chain/                 # Solidity agent
packages/shared/                # Orchestrator only, frozen Zod/TS types
packages/config/                # Orchestrator only, RPC env and addresses
tests/e2e/ tests/security/      # QA agent
docs/                           # Orchestrator, release agents (separate files)
```

## Shared enums
```
role: 'player' | 'developer' | 'sponsor' | 'verifier' | 'admin'
challenge.status: 'draft' | 'funding' | 'open' | 'expired' | 'settled' | 'refunded'
session.status: 'created' | 'running' | 'submitted' | 'accepted' | 'rejected' | 'expired'
claim.role: 'FINDER' | 'DEVELOPER'
claim.status: 'eligible' | 'approval_prepared' | 'tx_pending' | 'claimed' | 'rejected' | 'expired'
```

## API V1 — POSTs require auth except where stated
- `POST /api/auth/nonce` `{address, chainId:10143}` → `{nonce, message, expiresAt}`
- `POST /api/auth/verify` `{message, signature}` → session cookie + `{user:{id,address,role}}`
- `GET /api/me` → user/session or 401.
- `GET /api/challenges` → `{items:[{id,slug,title,description,status,chainId,tokenAddress,prizes:{finder,developer,platform},contractChallengeId?,fundingTxHash?}]}`; use base-unit strings on chain-facing API.
- `POST /api/game/sessions` `{challengeId,levelId}` → `{sessionId,startedAt,expiresAt,levelConfig,version}`.
- `POST /api/game/events` `{sessionId,seq,kind,payload,clientTimestamp?}` → `{accepted,nextSeq,serverState}`. Allowed MVP kinds: `start`, `coupon_applied`, `hint_opened`, `paused`, `resumed`.
- `POST /api/game/reports` `{sessionId,bugCode,evidence}` → `{reportId,status:'accepted'|'rejected',xp,reason?}`. MVP correct code: `negative_total_due_to_duplicate_coupon`.
- `POST /api/dev/submissions` `{challengeId,commitRef,patchId}` → `{submissionId,status:'queued'|'passed'|'failed'|'needs_review'}`; only allowlisted controlled repo/patches, authorized reviewer decision required.
- `GET /api/leaderboard` → `{players:[{handle,xp,rank}],developers:[{handle,acceptedFixes,rank}]}`; only opted-in public handles.
- `POST /api/claims/prepare` `{challengeId,role}` → `{approval:{challengeId,role,claimant,amount,proofHash,nonce,deadline},signature,chainId,verifyingContract}` or reject. Backend derives claimant from verified session, not caller-provided address.
- `GET /api/claims/:claimId` → persisted status + confirmed `txHash?`.
- `POST /api/sponsor/challenges` → `draft` data for an approved sponsor; on-chain funding is signed by sponsor wallet client, not API.
- `POST /api/verifier/submissions/:id/approve` → controlled test evidence + reviewer session required; issues developer entitlement once.

### Standard API error shape
`{error:{code:string,message:string,details?:Record<string,unknown>,requestId:string}}`; no secrets, stack traces, raw credentials or private keys in client errors.

## Gameplay event validation — deterministic MVP
Base price `100` demo units, 60-unit coupon, max 2 coupon events. The *intentional bug* permits repeated application yielding `-20`; acceptance requires replayable ordered events, nonexpired session, correct report category, rate/timing checks and user eligibility. **No score-based payout solely based on client event field**. Player testnet reward only after authorized verifier approval. Additional anti-Sybil required before real money.

## On-chain value model
- Token: Devnads test USDC `0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73` on 10143 (6 decimals).
- Example challenge deposit 20 USDC = `20000000` base units.
- Finder `4000000`, developer `14000000`, platform `2000000`. Never use JS floating point for amounts. Render with `formatUnits(bigint,6)`.
- Platform fee settles once with developer claim only. Unspent funds refundable to sponsor after expiry. Contract enforces immutability/actual balance; backend must not assume escrow funded until chain receipt.

## EIP-712 frozen proposal
```
Domain:
  name: FYXRewardVault
  version: '1'
  chainId: 10143
  verifyingContract: <actual deployed contract>
Types:
  Claim:
    challengeId: uint256
    role: uint8        # 0 FINDER, 1 DEVELOPER
    claimant: address
    amount: uint256
    proofHash: bytes32
    nonce: uint256
    deadline: uint256
```
If the contract agent chooses `claimant` as msg.sender, verify both claimant and msg.sender match the signed value. `nonce` must be consumed globally per verifying signature or scoped so it cannot replay; contract also prevents repeat per role/challenge. Contract must derive/token check the exact fixed amount independently of signature. `proofHash` is evidence commitment, not PII/raw bug report or proof of truth. Contract emits `RewardClaimed(challengeId, role, claimant, amount, proofHash)` and other events with stable indexed fields. Make any signed `role` encoding unambiguous.

## Signer trust boundary
The backend/verifier signing key signs only after allowed evidence + approved review, never based on arbitrary request. Signer address configured in vault; no app client signing key. For hackathon, verifier remains trusted. Production roadmap: independent multi-party attestations/dispute resolution, audit, user uniqueness and real sponsor KYB.

## Deployment artifact schema
```
{
  "chainId": 10143,
  "rpc": "https://testnet-rpc.monad.xyz",
  "vaultAddress": "<actual deployed>",
  "testUsdcAddress": "0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73",
  "decimals": 6,
  "deployTxHash": "<actual tx hash>",
  "explorerUrl": "<actual verified explorer link>",
  "abiPath": "<actual local path>"
}
```
Until deployment, absent fields should be empty/unset; **never commit placeholder addresses as if valid**.

## Integration sequence
1. Shared types and mocked API. 2. Game + platform UI. 3. Backend events and auth. 4. Chain contract tests. 5. Testnet deploy + verify. 6. Wallet funding. 7. Backend EIP-712 signing. 8. Live claims. 9. QA/release. Interface changes require signed-off handoff and re-testing all dependent layers.


## Copy / brand compatibility notice (v2)
Use `11_BRAND_VOICE_COPY_SKILL.md` for any human-facing status or error text. Business logic, API routes, payloads, on-chain contract names, EIP-712 domains and token/chain identifiers **must not be renamed** for the provisional PACH brand. Return stable machine-readable status codes; UI maps them to accurate human-facing text.
