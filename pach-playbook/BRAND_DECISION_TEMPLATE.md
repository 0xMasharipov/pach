# Brand Decision Record — template

**Current state:** NOT APPROVED / PROPOSED
**Candidate:** PACH (pronounced “patch”)
**Legacy technical project:** FYX
**Proposed line:** Found something? Make it count.
**Category:** Playable product challenges
**Date of decision:** TBD
**Decision owner:** TBD

## Required checks before public commercial use

- [ ] Exact and confusingly similar marks checked in TURKPATENT, EUIPO, WIPO and relevant target markets, including `PACH`, `PATCH` and phonetic equivalents.
- [ ] Trademark counsel or owner recorded risk decision.
- [ ] Domain status independently checked, with exact domain and date. Do not claim any domain is available without live registrar evidence.
- [ ] Social handle checks completed.
- [ ] 5+ Turkish speakers and 5+ English speakers asked to pronounce/recall the name. Record actual responses without fabricating data.
- [ ] Logo and tagline collision search completed.
- [ ] Product screenshots, legal claims, testnet notices reviewed.
- [ ] Public brand approval signed by responsible owner.

**Decision:** Pending / Approve / Approve with conditions / Reject
**Reason:** TBD
**Sign-off:** TBD
**Decision date:** TBD

## Migration if approved

1. Change `brandConfig.displayName` and metadata; do not rename API routes, chain contracts or package identifiers.
2. Check routes, in-game wordmarks, social previews, pitch and QR demo assets.
3. Keep `fyx` internals where changing names risks import, EIP-712 and deployed-contract compatibility.
4. Run all tests. Record deployment artifacts and actual transaction links separately.
