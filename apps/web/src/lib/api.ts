export class ApiError extends Error {
  constructor(message: string, public code: string, public status: number) { super(message); }
}
export async function api<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;
  try { response = await fetch(`/api${path}`, {method: body === undefined ? 'GET' : 'POST', credentials:'same-origin', headers: body === undefined ? {} : {'Content-Type':'application/json'}, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(20000), cache:'no-store'}); }
  catch { throw new ApiError('Can’t reach the server right now. You can still play the practice challenge.', 'NETWORK_UNAVAILABLE', 0); }
  let data: unknown;
  try { data = await response.json(); } catch { throw new ApiError('The server is unavailable. Please try again shortly.', 'INVALID_RESPONSE', response.status); }
  if (!response.ok) { const failure = data as {error?:{message?:string;code?:string}}; throw new ApiError(failure.error?.message || 'This request could not be completed.', failure.error?.code || 'REQUEST_FAILED', response.status); }
  return data as T;
}
export type User = {id:string;address:`0x${string}`;role:string;roles?:string[];handle?:string;publicProfile:boolean};
export type Config = {mode:'demo'|'testnet';chainId:number;tokenAddress:`0x${string}`;vaultAddress:`0x${string}`|null;explorerUrl:string};
export type Challenge = {id:string;slug:string;title:string;description:string;status:string;chainId:number;tokenAddress:string;prizes:{finder:string;developer:string;platform:string};expiry:number;sponsor:string;demo?:boolean;contractChallengeId?:string;fundingTxHash?:`0x${string}`};
export type Approval = {challengeId:string;role:0|1;claimant:`0x${string}`;amount:string;proofHash:`0x${string}`;nonce:string;deadline:string};
export type PreparedClaim = {claimId:string;approval:Approval;signature:`0x${string}`;chainId:number;verifyingContract:`0x${string}`};
export type Reward = {id:string;challengeId:string;role:'FINDER'|'DEVELOPER';amount:string;status:string;txHash?:`0x${string}`;transactionError?:string};
export type Submission = {id:string;challengeId:string;wallet:string;patchId:string;commitRef:string;status:string;testOutput:string;proofHash:string;reviewStatus:string};
export type Report = {id:string;challengeId:string;wallet:string;status:string;xp:number;evidence:unknown;reviewStatus:string;events?:unknown;proofHash?:string};
export const errorText = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.';
export const shortAddress = (address:string) => `${address.slice(0,6)}…${address.slice(-4)}`;
export function formatAmount(amount:string):string { const n=BigInt(amount); const whole=n/1000000n; const fraction=(n%1000000n).toString().padStart(6,'0').replace(/0+$/,''); return `${whole}${fraction?'.'+fraction:''}`; }
