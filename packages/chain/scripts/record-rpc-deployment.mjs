import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {decodeFunctionResult,encodeDeployData,encodeAbiParameters,getAddress,keccak256,toHex,formatEther} from 'viem';

// Records actual RPC evidence captured when the execution host cannot give Node/Forge network access.
// No Foundry broadcast file is fabricated; the submission method is recorded explicitly.
const root=fileURLToPath(new URL('../',import.meta.url));
const evidence=resolve(root,'../../.data/monad/deployment-rpc');
const json=path=>JSON.parse(readFileSync(path,'utf8'));
const rpc=name=>{const x=json(resolve(evidence,name+'.json'));if(x.error||x.result===undefined||x.result===null)throw new Error('Missing successful RPC evidence: '+name);return x.result;};
const summary=json(resolve(evidence,'signed-summary.json'));
const receipt=rpc('receipt'),transaction=rpc('transaction'),block=rpc('canonical-block');
const artifact=json(resolve(root,'out/FYXRewardVault.sol/FYXRewardVault.json'));
const manifest=json(resolve(root,'../../.data/monad/addresses.json'));
if(BigInt(rpc('chain'))!==10143n||BigInt(transaction.chainId)!==10143n||BigInt(receipt.status)!==1n)throw new Error('Evidence is not a successful Monad Testnet creation.');
if(receipt.blockHash!==block.hash||transaction.blockHash!==block.hash||receipt.blockNumber!==transaction.blockNumber||BigInt(rpc('head'))<BigInt(receipt.blockNumber)+1n)throw new Error('Creation does not have two confirmations in the captured canonical chain.');
const raw=json(resolve(evidence,'broadcast-request.json')).params[0];
if(keccak256(raw)!==summary.hash||transaction.hash!==summary.hash||receipt.transactionHash!==summary.hash)throw new Error('Signed transaction and receipt hashes differ.');
if(transaction.to!==null||receipt.contractAddress?.toLowerCase()!==summary.expectedContractAddress.toLowerCase()||transaction.from.toLowerCase()!==manifest.deployer.address.toLowerCase()||receipt.from.toLowerCase()!==transaction.from.toLowerCase())throw new Error('Created address or deployer differs from the signed deployment.');
if(rpc('runtime')==='0x')throw new Error('Created contract has no runtime code.');
const read=name=>decodeFunctionResult({abi:artifact.abi,functionName:name,data:rpc(name)});
const token=read('token'),verifier=read('verifier'),treasury=read('treasury');
if(token.toLowerCase()!=='0x56bf9cdc3c1876f3f22655a0016c2743e9e39a73'||verifier.toLowerCase()!==manifest.verifier.address.toLowerCase()||treasury.toLowerCase()!==manifest.treasury.toLowerCase()||read('CHAIN_ID')!==10143n||read('DEPOSIT')!==20000000n)throw new Error('Deployed immutables differ from the reviewed configuration.');
const expected=encodeDeployData({abi:artifact.abi,bytecode:artifact.bytecode.object,args:[token,verifier,treasury]});
if(transaction.input.toLowerCase()!==expected.toLowerCase())throw new Error('Actual creation input differs from compiled bytecode and constructor arguments.');
const metadata=typeof artifact.metadata==='string'?JSON.parse(artifact.metadata):artifact.metadata;
const sources={},contents={};
for(const [path,source] of Object.entries(metadata.sources)){
  if(path.startsWith('/')||path.includes('..'))throw new Error('Unexpected compiler source path.');
  const content=readFileSync(resolve(root,path),'utf8');
  if(keccak256(toHex(content))!==source.keccak256)throw new Error('Source changed after compilation: '+path);
  sources[path]={content};contents[path]=content;
}
const {compilationTarget,...settings}=metadata.settings;
const standardJsonInput={language:'Solidity',sources,settings};
const vaultAddress=getAddress(receipt.contractAddress);
const deployment={chainId:10143,rpc:'https://testnet-rpc.monad.xyz',vaultAddress,testUsdcAddress:token,decimals:6,verifier,treasury,deployTxHash:summary.hash,blockNumber:BigInt(receipt.blockNumber).toString(),explorerUrl:`https://testnet.monadscan.com/address/${vaultAddress}`,abiPath:'packages/chain/abi/FYXRewardVault.json',compilerVersion:metadata.compiler.version,optimizer:settings.optimizer,evmVersion:settings.evmVersion,sourceVerified:false,submissionMethod:'offline-signed-json-rpc',confirmations:2,gasUsed:BigInt(receipt.gasUsed).toString(),gasCostMon:formatEther(BigInt(receipt.gasUsed)*BigInt(receipt.effectiveGasPrice))};
const constructorArgs=encodeAbiParameters([{type:'address'},{type:'address'},{type:'address'}],[token,verifier,treasury]);
const verification={chainId:10143,contractAddress:vaultAddress,contractName:'src/FYXRewardVault.sol:FYXRewardVault',compilerVersion:`v${metadata.compiler.version}`,standardJsonInput,constructorArgs};
mkdirSync(resolve(root,'deployments'),{recursive:true});
for(const [path,value] of [['10143.json',deployment],[`${summary.hash}.json`,deployment],['verification-payload.json',verification],['sourcify-request.json',{sources:contents,metadata,creationTransactionHash:summary.hash}]])writeFileSync(resolve(root,'deployments',path),JSON.stringify(value,null,2)+'\n');
console.log(JSON.stringify(deployment,null,2));
