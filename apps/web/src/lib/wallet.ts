import {createPublicClient, createWalletClient, custom, defineChain, erc20Abi, http, isAddress, type EIP1193Provider, type Hash} from 'viem';
import {vaultAbi} from '@fyx/chain';
import type {Config, PreparedClaim} from './api';
export const chain = defineChain({id:10143,name:'Monad Testnet',nativeCurrency:{name:'Test MON',symbol:'MON',decimals:18},rpcUrls:{default:{http:['https://testnet-rpc.monad.xyz']}},blockExplorers:{default:{name:'Monadscan',url:'https://testnet.monadscan.com'}},testnet:true});
export type BrowserProvider = EIP1193Provider & {on?:(event:string,listener:(...args:unknown[])=>void)=>void;removeListener?:(event:string,listener:(...args:unknown[])=>void)=>void};
declare global { interface Window { ethereum?: BrowserProvider } }
export function provider() { if (!window.ethereum) throw new Error('Open this page in an EVM wallet browser or connect using a browser wallet extension. Practice is available without a wallet.'); return window.ethereum; }
export async function connectWallet() {
  const ethereum=provider();
  const wallet=createWalletClient({transport:custom(ethereum),chain});
  const [address]=await wallet.requestAddresses();
  if (!address) throw new Error('No wallet account was selected.');
  if (await wallet.getChainId()!==chain.id) {
    try { await wallet.switchChain({id:chain.id}); }
    catch(error) { if ((error as {code?:number}).code===4902 || (error as {cause?:{code?:number}}).cause?.code===4902) { await wallet.addChain({chain}); await wallet.switchChain({id:chain.id}); } else throw new Error('Switch to Monad Testnet in your wallet to continue.'); }
  }
  if (await wallet.getChainId()!==chain.id) throw new Error('Switch to Monad Testnet to continue.');
  return {address,wallet};
}
async function clients(config:Config,address:`0x${string}`) {
  if (config.chainId!==10143 || config.mode!=='testnet' || !config.vaultAddress || !isAddress(config.vaultAddress)) throw new Error('Testnet funding and claims are not configured yet.');
  if (config.tokenAddress.toLowerCase()!=='0x56bf9cdc3c1876f3f22655a0016c2743e9e39a73') throw new Error('The reward token configuration is incorrect.');
  const wallet=createWalletClient({transport:custom(provider()),chain,account:address});
  const accounts=await wallet.getAddresses();
  if (accounts[0]?.toLowerCase()!==address.toLowerCase()) throw new Error('Your wallet account changed. Connect and sign in again.');
  if (await wallet.getChainId()!==10143) throw new Error('Switch to Monad Testnet to continue.');
  const publicClient=createPublicClient({chain,transport:http()});
  if (await publicClient.getChainId()!==10143) throw new Error('The network connection does not match Monad Testnet.');
  return {wallet,publicClient,vault:config.vaultAddress};
}
export async function fundChallenge(config:Config,address:`0x${string}`,expiry:number,onProgress:(message:string,hash?:Hash)=>void,onSubmitted?:(hash:Hash)=>void) {
  const {wallet,publicClient,vault}=await clients(config,address);
  onProgress('Approve exactly 20 test USDC in your wallet.');
  const approvalSimulation=await publicClient.simulateContract({address:config.tokenAddress,abi:erc20Abi,functionName:'approve',args:[vault,20000000n],account:address});
  const approvalHash=await wallet.writeContract(approvalSimulation.request);
  onProgress('Token approval submitted. Waiting for confirmation.',approvalHash);
  const approvalReceipt=await publicClient.waitForTransactionReceipt({hash:approvalHash});
  if (approvalReceipt.status!=='success') throw new Error('Token approval reverted. The campaign has not been funded.');
  // Recheck the wallet immediately before the second signature.
  await clients(config,address);
  onProgress('Approval confirmed. Confirm the 20 test USDC campaign deposit in your wallet.');
  const simulation=await publicClient.simulateContract({address:vault,abi:vaultAbi,functionName:'createChallenge',args:[BigInt(expiry)],account:address});
  const hash=await wallet.writeContract(simulation.request);
  onProgress('Deposit submitted. Waiting for network confirmation.',hash);
  onSubmitted?.(hash);
  const receipt=await publicClient.waitForTransactionReceipt({hash});
  if (receipt.status!=='success') throw new Error('The campaign deposit reverted. See the transaction for details.');
  return hash;
}
export async function sendClaim(config:Config,address:`0x${string}`,prepared:PreparedClaim,onProgress:(message:string,hash?:Hash)=>void,onSubmitted?:(hash:Hash)=>Promise<void>) {
  const {wallet,publicClient,vault}=await clients(config,address);
  if (prepared.chainId!==10143 || prepared.verifyingContract.toLowerCase()!==vault.toLowerCase() || prepared.approval.claimant.toLowerCase()!==address.toLowerCase()) throw new Error('Claim authorization does not match this wallet or contract.');
  const a=prepared.approval;
  const approval={...a,challengeId:BigInt(a.challengeId),amount:BigInt(a.amount),nonce:BigInt(a.nonce),deadline:BigInt(a.deadline)};
  onProgress('Confirm your testnet claim in your wallet.');
  const simulation=await publicClient.simulateContract({address:vault,abi:vaultAbi,functionName:'claim',args:[approval,prepared.signature],account:address});
  const hash=await wallet.writeContract(simulation.request);
  onProgress('Claim submitted. Waiting for network confirmation.',hash);
  await onSubmitted?.(hash);
  const receipt=await publicClient.waitForTransactionReceipt({hash});
  if (receipt.status!=='success') throw new Error('The claim transaction reverted. See the transaction for details.');
  return hash;
}
export async function refundChallenge(config:Config,address:`0x${string}`,id:string,onProgress:(message:string,hash?:Hash)=>void) {
  const {wallet,publicClient,vault}=await clients(config,address);
  onProgress('Confirm the unspent-funds refund in your wallet.');
  const simulation=await publicClient.simulateContract({address:vault,abi:vaultAbi,functionName:'refundUnspent',args:[BigInt(id)],account:address});
  const hash=await wallet.writeContract(simulation.request); onProgress('Refund submitted. Waiting for confirmation.',hash);
  const receipt=await publicClient.waitForTransactionReceipt({hash});
  if(receipt.status!=='success') throw new Error('The refund transaction reverted.');
  return hash;
}
