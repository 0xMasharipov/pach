import test from 'node:test';
import assert from 'node:assert/strict';
import {hasFullVerification} from '../scripts/verification-status.mjs';
const address='0x1111111111111111111111111111111111111111';
test('verification requires the exact address, testnet chain and a full source match',()=>{
  assert.equal(hasFullVerification([{address,status:'perfect',chainIds:['10143']}],address),true);
  for(const result of [null,[],[{address,status:'false'}],[{address,status:'partial',chainIds:['10143']}],[{address,status:'perfect',chainIds:['143']}],[{address:'0x2222222222222222222222222222222222222222',status:'perfect',chainIds:['10143']}]]){
    assert.equal(hasFullVerification(result,address),false);
  }
});
