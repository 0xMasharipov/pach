import {createPublicClient,http,decodeEventLog,getAddress,erc20Abi,zeroAddress,type Address,type Hex,type Transport} from 'viem';
import {privateKeyToAccount} from 'viem/accounts';
import {monadTestnet} from 'viem/chains';
import {CHAIN_ID,TEST_USDC_ADDRESS,TRANSACTION_CONFIRMATIONS,TOKEN_DECIMALS,PRIZES,claimTypes} from '@fyx/shared';
import {vaultAbi as abi} from '@fyx/chain';
import {ApiError,type Approval,type Challenge,type Claim} from './model.js';
export interface ChainGateway {
 vaultAddress:Address|null;
 ready():Promise<void>;
 funding(hash:Hex,challenge:Challenge):Promise<{contractChallengeId:string}>;
 refund(hash:Hex,challenge:Challenge):Promise<{amount:string}>;
 claimReceipt(hash:Hex,claim:Claim):Promise<'pending'|'reverted'|'confirmed'>;
 sign(approval:Approval):Promise<Hex>;
}
export function chainGateway(config:{rpcUrl:string;vaultAddress?:Address;verifierKey?:Hex},transport?:Transport):ChainGateway{
 const client=createPublicClient({chain:monadTestnet,transport:transport??http(config.rpcUrl,{timeout:10000,retryCount:1})});
 const vault=config.vaultAddress;
 async function check(){
  if(!vault)throw new ApiError(503,'VAULT_UNAVAILABLE','Testnet rewards are not configured.');
  if(await client.getChainId()!==CHAIN_ID)throw new ApiError(503,'WRONG_CHAIN','The configured RPC is not Monad Testnet.');
  const token=await client.readContract({address:vault,abi,functionName:'token'});
  if(getAddress(token)!==getAddress(TEST_USDC_ADDRESS))throw new ApiError(503,'WRONG_TOKEN','The vault token does not match test USDC.');
  return vault;
 }
 async function receipt(hash:Hex){
  const r=await client.getTransactionReceipt({hash});
  if(await client.getBlockNumber({cacheTime:0})<r.blockNumber+BigInt(TRANSACTION_CONFIRMATIONS-1))throw new ApiError(409,'TX_PENDING','Waiting for two block confirmations.');
  return r;
 }
 return {
  vaultAddress:vault??null,
  async ready(){
   const address=await check();
   if(!config.verifierKey)throw new ApiError(503,'SIGNER_UNAVAILABLE','The authorized verifier signer is not configured.');
   const [decimals,verifier,treasury,chainId]=await Promise.all([
    client.readContract({address:TEST_USDC_ADDRESS,abi:erc20Abi,functionName:'decimals'}),
    client.readContract({address,abi,functionName:'verifier'}),
    client.readContract({address,abi,functionName:'treasury'}),
    client.readContract({address,abi,functionName:'CHAIN_ID'}),
   ]);
   if(decimals!==TOKEN_DECIMALS)throw new ApiError(503,'WRONG_TOKEN','The reward token must use six decimals.');
   if(getAddress(verifier)!==privateKeyToAccount(config.verifierKey).address)throw new ApiError(503,'SIGNER_MISMATCH','The configured signer is not the vault verifier.');
   if(treasury===zeroAddress||chainId!==BigInt(CHAIN_ID))throw new ApiError(503,'INVALID_DEPLOYMENT','The vault deployment is not configured for Monad Testnet.');
  },
  async funding(hash,challenge){
   const address=await check();const r=await receipt(hash);
   if(r.status!=='success'||r.to?.toLowerCase()!==address.toLowerCase()||r.from.toLowerCase()!==challenge.sponsor.toLowerCase())throw new ApiError(422,'INVALID_FUNDING','Funding transaction does not match this sponsor and vault.');
   for(const log of r.logs){
    if(log.address.toLowerCase()!==address.toLowerCase())continue;
    try{const e=decodeEventLog({abi,eventName:'ChallengeCreated',data:log.data,topics:log.topics});
     if(e.args.sponsor.toLowerCase()===challenge.sponsor.toLowerCase()&&Number(e.args.expiry)===challenge.expiry&&e.args.deposit===20_000_000n)return {contractChallengeId:e.args.challengeId.toString()};
    }catch{/* unrelated event */}
   }
   throw new ApiError(422,'INVALID_FUNDING','No matching confirmed challenge funding event was found.');
  },
  async refund(hash,challenge){
   const address=await check();const r=await receipt(hash);
   if(r.status!=='success'||r.to?.toLowerCase()!==address.toLowerCase()||r.from.toLowerCase()!==challenge.sponsor.toLowerCase())throw new ApiError(422,'INVALID_REFUND','Refund transaction does not match this sponsor and vault.');
   for(const log of r.logs){
    if(log.address.toLowerCase()!==address.toLowerCase())continue;
    try{const e=decodeEventLog({abi,eventName:'UnspentRefunded',data:log.data,topics:log.topics});
     if(e.args.challengeId.toString()===challenge.contractChallengeId&&e.args.sponsor.toLowerCase()===challenge.sponsor.toLowerCase()&&e.args.amount>0n&&e.args.amount<=20_000_000n)return {amount:e.args.amount.toString()};
    }catch{/* unrelated event */}
   }
   throw new ApiError(422,'INVALID_REFUND','No matching confirmed refund event was found.');
  },
  async claimReceipt(hash,claim){
   const address=await check();
   let r;
   try{r=await receipt(hash);}catch(e){if(e instanceof ApiError&&e.code==='TX_PENDING')return 'pending';throw e;}
   if(r.to?.toLowerCase()!==address.toLowerCase()||r.from.toLowerCase()!==claim.wallet.toLowerCase())throw new ApiError(422,'INVALID_CLAIM_TX','The transaction does not match the claimant and vault.');
   if(r.status==='reverted')return 'reverted';
   for(const log of r.logs){
    if(log.address.toLowerCase()!==address.toLowerCase())continue;
    try{const e=decodeEventLog({abi,eventName:'RewardClaimed',data:log.data,topics:log.topics});
     if(e.args.challengeId.toString()===claim.approval?.challengeId&&e.args.role===(claim.role==='FINDER'?0:1)&&e.args.claimant.toLowerCase()===claim.wallet.toLowerCase()&&e.args.amount.toString()===claim.amount&&e.args.proofHash.toLowerCase()===claim.proofHash.toLowerCase())return 'confirmed';
    }catch{/* unrelated event */}
   }
   throw new ApiError(422,'INVALID_CLAIM_TX','No matching reward event was found.');
  },
  async sign(approval){
   if(approval.role!==0&&approval.role!==1)throw new ApiError(422,'INVALID_ROLE','Unknown reward role.');
   if(approval.amount!==(approval.role===0?PRIZES.finder:PRIZES.developer))throw new ApiError(422,'WRONG_AMOUNT','The authorization must use the fixed campaign award.');
   const address=await check();
   if(!config.verifierKey)throw new ApiError(503,'SIGNER_UNAVAILABLE','The authorized verifier signer is not configured.');
   const account=privateKeyToAccount(config.verifierKey);
   const verifier=await client.readContract({address,abi,functionName:'verifier'});
   if(getAddress(verifier)!==account.address)throw new ApiError(503,'SIGNER_MISMATCH','The configured signer is not the vault verifier.');
   const campaign=await client.readContract({address,abi,functionName:'challenges',args:[BigInt(approval.challengeId)]});
   if(campaign[0]==='0x0000000000000000000000000000000000000000'||campaign[5])throw new ApiError(409,'CHALLENGE_UNAVAILABLE','This campaign is no longer available for claims.');
   if(approval.role===0?campaign[3]:campaign[4])throw new ApiError(409,'ALREADY_CLAIMED','This campaign award has already been claimed.');
   const [block,nonceUsed]=await Promise.all([
    client.getBlock({blockTag:'latest'}),
    client.readContract({address,abi,functionName:'usedNonces',args:[BigInt(approval.nonce)]}),
   ]);
   if(block.timestamp>=campaign[1])throw new ApiError(409,'CHALLENGE_UNAVAILABLE','This campaign has expired on-chain.');
   if(BigInt(approval.deadline)<=block.timestamp||BigInt(approval.deadline)>campaign[1])throw new ApiError(409,'CLAIM_EXPIRED','Prepare a new authorization within the campaign expiry.');
   if(nonceUsed)throw new ApiError(409,'NONCE_USED','This authorization nonce has already been used.');
   return account.signTypedData({domain:{name:'FYXRewardVault',version:'1',chainId:CHAIN_ID,verifyingContract:address},types:claimTypes,primaryType:'Claim',message:{...approval,challengeId:BigInt(approval.challengeId),amount:BigInt(approval.amount),nonce:BigInt(approval.nonce),deadline:BigInt(approval.deadline)}});
  }
 };
}
