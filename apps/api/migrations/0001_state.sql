-- A deliberately small, transactional MVP aggregate. Every write locks id=1.
-- JSONB maps contain users, nonces, sessions, challenges, games/events, reports,
-- submissions/evidence, reviews/claims/receipts and audit events. This serializes
-- award reservation across API processes; no in-memory fallback in testnet mode.
CREATE TABLE IF NOT EXISTS fyx_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  value JSONB NOT NULL
);
