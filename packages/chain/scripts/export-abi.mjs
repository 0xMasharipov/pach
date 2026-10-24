import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
const artifact = JSON.parse(readFileSync(new URL('../out/FYXRewardVault.sol/FYXRewardVault.json', import.meta.url), 'utf8'));
mkdirSync(new URL('../abi/', import.meta.url), {recursive:true});
writeFileSync(new URL('../abi/FYXRewardVault.json', import.meta.url), JSON.stringify(artifact.abi,null,2)+'\n');
writeFileSync(new URL('../abi/index.ts', import.meta.url), '// Generated from solc output; regenerate with pnpm --filter @fyx/chain abi.\nexport const vaultAbi = '+JSON.stringify(artifact.abi,null,2)+' as const;\n');
console.log('Exported actual compiler ABI; no deployment implied.');
