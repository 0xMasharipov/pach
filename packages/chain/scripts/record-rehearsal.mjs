import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeFunctionResult,decodeErrorResult,decodeEventLog,parseTransaction,keccak256,formatEther} from 'viem';

const root=fileURLToPath(new URL('../',import.meta.url));
const privateRoot=resolve(root,'../../.data/monad');
const rehearsal=resolve(privateRoot,'rehearsal');
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const deployment=json(resolve(root,'deployments/10143.json'));
const manifest=json(resolve(privateRoot,'addresses.json'));
const abi=json(resolve(root,'abi/FYXRewardVault.json'));
const tokenAbi=json(resolve(privateRoot,'test-usdc-abi.json'));
const campaigns=json(resolve(rehearsal,'campaigns.json'));
const approvals=json(resolve(rehearsal,'approvals.json'));
const plan=json(resolve(rehearsal,'plan.json'));
const rpc=name=>{const x=json(resolve(rehearsal,'final-state',name+'.json'));if(x.error||x.result===undefined)throw new Error('Missing final RPC state: '+name);return x.result;};
const vaultRead=(file,name=file)=>decodeFunctionResult({abi,functionName:name,data:rpc(file)});
const head=BigInt(rpc('head'));
const actions=['mint-test-usdc','approve-campaigns','fund-finder-gas','fund-developer-gas','create-settlement-campaign','create-refund-campaign','claim-finder','claim-developer','refund-unspent'];
const receipts={},transactions={};
let gasCost=0n;
for(const name of actions){
  const dir=resolve(rehearsal,name),result=json(resolve(dir,'result.json'));
  const raw=json(resolve(dir,'broadcast-request.json')).params[0],signed=parseTransaction(raw);
  const receipt=json(resolve(dir,'receipt.json')).result;
  if(keccak256(raw)!==result.hash||signed.chainId!==10143||signed.to.toLowerCase()!==plan[name].to.toLowerCase()||(signed.data||'0x').toLowerCase()!==(plan[name].data||'0x').toLowerCase()||(signed.value??0n)!==BigInt(plan[name].value||'0'))throw new Error('Signed rehearsal action mismatch: '+name);
  if(!receipt||BigInt(receipt.status)!==1n||receipt.transactionHash!==result.hash||receipt.from.toLowerCase()!==manifest[plan[name].actor].address.toLowerCase()||receipt.to.toLowerCase()!==signed.to.toLowerCase()||head<BigInt(receipt.blockNumber)+1n)throw new Error('Unconfirmed rehearsal receipt: '+name);
  receipts[name]=receipt;transactions[name]=result;
  gasCost+=BigInt(receipt.gasUsed)*BigInt(receipt.effectiveGasPrice);
}
const event=(action,eventName,address,contractAbi=abi)=>{
  const found=[];
  for(const log of receipts[action].logs){
    if(log.address.toLowerCase()!==address.toLowerCase())continue;
    try{const decoded=decodeEventLog({abi:contractAbi,data:log.data,topics:log.topics});if(decoded.eventName===eventName)found.push(decoded.args);}catch{}
  }
  if(found.length!==1)throw new Error(`Expected one ${eventName} event for ${action}.`);
  return found[0];
};
for(const role of ['finder','developer']){
  const claim=event('claim-'+role,'RewardClaimed',deployment.vaultAddress),approval=approvals[role];
  if(claim.challengeId!==BigInt(campaigns.settlement.id)||claim.role!==(role==='finder'?0:1)||claim.claimant.toLowerCase()!==manifest[role].address.toLowerCase()||claim.amount!==BigInt(approval.amount)||claim.proofHash!==approval.proofHash||vaultRead('nonce-'+role,'usedNonces')!==true)throw new Error('Reward event or nonce mismatch: '+role);
  if(role==='finder'){
    const transfer=event('claim-finder','Transfer',deployment.testUsdcAddress,tokenAbi);
    if(transfer.from.toLowerCase()!==deployment.vaultAddress.toLowerCase()||transfer.to.toLowerCase()!==manifest.finder.address.toLowerCase()||transfer.value!==4000000n)throw new Error('Finder token transfer mismatch.');
  }
}
const developerTransfers=receipts['claim-developer'].logs.filter(log=>log.address.toLowerCase()===deployment.testUsdcAddress.toLowerCase()).flatMap(log=>{try{const decoded=decodeEventLog({abi:tokenAbi,data:log.data,topics:log.topics});return decoded.eventName==='Transfer'?[decoded.args]:[];}catch{return [];}});
if(developerTransfers.length!==2||!developerTransfers.some(t=>t.from.toLowerCase()===deployment.vaultAddress.toLowerCase()&&t.to.toLowerCase()===manifest.developer.address.toLowerCase()&&t.value===14000000n)||!developerTransfers.some(t=>t.from.toLowerCase()===deployment.vaultAddress.toLowerCase()&&t.to.toLowerCase()===deployment.treasury.toLowerCase()&&t.value===2000000n))throw new Error('Developer/treasury token transfers do not match the atomic split.');
const fee=event('claim-developer','PlatformFeePaid',deployment.vaultAddress);
if(fee.challengeId!==BigInt(campaigns.settlement.id)||fee.treasury.toLowerCase()!==deployment.treasury.toLowerCase()||fee.amount!==2000000n)throw new Error('Platform fee was not paid atomically with the developer claim.');
const refund=event('refund-unspent','UnspentRefunded',deployment.vaultAddress);
if(refund.challengeId!==BigInt(campaigns.refund.id)||refund.sponsor.toLowerCase()!==manifest.deployer.address.toLowerCase()||refund.amount!==20000000n)throw new Error('Expired campaign refund mismatch.');
const totals=Object.fromEntries(['totalDeposited','totalClaimed','totalFeesPaid','totalRefunded','totalEscrow'].map(name=>[name,vaultRead(name)]));
if(totals.totalDeposited!==40000000n||totals.totalClaimed!==18000000n||totals.totalFeesPaid!==2000000n||totals.totalRefunded!==20000000n||totals.totalEscrow!==0n||totals.totalDeposited!==totals.totalClaimed+totals.totalFeesPaid+totals.totalRefunded+totals.totalEscrow)throw new Error('Rehearsal accounting does not conserve the funded tokens.');
const tokenBalances=Object.fromEntries(['finder','developer','sponsor','vault'].map(name=>[name,decodeFunctionResult({abi:tokenAbi,functionName:'balanceOf',data:rpc('token-'+name)})]));
if(tokenBalances.finder!==4000000n||tokenBalances.developer!==14000000n||tokenBalances.sponsor!==22000000n||tokenBalances.vault!==0n)throw new Error('Final test token balances differ from the funded split/refund.');
const settled=vaultRead('settlement-campaign','challenges'),refunded=vaultRead('refund-campaign','challenges');
if(settled[2]!==0n||!settled[3]||!settled[4]||settled[5]||refunded[2]!==0n||!refunded[5])throw new Error('Final campaign flags differ from settlement/refund.');
const replay=json(resolve(rehearsal,'final-state/replay-finder.json'));
const replayData=typeof replay.error?.data==='string'?replay.error.data:replay.error?.data?.data;
if(!replayData||decodeErrorResult({abi,data:replayData}).errorName!=='NonceUsed')throw new Error('Repeated claim was not rejected for its used nonce.');
const deploymentReceipt=json(resolve(privateRoot,'deployment-rpc/receipt.json')).result;
gasCost+=BigInt(deploymentReceipt.gasUsed)*BigInt(deploymentReceipt.effectiveGasPrice);
const nativeBalances=Object.fromEntries(['deployer','finder','developer'].map(role=>[role,formatEther(BigInt(rpc('mon-'+role)))]));
const report={chainId:10143,vaultAddress:deployment.vaultAddress,recordedAt:new Date().toISOString(),kind:'controlled-contract-rehearsal',scope:'Real testnet transactions using isolated test actors and synthetic approvals. This is not an HTTP/PostgreSQL or production report-review acceptance test.',sourceVerified:deployment.sourceVerified,actors:{sponsor:manifest.deployer.address,treasury:deployment.treasury,finder:manifest.finder.address,developer:manifest.developer.address,verifier:deployment.verifier},campaigns,transactions,totals,tokenBalances,nativeBalances,gasCostIncludingDeploymentMon:formatEther(gasCost),replay:{method:'eth_call',broadcast:false,result:'NonceUsed'},confirmations:2};
writeFileSync(resolve(root,'deployments/rehearsal-10143.json'),JSON.stringify(report,(_,v)=>typeof v==='bigint'?v.toString():v,2)+'\n');
console.log('Recorded receipt-backed settlement/refund/replay rehearsal. Total gas MON:',formatEther(gasCost));
