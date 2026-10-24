/** Node HTTP transport for environments where Fastify cannot be installed.
 * Uses the same service and security policy; demo data stays explicitly demo.
 */
import {createServer,type IncomingMessage} from 'node:http';
import {randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {readConfig,type Config} from './config.js';
import {chainGateway,type ChainGateway} from './chain.js';
import {MemoryStore,postgresStore} from './store.js';
import {Service} from './service.js';
import {ApiError,type Store} from './model.js';
import {RequestPolicy,errorResponse,sessionToken,sessionCookie} from './http.js';
const MAX_BODY=16384;
function body(req:IncomingMessage):Promise<unknown>{
 return new Promise((resolve,reject)=>{
  let size=0,failed=false;const chunks:Buffer[]=[];
  req.on('data',(chunk:Buffer)=>{size+=chunk.length;if(size>MAX_BODY){if(!failed)reject(new ApiError(413,'BODY_TOO_LARGE','This request is too large.'));failed=true;chunks.length=0;}else if(!failed)chunks.push(chunk);});
  req.on('end',()=>{if(failed)return;try{const raw=Buffer.concat(chunks).toString('utf8');resolve(raw?JSON.parse(raw):undefined);}catch{reject(new ApiError(400,'INVALID_JSON','Send valid JSON.'));}});
  req.on('error',reject);
 });
}
export function createOfflineServer(config:Config,store:Store,chain:ChainGateway){
 const service=new Service({config,store,chain});const policy=new RequestPolicy(config.origin);
 const server=createServer({requestTimeout:15000,headersTimeout:10000,maxHeaderSize:16384},async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Type','application/json; charset=utf-8');
  const requestId=randomUUID();
  try{
   const method=req.method??'GET';const path=(req.url??'/').split('?')[0]!;
   policy.check({method,origin:req.headers.origin,contentType:req.headers['content-type'],ip:req.socket.remoteAddress??'unknown',url:path});
   if(!['GET','POST'].includes(method)||!path.startsWith('/api/'))throw new ApiError(404,'NOT_FOUND','This API route does not exist.');
   const result=await service.execute(method,path,method==='POST'?await body(req):undefined,sessionToken(req.headers.cookie));
   if(result.cookie||result.clearCookie)res.setHeader('Set-Cookie',sessionCookie(result.cookie??'',config.secure,result.clearCookie));
   res.end(JSON.stringify(result.body));
  }catch(error){const result=errorResponse(error,requestId);res.statusCode=result.status;if(result.retryAfter)res.setHeader('Retry-After',result.retryAfter);res.end(JSON.stringify(result.body));req.resume();}
 });
 server.on('close',()=>{void store.close();});return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{
  const config=readConfig();const chain=chainGateway(config);
  if(config.mode==='testnet')await chain.ready();
  const store=config.databaseUrl?await postgresStore(config.databaseUrl):new MemoryStore();
  const server=createOfflineServer(config,store,chain);
  server.on('error',()=>{console.error('Could not start Node API listener; check host and port.');process.exitCode=1;void store.close();});
  server.listen(config.port,'0.0.0.0',()=>console.log(`Node API transport listening on ${config.port}; mode=${config.mode}`));
  for(const signal of ['SIGINT','SIGTERM'] as const)process.once(signal,()=>server.close());
 }catch{console.error('Could not start API; check configuration and database migration.');process.exitCode=1;}
}
