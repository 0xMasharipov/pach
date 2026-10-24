import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {brand} from '../config/brand';
function sources(dir:string):string[]{return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?sources(join(dir,entry.name)):/\.(tsx|ts)$/.test(entry.name)&&!entry.name.endsWith('.test.ts')?[readFileSync(join(dir,entry.name),'utf8')]:[]);}
test('public source avoids retired slogans and guaranteed payment claims',()=>{
 const text=sources(new URL('..',import.meta.url).pathname).join('\n');
 for(const phrase of ['Spot it. Fix it. Earn it.','Find. Fix. Earn.','guaranteed rewards','audited production vault','real USDC earned'])assert.ok(!text.toLowerCase().includes(phrase.toLowerCase()),phrase);
 assert.equal(brand.displayName,'PACH');assert.match(brand.testnetNote,/no monetary value/);assert.equal(brand.gameName,'Spot the Glitch');
});
