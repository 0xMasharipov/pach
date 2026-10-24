import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {loadProjectEnv,webEnvironment} from './project-env.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(import.meta.url);
const projectEnv=loadProjectEnv(root);
const offline=process.argv.includes('--offline');
const children=[];
let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)child.kill('SIGTERM');process.exitCode=code;}
function run(args,cwd,env={},web=false){
 const inherited={...projectEnv,...env};
 const childEnv=web?webEnvironment(inherited):inherited;
 const child=spawn(process.execPath,args,{cwd,stdio:'inherit',env:childEnv});
 children.push(child);
 child.on('error',error=>{console.error(error.message);stop(1);});
 child.on('exit',code=>{if(!stopping)stop(code??1);});
}
run(['--import','tsx',offline?'src/offline-server.ts':'src/server.ts'],resolve(root,'apps/api'));
run([require.resolve('next/dist/bin/next'),'dev','--webpack','-p','3000'],resolve(root,'apps/web'),{},true);
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>stop());
console.log(`PACH local preview: http://localhost:3000 (${offline?'Node HTTP':'Fastify'} API)`);
