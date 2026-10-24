import { emptyState, type State, type Store } from './model.js';

/** Explicit test/demo store. Clone-on-write gives rollback and serial execution. */
export class MemoryStore implements Store {
  private state: State;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(seed:State=emptyState()){this.state=structuredClone(seed);}
  transaction<T>(fn:(state:State)=>Promise<T>|T):Promise<T>{
    const operation=this.queue.then(async()=>{const draft=structuredClone(this.state); const result=await fn(draft);this.state=draft;return structuredClone(result);});
    this.queue=operation.catch(()=>undefined);return operation;
  }
  async close(){}
}

/** Small hackathon deployment: one locked JSONB aggregate, not a scalable indexer. */
export async function postgresStore(url:string):Promise<Store>{
  const [{default:postgres},{drizzle},{pgTable,integer,jsonb},{eq}]=await Promise.all([import('postgres'),import('drizzle-orm/postgres-js'),import('drizzle-orm/pg-core'),import('drizzle-orm')]);
  const client=postgres(url,{max:5,connect_timeout:10,prepare:false});
  const db=drizzle(client);
  const table=pgTable('fyx_state',{id:integer('id').primaryKey(),value:jsonb('value').$type<State>().notNull()});
  // Migration must have run. Startup intentionally fails if durable storage is absent.
  await db.insert(table).values({id:1,value:emptyState()}).onConflictDoNothing();
  return {
    transaction:fn=>db.transaction(async tx=>{
      const [row]=await tx.select().from(table).where(eq(table.id,1)).for('update');
      if(!row)throw new Error('Database state missing');
      const result=await fn(row.value);
      await tx.update(table).set({value:row.value}).where(eq(table.id,1));
      return result;
    }),
    close:()=>client.end()
  };
}
