import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {createOfflineServer} from '../src/offline-server.js';
import {RequestPolicy,errorResponse,RateLimitError} from '../src/http.js';
import {harness} from './helpers.js';

/** Invokes the actual request handler with streams. Does not claim a listening socket. */
function request(server:ReturnType<typeof createOfflineServer>,method:string,url:string,raw='',headers:Record<string,string>={}){
 return new Promise<{status:number;headers:Record<string,string>;body:any}>(resolve=>{
  const req=Object.assign(Readable.from(raw?[Buffer.from(raw)]:[]),{method,url,headers,socket:{remoteAddress:'127.0.0.1'}});
  const response={statusCode:200,headers:{} as Record<string,string>,setHeader(name:string,value:string){this.headers[name.toLowerCase()]=String(value);},end(value:string){resolve({status:this.statusCode,headers:this.headers,body:JSON.parse(value)});}};
  server.emit('request',req,response);
 });
}

test('Node handler checks origin, content type, body size, JSON and error envelopes without opening a socket',async()=>{
 const h=harness(),server=createOfflineServer(h.config,h.store,h.chain);
 const health=await request(server,'GET','/api/health');assert.equal(health.status,200);assert.equal(health.headers['cache-control'],'no-store');
 const headers={origin:h.config.origin,'content-type':'application/json'};
 const denied=await request(server,'POST','/api/auth/nonce','{}');assert.equal(denied.status,403);assert.equal(denied.body.error.code,'ORIGIN_REJECTED');assert.ok(denied.body.error.requestId);
 assert.equal((await request(server,'POST','/api/auth/nonce','{}',{...headers,'content-type':'text/plain'})).status,415);
 assert.equal((await request(server,'POST','/api/auth/nonce','{',headers)).status,400);
 assert.equal((await request(server,'POST','/api/auth/nonce',' '.repeat(17000),headers)).status,413);
 const rejected=await request(server,'POST','/api/auth/nonce',JSON.stringify({address:h.player.address,chainId:143}),headers);assert.equal(rejected.status,400);assert.equal(rejected.body.error.code,'INVALID_INPUT');assert.equal(rejected.body.error.stack,undefined);
 assert.equal((await request(server,'GET','/unrecognized')).status,404);
});

test('Node handler creates secure session cookie, authenticates and clears logout',async()=>{
 const h=harness();h.config.secure=true;const server=createOfflineServer(h.config,h.store,h.chain);
 const headers={origin:h.config.origin,'content-type':'application/json'};
 const nonce=await request(server,'POST','/api/auth/nonce',JSON.stringify({address:h.player.address,chainId:10143}),headers);
 const {message}=nonce.body;const signature=await h.player.signMessage({message});
 const auth=await request(server,'POST','/api/auth/verify',JSON.stringify({message,signature}),headers);
 assert.equal(auth.status,200);const cookie=auth.headers['set-cookie']!;assert.match(cookie,/HttpOnly; SameSite=Strict; Max-Age=3600; Secure/);
 const me=await request(server,'GET','/api/me','',{cookie});assert.equal(me.body.user.address,h.player.address);
 const logout=await request(server,'POST','/api/auth/logout','{}',{...headers,cookie});assert.match(logout.headers['set-cookie']!,/Max-Age=0/);
 assert.equal((await request(server,'GET','/api/me','',{cookie})).status,401);
});

test('shared policy limits auth separately, expires windows and sanitizes unexpected failures',()=>{
 let now=1;const policy=new RequestPolicy('http://localhost:3000',()=>now);
 const input={method:'POST',origin:'http://localhost:3000',contentType:'application/json; charset=utf-8',ip:'fixture',url:'/api/auth/nonce'};
 for(let i=0;i<30;i++)policy.check(input);
 assert.throws(()=>policy.check(input),RateLimitError);
 policy.check({...input,url:'/api/game/events'});now+=60001;policy.check(input);
 const error=errorResponse(new Error('postgres://private-credentials'), 'request-1');assert.equal(error.status,500);assert.equal(JSON.stringify(error).includes('private-credentials'),false);
});
