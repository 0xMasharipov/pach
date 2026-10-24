import type { Address, Hex } from 'viem';
import type {GameState} from '@fyx/shared';
export type Role = 'player' | 'developer' | 'sponsor' | 'verifier' | 'admin';
export type AwardRole = 'FINDER' | 'DEVELOPER';
export interface User { id: string; address: Address; role: Role; roles: Role[]; handle?: string; publicProfile: boolean }
export interface Challenge { id: string; slug: string; title: string; description: string; status: 'draft'|'funding'|'open'|'expired'|'settled'|'refunded'; chainId: number; tokenAddress: Address; prizes: {finder:string;developer:string;platform:string}; expiry:number; sponsor:Address; demo?:boolean; contractChallengeId?:string; fundingTxHash?:Hex; vaultAddress?:Address; refundTxHash?:Hex; refundedAmount?:string }
export interface Game { id:string; wallet:Address; challengeId:string; state:GameState; events:{seq:number;kind:string;at:number}[]; reportId?:string }
export interface Report { id:string; challengeId:string; sessionId:string; wallet:Address; status:'accepted'|'rejected'; xp:number; evidence:string; proofHash:Hex; reviewStatus:'pending'|'approved'; reason?:string }
export interface Submission { id:string; challengeId:string; wallet:Address; patchId:string; commitRef:string; status:'passed'|'failed'|'needs_review'; testOutput:string; proofHash:Hex; reviewStatus:'pending'|'approved' }
export interface Approval { challengeId:string; role:0|1; claimant:Address; amount:string; proofHash:Hex; nonce:string; deadline:string }
export interface Claim { id:string; challengeId:string; wallet:Address; role:AwardRole; amount:string; proofHash:Hex; status:'eligible'|'approval_prepared'|'tx_pending'|'claimed'|'expired'; approval?:Approval; signature?:Hex; txHash?:Hex; reviewer:Address; transactionError?:'TX_REVERTED'|'INVALID_CLAIM_TX' }
export interface State { users:Record<string,User>; nonces:Record<string,{message:string;address:Address;expiresAt:number}>; sessions:Record<string,{address:Address;expiresAt:number}>; challenges:Record<string,Challenge>; games:Record<string,Game>; reports:Record<string,Report>; submissions:Record<string,Submission>; claims:Record<string,Claim>; audit:{at:number;actor:string;action:string;subject:string}[] }
export const emptyState = ():State => ({users:{},nonces:{},sessions:{},challenges:{},games:{},reports:{},submissions:{},claims:{},audit:[]});
export interface Store { transaction<T>(fn:(state:State)=>Promise<T>|T):Promise<T>; close():Promise<void> }
export class ApiError extends Error { constructor(public statusCode:number,public code:string,message:string){super(message);} }
export const fail = (status:number,code:string,message:string):never => {throw new ApiError(status,code,message);};
