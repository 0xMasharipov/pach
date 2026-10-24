import {run} from './process.mjs';
import {existsSync} from 'node:fs';
import {homedir} from 'node:os';
import {join} from 'node:path';
import './check-vendor.mjs';

// Explicitly separate generic EVM regression tests from the Monad release gate.
console.log('BASELINE EVM ONLY: this command does not verify Monad execution or deployment.');
const version = (await run('forge', ['--version'])).split('\n')[0];
console.log(version);
const cached = join(process.env.XDG_DATA_HOME || join(homedir(), '.local/share'), 'svm/0.8.33/solc-0.8.33');
const compiler = process.env.SOLC_PATH || (existsSync(cached) ? cached : '0.8.33');
const mode = process.argv[2] || 'test';
if (!['test', 'build'].includes(mode)) throw new Error('Expected test or build.');
await run('forge', [mode, '--offline', '--use', compiler, ...(mode === 'test' ? ['-vv'] : [])], {stdio:'inherit', cwd:new URL('../', import.meta.url)});
await run(process.execPath, [new URL('./export-abi.mjs', import.meta.url).pathname], {stdio:'inherit'});
