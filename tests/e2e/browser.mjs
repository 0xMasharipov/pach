import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=fileURLToPath(new URL('../../',import.meta.url));
const artifact=process.argv.includes('--artifact');
const origin=artifact?'http://pach.local':process.env.E2E_BASE_URL||'http://localhost:3000';
const output=resolve(root,'test-results');
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{}),args:['--no-sandbox',...(process.env.PLAYWRIGHT_SINGLE_PROCESS==='1'?['--no-zygote','--single-process']:[])]});
let service,policy,errorResponse,sessionToken,sessionCookie;
if(artifact){
 const [{Service},{MemoryStore},{chainGateway},{readConfig},http]=await Promise.all([
  import('../../apps/api/src/service.ts'),import('../../apps/api/src/store.ts'),import('../../apps/api/src/chain.ts'),import('../../apps/api/src/config.ts'),import('../../apps/api/src/http.ts')]);
 const config={...readConfig(),mode:'demo',origin,databaseUrl:undefined,vaultAddress:undefined,verifierKey:undefined,sponsors:[],verifiers:[],admins:[]};
 service=new Service({store:new MemoryStore(),config,chain:chainGateway(config)});
 policy=new http.RequestPolicy(origin);({errorResponse,sessionToken,sessionCookie}=http);
}
const results=[];
async function context(options={}){
 const ctx=await browser.newContext({...options,reducedMotion:'reduce'});
 if(artifact)await ctx.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.origin!==origin)return route.abort();
  if(url.pathname.startsWith('/api/')){
   try{
    const headers=req.headers();policy.check({method:req.method(),origin:headers.origin,contentType:headers['content-type'],url:url.pathname,ip:'artifact-browser'});
    const response=await service.execute(req.method(),url.pathname,req.postData()?JSON.parse(req.postData()):undefined,sessionToken(headers.cookie));
    return route.fulfill({status:200,contentType:'application/json',headers:response.cookie?{'set-cookie':sessionCookie(response.cookie,false)}:{},body:JSON.stringify(response.body)});
   }catch(error){const response=errorResponse(error,'artifact-browser');return route.fulfill({status:response.status,contentType:'application/json',body:JSON.stringify(response.body)});}
  }
  const pathname=decodeURIComponent(url.pathname);
  if(pathname.includes('..'))return route.fulfill({status:400,body:'Invalid path'});
  const rsc=req.headers().rsc==='1';
  const suffix=pathname==='/'?'index':pathname.replace(/^\//,'').replace(/\/$/,'');
  const file=pathname.startsWith('/_next/static/')?resolve(root,'apps/web/.next',pathname.slice('/_next/'.length)):resolve(root,'apps/web/.next/server/app',suffix+(rsc?'.rsc':'.html'));
  try{
   const body=await readFile(file);const type=rsc?'text/x-component':({'.html':'text/html','.js':'application/javascript','.css':'text/css','.woff2':'font/woff2','.json':'application/json'}[extname(file)]||'application/octet-stream');
   return route.fulfill({status:200,contentType:type,body});
  }catch{return route.fulfill({status:404,body:'Artifact not found'});}
 });
 return ctx;
}
async function check(name,fn){await fn();results.push({name,status:'passed'});console.log('PASS',name);}
try{
 for(const width of [360,1440]){
  const ctx=await context({viewport:{width,height:900},hasTouch:width===360,isMobile:width===360});const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await check(`practice gameplay at ${width}px`,async()=>{
   await page.goto(origin+'/play/checkout');
   await page.getByRole('button',{name:'Start challenge'}).click();
   await page.getByRole('button',{name:'Apply coupon',exact:true}).click();
   await page.getByRole('button',{name:'Apply again',exact:true}).click();
   await page.locator('.glitch-total dd').filter({hasText:'-20'}).waitFor();
   await page.getByRole('button',{name:'Submit finding',exact:true}).click();
   await page.getByLabel('Finding category').selectOption('negative_total_due_to_duplicate_coupon');
   await page.getByLabel('Your observation').fill('Applying the same coupon twice changed the total from 100 to -20 demo units.');
   await page.getByRole('button',{name:'Send finding',exact:true}).click();
   await page.getByText('Practice result only.',{exact:false}).waitFor();
   assert.match(await page.locator('.glitch-xp').innerText(),/practice XP/);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'horizontal overflow');
   await page.screenshot({path:resolve(output,`practice-${width}.png`),fullPage:true});
   assert.deepEqual(errors,[]);
  });
  await check(`incorrect report, hint and pause at ${width}px`,async()=>{
   await page.getByRole('button',{name:'Play again',exact:false}).click();
   await page.getByRole('button',{name:'Submit finding',exact:true}).click();
   await page.getByLabel('Finding category').selectOption('missing_image');
   await page.getByLabel('Your observation').fill('I think the product image is missing.');
   await page.getByRole('button',{name:'Send finding',exact:true}).click();
   await page.getByRole('alert').filter({hasText:'Not quite'}).waitFor();
   await page.getByRole('button',{name:'Close report'}).click();
   await page.getByRole('button',{name:'Need a hint?',exact:false}).click();
   await page.getByText('Try applying the same coupon again.',{exact:true}).waitFor();
   await page.getByRole('button',{name:'Pause',exact:true}).click();
   await page.getByRole('heading',{name:'Take a breather.'}).waitFor();
   await page.getByRole('button',{name:'Resume challenge',exact:true}).click();
   await page.getByRole('button',{name:'Apply coupon',exact:true}).waitFor();
  });
  await ctx.close();
 }
 const ctx=await context({viewport:{width:390,height:844}});const page=await ctx.newPage();
 await check('timer expiry prevents further interaction',async()=>{
  await page.clock.install();await page.goto(origin+'/play/checkout');await page.getByRole('button',{name:'Start challenge'}).click();await page.clock.fastForward(61_000);await page.getByRole('heading',{name:'Time’s up.'}).waitFor();assert.equal(await page.getByRole('button',{name:'Apply coupon',exact:true}).count(),0);
 });
 await check('platform routes render without hydration failures or overflow',async()=>{
  for(const path of ['/','/arenas','/arena/preview-checkout','/build','/rewards','/corporate','/review','/leaderboard','/docs','/about']){
   const errors=[];const listener=e=>errors.push(e.message);page.on('pageerror',listener);
   const response=await page.goto(origin+path);assert.equal(response.status(),200,path);await page.locator('h1').waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,path+' overflow');assert.deepEqual(errors,[],path);page.off('pageerror',listener);
  }
  await page.goto(origin+'/');await page.screenshot({path:resolve(output,'home-mobile.png'),fullPage:true});
 });
 await ctx.close();
 console.log(JSON.stringify({mode:artifact?'built artifacts with in-process real API service; no HTTP listener or live chain':'HTTP preview',results},null,2));
}finally{await browser.close();}
