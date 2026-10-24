import Fastify from 'fastify';
import {readConfig,type Config} from './config.js';
import {chainGateway,type ChainGateway} from './chain.js';
import {MemoryStore,postgresStore} from './store.js';
import {Service} from './service.js';
import type {Store} from './model.js';
import {RequestPolicy,errorResponse,sessionToken,sessionCookie} from './http.js';
import {pathToFileURL} from 'node:url';
export function createServer(config:Config,store:Store,chain:ChainGateway){
 const app=Fastify({logger:{level:'info',redact:['req.headers.cookie','req.headers.authorization','res.headers["set-cookie"]']},bodyLimit:16384,trustProxy:false});
 const service=new Service({config,store,chain});
 const policy=new RequestPolicy(config.origin);
 app.addHook('onRequest',async(req,reply)=>{
  reply.header('Cache-Control','no-store').header('X-Content-Type-Options','nosniff');
  policy.check({method:req.method,origin:req.headers.origin,contentType:req.headers['content-type'],ip:req.ip,url:req.url});
 });
 app.setErrorHandler((error,req,reply)=>{
  const result=errorResponse(error,req.id);
  if(result.status>=500)req.log.error({requestId:req.id,code:result.body.error.code},'API request failed');
  if(result.retryAfter)reply.header('Retry-After',result.retryAfter);
  reply.code(result.status).send(result.body);
 });
 app.route({method:['GET','POST'],url:'/api/*',handler:async(req,reply)=>{
  const result=await service.execute(req.method,req.url.split('?')[0]!,req.body,sessionToken(req.headers.cookie));
  if(result.cookie||result.clearCookie)reply.header('Set-Cookie',sessionCookie(result.cookie??'',config.secure,result.clearCookie));
  return result.body;
 }});
 app.addHook('onClose',()=>store.close());return app;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{
  const config=readConfig();const store=config.databaseUrl?await postgresStore(config.databaseUrl):new MemoryStore();
  const app=createServer(config,store,chainGateway(config));
  await app.listen({port:config.port,host:'0.0.0.0'});
  for(const signal of ['SIGINT','SIGTERM'] as const)process.once(signal,()=>{void app.close();});
 }catch{console.error('Could not start API; check configuration, port and database migration.');process.exitCode=1;}
}
