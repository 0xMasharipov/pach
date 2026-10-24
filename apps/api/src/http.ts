import {ZodError} from 'zod';
import {ApiError} from './model.js';

export class RateLimitError extends ApiError {
 constructor(public retryAfter:number){super(429,'RATE_LIMITED','Too many requests. Wait a minute and try again.');}
}
/** Shared security policy for Fastify and the dependency-free development listener. */
export class RequestPolicy {
 private requests=new Map<string,{count:number;expires:number}>();
 constructor(private origin:string,private now:()=>number=Date.now){}
 check(input:{method:string;origin?:string;contentType?:string;ip:string;url:string}){
  const now=this.now();
  for(const [key,entry] of this.requests)if(entry.expires<=now)this.requests.delete(key);
  const key=`${input.ip}:${input.url.startsWith('/api/auth/')?'auth':'api'}`;
  const entry=this.requests.get(key)??{count:0,expires:now+60000};entry.count++;this.requests.set(key,entry);
  const limit=input.url.startsWith('/api/auth/')?30:240;
  if(entry.count>limit)throw new RateLimitError(Math.ceil((entry.expires-now)/1000));
  if(input.method!=='GET'&&input.method!=='HEAD'){
   if(input.origin!==this.origin)throw new ApiError(403,'ORIGIN_REJECTED','This request must come from the application origin.');
   if(input.contentType?.split(';')[0]?.trim().toLowerCase()!=='application/json')throw new ApiError(415,'JSON_REQUIRED','Send an application/json request.');
  }
 }
}
export function errorResponse(error:unknown,requestId:string){
 const known=error instanceof ApiError;
 const rawStatus=typeof error==='object'&&error!==null&&'statusCode' in error?Number(error.statusCode):500;
 const status=error instanceof ZodError?400:known?error.statusCode:rawStatus>=400&&rawStatus<500?rawStatus:500;
 const code=error instanceof ZodError?'INVALID_INPUT':known?error.code:status===500?'INTERNAL_ERROR':'REQUEST_REJECTED';
 const message=error instanceof ZodError?'Check the request fields.':known?error.message:status===500?'The request could not be completed. Try again.':'The request was rejected.';
 return {status,body:{error:{code,message,requestId}},retryAfter:error instanceof RateLimitError?error.retryAfter:undefined};
}
export const sessionToken=(cookie?:string)=>cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('fyx_session='))?.slice('fyx_session='.length);
export const sessionCookie=(token:string,secure:boolean,clear=false)=>`fyx_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${clear?0:3600}${secure?'; Secure':''}`;
