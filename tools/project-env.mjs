import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {parseEnv} from 'node:util';

export function loadProjectEnv(root,inherited=process.env){
  let local={};
  for(const name of ['.env','.env.local']){
    const path=resolve(root,name);
    if(existsSync(path))local={...local,...parseEnv(readFileSync(path,'utf8'))};
  }
  return {...local,...inherited};
}

export function webEnvironment(env){
  const serverOnly=new Set(['VERIFIER_PRIVATE_KEY','DATABASE_URL','POSTGRES_PASSWORD','FYX_DEPLOYER_KEYSTORE','FYX_KEYSTORE_PASSWORD_FILE','anon_public_key','21stDEV_API_KEY']);
  return Object.fromEntries(Object.entries(env).filter(([key])=>!serverOnly.has(key)&&!key.startsWith('SUPABASE_')&&!/^NEXT_PUBLIC_SUPABASE_(SECRET|SERVICE_ROLE|POSTGRES_PASSWORD)/.test(key)));
}
