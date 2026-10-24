import Link from 'next/link';
export default function NotFound(){return <div className="shell error-page"><p className="eyebrow">404 / Page not found</p><h1>This one isn’t part of the challenge.</h1><p>Let’s get you back to something playable.</p><Link className="button primary" href="/arenas">Explore challenges</Link></div>;}
