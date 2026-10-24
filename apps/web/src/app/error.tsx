'use client';
import Link from 'next/link';
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="shell error-page"><p className="eyebrow">Something went wrong</p><h1>Let’s give that another try.</h1><p>The page couldn’t finish loading. No transaction status is implied by this error.</p><button className="button primary" onClick={reset}>Try again</button><Link href="/" className="button">Back home</Link></div>;}
