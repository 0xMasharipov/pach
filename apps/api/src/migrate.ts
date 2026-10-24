import postgres from 'postgres';
import {readFile,readdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export async function migrateDatabase(databaseUrl:string){
 const db=postgres(databaseUrl,{max:1,connect_timeout:10,prepare:false});
 try{
  const directory=new URL('../migrations/',import.meta.url);
  const files=(await readdir(directory)).filter(file=>/^\d+_.+\.sql$/.test(file)).sort();
  await db.begin(async tx=>{
   await tx`SELECT pg_advisory_xact_lock(70616348)`;
   for(const file of files)await tx.unsafe(await readFile(new URL(file,directory),'utf8'));
  });
  return files;
 }finally{await db.end();}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 if(!process.env.DATABASE_URL){
  console.error('Set DATABASE_URL in root .env.local or .env before running database migrations.');
  process.exitCode=1;
 }else try{
  const files=await migrateDatabase(process.env.DATABASE_URL);
  console.log('Applied database migrations:',files.join(', '));
 }catch{
  console.error('Database migration failed. Check DATABASE_URL, PostgreSQL reachability and database-owner permissions. Credentials were not printed.');
  process.exitCode=1;
 }
}
