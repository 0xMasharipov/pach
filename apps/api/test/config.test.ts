import test from 'node:test';
import assert from 'node:assert/strict';
import {readConfig} from '../src/config.js';
import {generatePrivateKey} from 'viem/accounts';
test('configuration defaults to demo and fails closed for missing durable storage or production HTTPS',()=>{
 assert.equal(readConfig({}).mode,'demo');
 assert.throws(()=>readConfig({FYX_MODE:'testnet'}),/PostgreSQL/);
 assert.throws(()=>readConfig({NODE_ENV:'production',PUBLIC_ORIGIN:'http://example.test'}),/HTTPS/);
 assert.throws(()=>readConfig({SPONSOR_ADDRESSES:'not-a-wallet'}));
 assert.throws(()=>readConfig({FYX_MODE:'testnet',DATABASE_URL:'postgres://fixture-only'}),/FYX_VAULT_ADDRESS/);
 const config=readConfig({FYX_MODE:'testnet',DATABASE_URL:'postgres://fixture-only',FYX_VAULT_ADDRESS:'0x1111111111111111111111111111111111111111',VERIFIER_PRIVATE_KEY:generatePrivateKey(),NODE_ENV:'production',PUBLIC_ORIGIN:'https://example.test',SPONSOR_ADDRESSES:'0x1111111111111111111111111111111111111111'});
 assert.equal(config.secure,true);assert.equal(config.origin,'https://example.test');assert.equal(config.sponsors.length,1);
});
