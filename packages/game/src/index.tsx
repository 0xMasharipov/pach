'use client';
import {useState,useEffect,useRef,useCallback} from 'react';
import {applyGameEvent,createGameState,evaluateReport,remainingMs,BUG_CODE,LEVEL,type GameAdapter,type GameState,type GameEventKind,type GameReportResult} from '@fyx/shared';
export interface SpotTheGlitchProps {adapter?:GameAdapter;onExit?:()=>void}
export function SpotTheGlitch({adapter,onExit}:SpotTheGlitchProps) {
 const [state,setState]=useState<GameState|null>(null);
 const [sessionId,setSessionId]=useState('');
 const [now,setNow]=useState(Date.now());
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [reportOpen,setReportOpen]=useState(false);
 const [category,setCategory]=useState('');
 const [evidence,setEvidence]=useState('');
 const [result,setResult]=useState<GameReportResult|null>(null);
 const [sound,setSound]=useState(false);
 const stateRef=useRef(state); stateRef.current=state;
 const busyRef=useRef(false);
 const pauseQueued=useRef(false);
 const offset=useRef(0);
 const clock=useCallback(()=>Date.now()-offset.current,[]);
 const sync=(s:GameState,serverNow=s.lastEventAt)=>{offset.current=Date.now()-serverNow;setNow(serverNow);stateRef.current=s;setState(s);};
 const time=state?remainingMs(state,now):LEVEL.activeMs;
 const expired=!!state&&(now>=state.expiresAt||time<=0);
 const won=result?.status==='accepted';
 const rejected=!!adapter&&result?.status==='rejected';
 const beep=()=>{if(!sound)return;try{const ctx=new AudioContext();const oscillator=ctx.createOscillator();const gain=ctx.createGain();oscillator.connect(gain);gain.connect(ctx.destination);gain.gain.value=.025;oscillator.frequency.value=660;oscillator.start();oscillator.stop(ctx.currentTime+.1);oscillator.onended=()=>void ctx.close();}catch{/* Audio is optional. */}};
 const send=useCallback(async(kind:GameEventKind)=>{
  const current=stateRef.current;if(!current||busyRef.current)return;
  busyRef.current=true;setBusy(true);setError('');
  try{
   if(adapter){const response=await adapter.event(sessionId,current.seq+1,kind);sync(response.serverState,response.serverNow);}
   else setState(applyGameEvent(current,kind,current.seq+1,clock()));
  }catch(e){setError(e instanceof Error?e.message:'Could not save this action. Try again.');
   if(adapter?.recover){try{const recovered=await adapter.recover(sessionId);sync(recovered.serverState,recovered.serverNow);}catch{/* Preserve session for retry. */}}
  }finally{busyRef.current=false;setBusy(false);}
 },[adapter,sessionId,clock]);
 useEffect(()=>{if(!state||won||rejected)return;const timer=setInterval(()=>setNow(clock()),200);return()=>clearInterval(timer);},[state,won,rejected,clock]);
 useEffect(()=>{if(!busy&&pauseQueued.current){pauseQueued.current=false;if(document.hidden&&state?.status==='running'&&!result)void send('paused');}},[busy,state,result,send]);
 useEffect(()=>{const visibility=()=>{if(document.hidden&&stateRef.current?.status==='running'){if(busyRef.current)pauseQueued.current=true;else void send('paused');}else pauseQueued.current=false;};document.addEventListener('visibilitychange',visibility);return()=>document.removeEventListener('visibilitychange',visibility);},[send]);
 async function start(){
  if(busyRef.current)return;busyRef.current=true;setBusy(true);setError('');setResult(null);setReportOpen(false);setCategory('');setEvidence('');
  try{
   if(adapter){const session=await adapter.createSession();setSessionId(session.sessionId);const response=await adapter.event(session.sessionId,1,'start');sync(response.serverState,response.serverNow);}
   else{offset.current=0;const timestamp=Date.now();setSessionId(`preview-${timestamp}`);setState(applyGameEvent(createGameState(timestamp),'start',1,timestamp));setNow(timestamp);}
  }catch(e){setError(e instanceof Error?e.message:'The challenge could not start. Try again.');}
  finally{busyRef.current=false;setBusy(false);}
 }
 async function submit(event:React.FormEvent){
  event.preventDefault();if(!state||busyRef.current||expired)return;
  busyRef.current=true;setBusy(true);setError('');
  try{
   const verdict=adapter?await adapter.report(sessionId,category,evidence):{...evaluateReport(state,category,clock()),reportId:'preview'};
   setResult(verdict);if(verdict.status==='accepted'){setReportOpen(false);beep();}else setError(verdict.reason==='SESSION_EXPIRED'?"Time’s up. Try a new round.":'Not quite. Check what happened to the total.');
  }catch(e){setError(e instanceof Error?e.message:'Your finding could not be submitted. Try again.');}
  finally{busyRef.current=false;setBusy(false);}
 }
 const interactive=!!state&&!won&&!rejected&&!expired&&state.status==='running'&&!busy;
 return <section className="glitch" data-fyx-theme="play" aria-label="Spot the Glitch game">
  <header className="glitch-top"><div><span className="glitch-eyebrow">PACH LAB / CHALLENGE 001</span><h2>Spot the Glitch<span className="glitch-dot">.</span></h2></div><button className="glitch-icon-button" type="button" aria-pressed={sound} onClick={()=>setSound(!sound)}>{sound?'Sound on':'Sound off'}</button></header>
  <div className="glitch-status"><span className="glitch-mode">{adapter?'Testnet challenge':'Demo · practice mode'}</span><span>{adapter?'Findings require review':'No wallet needed. Rewards unavailable.'}</span></div>
  {!state?<div className="glitch-brief"><div className="glitch-target" aria-hidden="true">⌕</div><p className="glitch-eyebrow">YOUR MISSION</p><h3>A checkout that<br/>doesn’t quite add up.</h3><p>Try this fictional shop. Find what’s wrong with its checkout before the timer runs out, then tell us what happened.</p><div className="glitch-rules"><span>60 seconds</span><span>One hidden bug</span><span>One useful finding</span></div><button className="glitch-primary" disabled={busy} onClick={()=>void start()}>{busy?'Starting…':'Start challenge'} <span aria-hidden="true">↗</span></button><p className="glitch-small">A controlled testing sandbox. No purchases or real money.</p></div>:
   won?<div className="glitch-outcome" role="status"><div className="glitch-check" aria-hidden="true">✓</div><p className="glitch-eyebrow">NICE CATCH</p><h3>That’s not how<br/>discounts should work.</h3><p>You applied the same coupon twice. A 100-unit cart fell to −20. A coupon should apply once, and a total should never go below zero.</p><div className="glitch-xp">+{result.xp} <span>{adapter?'XP':'practice XP'}</span></div><p className="glitch-small">{adapter?'Your finding passed the game checks. An authorized reviewer must approve any testnet reward.':'Practice result only. This round cannot be converted into a reward claim.'}</p><button className="glitch-primary" onClick={()=>void start()} disabled={busy}>Play again <span aria-hidden="true">↻</span></button>{onExit&&<button className="glitch-text-button" onClick={onExit}>Back to challenges</button>}</div>:
   rejected?<div className="glitch-timeout" role="status"><h3>That finding didn’t match.</h3><p>This campaign round is closed. Start a new round and look closely at the checkout total.</p><button className="glitch-primary" disabled={busy} onClick={()=>void start()}>Try a new round</button></div>:
   <><div className="glitch-hud"><div><span className="glitch-eyebrow">TIME LEFT</span><strong className={time<15000?'glitch-urgent':''}>{Math.ceil(time/1000).toString().padStart(2,'0')}<small>s</small></strong></div><div><span className="glitch-eyebrow">MISSION</span><b>Broken Checkout</b></div><button className="glitch-text-button" disabled={busy||expired} onClick={()=>void send(state.status==='paused'?'resumed':'paused')}>{state.status==='paused'?'Resume':'Pause'}</button></div>
   <div className="glitch-time-track"><div style={{width:`${time/LEVEL.activeMs*100}%`}}/></div>
   {expired?<div className="glitch-timeout" role="status"><h3>Time’s up.</h3><p>A fresh pair of eyes? Try the checkout again.</p><button className="glitch-primary" onClick={()=>void start()}>Try again</button></div>:
   state.status==='paused'?<div className="glitch-timeout"><h3>Take a breather.</h3><p>The game timer is paused. This session closes five minutes after it was created.</p><button className="glitch-primary" onClick={()=>void send('resumed')} disabled={busy}>Resume challenge</button></div>:
   <div className="glitch-workspace"><div className="glitch-shop"><div className="glitch-shop-header"><b>ordinary<span>goods</span></b><span>Sandbox checkout</span></div><div className="glitch-product"><div className="glitch-product-art" aria-hidden="true"><div className="glitch-bag"><span>og.</span></div></div><div><span className="glitch-eyebrow">EVERYDAY ESSENTIALS</span><h3>The everyday tote</h3><p>Natural canvas / one size</p><b>100 demo units</b></div></div><div className="glitch-coupon"><div><b>GOOD60</b><span>Take 60 units off your order</span></div><button disabled={!interactive||state.coupons>=2} onClick={()=>void send('coupon_applied')}>{state.coupons>=2?'Applied twice':state.coupons===1?'Apply again':'Apply coupon'}</button></div><dl className="glitch-totals"><div><dt>Subtotal</dt><dd>100</dd></div><div><dt>Discount {state.coupons>0&&`(×${state.coupons})`}</dt><dd>−{state.coupons*60}</dd></div><div className="glitch-total"><dt>Total <span>demo units</span></dt><dd aria-live="polite">{100-state.coupons*60}</dd></div></dl><p className="glitch-shop-note">Fictional items. No order will be placed.</p></div>
   <aside className="glitch-notes"><span className="glitch-eyebrow">INVESTIGATION NOTES</span><h3>Something seems off.</h3><p>Try the checkout. Look at what changes. When you spot the problem, submit a finding.</p><button className="glitch-hint" disabled={!interactive||state.hints>0} onClick={()=>void send('hint_opened')}>{state.hints?'Hint opened':'Need a hint?'} <span>{state.hints?'':'−20 potential XP'}</span></button>{state.hints>0&&<p className="glitch-hint-copy">Try applying the same coupon again.</p>}<button className="glitch-primary" disabled={!interactive} onClick={()=>setReportOpen(true)}>Submit finding <span aria-hidden="true">↗</span></button><p className="glitch-small">You’ll need to describe the bug. Clicking through the shop is only the beginning.</p></aside></div>}
   {reportOpen&&!expired&&state.status==='running'&&<form className="glitch-report" onSubmit={submit}><div className="glitch-report-heading"><h3>What went wrong?</h3><button type="button" className="glitch-text-button" onClick={()=>setReportOpen(false)}>Close report</button></div><label>Finding category<select required value={category} onChange={e=>setCategory(e.target.value)}><option value="">Choose what you noticed</option><option value="missing_image">The product image is missing</option><option value={BUG_CODE}>The same coupon makes the total negative</option><option value="incorrect_shipping">The shipping cost is incorrect</option></select></label><label>Your observation<textarea required minLength={5} maxLength={500} value={evidence} onChange={e=>setEvidence(e.target.value)} placeholder="Describe what you did and what happened."/></label><p className="glitch-small">Keep this about the fictional checkout. Don’t include personal information.</p><button className="glitch-primary" disabled={busy||expired}>{busy?'Checking your report…':'Send finding'}</button></form>}</>}
  {error&&<div className="glitch-error" role="alert">{error}</div>}
  <footer className="glitch-footer"><span>AUTHORIZED SANDBOX</span><span>XP is progress, not currency.</span></footer>
 </section>;
}
