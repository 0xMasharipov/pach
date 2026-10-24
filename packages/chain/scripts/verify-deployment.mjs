import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createPublicClient,http,encodeDeployData,keccak256,toHex} from 'viem';
import {run} from './process.mjs';
import {hasFullVerification} from './verification-status.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const deployment=read('deployments/10143.json');
if(deployment.chainId!==10143)throw new Error('Only a recorded Monad Testnet deployment can be verified.');
const rpc=process.env.MONAD_RPC_URL||'https://testnet-rpc.monad.xyz';
const client=createPublicClient({transport:http(rpc,{timeout:15000,retryCount:1})});
if(await client.getChainId()!==10143)throw new Error('Configured RPC is not Monad Testnet.');
const artifact=read('out/FYXRewardVault.sol/FYXRewardVault.json');
const metadata=typeof artifact.metadata==='string'?JSON.parse(artifact.metadata):artifact.metadata;
for(const [path,source] of Object.entries(metadata.sources)){
  if(path.includes('..')||path.startsWith('/'))throw new Error('Unexpected compiler source path.');
  if(keccak256(toHex(readFileSync(resolve(root,path),'utf8')))!==source.keccak256)throw new Error('Source changed since compilation; rebuild the exact deployed version.');
}
const receipt=await client.getTransactionReceipt({hash:deployment.deployTxHash});
if(receipt.status!=='success'||receipt.contractAddress?.toLowerCase()!==deployment.vaultAddress.toLowerCase())throw new Error('Recorded deployment does not have a matching successful creation receipt.');
const transaction=await client.getTransaction({hash:deployment.deployTxHash});
const expected=encodeDeployData({abi:artifact.abi,bytecode:artifact.bytecode.object,args:[deployment.testUsdcAddress,deployment.verifier,deployment.treasury]});
if(transaction.to!==null||transaction.input.toLowerCase()!==expected.toLowerCase())throw new Error('Compiled creation bytecode and constructor arguments do not match the deployed transaction.');
await run(process.execPath,[resolve(root,'scripts/check-toolchain.mjs')],{stdio:'inherit'});
const verifierUrl='https://sourcify-api-monad.blockvision.org/';
await run('forge',['verify-contract',deployment.vaultAddress,'src/FYXRewardVault.sol:FYXRewardVault','--chain','10143','--rpc-url',rpc,'--verifier','sourcify','--verifier-url',verifierUrl,'--creation-transaction-hash',deployment.deployTxHash,'--watch'],{cwd:root,stdio:'inherit'});
const url=new URL('check-by-addresses',verifierUrl);
url.searchParams.set('addresses',deployment.vaultAddress);url.searchParams.set('chainIds','10143');
const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
if(!response.ok||!hasFullVerification(await response.json(),deployment.vaultAddress))throw new Error('Full source verification is not confirmed by the explorer yet; deployment status was left unchanged.');
deployment.sourceVerified=true;
deployment.sourceVerification={provider:'sourcify',status:'perfect',verifiedAt:new Date().toISOString()};
for(const path of ['deployments/10143.json',`deployments/${deployment.deployTxHash}.json`])writeFileSync(resolve(root,path),JSON.stringify(deployment,null,2)+'\n');
console.log(`Full source verification confirmed for ${deployment.vaultAddress} on Monad Testnet.`);
