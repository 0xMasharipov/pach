import {readFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseEnv} from 'node:util';
import {spawn} from 'node:child_process';
import {run} from '../packages/chain/scripts/process.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const mode=process.argv[2]||'check';
if(!['check','simulate','deploy','dev'].includes(mode))throw new Error('Use check, simulate, deploy or dev.');
const manifestFile=resolve(root,'.data/monad/addresses.json');
if(!existsSync(manifestFile))throw new Error('Run pnpm monad:wallets first.');
const manifest=JSON.parse(readFileSync(manifestFile,'utf8'));
const localEnv=resolve(root,'.env');
const env={...(existsSync(localEnv)?parseEnv(readFileSync(localEnv,'utf8')):{}),...process.env};
env.MONAD_RPC_URL||='https://testnet-rpc.monad.xyz';
env.FYX_DEPLOYER_KEYSTORE||=manifest.deployer.keystore;
env.FYX_KEYSTORE_PASSWORD_FILE||=manifest.passwordFile;
env.FYX_VERIFIER_ADDRESS||=manifest.verifier.address;
env.FYX_TREASURY_ADDRESS||=manifest.treasury;
const localTools=resolve(root,'.tools/foundry-v1.8.6');
if(existsSync(join(localTools,'forge')))env.PATH=localTools+':'+env.PATH;
if(mode==='dev'){
  const deploymentFile=resolve(root,'packages/chain/deployments/10143.json');
  if(!existsSync(deploymentFile))throw new Error('A confirmed deployment record is required before testnet mode.');
  const deployment=JSON.parse(readFileSync(deploymentFile,'utf8'));
  if(deployment.chainId!==10143||deployment.verifier.toLowerCase()!==manifest.verifier.address.toLowerCase())throw new Error('The deployment does not match the prepared testnet signer.');
  if(!env.DATABASE_URL)throw new Error('Set DATABASE_URL in .env; testnet mode requires PostgreSQL and the database migration.');
  // Decrypt only into the server process environment. Never write or print this value.
  env.VERIFIER_PRIVATE_KEY=await run('cast',['wallet','private-key','--keystore',manifest.verifier.keystore,'--password-file',manifest.passwordFile],{env});
  if(!/^0x[0-9a-fA-F]{64}$/.test(env.VERIFIER_PRIVATE_KEY))throw new Error('Could not unlock the project verifier.');
  env.FYX_MODE='testnet';env.FYX_VAULT_ADDRESS=deployment.vaultAddress;
  env.SPONSOR_ADDRESSES||=manifest.deployer.address;
  env.VERIFIER_ADDRESSES||=manifest.deployer.address;
}
const script=mode==='dev'?resolve(root,'tools/dev.mjs'):resolve(root,'packages/chain/scripts',mode==='check'?'preflight.mjs':'deploy.mjs');
const child=spawn(process.execPath,[script,...(mode==='deploy'?['--broadcast']:[])],{cwd:root,env,stdio:'inherit'});
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>child.kill(signal));
child.on('error',()=>{console.error('Could not start testnet command.');process.exitCode=1;});
child.on('close',code=>{process.exitCode=code??1;});
