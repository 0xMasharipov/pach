import {generatePrivateKey,privateKeyToAccount,type PrivateKeyAccount} from 'viem/accounts';
import type {Address,Hex} from 'viem';
import {CHAIN_ID,PRIZES,TEST_USDC_ADDRESS} from '@fyx/shared';
import {MemoryStore} from '../src/store.js';
import {Service} from '../src/service.js';
import type {Config} from '../src/config.js';
import type {ChainGateway} from '../src/chain.js';
import type {Approval,Challenge} from '../src/model.js';
export const TEST_VAULT='0x1111111111111111111111111111111111111111' as Address;
export const TEST_HASH=`0x${'12'.repeat(32)}` as Hex;
export const account=()=>privateKeyToAccount(generatePrivateKey());
/** Explicit in-memory test fixture. No addresses/hashes here represent live deployment. */
export function harness(){
 let time=Date.now();const sponsor=account(),player=account(),other=account(),reviewer=account();
 const config:Config={mode:'testnet',port:3001,origin:'http://localhost:3000',secure:false,databaseUrl:'postgres://fixture-only',rpcUrl:'http://localhost:8545',vaultAddress:TEST_VAULT,verifierKey:undefined,sponsors:[sponsor.address.toLowerCase()],verifiers:[reviewer.address.toLowerCase()],admins:[]};
 const store=new MemoryStore();const signed:Approval[]=[];
 const chain:ChainGateway={vaultAddress:TEST_VAULT,funding:async()=>({contractChallengeId:'1'}),refund:async()=>({amount:'20000000'}),claimReceipt:async()=> 'pending',sign:async approval=>{signed.push(structuredClone(approval));return `0x${'ab'.repeat(65)}`;}};
 const service=new Service({config,store,chain,now:()=>time});
 const call=async(method:string,path:string,body?:unknown,token?:string):Promise<any>=>(await service.execute(method,path,body,token)).body;
 async function login(who:PrivateKeyAccount){const {message}=await call('POST','/api/auth/nonce',{address:who.address,chainId:CHAIN_ID});return (await service.execute('POST','/api/auth/verify',{message,signature:await who.signMessage({message})})).cookie!;}
 async function campaign(){const c:Challenge={id:'campaign',slug:'campaign',title:'Test fixture checkout',description:'A controlled fixture, not a deployed campaign.',status:'open',chainId:CHAIN_ID,tokenAddress:TEST_USDC_ADDRESS,prizes:PRIZES,expiry:Math.floor(time/1000)+3600,sponsor:sponsor.address,vaultAddress:TEST_VAULT,contractChallengeId:'1',fundingTxHash:TEST_HASH};await store.transaction(s=>{s.challenges[c.id]=c;});return c;}
 return {config,store,chain,service,call,login,campaign,sponsor,player,other,reviewer,signed,now:()=>time,advance:(ms:number)=>{time+=ms;}};
}
export async function finding(h:ReturnType<typeof harness>,token:string){
 const {sessionId}=await h.call('POST','/api/game/sessions',{challengeId:'campaign',levelId:'checkout'},token);
 for(const [i,kind] of ['start','coupon_applied','coupon_applied'].entries())await h.call('POST','/api/game/events',{sessionId,seq:i+1,kind},token);
 return h.call('POST','/api/game/reports',{sessionId,bugCode:'negative_total_due_to_duplicate_coupon',evidence:'Applied the coupon twice; total became negative.'},token);
}
export async function approved(h:ReturnType<typeof harness>){await h.campaign();const token=await h.login(h.player),reviewer=await h.login(h.reviewer);const report=await finding(h,token);const {claimId}=await h.call('POST',`/api/verifier/reports/${report.reportId}/approve`,{},reviewer);return {token,reviewer,claimId,report};}
