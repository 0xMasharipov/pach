# Suggested `.env.example` (documentation — copy values to actual local `.env` only)

```dotenv
# Browser-exposed, safe to publish
NEXT_PUBLIC_MONAD_CHAIN_ID=10143
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_TEST_USDC_ADDRESS=0x56bf9CDc3C1876F3F22655a0016C2743E9e39a73
NEXT_PUBLIC_FYX_VAULT_ADDRESS=
NEXT_PUBLIC_API_URL=http://localhost:3001

# Server-only: never prefix with NEXT_PUBLIC
DATABASE_URL=postgresql://fyx:local-development-only@localhost:5432/fyx
SESSION_SECRET=replace_with_strong_random_secret
VERIFIER_PRIVATE_KEY=
DEPLOYER_PRIVATE_KEY=
CORS_ALLOWED_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Never commit a populated `.env`. `.env.example` must contain **no usable secret**. The server-only verifier key must never reach a browser bundle. Store actual deployed addresses only after chain verification; false placeholders should prevent chain writes rather than route funds to wrong addresses.
