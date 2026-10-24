import {z} from 'zod';
import type {Address,Hex} from 'viem';
const env=z.object({NODE_ENV:z.string().default('development'),FYX_MODE:z.enum(['demo','testnet']).default('demo'),PORT:z.coerce.number().int().min(1).max(65535).default(3001),PUBLIC_ORIGIN:z.string().url().default('http://localhost:3000'),DATABASE_URL:z.string().optional(),MONAD_RPC_URL:z.string().url().default('https://testnet-rpc.monad.xyz'),FYX_VAULT_ADDRESS:z.string().regex(/^0x[0-9a-fA-F]{40}$/).optional(),VERIFIER_PRIVATE_KEY:z.string().regex(/^0x[0-9a-fA-F]{64}$/).optional(),SPONSOR_ADDRESSES:z.string().default(''),VERIFIER_ADDRESSES:z.string().default(''),ADMIN_ADDRESSES:z.string().default('')});
const addresses=(value:string)=>value.split(',').map(v=>v.trim().toLowerCase()).filter(Boolean).map(v=>z.string().regex(/^0x[0-9a-f]{40}$/).parse(v));
export function readConfig(source:NodeJS.ProcessEnv=process.env){
 const raw=Object.fromEntries(Object.entries(source).filter(([,v])=>v!==''));const e=env.parse(raw);
 if(e.FYX_MODE==='testnet'&&!e.DATABASE_URL)throw new Error('Testnet mode requires PostgreSQL DATABASE_URL; memory storage is demo only.');
 if(e.FYX_MODE==='testnet'&&(!e.FYX_VAULT_ADDRESS||!e.VERIFIER_PRIVATE_KEY))throw new Error('Testnet mode requires FYX_VAULT_ADDRESS and a server-only VERIFIER_PRIVATE_KEY.');
 if(e.NODE_ENV==='production'&&!e.PUBLIC_ORIGIN.startsWith('https://'))throw new Error('Production requires HTTPS PUBLIC_ORIGIN.');
 return {mode:e.FYX_MODE,port:e.PORT,origin:new URL(e.PUBLIC_ORIGIN).origin,secure:e.NODE_ENV==='production',databaseUrl:e.DATABASE_URL,rpcUrl:e.MONAD_RPC_URL,vaultAddress:e.FYX_VAULT_ADDRESS as Address|undefined,verifierKey:e.VERIFIER_PRIVATE_KEY as Hex|undefined,sponsors:addresses(e.SPONSOR_ADDRESSES),verifiers:addresses(e.VERIFIER_ADDRESSES),admins:addresses(e.ADMIN_ADDRESSES)};
}
export type Config=ReturnType<typeof readConfig>;
