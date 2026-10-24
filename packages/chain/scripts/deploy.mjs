import {run} from './process.mjs';
const cwd = new URL('../', import.meta.url);
const rpc = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz';
const account = process.env.FYX_DEPLOYER_ACCOUNT;
const address = /^0x[0-9a-fA-F]{40}$/;
if (!account || !address.test(process.env.FYX_VERIFIER_ADDRESS || '') || !address.test(process.env.FYX_TREASURY_ADDRESS || '')) {
  throw new Error('Configure FYX_DEPLOYER_ACCOUNT (encrypted Foundry keystore name), FYX_VERIFIER_ADDRESS and FYX_TREASURY_ADDRESS.');
}
await run(process.execPath, [new URL('./check-toolchain.mjs', import.meta.url).pathname], {stdio:'inherit'});
const chainId = await run('cast', ['chain-id', '--rpc-url', rpc]);
if (chainId !== '10143') throw new Error('RPC is not Monad Testnet 10143; refusing deployment.');
// Without --broadcast, forge simulates only and writes no deployment artifact.
const broadcast = process.argv.includes('--broadcast');
await run('forge', ['script', 'script/Deploy.s.sol:Deploy', '--rpc-url', rpc, '--account', account, ...(broadcast ? ['--broadcast'] : [])], {cwd, stdio:'inherit'});
if (broadcast) await run(process.execPath, [new URL('./record-deployment.mjs', import.meta.url).pathname], {cwd, stdio:'inherit'});
else console.log('Simulation finished. No deployment was recorded.');
