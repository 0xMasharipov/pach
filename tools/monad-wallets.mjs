import {randomBytes} from 'node:crypto';
import {mkdirSync,writeFileSync,readFileSync,existsSync,chmodSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

// Project-local encrypted testnet accounts. Never print or persist an unencrypted key.
const root=fileURLToPath(new URL('../',import.meta.url));
const directory=resolve(root,'.data/monad');
const keystores=resolve(directory,'keystores');
const passwordFile=resolve(directory,'keystore-password');
const manifestFile=resolve(directory,'addresses.json');
const existing=existsSync(manifestFile)?JSON.parse(readFileSync(manifestFile,'utf8')):undefined;
if(existing&&existing.chainId!==10143)throw new Error('Existing wallet manifest is not for Monad Testnet.');
mkdirSync(keystores,{recursive:true,mode:0o700});
chmodSync(directory,0o700);chmodSync(keystores,0o700);
if(!existsSync(passwordFile)){
  if(existing||['deployer','verifier'].some(role=>existsSync(resolve(keystores,`pach-${role}`))))throw new Error('Wallet data exists but the password is missing. Restore the password; existing wallets will not be replaced.');
  writeFileSync(passwordFile,randomBytes(32).toString('hex'),{mode:0o600,flag:'wx'});
}
chmodSync(passwordFile,0o600);
const password=readFileSync(passwordFile,'utf8').trim();
if(password.length<32)throw new Error('Keystore password is unexpectedly short.');
function cast(args,env={}){
  return new Promise((resolve,reject)=>{
    const child=spawn('cast',args,{env:{...process.env,...env},stdio:['ignore','pipe','pipe']});
    let output='';child.stdout.on('data',chunk=>{output+=chunk;});child.stderr.resume();
    child.on('error',()=>reject(new Error('Install Foundry before preparing testnet wallets.')));
    child.on('close',code=>code===0?resolve(output.trim()):reject(new Error('Encrypted wallet operation failed; no private key was printed.')));
  });
}
const accounts={};
const roles=process.argv.includes('--rehearsal')?['deployer','verifier','finder','developer']:['deployer','verifier'];
for(const role of roles){
  const name=`pach-${role}`;
  const path=resolve(keystores,name);
  if(existing?.[role]&&!existsSync(path))throw new Error(`The ${role} keystore is missing. Restore it; a funded address will never be silently replaced.`);
  if(!existsSync(path))await cast(['wallet','new',keystores,name],{CAST_PASSWORD:password});
  chmodSync(path,0o600);
  const address=await cast(['wallet','address','--keystore',path,'--password-file',passwordFile]);
  if(!/^0x[0-9a-fA-F]{40}$/.test(address))throw new Error('Keystore did not return a valid address.');
  if(existing?.[role]&&existing[role].address.toLowerCase()!==address.toLowerCase())throw new Error(`The ${role} address no longer matches the existing wallet manifest.`);
  accounts[role]={address,keystore:resolve(dirname(manifestFile),'keystores',name)};
}
const manifest={...existing,chainId:10143,...accounts,treasury:existing?.treasury||accounts.deployer.address,passwordFile};
writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n',{mode:0o600});
console.log(JSON.stringify({chainId:10143,...Object.fromEntries(Object.entries(accounts).map(([role,account])=>[role,account.address])),treasury:manifest.treasury,manifest:manifestFile},null,2));
