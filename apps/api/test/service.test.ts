import test from 'node:test';
import assert from 'node:assert/strict';
import {ApiError} from '../src/model.js';
import {harness,finding,approved,TEST_HASH} from './helpers.js';
const rejects=(operation:Promise<unknown>,code:string)=>assert.rejects(operation,(e:unknown)=>e instanceof ApiError&&e.code===code);

test('wallet authentication verifies signatures, binds chain/domain, consumes nonces and expires sessions',async()=>{
 const h=harness();
 await assert.rejects(h.call('POST','/api/auth/nonce',{address:h.player.address,chainId:143}));
 const {message}=await h.call('POST','/api/auth/nonce',{address:h.player.address,chainId:10143});
 assert.match(message,/localhost:3000/);assert.match(message,/Chain ID: 10143/);
 await rejects(h.call('POST','/api/auth/verify',{message,signature:await h.other.signMessage({message})}),'INVALID_SIGNATURE');
 const signature=await h.player.signMessage({message});
 await rejects(h.call('POST','/api/auth/verify',{message:message.replace('localhost:3000','evil.example'),signature}),'INVALID_NONCE');
 const result=await h.service.execute('POST','/api/auth/verify',{message,signature});
 const {user}=await h.call('GET','/api/me',undefined,result.cookie);assert.equal(user.address,h.player.address);assert.ok(!user.roles.includes('verifier'));
 await rejects(h.call('POST','/api/auth/verify',{message,signature}),'INVALID_NONCE');
 h.advance(3600001);await rejects(h.call('GET','/api/me',undefined,result.cookie),'UNAUTHORIZED');
 const old=await h.call('POST','/api/auth/nonce',{address:h.player.address,chainId:10143});h.advance(300001);
 await rejects(h.call('POST','/api/auth/verify',{message:old.message,signature:await h.player.signMessage({message:old.message})}),'INVALID_NONCE');
});

test('game ownership, ordered events, server time, expiry and strict payloads are enforced',async()=>{
 const h=harness();await h.campaign();const token=await h.login(h.player),other=await h.login(h.other);
 const {sessionId}=await h.call('POST','/api/game/sessions',{challengeId:'campaign',levelId:'checkout'},token);
 const event=(seq:number,kind:string,t=token,extra={})=>h.call('POST','/api/game/events',{sessionId,seq,kind,...extra},t);
 await rejects(event(1,'start',other),'NOT_FOUND');await rejects(event(2,'start'),'INVALID_SEQUENCE');
 await event(1,'start',token,{clientTimestamp:-100000});await rejects(event(1,'start'),'INVALID_SEQUENCE');
 await assert.rejects(event(2,'coupon_applied',token,{payload:{completed:true}}));
 await event(2,'coupon_applied');await event(3,'coupon_applied');await rejects(event(4,'coupon_applied'),'COUPON_LIMIT');
 const recovered=await h.call('GET',`/api/game/sessions/${sessionId}`,undefined,token);assert.equal(recovered.serverNow,h.now());
 h.advance(60001);
 const report=await h.call('POST','/api/game/reports',{sessionId,bugCode:'negative_total_due_to_duplicate_coupon',evidence:'Two coupon applications.'},token);
 assert.equal(report.status,'rejected');assert.equal(report.xp,0);assert.equal(report.reason,'SESSION_EXPIRED');
 await rejects(event(4,'hint_opened'),'SESSION_EXPIRED');
});

test('validated report is idempotent, XP credited once, leaderboard requires opt-in',async()=>{
 const h=harness();await h.campaign();const token=await h.login(h.player);
 const report=await finding(h,token);assert.equal(report.status,'accepted');assert.ok(report.xp>=100);
 const state=await h.store.transaction(s=>s);const original=state.reports[report.reportId]!;
 assert.deepEqual(await h.call('POST','/api/game/reports',{sessionId:original.sessionId,bugCode:'other',evidence:'Retry after lost response.'},token),{reportId:report.reportId,status:'accepted',xp:report.xp,reason:undefined});
 const again=await finding(h,token);assert.equal(again.xp,0);
 assert.deepEqual((await h.call('GET','/api/leaderboard')).players,[]);
 await h.call('POST','/api/profile',{handle:'tester_1',publicProfile:true},token);
 assert.deepEqual((await h.call('GET','/api/leaderboard')).players,[{handle:'tester_1',xp:report.xp,rank:1}]);
 await rejects(h.call('POST','/api/claims/prepare',{challengeId:'campaign',role:'FINDER'},token),'NOT_ELIGIBLE');
 await rejects(h.call('POST',`/api/verifier/reports/${report.reportId}/approve`,{},token),'FORBIDDEN');
});

test('concurrent reviewer decisions reserve one recipient; preparation is idempotent and rejects recipient injection',async()=>{
 const h=harness();await h.campaign();const a=await h.login(h.player),b=await h.login(h.other),reviewer=await h.login(h.reviewer);
 const ra=await finding(h,a),rb=await finding(h,b);
 const results=await Promise.allSettled([h.call('POST',`/api/verifier/reports/${ra.reportId}/approve`,{},reviewer),h.call('POST',`/api/verifier/reports/${rb.reportId}/approve`,{},reviewer)]);
 assert.equal(results.filter(x=>x.status==='fulfilled').length,1);
 assert.equal((results[1] as PromiseRejectedResult).reason.code,'AWARD_RESERVED');
 await assert.rejects(h.call('POST','/api/claims/prepare',{challengeId:'campaign',role:'FINDER',claimant:h.other.address},a));
 const [first,second]=await Promise.all([h.call('POST','/api/claims/prepare',{challengeId:'campaign',role:'FINDER'},a),h.call('POST','/api/claims/prepare',{challengeId:'campaign',role:'FINDER'},a)]);
 assert.deepEqual(first,second);assert.equal(h.signed.length,1);assert.equal(first.approval.claimant,h.player.address);assert.equal(first.approval.amount,'4000000');
 h.advance(601000);
 const renewed=await h.call('POST','/api/claims/prepare',{challengeId:'campaign',role:'FINDER'},a);assert.notEqual(renewed.approval.nonce,first.approval.nonce);assert.equal(renewed.approval.claimant,h.player.address);
 await rejects(h.call('POST',`/api/verifier/reports/${rb.reportId}/approve`,{},reviewer),'AWARD_RESERVED');
});

test('RPC errors never mark paid, invalid/reverted transactions recover durably, confirmed receipt marks claimed once',async()=>{
 const h=harness();const {token,claimId}=await approved(h);
 await h.call('POST','/api/claims/prepare',{challengeId:'campaign',role:'FINDER'},token);
 h.chain.claimReceipt=async()=>{throw new Error('RPC down');};
 const pending=await h.call('POST',`/api/claims/${claimId}/transaction`,{txHash:TEST_HASH},token);assert.equal(pending.status,'tx_pending');
 await rejects(h.call('POST','/api/claims/prepare',{challengeId:'campaign',role:'FINDER'},token),'TX_PENDING');
 h.chain.claimReceipt=async()=>{throw new ApiError(422,'INVALID_CLAIM_TX','Wrong event');};
 const invalid=await h.call('GET',`/api/claims/${claimId}`,undefined,token);assert.equal(invalid.status,'approval_prepared');assert.equal(invalid.transactionError,'INVALID_CLAIM_TX');assert.equal(invalid.txHash,undefined);
 assert.equal((await h.store.transaction(s=>s.claims[claimId]!)).txHash,undefined);
 h.chain.claimReceipt=async()=> 'reverted';
 const reverted=await h.call('POST',`/api/claims/${claimId}/transaction`,{txHash:TEST_HASH},token);assert.equal(reverted.status,'approval_prepared');assert.equal(reverted.transactionError,'TX_REVERTED');
 h.chain.claimReceipt=async()=> 'confirmed';
 assert.equal((await h.call('POST',`/api/claims/${claimId}/transaction`,{txHash:TEST_HASH},token)).status,'claimed');
 assert.equal((await h.call('POST',`/api/claims/${claimId}/transaction`,{txHash:TEST_HASH},token)).status,'claimed');
 await rejects(h.call('POST','/api/claims/prepare',{challengeId:'campaign',role:'FINDER'},token),'ALREADY_CLAIMED');
});

test('controlled developer fixtures fail/pass deterministically and still require review',async()=>{
 const h=harness();await h.campaign();const token=await h.login(h.player),reviewer=await h.login(h.reviewer);
 await assert.rejects(h.call('POST','/api/dev/submissions',{challengeId:'campaign',commitRef:'https://untrusted/code',patchId:'fixed-v1'},token));
 const failed=await h.call('POST','/api/dev/submissions',{challengeId:'campaign',commitRef:'fixture-v1',patchId:'broken-v1'},token);assert.equal(failed.status,'failed');
 await rejects(h.call('POST',`/api/verifier/submissions/${failed.submissionId}/approve`,{},reviewer),'TESTS_FAILED');
 const good=await h.call('POST','/api/dev/submissions',{challengeId:'campaign',commitRef:'fixture-v1',patchId:'fixed-v1'},token);assert.equal(good.status,'needs_review');
 await rejects(h.call('POST','/api/claims/prepare',{challengeId:'campaign',role:'DEVELOPER'},token),'NOT_ELIGIBLE');
 await h.call('POST',`/api/verifier/submissions/${good.submissionId}/approve`,{},reviewer);
 const prepared=await h.call('POST','/api/claims/prepare',{challengeId:'campaign',role:'DEVELOPER'},token);assert.equal(prepared.approval.amount,'14000000');assert.equal(prepared.approval.role,1);
});

test('funding and refund are sponsor-only, receipt-verified, idempotent and bound to deployment',async()=>{
 const h=harness();const sponsor=await h.login(h.sponsor),player=await h.login(h.player);
 const input={title:'Checkout fixture',description:'A controlled fixture campaign.',expiry:Math.floor(h.now()/1000)+3600};
 await rejects(h.call('POST','/api/sponsor/challenges',input,player),'FORBIDDEN');
 const c=await h.call('POST','/api/sponsor/challenges',input,sponsor);assert.equal(c.status,'draft');
 h.chain.funding=async()=>{throw new ApiError(422,'INVALID_FUNDING','No event');};
 await rejects(h.call('POST',`/api/sponsor/challenges/${c.id}/funding`,{txHash:TEST_HASH},sponsor),'INVALID_FUNDING');
 assert.equal((await h.call('GET',`/api/challenges/${c.id}`)).status,'draft');
 h.chain.funding=async()=>({contractChallengeId:'1'});
 const funded=await h.call('POST',`/api/sponsor/challenges/${c.id}/funding`,{txHash:TEST_HASH},sponsor);assert.equal(funded.status,'open');assert.equal(funded.vaultAddress,h.chain.vaultAddress);
 const c2=await h.call('POST','/api/sponsor/challenges',input,sponsor);
 await rejects(h.call('POST',`/api/sponsor/challenges/${c2.id}/funding`,{txHash:TEST_HASH},sponsor),'FUNDING_REUSED');
 h.chain.vaultAddress='0x2222222222222222222222222222222222222222';
 await rejects(h.call('POST','/api/game/sessions',{challengeId:c.id,levelId:'checkout'},player),'DEPLOYMENT_MISMATCH');h.chain.vaultAddress=funded.vaultAddress;
 h.chain.refund=async()=>{throw new ApiError(422,'INVALID_REFUND','No event');};
 await rejects(h.call('POST',`/api/sponsor/challenges/${c.id}/refund`,{txHash:TEST_HASH},sponsor),'INVALID_REFUND');
 h.chain.refund=async()=>({amount:'20000000'});
 const refunded=await h.call('POST',`/api/sponsor/challenges/${c.id}/refund`,{txHash:TEST_HASH},sponsor);assert.equal(refunded.status,'refunded');assert.equal(refunded.refundedAmount,'20000000');
 assert.deepEqual(await h.call('POST',`/api/sponsor/challenges/${c.id}/refund`,{txHash:TEST_HASH},sponsor),refunded);
});

test('store serializes concurrent operations and rolls back failed mutations',async()=>{
 const h=harness();await assert.rejects(h.store.transaction(s=>{s.audit.push({at:0,actor:'test',action:'bad',subject:'fixture'});throw new Error('rollback');}));
 assert.equal((await h.store.transaction(s=>s.audit)).length,0);
 await Promise.all(Array.from({length:20},(_,i)=>h.store.transaction(async s=>{await Promise.resolve();s.audit.push({at:i,actor:'test',action:'ok',subject:'fixture'});})));assert.equal((await h.store.transaction(s=>s.audit)).length,20);
});

test('demo mode refuses live campaign sessions and signatures even with a configured vault',async()=>{
 const h=harness();const {token}=await approved(h);h.config.mode='demo';
 await rejects(h.call('POST','/api/claims/prepare',{challengeId:'campaign',role:'FINDER'},token),'PREVIEW_ONLY');
 await rejects(h.call('POST','/api/game/sessions',{challengeId:'campaign',levelId:'checkout'},token),'PREVIEW_ONLY');assert.equal(h.signed.length,0);
});

test('review queue exposes recorded evidence/events only to reviewers; both confirmed awards settle campaign',async()=>{
 const h=harness();const {token,reviewer,claimId}=await approved(h);
 await rejects(h.call('GET','/api/verifier/queue',undefined,token),'FORBIDDEN');
 const queue=await h.call('GET','/api/verifier/queue',undefined,reviewer);assert.equal(queue.reports[0].events.length,3);assert.ok(queue.reports[0].proofHash);
 const submission=await h.call('POST','/api/dev/submissions',{challengeId:'campaign',commitRef:'fixture-v1',patchId:'fixed-v1'},token);
 const developer=await h.call('POST',`/api/verifier/submissions/${submission.submissionId}/approve`,{},reviewer);
 for(const role of ['FINDER','DEVELOPER'])await h.call('POST','/api/claims/prepare',{challengeId:'campaign',role},token);
 h.chain.claimReceipt=async()=> 'confirmed';
 await h.call('POST',`/api/claims/${claimId}/transaction`,{txHash:TEST_HASH},token);
 assert.equal((await h.call('GET','/api/challenges/campaign')).status,'open');
 await h.call('POST',`/api/claims/${developer.claimId}/transaction`,{txHash:`0x${'34'.repeat(32)}`},token);
 assert.equal((await h.call('GET','/api/challenges/campaign')).status,'settled');
});
