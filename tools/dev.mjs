import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(import.meta.url);
const offline=process.argv.includes('--offline');
const children=[];
let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)child.kill('SIGTERM');process.exitCode=code;}
function run(args,cwd,env={},web=false){
 const childEnv={...process.env,...env};
 if(web)for(const key of ['VERIFIER_PRIVATE_KEY','DATABASE_URL','POSTGRES_PASSWORD','FYX_DEPLOYER_KEYSTORE','FYX_KEYSTORE_PASSWORD_FILE'])delete childEnv[key];
 const child=spawn(process.execPath,args,{cwd,stdio:'inherit',env:childEnv});
 children.push(child);
 child.on('error',error=>{console.error(error.message);stop(1);});
 child.on('exit',code=>{if(!stopping)stop(code??1);});
}
run(['--env-file-if-exists='+resolve(root,'.env'),'--import','tsx',offline?'src/offline-server.ts':'src/server.ts'],resolve(root,'apps/api'));
run([require.resolve('next/dist/bin/next'),'dev','--webpack','-p','3000'],resolve(root,'apps/web'),{},true);
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>stop());
console.log(`PACH local preview: http://localhost:3000 (${offline?'Node HTTP':'Fastify'} API)`);
