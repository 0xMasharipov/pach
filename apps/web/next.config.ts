import type { NextConfig } from 'next';
import {fileURLToPath} from 'node:url';
const config: NextConfig = {
  transpilePackages: ['@fyx/shared', '@fyx/game', '@fyx/chain'],
  poweredByHeader: false,
  outputFileTracingRoot: fileURLToPath(new URL('../..', import.meta.url)),
  async rewrites() { return [{source:'/api/:path*',destination:`${process.env.API_URL || 'http://127.0.0.1:3001'}/api/:path*`}]; },
  async headers() { return [{source:'/(.*)',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'X-Frame-Options',value:'DENY'}]}]; },
};
export default config;
