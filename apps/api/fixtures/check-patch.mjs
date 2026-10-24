// No user code or URLs are imported. Only these two shipped fixture IDs execute.
import assert from 'node:assert/strict';
const patch=process.argv[2];
if(!['broken-v1','fixed-v1'].includes(patch))throw new Error('Unknown fixture');
const checkout=(price,coupons)=>patch==='fixed-v1'?Math.max(0,price-(coupons>0?60:0)):price-coupons*60;
assert.equal(checkout(100,0),100,'base price');
assert.equal(checkout(100,1),40,'single coupon');
assert.equal(checkout(100,2),40,'duplicate coupon must apply only once');
assert.ok(checkout(20,1)>=0,'total must never be negative');
console.log('4/4 controlled checkout assertions passed. Test suite: checkout-v1.');
