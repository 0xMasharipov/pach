import {run} from './process.mjs';
import {preflight} from './preflight.mjs';
import {existsSync} from 'node:fs';
const cwd = new URL('../', import.meta.url);
const rpc = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz';
const broadcast = process.argv.includes('--broadcast');
if(broadcast&&existsSync(new URL('../deployments/10143.json',import.meta.url))&&!process.argv.includes('--redeploy'))throw new Error('A Monad Testnet deployment is already recorded. Reuse that vault, or pass --redeploy explicitly to create another one.');
await run(process.execPath, [new URL('./check-toolchain.mjs', import.meta.url).pathname], {stdio:'inherit'});
const {report,walletArgs,balance}=await preflight();
console.log(JSON.stringify(report,null,2));
// Without --broadcast, forge simulates only and writes no deployment artifact.
if(broadcast&&balance===0n)throw new Error(`Send test MON to ${report.deployer} before broadcasting.`);
await run('forge', ['script', 'script/Deploy.s.sol:Deploy', '--rpc-url', rpc, '--sender',report.deployer,...walletArgs,...(broadcast ? ['--broadcast'] : [])], {cwd, stdio:'inherit'});
if (broadcast) await run(process.execPath, [new URL('./record-deployment.mjs', import.meta.url).pathname], {cwd, stdio:'inherit'});
else console.log('Simulation finished. No deployment was recorded.');
