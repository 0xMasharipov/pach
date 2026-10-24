-- Wallet sessions, claim authorizations and audit records belong to the API.
-- Supabase's browser/Data API roles must not access the aggregate directly.
ALTER TABLE public.fyx_state ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.fyx_state FROM PUBLIC;

DO $$
DECLARE role_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated', 'service_role']
  LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('REVOKE ALL ON TABLE public.fyx_state FROM %I', role_name);
    END IF;
  END LOOP;
END;
$$;
