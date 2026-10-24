import {run} from './process.mjs';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve, relative} from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const rpc = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz';
const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const cast = async args => {
  try { return await run('cast', [...args, '--rpc-url', rpc]); }
  catch { throw new Error('RPC verification failed; deployment artifacts were not written. Check connectivity and configuration.'); }
};
if (await cast(['chain-id']) !== '10143') throw new Error('RPC is not Monad Testnet 10143.');
const broadcast = read('broadcast/Deploy.s.sol/10143/run-latest.json');
const creations = broadcast.transactions.filter(tx => tx.transactionType === 'CREATE' && tx.contractName === 'FYXRewardVault');
if (creations.length !== 1) throw new Error('Expected exactly one actual vault creation in the broadcast record.');
const tx = creations[0];
if (!/^0x[0-9a-fA-F]{64}$/.test(tx.hash)) throw new Error('Missing actual deployment transaction hash.');
const receipt = JSON.parse(await cast(['receipt', tx.hash, '--json']));
if (BigInt(receipt.status) !== 1n || !receipt.contractAddress || receipt.contractAddress.toLowerCase() !== tx.contractAddress.toLowerCase()) {
  throw new Error('Deployment receipt is not successful or does not match the vault.');
}
const vaultAddress = receipt.contractAddress;
if (await cast(['code', vaultAddress]) === '0x') throw new Error('No deployed runtime code at the receipt address.');
const readAddress = name => cast(['call', vaultAddress, `${name}()(address)`]);
const token = await readAddress('token');
const verifier = await readAddress('verifier');
const treasury = await readAddress('treasury');
if (token.toLowerCase() !== '0x56bf9cdc3c1876f3f22655a0016c2743e9e39a73') throw new Error('Unexpected deployed token.');
const artifact = read('out/FYXRewardVault.sol/FYXRewardVault.json');
const creationData = tx.transaction?.input || tx.transaction?.data;
const liveTransaction = JSON.parse(await cast(['tx', tx.hash, '--json']));
if (liveTransaction.to != null || liveTransaction.input?.toLowerCase() !== creationData?.toLowerCase()) {
  throw new Error('Actual on-chain creation input differs from the local broadcast record.');
}
const expectedBytecode = artifact.bytecode.object.replace(/^0x/, '');
if (!creationData || !creationData.replace(/^0x/, '').toLowerCase().startsWith(expectedBytecode.toLowerCase())) {
  throw new Error('Broadcast creation bytecode does not match the current compiler artifact. Rebuild the exact deployed source.');
}
const metadata = typeof artifact.metadata === 'string' ? JSON.parse(artifact.metadata) : artifact.metadata;
const sources = {};
for (const sourcePath of Object.keys(metadata.sources)) {
  const path = resolve(root, sourcePath);
  if (relative(root, path).startsWith('..')) throw new Error('Compiler source is outside package root.');
  const content = readFileSync(path, 'utf8');
  const hash = await run('cast', ['keccak', content]);
  if (hash !== metadata.sources[sourcePath].keccak256) throw new Error('Compiler source changed since deployment; refusing a mismatched verification payload.');
  sources[sourcePath] = {content};
}
const {compilationTarget, ...settings} = metadata.settings;
settings.outputSelection = {'*':{'*':['abi','evm.bytecode','evm.deployedBytecode','metadata']}};
const standardJsonInput = {language:'Solidity',sources,settings};
const constructorArgs = await run('cast', ['abi-encode','constructor(address,address,address)',token,verifier,treasury]);
const deployment = {
  chainId:10143, rpc:'https://testnet-rpc.monad.xyz', vaultAddress, testUsdcAddress:token, decimals:6,
  verifier, treasury, deployTxHash:tx.hash, blockNumber:BigInt(receipt.blockNumber).toString(),
  explorerUrl:`https://testnet.monadscan.com/address/${vaultAddress}`,
  abiPath:'packages/chain/abi/FYXRewardVault.json', compilerVersion:metadata.compiler.version,
  optimizer:settings.optimizer, evmVersion:settings.evmVersion, sourceVerified:false,
};
const verification = {chainId:10143,contractAddress:vaultAddress,contractName:'src/FYXRewardVault.sol:FYXRewardVault',compilerVersion:`v${metadata.compiler.version}`,standardJsonInput,constructorArgs};
mkdirSync(resolve(root,'deployments'), {recursive:true});
writeFileSync(resolve(root,`deployments/${tx.hash}.json`), JSON.stringify(deployment,null,2)+'\n');
writeFileSync(resolve(root,'deployments/10143.json'), JSON.stringify(deployment,null,2)+'\n');
writeFileSync(resolve(root,'deployments/verification-payload.json'), JSON.stringify(verification,null,2)+'\n');
console.log(`Recorded confirmed testnet deployment ${vaultAddress}. Source verification remains pending.`);
