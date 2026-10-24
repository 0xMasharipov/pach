import postgres from 'postgres';
import {readFile} from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required');
const db=postgres(process.env.DATABASE_URL,{max:1});
try{await db.unsafe(await readFile(new URL('../migrations/0001_state.sql',import.meta.url),'utf8'));console.log('Applied 0001_state.sql');}finally{await db.end();}
