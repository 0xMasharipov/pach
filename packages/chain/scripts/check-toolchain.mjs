import {run} from './process.mjs';
import './check-vendor.mjs';
const version = await run('forge', ['--version']);
const match = version.match(/Version:\s*(\d+)\.(\d+)\.(\d+)/);
if (!match || Number(match[1]) < 1 || (Number(match[1]) === 1 && Number(match[2]) < 8)) {
  throw new Error('Monad verification requires official Foundry >=1.8. Install it before build/test/deploy. Baseline EVM checks do not establish Monad readiness.');
}
console.log(version.split('\n')[0]);
