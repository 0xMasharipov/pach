import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './helpers.js';
let createServer:typeof import('../src/server.js').createServer|undefined;
try{({createServer}=await import('../src/server.js'));}catch(error){
 if(!(error instanceof Error)||!error.message.includes("Cannot find package 'fastify'"))throw error;
}
test('Fastify injection: CSRF, payload limit, authentication errors and health',{skip:!createServer?'Fastify dependency unavailable in offline cache':false},async()=>{
 const h=harness();const app=createServer!(h.config,h.store,h.chain);
 try{
  assert.equal((await app.inject({method:'GET',url:'/api/health'})).statusCode,200);
  const csrf=await app.inject({method:'POST',url:'/api/auth/nonce',payload:{}});assert.equal(csrf.statusCode,403);assert.equal(csrf.json().error.code,'ORIGIN_REJECTED');
  const headers={origin:h.config.origin,'content-type':'application/json'};
  assert.equal((await app.inject({method:'POST',url:'/api/auth/nonce',headers,payload:'x'.repeat(20000)})).statusCode,413);
  const wrongChain=await app.inject({method:'POST',url:'/api/auth/nonce',headers,payload:{address:h.player.address,chainId:143}});assert.equal(wrongChain.statusCode,400);
  assert.equal((await app.inject({method:'GET',url:'/api/me'})).statusCode,401);
 }finally{await app.close();}
});
