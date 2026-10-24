import { z } from 'zod';
export const CHAIN_ID = 10143 as const;
export const TRANSACTION_CONFIRMATIONS = 2 as const;
export const TEST_USDC_ADDRESS = '0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73' as const;
export const PRIZES = { finder: '4000000', developer: '14000000', platform: '2000000', total: '20000000' } as const;
export const TOKEN_DECIMALS = 6;
export const BUG_CODE = 'negative_total_due_to_duplicate_coupon' as const;
export const LEVEL = { id: 'checkout', price: 100, coupon: 60, maxCoupons: 2, activeMs: 60_000, lifetimeMs: 300_000 } as const;
export const claimTypes = { Claim: [
  { name: 'challengeId', type: 'uint256' }, { name: 'role', type: 'uint8' },
  { name: 'claimant', type: 'address' }, { name: 'amount', type: 'uint256' },
  { name: 'proofHash', type: 'bytes32' }, { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
] } as const;
export const addressSchema = z.string().regex(/^0x[0-9a-fA-F]{40}$/);
export const hashSchema = z.string().regex(/^0x[0-9a-fA-F]{64}$/);
export const roleSchema = z.enum(['FINDER', 'DEVELOPER']);
export const eventKindSchema = z.enum(['start', 'coupon_applied', 'hint_opened', 'paused', 'resumed']);
export type GameEventKind = z.infer<typeof eventKindSchema>;
export const eventSchema = z.object({sessionId:z.string().min(1).max(128),seq:z.number().int().positive(),kind:eventKindSchema,payload:z.object({}).strict().default({}),clientTimestamp:z.number().optional()}).strict();
export const reportSchema = z.object({sessionId:z.string().min(1).max(128),bugCode:z.string().max(100),evidence:z.string().trim().min(5).max(500)}).strict();
export const sessionSchema = z.object({challengeId:z.string().min(1).max(128),levelId:z.literal('checkout')}).strict();
export interface GameState {
  createdAt:number; expiresAt:number; startedAt:number|null; lastEventAt:number; runningSince:number|null;
  elapsedMs:number; coupons:number; hints:number; seq:number; status:'created'|'running'|'paused'|'submitted';
}
export function createGameState(now:number):GameState { return {createdAt:now,expiresAt:now+LEVEL.lifetimeMs,startedAt:null,lastEventAt:now,runningSince:null,elapsedMs:0,coupons:0,hints:0,seq:0,status:'created'}; }
export function remainingMs(state:GameState,now:number):number {return Math.max(0,LEVEL.activeMs-state.elapsedMs-(state.runningSince===null?0:Math.max(0,now-state.runningSince)));}
export class GameRuleError extends Error { constructor(public code:string) { super(code); this.name='GameRuleError'; } }
export function applyGameEvent(state:GameState,kind:GameEventKind,seq:number,now:number):GameState {
  if(now<state.lastEventAt) throw new GameRuleError('TIME_REVERSED');
  if(now>=state.expiresAt||remainingMs(state,now)<=0) throw new GameRuleError('SESSION_EXPIRED');
  if(seq!==state.seq+1) throw new GameRuleError('INVALID_SEQUENCE');
  if(state.status==='submitted') throw new GameRuleError('ALREADY_SUBMITTED');
  const next={...state,seq,lastEventAt:now};
  if(kind==='start') { if(state.status!=='created') throw new GameRuleError('ALREADY_STARTED'); return {...next,status:'running',startedAt:now,runningSince:now}; }
  if(kind==='resumed') {if(state.status!=='paused') throw new GameRuleError('NOT_PAUSED'); return {...next,status:'running',runningSince:now};}
  if(state.status!=='running') throw new GameRuleError('NOT_RUNNING');
  if(kind==='paused') return {...next,status:'paused',elapsedMs:state.elapsedMs+now-state.runningSince!,runningSince:null};
  if(kind==='coupon_applied') { if(state.coupons>=LEVEL.maxCoupons) throw new GameRuleError('COUPON_LIMIT'); return {...next,coupons:state.coupons+1}; }
  if(kind==='hint_opened') {if(state.hints>=1) throw new GameRuleError('HINT_LIMIT'); return {...next,hints:state.hints+1};}
  throw new GameRuleError('INVALID_EVENT');
}
export function evaluateReport(state:GameState,bugCode:string,now:number):{status:'accepted'|'rejected';xp:number;reason?:string} {
  if(now<state.lastEventAt||now>=state.expiresAt||remainingMs(state,now)<=0) return {status:'rejected',xp:0,reason:'SESSION_EXPIRED'};
  if(state.status!=='running'||state.coupons!==2||bugCode!==BUG_CODE) return {status:'rejected',xp:0,reason:'FINDING_MISMATCH'};
  return {status:'accepted',xp:Math.max(10,100-state.hints*20+Math.floor(remainingMs(state,now)/1000))};
}
export interface GameSession {sessionId:string;startedAt:string;expiresAt:string;levelConfig:typeof LEVEL;version:string;serverState?:GameState}
export interface GameEventResult {accepted:boolean;nextSeq:number;serverState:GameState;serverNow?:number}
export interface GameReportResult {reportId:string;status:'accepted'|'rejected';xp:number;reason?:string}
export interface GameAdapter {
  createSession():Promise<GameSession>;
  event(sessionId:string,seq:number,kind:GameEventKind):Promise<GameEventResult>;
  report(sessionId:string,bugCode:string,evidence:string):Promise<GameReportResult>;
  recover?(sessionId:string):Promise<{serverState:GameState;serverNow?:number}>;
}
