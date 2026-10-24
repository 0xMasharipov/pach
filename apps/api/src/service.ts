import {randomBytes,randomUUID,createHash} from 'node:crypto';
import {z} from 'zod';
import {getAddress,verifyMessage,type Address,type Hex} from 'viem';
import {CHAIN_ID,TEST_USDC_ADDRESS,PRIZES,LEVEL,createGameState,applyGameEvent,evaluateReport,eventSchema,reportSchema,sessionSchema,GameRuleError,addressSchema,hashSchema,roleSchema} from '@fyx/shared';
import {ApiError,fail,type Store,type State,type User,type Role,type Challenge,type Claim,type Approval} from './model.js';
import type {Config} from './config.js';
import type {ChainGateway} from './chain.js';
import {checkPatch} from './patch.js';
export const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
const proof=(value:unknown)=>`0x${hash(JSON.stringify(value))}` as Hex;
const idSchema=z.string().min(1).max(128);
const sessionDuration=60*60*1000;
const publicClaim=(c:Claim)=>({id:c.id,challengeId:c.challengeId,role:c.role,amount:c.amount,status:c.status,txHash:c.txHash,approval:c.approval,signature:c.signature,transactionError:c.transactionError});
export interface ServiceOptions {store:Store;config:Config;chain:ChainGateway;now?:()=>number;verify?:typeof verifyMessage;patch?:typeof checkPatch}
export class Service {
 readonly options:ServiceOptions;
 constructor(options:ServiceOptions){this.options=options;}
 now(){return (this.options.now??Date.now)();}
 private roles(address:Address):Role[]{
  const c=this.options.config;const key=address.toLowerCase();const roles:Role[]=['player','developer'];
  if(c.sponsors.includes(key))roles.push('sponsor');if(c.verifiers.includes(key))roles.push('verifier');if(c.admins.includes(key))roles.push('admin');return roles;
 }
 private auth(s:State,token?:string):User{
  const session=token?s.sessions[hash(token)]:undefined;
  if(!session||session.expiresAt<=this.now())return fail(401,'UNAUTHORIZED','Connect and sign in with your wallet.');
  const user=s.users[session.address.toLowerCase()];if(!user)return fail(401,'UNAUTHORIZED','Your session is no longer available.');
  user.roles=this.roles(user.address);user.role=user.roles.at(-1)!;return user;
 }
 private require(user:User,role:Role){if(!user.roles.includes(role)&&!user.roles.includes('admin'))fail(403,'FORBIDDEN','This action requires an authorized role.');}
 private challenge(s:State,id:string){const c=s.challenges[id];if(!c) return fail(404,'NOT_FOUND','Challenge not found.');return c;}
 private active(s:State,id:string){if(this.options.config.mode!=='testnet')return fail(409,'PREVIEW_ONLY','Campaign sessions and rewards are unavailable in demo mode.');const c=this.challenge(s,id);if(c.demo||c.status!=='open'||!c.contractChallengeId||c.expiry*1000<=this.now())return fail(409,'CHALLENGE_UNAVAILABLE','A confirmed funded, open testnet campaign is required.');if(c.vaultAddress?.toLowerCase()!==this.options.chain.vaultAddress?.toLowerCase())return fail(409,'DEPLOYMENT_MISMATCH','This campaign belongs to another vault deployment.');return c;}
 private audit(s:State,actor:string,action:string,subject:string){s.audit.push({at:this.now(),actor,action,subject});}
 private seed():Challenge{return {id:'preview-checkout',slug:'checkout',title:'Broken Checkout',description:'Explore a fictional checkout and report the duplicate-coupon defect. Practice only; no reward eligibility.',status:'draft',chainId:CHAIN_ID,tokenAddress:TEST_USDC_ADDRESS,prizes:PRIZES,expiry:0,sponsor:'0x0000000000000000000000000000000000000000',demo:true};}
 async execute(method:string,path:string,body:unknown,token?:string):Promise<{body:unknown;cookie?:string;clearCookie?:boolean}>{
  const {store,config,chain}=this.options;
  if(method==='GET'&&path==='/api/config')return {body:{mode:config.mode,chainId:CHAIN_ID,tokenAddress:TEST_USDC_ADDRESS,vaultAddress:chain.vaultAddress,explorerUrl:'https://testnet.monadscan.com'}};
  if(method==='GET'&&path==='/api/health'){await store.transaction(()=>null);return {body:{status:'ok',mode:config.mode,storage:config.databaseUrl?'postgres':'memory-demo'}};}
  if(method==='POST'&&path==='/api/auth/nonce'){
   const input=z.object({address:addressSchema,chainId:z.literal(CHAIN_ID)}).strict().parse(body);const address=getAddress(input.address);const nonce=randomBytes(24).toString('hex');const now=this.now();const expiresAt=now+300_000;
   const message=`${new URL(config.origin).host} wants you to sign in with your Ethereum account:\n${address}\n\nSign in to the PACH testnet prototype. This does not authorize a transaction.\n\nURI: ${config.origin}\nVersion: 1\nChain ID: ${CHAIN_ID}\nNonce: ${nonce}\nIssued At: ${new Date(now).toISOString()}\nExpiration Time: ${new Date(expiresAt).toISOString()}`;
   await store.transaction(s=>{for(const [key,n] of Object.entries(s.nonces))if(n.expiresAt<=now)delete s.nonces[key];s.nonces[hash(message)]={message,address,expiresAt};});
   return {body:{nonce,message,expiresAt:new Date(expiresAt).toISOString()}};
  }
  if(method==='POST'&&path==='/api/auth/verify'){
   const input=z.object({message:z.string().max(2000),signature:z.string().regex(/^0x[0-9a-fA-F]{130}$/)}).strict().parse(body);
   return store.transaction(async s=>{
    const key=hash(input.message),nonce=s.nonces[key];if(!nonce||nonce.message!==input.message||nonce.expiresAt<=this.now())return fail(401,'INVALID_NONCE','This sign-in request expired or was already used.');
    const valid=await (this.options.verify??verifyMessage)({address:nonce.address,message:input.message,signature:input.signature as Hex});if(!valid)return fail(401,'INVALID_SIGNATURE','The wallet signature did not match.');
    delete s.nonces[key];const wallet=nonce.address.toLowerCase();const roles=this.roles(nonce.address);
    const user=s.users[wallet]??{id:randomUUID(),address:nonce.address,role:'player',roles,publicProfile:false};user.roles=roles;user.role=roles.at(-1)!;s.users[wallet]=user;
    const cookie=randomBytes(32).toString('hex');s.sessions[hash(cookie)]={address:nonce.address,expiresAt:this.now()+sessionDuration};
    for(const [k,v] of Object.entries(s.sessions))if(v.expiresAt<this.now())delete s.sessions[k];
    return {body:{user},cookie};
   });
  }
  if(method==='GET'&&path==='/api/challenges')return {body:await store.transaction(s=>({items:[this.seed(),...Object.values(s.challenges).map(c=>({...c,status:c.status==='open'&&c.expiry*1000<=this.now()?'expired':c.status}))]}))};
  if(method==='GET'&&/^\/api\/challenges\/[^/]+$/.test(path))return {body:await store.transaction(s=>{const c=path==='/api/challenges/preview-checkout'?this.seed():this.challenge(s,path.split('/').at(-1)!);return {...c,status:c.status==='open'&&c.expiry*1000<=this.now()?'expired':c.status};})};
  if(method==='GET'&&path==='/api/leaderboard')return {body:await store.transaction(s=>{
   const visible=Object.values(s.users).filter(u=>u.publicProfile&&u.handle);
   const players=visible.map(u=>({handle:u.handle!,xp:Object.values(s.reports).filter(r=>r.wallet===u.address&&r.status==='accepted').reduce((n,r)=>n+r.xp,0)})).filter(u=>u.xp>0).sort((a,b)=>b.xp-a.xp).map((u,i)=>({...u,rank:i+1}));
   const developers=visible.map(u=>({handle:u.handle!,acceptedFixes:Object.values(s.claims).filter(c=>c.wallet===u.address&&c.role==='DEVELOPER').length})).filter(u=>u.acceptedFixes>0).sort((a,b)=>b.acceptedFixes-a.acceptedFixes).map((u,i)=>({...u,rank:i+1}));return {players,developers};
  })};
  // All remaining routes require wallet authentication. No untrusted code executes here.
  return store.transaction(async s=>{
   const user=this.auth(s,token);const wallet=user.address;
   if(method==='GET'&&path==='/api/me')return {body:{user}};
   if(method==='POST'&&path==='/api/auth/logout'){delete s.sessions[hash(token!)];return {body:{ok:true},clearCookie:true};}
   if(method==='POST'&&path==='/api/profile'){
    const input=z.object({handle:z.string().trim().regex(/^[a-zA-Z0-9_-]{3,24}$/),publicProfile:z.boolean()}).strict().parse(body);
    if(Object.values(s.users).some(u=>u.id!==user.id&&u.handle?.toLowerCase()===input.handle.toLowerCase()))return fail(409,'HANDLE_TAKEN','That handle is already in use.');Object.assign(user,input);return {body:{user}};
   }
   if(method==='POST'&&path==='/api/sponsor/challenges'){
    this.require(user,'sponsor');if(config.mode!=='testnet')return fail(409,'PREVIEW_ONLY','Campaign funding is unavailable in demo mode.');
    const input=z.object({title:z.string().trim().min(5).max(100),description:z.string().trim().min(10).max(1000),expiry:z.number().int().positive()}).strict().parse(body);
    if(input.expiry*1000<this.now()+600_000||input.expiry*1000>this.now()+30*86400_000)return fail(422,'INVALID_EXPIRY','Choose an expiry between ten minutes and thirty days from now.');
    const id=randomUUID();const c:Challenge={...input,id,slug:id,status:'draft',chainId:CHAIN_ID,tokenAddress:TEST_USDC_ADDRESS,prizes:PRIZES,sponsor:wallet};s.challenges[id]=c;this.audit(s,wallet,'challenge.created',id);return {body:c};
   }
   const funding=path.match(/^\/api\/sponsor\/challenges\/([^/]+)\/funding$/);
   if(method==='POST'&&funding){
    this.require(user,'sponsor');if(config.mode!=='testnet')return fail(409,'PREVIEW_ONLY','Campaign transactions are unavailable in demo mode.');const input=z.object({txHash:hashSchema}).strict().parse(body);const c=this.challenge(s,funding[1]!);if(c.sponsor!==wallet)return fail(403,'FORBIDDEN','Only this campaign sponsor can attach funding.');
    if(c.fundingTxHash===input.txHash)return {body:c};if(c.fundingTxHash)return fail(409,'ALREADY_FUNDED','This campaign already has confirmed funding.');
    if(Object.values(s.challenges).some(x=>x.fundingTxHash===input.txHash))return fail(409,'FUNDING_REUSED','That deposit already belongs to another campaign.');
    const confirmed=await chain.funding(input.txHash as Hex,c);
    if(Object.values(s.challenges).some(x=>x.contractChallengeId===confirmed.contractChallengeId))return fail(409,'FUNDING_REUSED','That on-chain challenge already has a campaign.');
    Object.assign(c,confirmed,{vaultAddress:chain.vaultAddress,fundingTxHash:input.txHash,status:c.expiry*1000<=this.now()?'expired':'open'});this.audit(s,wallet,'challenge.funded',c.id);return {body:c};
   }
   const refund=path.match(/^\/api\/sponsor\/challenges\/([^/]+)\/refund$/);
   if(method==='POST'&&refund){
    this.require(user,'sponsor');if(config.mode!=='testnet')return fail(409,'PREVIEW_ONLY','Campaign transactions are unavailable in demo mode.');const input=z.object({txHash:hashSchema}).strict().parse(body);const c=this.challenge(s,refund[1]!);
    if(c.sponsor!==wallet)return fail(403,'FORBIDDEN','Only this campaign sponsor can attach a refund.');
    if(!c.contractChallengeId||c.vaultAddress?.toLowerCase()!==chain.vaultAddress?.toLowerCase())return fail(409,'CHALLENGE_UNAVAILABLE','This campaign has no matching vault funding.');
    if(c.refundTxHash===input.txHash)return {body:c};if(c.refundTxHash)return fail(409,'ALREADY_REFUNDED','This campaign already has a confirmed refund.');
    const result=await chain.refund(input.txHash as Hex,c);Object.assign(c,{status:'refunded',refundTxHash:input.txHash,refundedAmount:result.amount});
    this.audit(s,wallet,'challenge.refunded',c.id);return {body:c};
   }
   if(method==='POST'&&path==='/api/game/sessions'){
    const input=sessionSchema.parse(body);this.active(s,input.challengeId);
    if(Object.values(s.games).filter(g=>g.wallet===wallet&&g.state.expiresAt>this.now()&&!g.reportId).length>=3)return fail(429,'SESSION_LIMIT','Finish or wait for an existing session before starting another.');
    const id=randomUUID(),state=createGameState(this.now());s.games[id]={id,wallet,challengeId:input.challengeId,state,events:[]};return {body:{sessionId:id,startedAt:new Date(state.createdAt).toISOString(),expiresAt:new Date(state.expiresAt).toISOString(),levelConfig:LEVEL,version:'1',serverState:state}};
   }
   const gamePath=path.match(/^\/api\/game\/sessions\/([^/]+)$/);
   if(method==='GET'&&gamePath){const g=s.games[gamePath[1]!];if(!g||g.wallet!==wallet)return fail(404,'NOT_FOUND','Game session not found.');return {body:{sessionId:g.id,serverState:g.state,serverNow:this.now(),report:g.reportId?s.reports[g.reportId]:undefined}};}
   if(method==='POST'&&path==='/api/game/events'){
    const input=eventSchema.parse(body);const g=s.games[input.sessionId];if(!g||g.wallet!==wallet)return fail(404,'NOT_FOUND','Game session not found.');this.active(s,g.challengeId);
    try{g.state=applyGameEvent(g.state,input.kind,input.seq,this.now());}catch(e){if(e instanceof GameRuleError)return fail(409,e.code,'This game action cannot be accepted. Refresh the session or start a new round.');throw e;}
    g.events.push({seq:input.seq,kind:input.kind,at:this.now()});return {body:{accepted:true,nextSeq:g.state.seq+1,serverState:g.state,serverNow:this.now()}};
   }
   if(method==='POST'&&path==='/api/game/reports'){
    const input=reportSchema.parse(body);const g=s.games[input.sessionId];if(!g||g.wallet!==wallet)return fail(404,'NOT_FOUND','Game session not found.');
    if(g.reportId){const r=s.reports[g.reportId]!;return {body:{reportId:r.id,status:r.status,xp:r.xp,reason:r.reason}};}
    this.active(s,g.challengeId);const verdict=evaluateReport(g.state,input.bugCode,this.now());
    const alreadyCredited=Object.values(s.reports).some(r=>r.wallet===wallet&&r.challengeId===g.challengeId&&r.status==='accepted');
    const id=randomUUID();const r={id,challengeId:g.challengeId,sessionId:g.id,wallet,...verdict,xp:alreadyCredited?0:verdict.xp,evidence:input.evidence,proofHash:proof({session:g.id,events:g.events,bugCode:input.bugCode,evidence:input.evidence}),reviewStatus:'pending' as const};s.reports[id]=r;g.reportId=id;g.state.status='submitted';this.audit(s,wallet,'report.submitted',id);return {body:{reportId:id,status:r.status,xp:r.xp,reason:r.reason}};
   }
   if(method==='POST'&&path==='/api/dev/submissions'){
    const input=z.object({challengeId:idSchema,commitRef:z.literal('fixture-v1'),patchId:z.enum(['broken-v1','fixed-v1'])}).strict().parse(body);this.active(s,input.challengeId);
    const existing=Object.values(s.submissions).find(d=>d.wallet===wallet&&d.challengeId===input.challengeId&&d.patchId===input.patchId);if(existing)return {body:{submissionId:existing.id,status:existing.status}};
    const result=await (this.options.patch??checkPatch)(input.patchId);const id=randomUUID();s.submissions[id]={id,wallet,...input,status:result.passed?'needs_review':'failed',testOutput:result.testOutput,proofHash:result.proofHash,reviewStatus:'pending'};this.audit(s,wallet,'fix.tested',id);return {body:{submissionId:id,status:s.submissions[id]!.status}};
   }
   if(method==='GET'&&path==='/api/dev/submissions')return {body:{items:Object.values(s.submissions).filter(d=>d.wallet===wallet)}};
   if(method==='GET'&&path==='/api/verifier/queue'){this.require(user,'verifier');return {body:{reports:Object.values(s.reports).map(r=>({...r,events:s.games[r.sessionId]?.events??[]})),submissions:Object.values(s.submissions)}};}
   const approvalPath=path.match(/^\/api\/verifier\/(reports|submissions)\/([^/]+)\/approve$/);
   if(method==='POST'&&approvalPath){
    this.require(user,'verifier');const type=approvalPath[1]!,id=approvalPath[2]!;const finding=type==='reports'?s.reports[id]:s.submissions[id];if(!finding)return fail(404,'NOT_FOUND','Review item not found.');this.active(s,finding.challengeId);
    if(type==='reports'&&finding.status!=='accepted'||type==='submissions'&&finding.status!=='needs_review'&&finding.status!=='passed')return fail(409,'TESTS_FAILED','Only validated findings and passing controlled fixes can be approved.');
    const role=type==='reports'?'FINDER':'DEVELOPER';const existing=Object.values(s.claims).find(c=>c.challengeId===finding.challengeId&&c.role===role);
    if(existing){if(existing.wallet!==finding.wallet||existing.proofHash!==finding.proofHash)return fail(409,'AWARD_RESERVED','This campaign award is already reserved for another approved contribution.');return {body:{claimId:existing.id,status:existing.status}};}
    const claimId=randomUUID();s.claims[claimId]={id:claimId,challengeId:finding.challengeId,wallet:finding.wallet,role,amount:role==='FINDER'?PRIZES.finder:PRIZES.developer,proofHash:finding.proofHash,status:'eligible',reviewer:wallet};finding.reviewStatus='approved';if(type==='submissions')s.submissions[id]!.status='passed';this.audit(s,wallet,'review.approved',id);return {body:{claimId,status:'eligible'}};
   }
   if(method==='GET'&&path==='/api/rewards'){
    const claims=Object.values(s.claims).filter(c=>c.wallet===wallet);for(const c of claims)await this.reconcile(c,s);return {body:{items:claims.map(publicClaim)}};
   }
   if(method==='POST'&&path==='/api/claims/prepare'){
    const input=z.object({challengeId:idSchema,role:roleSchema}).strict().parse(body);const challenge=this.active(s,input.challengeId);
    const c=Object.values(s.claims).find(c=>c.challengeId===input.challengeId&&c.role===input.role&&c.wallet===wallet);if(!c)return fail(403,'NOT_ELIGIBLE','An authorized review must approve your contribution first.');await this.reconcile(c,s);
    if(c.status==='claimed')return fail(409,'ALREADY_CLAIMED','This reward has already been claimed.');if(c.status==='tx_pending')return fail(409,'TX_PENDING','Wait for the submitted claim transaction.');
    if(!c.approval||Number(c.approval.deadline)*1000<=this.now()){
     const approval:Approval={challengeId:challenge.contractChallengeId!,role:c.role==='FINDER'?0:1,claimant:wallet,amount:c.amount,proofHash:c.proofHash,nonce:BigInt(`0x${randomBytes(24).toString('hex')}`).toString(),deadline:Math.min(challenge.expiry,Math.floor(this.now()/1000)+600).toString()};
     c.signature=await chain.sign(approval);c.approval=approval;c.status='approval_prepared';this.audit(s,wallet,'claim.prepared',c.id);
    }
    return {body:{claimId:c.id,approval:c.approval,signature:c.signature,chainId:CHAIN_ID,verifyingContract:chain.vaultAddress}};
   }
   const transactionPath=path.match(/^\/api\/claims\/([^/]+)\/transaction$/);
   if(method==='POST'&&transactionPath){
    const input=z.object({txHash:hashSchema}).strict().parse(body);const c=s.claims[transactionPath[1]!];if(!c||c.wallet!==wallet)return fail(404,'NOT_FOUND','Claim not found.');if(!c.approval)return fail(409,'NOT_PREPARED','Prepare the approved claim before submitting a transaction.');
    if(c.status==='claimed'){if(c.txHash!==input.txHash)return fail(409,'ALREADY_CLAIMED','The claim already has a confirmed transaction.');return {body:publicClaim(c)};}
    c.txHash=input.txHash as Hex;c.status='tx_pending';delete c.transactionError;await this.reconcile(c,s);return {body:publicClaim(c)};
   }
   const claimPath=path.match(/^\/api\/claims\/([^/]+)$/);
   if(method==='GET'&&claimPath){const c=s.claims[claimPath[1]!];if(!c||c.wallet!==wallet)return fail(404,'NOT_FOUND','Claim not found.');await this.reconcile(c,s);return {body:publicClaim(c)};}
   return fail(404,'NOT_FOUND','This API route does not exist.');
  });
 }
 private async reconcile(c:Claim,s:State){
  if(c.status==='claimed')return;
  if(c.txHash){
   try{
    const result=await this.options.chain.claimReceipt(c.txHash,c);
    if(result==='confirmed'){c.status='claimed';delete c.transactionError;}
    if(result==='reverted'){c.status='approval_prepared';c.transactionError='TX_REVERTED';delete c.txHash;}
   }catch(e){
    if(e instanceof ApiError&&e.statusCode===422){c.status='approval_prepared';c.transactionError='INVALID_CLAIM_TX';delete c.txHash;}
    // A missing receipt or RPC error is never confirmation. Keep the transaction pending.
   }
  }
  const challenge=s.challenges[c.challengeId];
  if(c.status!=='claimed'&&c.status!=='tx_pending'&&(challenge?.expiry*1000<=this.now()||c.approval&&Number(c.approval.deadline)*1000<=this.now()))c.status='expired';
  const awards=Object.values(s.claims).filter(x=>x.challengeId===c.challengeId);
  if(challenge&&awards.some(x=>x.role==='FINDER'&&x.status==='claimed')&&awards.some(x=>x.role==='DEVELOPER'&&x.status==='claimed'))challenge.status='settled';
 }
}
