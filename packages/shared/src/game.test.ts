import { test } from 'node:test';
import assert from 'node:assert/strict';
import {createGameState,applyGameEvent,evaluateReport,remainingMs,BUG_CODE,eventSchema} from './index.ts';
test('only ordered duplicate coupon evidence accepts a report; hints reduce XP',()=>{
 let s=createGameState(0);s=applyGameEvent(s,'start',1,100);
 assert.equal(evaluateReport(s,BUG_CODE,200).status,'rejected');
 s=applyGameEvent(s,'coupon_applied',2,300);s=applyGameEvent(s,'coupon_applied',3,500);
 assert.equal(evaluateReport(s,'wrong',600).status,'rejected');
 const before=evaluateReport(s,BUG_CODE,1000).xp;
 s=applyGameEvent(s,'hint_opened',4,1000);
 assert.equal(evaluateReport(s,BUG_CODE,1000).xp,before-20);
 assert.throws(()=>applyGameEvent(s,'coupon_applied',5,1100),/COUPON_LIMIT/);
});
test('pause stops active time but cannot extend absolute expiry',()=>{
 let s=applyGameEvent(createGameState(0),'start',1,0);
 s=applyGameEvent(s,'paused',2,10000);assert.equal(remainingMs(s,100000),50000);
 s=applyGameEvent(s,'resumed',3,200000);assert.equal(remainingMs(s,240000),10000);
 assert.throws(()=>applyGameEvent(s,'paused',4,300000),/SESSION_EXPIRED/);
});
test('sequence replay, reversed time, paused interaction and timeout fail',()=>{
 let s=applyGameEvent(createGameState(0),'start',1,100);
 assert.throws(()=>applyGameEvent(s,'coupon_applied',1,200),/INVALID_SEQUENCE/);
 assert.throws(()=>applyGameEvent(s,'coupon_applied',2,50),/TIME_REVERSED/);
 assert.throws(()=>applyGameEvent(s,'coupon_applied',2,60100),/SESSION_EXPIRED/);
 s=applyGameEvent(s,'paused',2,200);
 assert.throws(()=>applyGameEvent(s,'coupon_applied',3,300),/NOT_RUNNING/);
});
test('wire payload rejects forged scores and completion flags',()=>{
 assert.equal(eventSchema.safeParse({sessionId:'abc',seq:1,kind:'start',payload:{score:999}}).success,false);
 assert.equal(eventSchema.safeParse({sessionId:'abc',seq:1,kind:'start',completed:true}).success,false);
});
