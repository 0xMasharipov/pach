import {test} from 'node:test';
import assert from 'node:assert/strict';
import {connectWallet,type BrowserProvider} from './wallet';
const address='0x1111111111111111111111111111111111111111';
function browser(ethereum:BrowserProvider){Object.defineProperty(globalThis,'window',{value:{ethereum},configurable:true});}
test('wallet connection switches to testnet and verifies the resulting network',async()=>{
 let current='0x1';const methods:string[]=[];
 browser({request:async({method})=>{methods.push(method);if(method==='eth_requestAccounts')return [address];if(method==='eth_chainId')return current;if(method==='wallet_switchEthereumChain'){current='0x279f';return null;}throw new Error(method);}} as BrowserProvider);
 const result=await connectWallet();assert.equal(result.address,address);assert.ok(methods.includes('wallet_switchEthereumChain'));assert.equal(methods.filter(m=>m==='eth_chainId').length,2);
});
test('a wallet reporting success without switching networks is rejected',async()=>{
 browser({request:async({method})=>{if(method==='eth_requestAccounts')return [address];if(method==='eth_chainId')return '0x1';return null;}} as BrowserProvider);
 await assert.rejects(connectWallet,/Switch to Monad Testnet/);
});
test('an empty wallet account list cannot create a connection',async()=>{
 browser({on:()=>{},removeListener:()=>{},request:async()=>[]} as unknown as BrowserProvider);await assert.rejects(connectWallet,/No wallet account/);
});
