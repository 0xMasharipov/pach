import {test} from 'node:test';
import assert from 'node:assert/strict';
import {api,ApiError,formatAmount} from './api';
test('token amounts retain six-decimal base-unit precision without floating point',()=>{
 assert.equal(formatAmount('4000000'),'4');assert.equal(formatAmount('14000000'),'14');assert.equal(formatAmount('1'),'0.000001');assert.equal(formatAmount('9007199254740993123456'),'9007199254740993.123456');
});
test('API sends authenticated same-origin JSON and preserves server error code',async()=>{
 const original=globalThis.fetch;let init:RequestInit|undefined;
 globalThis.fetch=(async (_url,options)=>{init=options;return new Response(JSON.stringify({error:{code:'NOT_ELIGIBLE',message:'Review is required.'}}),{status:403,headers:{'content-type':'application/json'}});}) as typeof fetch;
 try{await assert.rejects(()=>api('/claims/prepare',{role:'FINDER'}),e=>e instanceof ApiError&&e.code==='NOT_ELIGIBLE'&&e.status===403);assert.equal(init?.credentials,'same-origin');assert.equal(init?.method,'POST');assert.equal(init?.body,'{"role":"FINDER"}');}finally{globalThis.fetch=original;}
});
test('offline and non-JSON failures cannot masquerade as successful API responses',async()=>{
 const original=globalThis.fetch;
 try{globalThis.fetch=(async()=>{throw new TypeError('offline');}) as typeof fetch;await assert.rejects(()=>api('/rewards'),e=>e instanceof ApiError&&e.code==='NETWORK_UNAVAILABLE');globalThis.fetch=(async()=>new Response('<h1>Bad gateway</h1>',{status:502})) as typeof fetch;await assert.rejects(()=>api('/rewards'),e=>e instanceof ApiError&&e.code==='INVALID_RESPONSE'&&e.status===502);}finally{globalThis.fetch=original;}
});
