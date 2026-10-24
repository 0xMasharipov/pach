import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {loadProjectEnv,webEnvironment} from './project-env.mjs';

test('.env.local overrides .env while explicit process settings retain precedence',()=>{
  const root=mkdtempSync(join(tmpdir(),'pach-env-'));
  try{
    writeFileSync(join(root,'.env'),'PORT=3001\nDATABASE_URL="postgres://base"\n');
    writeFileSync(join(root,'.env.local'),'PORT=3002\nDATABASE_URL="postgres://local"\nSUPABASE_POSTGRES_PASSWORD="fixture # with spaces"\n');
    const env=loadProjectEnv(root,{PORT:'4000'});
    assert.equal(env.PORT,'4000');assert.equal(env.DATABASE_URL,'postgres://local');
    assert.equal(env.SUPABASE_POSTGRES_PASSWORD,'fixture # with spaces');
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('the Next process does not inherit database, Supabase or signing credentials',()=>{
  const env={PATH:'/fixture/bin',NODE_ENV:'development',API_URL:'http://localhost:3001',NEXT_PUBLIC_SUPABASE_URL:'https://fixture.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'public-fixture',DATABASE_URL:'private-fixture',VERIFIER_PRIVATE_KEY:'private-fixture',SUPABASE_SECRET_KEY:'private-fixture',SUPABASE_POSTGRES_PASSWORD:'private-fixture',SUPABASE_PUBLISABLE_KEY:'public-unused-fixture',anon_public_key:'public-unused-fixture','21stDEV_API_KEY':'private-fixture',NEXT_PUBLIC_SUPABASE_SECRET_KEY:'private-fixture'};
  const web=webEnvironment(env);
  assert.deepEqual(Object.keys(web).sort(),['PATH','NODE_ENV','API_URL','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'].sort());
  assert.equal(web.API_URL,env.API_URL);assert.equal(env.DATABASE_URL,'private-fixture');
});
