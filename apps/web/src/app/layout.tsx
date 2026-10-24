import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {Providers,Header,Footer} from '../components/system';
import {brand} from '../config/brand';
import './globals.css';
import '@fyx/game/style.css';
export const metadata:Metadata={title:{default:`${brand.displayName} — ${brand.category}`,template:`%s | ${brand.displayName}`},description:brand.subhead,robots:{index:false,follow:false},icons:{icon:{url:'/brand/favicon.png',type:'image/png',sizes:'64x64'},apple:{url:'/brand/apple-touch-icon.png',sizes:'180x180',type:'image/png'}}};
export default function RootLayout({children}:{children:ReactNode}){return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a><Providers><Header/><main id="main-content">{children}</main><Footer/></Providers></body></html>;}
