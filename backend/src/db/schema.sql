-- Agents table (registered marketplace participants)
CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  public_key TEXT UNIQUE NOT NULL,
  nametag TEXT UNIQUE,           -- Unicity nametag (e.g., 'alice' for @alice)
  display_name TEXT,             -- Optional friendly display name
  nostr_pubkey TEXT,
  registered_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agents_public_key ON agents(public_key);
CREATE INDEX IF NOT EXISTS idx_agents_nametag ON agents(nametag);

-- Intent metadata (stored alongside Qdrant vectors)
-- This provides relational queries the vector DB can't do
CREATE TABLE IF NOT EXISTS intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qdrant_point_id UUID NOT NULL,
  agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
  intent_type TEXT NOT NULL CHECK (intent_type IN ('sell', 'buy')),
  category TEXT,
  price NUMERIC(18, 8),
  currency TEXT DEFAULT 'UCT',
  location TEXT,
  contact_method TEXT DEFAULT 'nostr',
  contact_handle TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_intents_agent ON intents(agent_id);
CREATE INDEX IF NOT EXISTS idx_intents_status ON intents(status);
CREATE INDEX IF NOT EXISTS idx_intents_category ON intents(category);
CREATE INDEX IF NOT EXISTS idx_intents_qdrant_point ON intents(qdrant_point_id);
