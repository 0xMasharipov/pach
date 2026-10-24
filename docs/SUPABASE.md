# Supabase database setup

The API stores wallet sessions, campaign state, review decisions and claim records in PostgreSQL. Its connection is configured with `DATABASE_URL`. The project’s Supabase API keys can remain in `.env.local`; the current persistence layer uses the Postgres connection.

## Connection

In the [Supabase Connect dialog](https://supabase.com/docs/guides/database/connecting-to-postgres), choose the **Session pooler** connection on port **5432** for an IPv4 backend. Copy the connection URI, replace the password placeholder, and put it in the project root `.env.local`:

```dotenv
DATABASE_URL="postgresql://postgres.PROJECT_REF:ENCODED_PASSWORD@POOLER_HOST:5432/postgres?sslmode=require"
```

Use the actual host supplied by Supabase. Percent-encode reserved characters in the password. The existing `SUPABASE_POSTGRES_PASSWORD` is the database password; keep credentials in ignored local environment files or the deployment’s server secret manager.

Root development/testnet launchers and API package start/migration commands read `.env` followed by `.env.local`. Explicit process environment values have the highest priority. Database, Supabase and verifier credentials are removed from the web child’s environment.

## Migration and startup

```sh
pnpm db:migrate
pnpm monad:dev
```

The migration runner applies the ordered, idempotent SQL files in one transaction and takes an advisory lock. It does not overwrite existing campaign records. The backend uses `prepare: false` so it also works with Supabase’s transaction pooler if that mode is deliberately selected.

Migration `0002_backend_only.sql` enables RLS on `public.fyx_state` and revokes Data API grants from `PUBLIC`, `anon`, `authenticated` and `service_role` when those roles exist. There are no browser policies for the aggregate: all wallet authentication and authorization go through the PACH API. The database-owner connection retains access. Only this application table is affected.

The testnet launcher reads the confirmed Monad deployment and unlocks the local encrypted verifier for the API. It requires PostgreSQL and a matching on-chain verifier; testnet mode has no memory-store fallback.

## Verification

After a successful migration, check the API health response for `mode: "testnet"` and `storage: "postgres"`. Verify that the Data API cannot read or write `fyx_state` using a publishable key, then exercise wallet sign-in, campaign funding, review and claims through the application.

Current integration work has verified the supplied project’s API credentials and local environment handling. The remote database migration and runtime checks are pending a usable Postgres connection URI. No schema changes have been claimed as applied yet.
