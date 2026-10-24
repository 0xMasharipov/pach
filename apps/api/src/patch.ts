import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import type {Hex} from 'viem';
const execute=promisify(execFile);
export async function checkPatch(patchId:'broken-v1'|'fixed-v1'){
  const fixture=fileURLToPath(new URL('../fixtures/check-patch.mjs',import.meta.url));
  let passed=true,output='';
  try{const result=await execute(process.execPath,['--permission',`--allow-fs-read=${fixture}`,fixture,patchId],{timeout:5000,maxBuffer:16384,env:{NODE_NO_WARNINGS:'1'}});output=result.stdout.trim();}
  catch(error){passed=false;const e=error as {stdout?:string;stderr?:string};output=(e.stdout||e.stderr||'Controlled test process failed').slice(0,3000);}
  const digest=createHash('sha256').update(await readFile(fixture)).update(patchId).update(output).digest('hex');
  return {passed,testOutput:output,proofHash:`0x${digest}` as Hex};
}
