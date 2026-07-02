-- VIVOKID — Migration 002: push_subscriptions (Web Push VAPID souverain)
-- À appliquer depuis le nœud sqldb: psql -U webadmin -h <IP_interne> -d kido -f 002_push_subscriptions.sql

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          SERIAL PRIMARY KEY,
  user_id     VARCHAR(20) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  user_agent  TEXT,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS push_subs_user_idx ON push_subscriptions (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS push_subs_endpoint_idx ON push_subscriptions (endpoint);
