import test from 'node:test';
import assert from 'node:assert/strict';
import {custom,decodeFunctionData,encodeFunctionResult,encodeEventTopics,encodeAbiParameters,recoverTypedDataAddress,erc20Abi,zeroAddress,type Hex} from 'viem';
import {generatePrivateKey,privateKeyToAccount} from 'viem/accounts';
import {vaultAbi as abi} from '@fyx/chain';
import {CHAIN_ID,TEST_USDC_ADDRESS,claimTypes} from '@fyx/shared';
import {chainGateway} from '../src/chain.js';
import {ApiError,type Approval,type Claim} from '../src/model.js';
import {harness,TEST_HASH,TEST_VAULT} from './helpers.js';

function rpcFixture(){
 const key=generatePrivateKey(),signer=privateKeyToAccount(key);const h=harness();
 const state={chainId:CHAIN_ID as number,token:TEST_USDC_ADDRESS as string,verifier:signer.address as string,treasury:h.other.address as string,decimals:6,head:101n,timestamp:BigInt(Math.floor(h.now()/1000)),expiry:BigInt(Math.floor(h.now()/1000)+3600),nonceUsed:false,finderClaimed:false,refunded:false};
 const receipt={blockHash:TEST_HASH,blockNumber:'0x64',transactionHash:TEST_HASH,transactionIndex:'0x0',from:h.player.address,to:TEST_VAULT,cumulativeGasUsed:'0x123',gasUsed:'0x123',logs:[] as any[],logsBloom:`0x${'00'.repeat(256)}`,status:'0x1',type:'0x2',effectiveGasPrice:'0x1',contractAddress:null};
 const gateway=chainGateway({rpcUrl:'http://unused.test',vaultAddress:TEST_VAULT,verifierKey:key},custom({request:async({method,params})=>{
  if(method==='eth_chainId')return `0x${state.chainId.toString(16)}`;
  if(method==='eth_blockNumber')return `0x${state.head.toString(16)}`;
  if(method==='eth_getTransactionReceipt')return receipt;
  if(method==='eth_getBlockByNumber')return {number:'0x65',timestamp:`0x${state.timestamp.toString(16)}`,transactions:[]};
  if(method==='eth_call'){
   const [call]=params as [{data:Hex}];const decoded=decodeFunctionData({abi:[...abi,...erc20Abi],data:call.data});
   if(decoded.functionName==='token')return encodeFunctionResult({abi,functionName:'token',result:state.token as Hex});
   if(decoded.functionName==='verifier')return encodeFunctionResult({abi,functionName:'verifier',result:state.verifier as Hex});
   if(decoded.functionName==='treasury')return encodeFunctionResult({abi,functionName:'treasury',result:state.treasury as Hex});
   if(decoded.functionName==='CHAIN_ID')return encodeFunctionResult({abi,functionName:'CHAIN_ID',result:BigInt(state.chainId)});
   if(decoded.functionName==='decimals')return encodeFunctionResult({abi:erc20Abi,functionName:'decimals',result:state.decimals});
   if(decoded.functionName==='usedNonces')return encodeFunctionResult({abi,functionName:'usedNonces',result:state.nonceUsed});
   if(decoded.functionName==='challenges')return encodeFunctionResult({abi,functionName:'challenges',result:[h.sponsor.address,state.expiry,20000000n,state.finderClaimed,false,state.refunded]});
  }
  throw new Error(`Unexpected fixture RPC method ${method}`);
 }}));
 const addLog=(topics:readonly unknown[],data:Hex,address=TEST_VAULT)=>{receipt.logs=[{address,topics,data,blockHash:TEST_HASH,blockNumber:'0x64',transactionHash:TEST_HASH,transactionIndex:'0x0',logIndex:'0x0',removed:false}];};
 return {h,state,receipt,gateway,signer,addLog};
}
const hasCode=(code:string)=>(e:unknown)=>e instanceof ApiError&&e.code===code;

test('testnet readiness validates token decimals, signer and treasury before accepting traffic',async()=>{
 const f=rpcFixture();await f.gateway.ready();
 f.state.decimals=18;await assert.rejects(f.gateway.ready(),hasCode('WRONG_TOKEN'));
 f.state.decimals=6;f.state.verifier=f.h.other.address;await assert.rejects(f.gateway.ready(),hasCode('SIGNER_MISMATCH'));
 f.state.verifier=f.signer.address;f.state.treasury=zeroAddress;await assert.rejects(f.gateway.ready(),hasCode('INVALID_DEPLOYMENT'));
});

test('signer rejects expired chain state, reused nonces and authorizations outside campaign limits',async()=>{
 const f=rpcFixture();const a:Approval={challengeId:'1',role:0,claimant:f.h.player.address,amount:'4000000',proofHash:TEST_HASH,nonce:'1',deadline:(f.state.timestamp+600n).toString()};
 await assert.rejects(f.gateway.sign({...a,role:2 as 0}),hasCode('INVALID_ROLE'));
 await assert.rejects(f.gateway.sign({...a,amount:'14000000'}),hasCode('WRONG_AMOUNT'));
 f.state.nonceUsed=true;await assert.rejects(f.gateway.sign(a),hasCode('NONCE_USED'));
 f.state.nonceUsed=false;
 await assert.rejects(f.gateway.sign({...a,deadline:f.state.timestamp.toString()}),hasCode('CLAIM_EXPIRED'));
 await assert.rejects(f.gateway.sign({...a,deadline:(f.state.expiry+1n).toString()}),hasCode('CLAIM_EXPIRED'));
 f.state.timestamp=f.state.expiry;await assert.rejects(f.gateway.sign(a),hasCode('CHALLENGE_UNAVAILABLE'));
});

test('chain gateway rejects wrong chain/token and signs only the configured verifier with fixed typed domain',async()=>{
 const f=rpcFixture();const a:Approval={challengeId:'1',role:0,claimant:f.h.player.address,amount:'4000000',proofHash:TEST_HASH,nonce:'1',deadline:String(Math.floor(f.h.now()/1000)+600)};
 f.state.chainId=143;await assert.rejects(f.gateway.sign(a),hasCode('WRONG_CHAIN'));
 f.state.chainId=CHAIN_ID;f.state.token=TEST_VAULT;await assert.rejects(f.gateway.sign(a),hasCode('WRONG_TOKEN'));
 f.state.token=TEST_USDC_ADDRESS;f.state.verifier=f.h.other.address;await assert.rejects(f.gateway.sign(a),hasCode('SIGNER_MISMATCH'));
 f.state.verifier=f.signer.address;
 const signature=await f.gateway.sign(a);
 const recovered=await recoverTypedDataAddress({domain:{name:'FYXRewardVault',version:'1',chainId:CHAIN_ID,verifyingContract:TEST_VAULT},types:claimTypes,primaryType:'Claim',message:{...a,challengeId:1n,amount:4000000n,nonce:1n,deadline:BigInt(a.deadline)},signature});assert.equal(recovered,f.signer.address);
 f.state.finderClaimed=true;await assert.rejects(f.gateway.sign(a),hasCode('ALREADY_CLAIMED'));
 f.state.finderClaimed=false;f.state.refunded=true;await assert.rejects(f.gateway.sign(a),hasCode('CHALLENGE_UNAVAILABLE'));
});

test('funding receipt must have two confirmations and match sponsor, vault, immutable deposit and expiry',async()=>{
 const f=rpcFixture(),c=await f.h.campaign();f.receipt.from=c.sponsor;
 const topics=encodeEventTopics({abi,eventName:'ChallengeCreated',args:{challengeId:1n,sponsor:c.sponsor}});
 const data=(deposit=20000000n,expiry=BigInt(c.expiry))=>encodeAbiParameters([{type:'uint64'},{type:'uint256'}],[expiry,deposit]);
 f.addLog(topics,data());f.state.head=100n;await assert.rejects(f.gateway.funding(TEST_HASH,c),hasCode('TX_PENDING'));
 f.state.head=101n;assert.deepEqual(await f.gateway.funding(TEST_HASH,c),{contractChallengeId:'1'});
 f.addLog(topics,data(19000000n));await assert.rejects(f.gateway.funding(TEST_HASH,c),hasCode('INVALID_FUNDING'));
 f.addLog(topics,data(20000000n,BigInt(c.expiry)+1n));await assert.rejects(f.gateway.funding(TEST_HASH,c),hasCode('INVALID_FUNDING'));
 f.addLog(topics,data());f.receipt.from=f.h.other.address;await assert.rejects(f.gateway.funding(TEST_HASH,c),hasCode('INVALID_FUNDING'));
});

test('claim reconciliation requires exact event recipient, role, amount, proof and campaign',async()=>{
 const f=rpcFixture();const approval:Approval={challengeId:'1',role:0,claimant:f.h.player.address,amount:'4000000',proofHash:TEST_HASH,nonce:'1',deadline:'9999999999'};
 const claim:Claim={id:'claim',challengeId:'campaign',wallet:f.h.player.address,role:'FINDER',amount:'4000000',proofHash:TEST_HASH,status:'tx_pending',reviewer:f.h.reviewer.address,approval};
 const topics=encodeEventTopics({abi,eventName:'RewardClaimed',args:{challengeId:1n,role:0,claimant:claim.wallet}});
 const data=(amount=4000000n,proof=TEST_HASH)=>encodeAbiParameters([{type:'uint256'},{type:'bytes32'}],[amount,proof]);
 f.addLog(topics,data());assert.equal(await f.gateway.claimReceipt(TEST_HASH,claim),'confirmed');
 f.state.head=100n;assert.equal(await f.gateway.claimReceipt(TEST_HASH,claim),'pending');f.state.head=101n;
 f.receipt.status='0x0';assert.equal(await f.gateway.claimReceipt(TEST_HASH,claim),'reverted');f.receipt.status='0x1';
 f.addLog(topics,data(14000000n));await assert.rejects(f.gateway.claimReceipt(TEST_HASH,claim),hasCode('INVALID_CLAIM_TX'));
 f.addLog(topics,data(4000000n,`0x${'23'.repeat(32)}`));await assert.rejects(f.gateway.claimReceipt(TEST_HASH,claim),hasCode('INVALID_CLAIM_TX'));
 f.addLog(encodeEventTopics({abi,eventName:'RewardClaimed',args:{challengeId:2n,role:0,claimant:claim.wallet}}),data());await assert.rejects(f.gateway.claimReceipt(TEST_HASH,claim),hasCode('INVALID_CLAIM_TX'));
 f.addLog(topics,data(),f.h.other.address);await assert.rejects(f.gateway.claimReceipt(TEST_HASH,claim),hasCode('INVALID_CLAIM_TX'));
});

test('refund receipt must match the funded challenge and sponsor',async()=>{
 const f=rpcFixture(),c=await f.h.campaign();f.receipt.from=c.sponsor;
 const topics=encodeEventTopics({abi,eventName:'UnspentRefunded',args:{challengeId:1n,sponsor:c.sponsor}});
 f.addLog(topics,encodeAbiParameters([{type:'uint256'}],[16000000n]));assert.deepEqual(await f.gateway.refund(TEST_HASH,c),{amount:'16000000'});
 f.receipt.from=f.h.other.address;await assert.rejects(f.gateway.refund(TEST_HASH,c),hasCode('INVALID_REFUND'));
});
