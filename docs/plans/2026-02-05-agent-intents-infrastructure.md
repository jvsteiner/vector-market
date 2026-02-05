# Agent Intents Infrastructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the backend infrastructure for Vector Sphere's agent marketplace - Qdrant vector database for listing discovery, Express API for agents, and Openclaw skill for AI agent interaction.

**Architecture:**
- Docker Compose on VPS: Express backend + Qdrant + PostgreSQL
- Express API handles intent posting and semantic search (generates embeddings via OpenAI)
- Agents authenticate with secp256k1 signatures (same pattern as PolyClaw)
- Openclaw skill provides CLI tools for agents to interact with the marketplace

**Tech Stack:**
- Node.js 22, Express 5, TypeScript
- Qdrant (vector database)
- PostgreSQL (agent registry, metadata)
- OpenAI API (text-embedding-3-small)
- @noble/curves (secp256k1 signatures)
- Docker Compose

---

## Phase 1: Docker Compose Infrastructure

### Task 1: Create Backend Directory Structure

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/.gitignore`

**Step 1: Create package.json**

```json
{
  "name": "vector-sphere-backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "test:run": "vitest run"
  },
  "dependencies": {
    "@noble/curves": "^2.0.1",
    "@noble/hashes": "^2.0.1",
    "@qdrant/js-client-rest": "^1.12.0",
    "dotenv": "^17.2.3",
    "express": "^5.2.1",
    "openai": "^4.77.0",
    "pg": "^8.18.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^25.2.0",
    "@types/pg": "^8.16.0",
    "tsx": "^4.21.0",
    "typescript": "^5.9.3",
    "vitest": "^4.0.18"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create .gitignore**

```
node_modules/
dist/
.env
```

**Step 4: Commit**

```bash
cd /Users/jamie/Code/vector-sphere
git add backend/
git commit -m "feat: initialize backend package structure"
```

---

### Task 2: Create Docker Compose Setup

**Files:**
- Create: `backend/docker-compose.dev.yml`
- Create: `backend/Dockerfile.dev`

**Step 1: Create docker-compose.dev.yml**

```yaml
# Local development stack
# Run: docker compose -f docker-compose.dev.yml up

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - PORT=3001
      - DATABASE_URL=postgres://vectorsphere:vectorsphere@db:5432/vectorsphere
      - QDRANT_URL=http://qdrant:6333
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./src:/app/src:ro
    depends_on:
      db:
        condition: service_healthy
      qdrant:
        condition: service_healthy

  db:
    image: postgres:17-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=vectorsphere
      - POSTGRES_PASSWORD=vectorsphere
      - POSTGRES_DB=vectorsphere
    volumes:
      - postgres-dev-data:/var/lib/postgresql/data
      - ./src/db/schema.sql:/docker-entrypoint-initdb.d/schema.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vectorsphere"]
      interval: 2s
      timeout: 5s
      retries: 10

  qdrant:
    image: qdrant/qdrant:v1.13.2
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant-dev-data:/qdrant/storage
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:6333/readyz"]
      interval: 2s
      timeout: 5s
      retries: 10

volumes:
  postgres-dev-data:
  qdrant-dev-data:
```

**Step 2: Create Dockerfile.dev**

```dockerfile
# Development Dockerfile
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source
COPY . .

EXPOSE 3001

# Run with tsx watch for hot reload
CMD ["npx", "tsx", "watch", "src/index.ts"]
```

**Step 3: Commit**

```bash
git add backend/docker-compose.dev.yml backend/Dockerfile.dev
git commit -m "feat: add Docker Compose with Qdrant and PostgreSQL"
```

---

### Task 3: Create Database Schema

**Files:**
- Create: `backend/src/db/schema.sql`
- Create: `backend/src/db/client.ts`

**Step 1: Create schema.sql**

```sql
-- Agents table (registered marketplace participants)
CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  public_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  nostr_pubkey TEXT,
  registered_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agents_public_key ON agents(public_key);

-- Intent metadata (stored alongside Qdrant vectors)
-- This provides relational queries the vector DB can't do
CREATE TABLE IF NOT EXISTS intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qdrant_point_id UUID NOT NULL,
  agent_id INTEGER REFERENCES agents(id),
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
```

**Step 2: Create client.ts**

```typescript
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

export async function getClient() {
  return pool.connect();
}

export { pool };
```

**Step 3: Commit**

```bash
git add backend/src/db/
git commit -m "feat: add PostgreSQL schema and client"
```

---

### Task 4: Create Qdrant Client and Collection Setup

**Files:**
- Create: `backend/src/qdrant/client.ts`
- Create: `backend/src/qdrant/setup.ts`

**Step 1: Create client.ts**

```typescript
import { QdrantClient } from '@qdrant/js-client-rest';

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
});

export const COLLECTION_NAME = 'intents';
export const VECTOR_SIZE = 1536; // text-embedding-3-small dimension
```

**Step 2: Create setup.ts**

```typescript
import { qdrant, COLLECTION_NAME, VECTOR_SIZE } from './client.js';

export async function ensureCollection(): Promise<void> {
  const collections = await qdrant.getCollections();
  const exists = collections.collections.some(c => c.name === COLLECTION_NAME);

  if (!exists) {
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: 'Cosine',
      },
    });
    console.log(`Created collection: ${COLLECTION_NAME}`);

    // Create payload indexes for filtering
    await qdrant.createPayloadIndex(COLLECTION_NAME, {
      field_name: 'intent_type',
      field_schema: 'keyword',
    });
    await qdrant.createPayloadIndex(COLLECTION_NAME, {
      field_name: 'category',
      field_schema: 'keyword',
    });
    await qdrant.createPayloadIndex(COLLECTION_NAME, {
      field_name: 'status',
      field_schema: 'keyword',
    });
    console.log('Created payload indexes');
  } else {
    console.log(`Collection ${COLLECTION_NAME} already exists`);
  }
}
```

**Step 3: Commit**

```bash
git add backend/src/qdrant/
git commit -m "feat: add Qdrant client and collection setup"
```

---

### Task 5: Create OpenAI Embeddings Service

**Files:**
- Create: `backend/src/embeddings/openai.ts`

**Step 1: Create openai.ts**

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EMBEDDING_MODEL = 'text-embedding-3-small';

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return response.data.map(d => d.embedding);
}
```

**Step 2: Commit**

```bash
git add backend/src/embeddings/
git commit -m "feat: add OpenAI embeddings service"
```

---

## Phase 2: Agent Authentication

### Task 6: Create Signature Verification

**Files:**
- Create: `backend/src/auth/verify-signature.ts`

**Step 1: Create verify-signature.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { hexToBytes } from '@noble/hashes/utils.js';
import { query } from '../db/client.js';

const MAX_TIMESTAMP_DRIFT_MS = 60_000; // 1 minute

export interface AuthenticatedRequest extends Request {
  agentId?: number;
  publicKey?: string;
}

export async function verifySignature(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const signature = req.headers['x-signature'] as string;
  const publicKey = req.headers['x-public-key'] as string;
  const timestamp = req.headers['x-timestamp'] as string;

  if (!signature || !publicKey || !timestamp) {
    res.status(401).json({ error: 'Missing authentication headers' });
    return;
  }

  // Check timestamp freshness
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts) || Math.abs(Date.now() - ts) > MAX_TIMESTAMP_DRIFT_MS) {
    res.status(401).json({ error: 'Invalid or expired timestamp' });
    return;
  }

  // Verify signature
  const payload = JSON.stringify({ body: req.body ?? {}, timestamp: ts });
  const messageHash = sha256(new TextEncoder().encode(payload));

  try {
    const sigBytes = hexToBytes(signature);
    const pubBytes = hexToBytes(publicKey);
    const valid = secp256k1.verify(sigBytes, messageHash, pubBytes);

    if (!valid) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }
  } catch {
    res.status(401).json({ error: 'Invalid signature format' });
    return;
  }

  // Look up agent
  const result = await query('SELECT id FROM agents WHERE public_key = $1', [publicKey]);
  if (result.rows.length === 0) {
    res.status(401).json({ error: 'Agent not registered' });
    return;
  }

  req.agentId = result.rows[0].id;
  req.publicKey = publicKey;
  next();
}
```

**Step 2: Commit**

```bash
git add backend/src/auth/
git commit -m "feat: add secp256k1 signature verification middleware"
```

---

### Task 7: Create Agent Registration Route

**Files:**
- Create: `backend/src/routes/agent.ts`

**Step 1: Create agent.ts**

```typescript
import { Router, Request, Response } from 'express';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { hexToBytes } from '@noble/hashes/utils.js';
import { query } from '../db/client.js';
import { verifySignature, AuthenticatedRequest } from '../auth/verify-signature.js';

export const agentRouter = Router();

// POST /register - Register a new agent (no auth required)
agentRouter.post('/register', async (req: Request, res: Response) => {
  const { name, public_key, nostr_pubkey } = req.body;

  if (!name || !public_key) {
    res.status(400).json({ error: 'name and public_key required' });
    return;
  }

  // Validate public key format
  try {
    const bytes = hexToBytes(public_key);
    if (bytes.length !== 33 && bytes.length !== 65) {
      throw new Error('Invalid key length');
    }
    secp256k1.ProjectivePoint.fromHex(public_key);
  } catch {
    res.status(400).json({ error: 'Invalid public key format' });
    return;
  }

  // Check for existing registration
  const existing = await query('SELECT id FROM agents WHERE public_key = $1', [public_key]);
  if (existing.rows.length > 0) {
    res.status(409).json({ error: 'Agent already registered', agentId: existing.rows[0].id });
    return;
  }

  // Register
  const result = await query(
    'INSERT INTO agents (public_key, name, nostr_pubkey) VALUES ($1, $2, $3) RETURNING id',
    [public_key, name, nostr_pubkey || null]
  );

  res.status(201).json({ agentId: result.rows[0].id, name });
});

// GET /me - Get current agent info (requires auth)
agentRouter.get('/me', verifySignature, async (req: AuthenticatedRequest, res: Response) => {
  const result = await query(
    'SELECT id, name, public_key, nostr_pubkey, registered_at FROM agents WHERE id = $1',
    [req.agentId]
  );
  res.json({ agent: result.rows[0] });
});
```

**Step 2: Commit**

```bash
git add backend/src/routes/agent.ts
git commit -m "feat: add agent registration and profile routes"
```

---

## Phase 3: Intents API

### Task 8: Create Intent Posting Route

**Files:**
- Create: `backend/src/routes/intents.ts`

**Step 1: Create intents.ts**

```typescript
import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/client.js';
import { qdrant, COLLECTION_NAME } from '../qdrant/client.js';
import { generateEmbedding } from '../embeddings/openai.js';
import { verifySignature, AuthenticatedRequest } from '../auth/verify-signature.js';

export const intentsRouter = Router();

interface IntentPayload {
  description: string;
  intent_type: 'sell' | 'buy';
  category?: string;
  price?: number;
  currency?: string;
  location?: string;
  contact_handle?: string;
  expires_in_days?: number;
}

// POST /intents - Create a new intent
intentsRouter.post('/', verifySignature, async (req: AuthenticatedRequest, res: Response) => {
  const {
    description,
    intent_type,
    category,
    price,
    currency = 'UCT',
    location,
    contact_handle,
    expires_in_days = 30,
  } = req.body as IntentPayload;

  if (!description || !intent_type) {
    res.status(400).json({ error: 'description and intent_type required' });
    return;
  }

  if (!['sell', 'buy'].includes(intent_type)) {
    res.status(400).json({ error: 'intent_type must be "sell" or "buy"' });
    return;
  }

  // Generate embedding
  const embedding = await generateEmbedding(description);

  // Generate IDs
  const intentId = uuidv4();
  const qdrantPointId = uuidv4();

  // Calculate expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expires_in_days);

  // Get agent's NOSTR pubkey for contact
  const agentResult = await query('SELECT nostr_pubkey FROM agents WHERE id = $1', [req.agentId]);
  const nostrPubkey = contact_handle || agentResult.rows[0]?.nostr_pubkey;

  // Store in Qdrant
  await qdrant.upsert(COLLECTION_NAME, {
    wait: true,
    points: [
      {
        id: qdrantPointId,
        vector: embedding,
        payload: {
          intent_id: intentId,
          agent_id: req.agentId,
          description,
          intent_type,
          category: category || null,
          price: price || null,
          currency,
          location: location || null,
          contact_method: 'nostr',
          contact_handle: nostrPubkey,
          status: 'active',
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        },
      },
    ],
  });

  // Store metadata in PostgreSQL
  await query(
    `INSERT INTO intents (id, qdrant_point_id, agent_id, intent_type, category, price, currency, location, contact_method, contact_handle, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [intentId, qdrantPointId, req.agentId, intent_type, category, price, currency, location, 'nostr', nostrPubkey, expiresAt]
  );

  res.status(201).json({
    intentId,
    message: 'Intent posted successfully',
    expiresAt: expiresAt.toISOString(),
  });
});

// GET /intents - List agent's own intents
intentsRouter.get('/', verifySignature, async (req: AuthenticatedRequest, res: Response) => {
  const result = await query(
    `SELECT id, intent_type, category, price, currency, location, status, created_at, expires_at
     FROM intents WHERE agent_id = $1 ORDER BY created_at DESC`,
    [req.agentId]
  );
  res.json({ intents: result.rows });
});

// DELETE /intents/:id - Close an intent
intentsRouter.delete('/:id', verifySignature, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Verify ownership
  const result = await query(
    'SELECT qdrant_point_id FROM intents WHERE id = $1 AND agent_id = $2',
    [id, req.agentId]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Intent not found or not owned by you' });
    return;
  }

  const qdrantPointId = result.rows[0].qdrant_point_id;

  // Update status in both stores
  await query('UPDATE intents SET status = $1 WHERE id = $2', ['closed', id]);

  await qdrant.setPayload(COLLECTION_NAME, {
    points: [qdrantPointId],
    payload: { status: 'closed' },
  });

  res.json({ message: 'Intent closed' });
});
```

**Step 2: Add uuid dependency**

```bash
cd backend && npm install uuid && npm install -D @types/uuid
```

**Step 3: Commit**

```bash
git add backend/src/routes/intents.ts backend/package.json backend/package-lock.json
git commit -m "feat: add intent CRUD routes with Qdrant storage"
```

---

### Task 9: Create Search Route

**Files:**
- Create: `backend/src/routes/search.ts`

**Step 1: Create search.ts**

```typescript
import { Router, Request, Response } from 'express';
import { qdrant, COLLECTION_NAME } from '../qdrant/client.js';
import { generateEmbedding } from '../embeddings/openai.js';

export const searchRouter = Router();

interface SearchFilters {
  intent_type?: 'sell' | 'buy';
  category?: string;
  min_price?: number;
  max_price?: number;
  location?: string;
}

// POST /search - Semantic search for intents (no auth required)
searchRouter.post('/', async (req: Request, res: Response) => {
  const { query: searchQuery, filters = {}, limit = 20 } = req.body as {
    query: string;
    filters?: SearchFilters;
    limit?: number;
  };

  if (!searchQuery) {
    res.status(400).json({ error: 'query string required' });
    return;
  }

  // Generate embedding for search query
  const embedding = await generateEmbedding(searchQuery);

  // Build Qdrant filter
  const must: any[] = [
    { key: 'status', match: { value: 'active' } },
  ];

  if (filters.intent_type) {
    must.push({ key: 'intent_type', match: { value: filters.intent_type } });
  }
  if (filters.category) {
    must.push({ key: 'category', match: { value: filters.category } });
  }
  if (filters.location) {
    must.push({ key: 'location', match: { value: filters.location } });
  }

  // Price range filter
  if (filters.min_price !== undefined || filters.max_price !== undefined) {
    const priceFilter: any = { key: 'price' };
    if (filters.min_price !== undefined) {
      priceFilter.range = { ...priceFilter.range, gte: filters.min_price };
    }
    if (filters.max_price !== undefined) {
      priceFilter.range = { ...priceFilter.range, lte: filters.max_price };
    }
    must.push(priceFilter);
  }

  // Search Qdrant
  const results = await qdrant.search(COLLECTION_NAME, {
    vector: embedding,
    filter: { must },
    limit: Math.min(limit, 100),
    with_payload: true,
  });

  // Format results
  const intents = results.map(r => ({
    id: r.payload?.intent_id,
    score: r.score,
    description: r.payload?.description,
    intent_type: r.payload?.intent_type,
    category: r.payload?.category,
    price: r.payload?.price,
    currency: r.payload?.currency,
    location: r.payload?.location,
    contact_method: r.payload?.contact_method,
    contact_handle: r.payload?.contact_handle,
    created_at: r.payload?.created_at,
    expires_at: r.payload?.expires_at,
  }));

  res.json({ intents, count: intents.length });
});

// GET /search/categories - List available categories
searchRouter.get('/categories', async (_req: Request, res: Response) => {
  // This would be more sophisticated in production
  // For now, return common marketplace categories
  res.json({
    categories: [
      'electronics',
      'furniture',
      'clothing',
      'vehicles',
      'services',
      'real-estate',
      'collectibles',
      'other',
    ],
  });
});
```

**Step 2: Commit**

```bash
git add backend/src/routes/search.ts
git commit -m "feat: add semantic search route with filters"
```

---

### Task 10: Create Main Server Entry Point

**Files:**
- Create: `backend/src/index.ts`
- Create: `backend/src/config.ts`

**Step 1: Create config.ts**

```typescript
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgres://localhost:5432/vectorsphere',
  qdrantUrl: process.env.QDRANT_URL || 'http://localhost:6333',
  openaiApiKey: process.env.OPENAI_API_KEY,
  nodeEnv: process.env.NODE_ENV || 'development',
};
```

**Step 2: Create index.ts**

```typescript
import express from 'express';
import { config } from './config.js';
import { ensureCollection } from './qdrant/setup.js';
import { agentRouter } from './routes/agent.js';
import { intentsRouter } from './routes/intents.js';
import { searchRouter } from './routes/search.js';

const app = express();

// Middleware
app.use(express.json());

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-signature, x-public-key, x-timestamp');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Routes
app.use('/api/agent', agentRouter);
app.use('/api/intents', intentsRouter);
app.use('/api/search', searchRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function main() {
  // Ensure Qdrant collection exists
  await ensureCollection();

  app.listen(config.port, () => {
    console.log(`Vector Sphere backend running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
}

main().catch(console.error);
```

**Step 3: Commit**

```bash
git add backend/src/index.ts backend/src/config.ts
git commit -m "feat: add main server entry point"
```

---

## Phase 4: Openclaw Skill

### Task 11: Create Skill Directory Structure

**Files:**
- Create: `vector-skill/package.json`
- Create: `vector-skill/tsconfig.json`
- Create: `vector-skill/.gitignore`

**Step 1: Create package.json**

```json
{
  "name": "vector-skill",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "@noble/curves": "^2.0.1",
    "@noble/hashes": "^2.0.1"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.21.0",
    "typescript": "^5.9.3"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["lib/**/*", "scripts/**/*"],
  "exclude": ["node_modules"]
}
```

**Step 3: Create .gitignore**

```
node_modules/
dist/
.env
```

**Step 4: Commit**

```bash
git add vector-skill/
git commit -m "feat: initialize vector-skill package"
```

---

### Task 12: Create Skill Library Files

**Files:**
- Create: `vector-skill/lib/config.ts`
- Create: `vector-skill/lib/wallet.ts`
- Create: `vector-skill/lib/api.ts`

**Step 1: Create config.ts**

```typescript
export const config = {
  serverUrl: process.env.VECTOR_SPHERE_SERVER || 'http://localhost:3001',
  walletPath: process.env.WALLET_PATH || `${process.env.HOME}/.vector-sphere-wallet.json`,
};
```

**Step 2: Create wallet.ts**

```typescript
import * as fs from 'fs';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { bytesToHex, randomBytes } from '@noble/hashes/utils.js';
import { config } from './config.js';

interface WalletData {
  privateKey: string;
  publicKey: string;
}

export function walletExists(): boolean {
  return fs.existsSync(config.walletPath);
}

export function createWallet(): WalletData {
  const privateKeyBytes = randomBytes(32);
  const privateKey = bytesToHex(privateKeyBytes);
  const publicKey = bytesToHex(secp256k1.getPublicKey(privateKeyBytes, true));

  const data: WalletData = { privateKey, publicKey };
  fs.writeFileSync(config.walletPath, JSON.stringify(data, null, 2));
  console.log('Wallet created at:', config.walletPath);

  return data;
}

export function loadWallet(): WalletData {
  if (!walletExists()) {
    throw new Error(`No wallet found. Run: npx tsx scripts/wallet.ts init`);
  }
  const data = JSON.parse(fs.readFileSync(config.walletPath, 'utf-8'));
  return data;
}

export function getPrivateKeyHex(): string {
  return loadWallet().privateKey;
}

export function getPublicKeyHex(): string {
  return loadWallet().publicKey;
}
```

**Step 3: Create api.ts**

```typescript
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import { config } from './config.js';

interface SignedHeaders extends Record<string, string> {
  'x-signature': string;
  'x-public-key': string;
  'x-timestamp': string;
  'content-type': string;
}

export function signRequest(body: unknown, privateKeyHex: string): { body: string; headers: SignedHeaders } {
  const timestamp = Date.now();
  const payload = JSON.stringify({ body, timestamp });
  const messageHash = sha256(new TextEncoder().encode(payload));
  const privateKeyBytes = hexToBytes(privateKeyHex);
  const signature = secp256k1.sign(messageHash, privateKeyBytes);
  const publicKey = bytesToHex(secp256k1.getPublicKey(privateKeyBytes, true));

  return {
    body: JSON.stringify(body),
    headers: {
      'x-signature': bytesToHex(signature.toCompactRawBytes()),
      'x-public-key': publicKey,
      'x-timestamp': String(timestamp),
      'content-type': 'application/json',
    },
  };
}

export async function apiPost(path: string, body: unknown, privateKeyHex: string): Promise<any> {
  const signed = signRequest(body, privateKeyHex);
  const res = await fetch(`${config.serverUrl}${path}`, {
    method: 'POST',
    headers: signed.headers,
    body: signed.body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  return data;
}

export async function apiGet(path: string, privateKeyHex: string): Promise<any> {
  const signed = signRequest({}, privateKeyHex);
  const res = await fetch(`${config.serverUrl}${path}`, {
    method: 'GET',
    headers: signed.headers,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  return data;
}

export async function apiDelete(path: string, privateKeyHex: string): Promise<any> {
  const signed = signRequest({}, privateKeyHex);
  const res = await fetch(`${config.serverUrl}${path}`, {
    method: 'DELETE',
    headers: signed.headers,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  return data;
}

// Public endpoints (no auth)
export async function apiPublicPost(path: string, body: unknown): Promise<any> {
  const res = await fetch(`${config.serverUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  return data;
}
```

**Step 4: Commit**

```bash
git add vector-skill/lib/
git commit -m "feat: add skill library (config, wallet, api)"
```

---

### Task 13: Create Skill CLI Scripts

**Files:**
- Create: `vector-skill/scripts/wallet.ts`
- Create: `vector-skill/scripts/register.ts`
- Create: `vector-skill/scripts/intent.ts`
- Create: `vector-skill/scripts/search.ts`

**Step 1: Create wallet.ts**

```typescript
import { walletExists, createWallet, loadWallet } from '../lib/wallet.js';

const command = process.argv[2];

switch (command) {
  case 'init': {
    if (walletExists()) {
      console.log('Wallet already exists. Delete it first to create a new one.');
      process.exit(1);
    }
    const wallet = createWallet();
    console.log('Wallet initialized!');
    console.log('Public key:', wallet.publicKey);
    console.log('\nKeep your wallet file safe:', process.env.HOME + '/.vector-sphere-wallet.json');
    break;
  }

  case 'show': {
    const wallet = loadWallet();
    console.log('Public key:', wallet.publicKey);
    break;
  }

  default:
    console.log('Usage: npx tsx scripts/wallet.ts <init|show>');
    process.exit(1);
}
```

**Step 2: Create register.ts**

```typescript
import { loadWallet, getPublicKeyHex } from '../lib/wallet.js';
import { config } from '../lib/config.js';

const name = process.argv[2];
const nostrPubkey = process.argv[3];

if (!name) {
  console.log('Usage: npx tsx scripts/register.ts <agent-name> [nostr-pubkey]');
  process.exit(1);
}

async function main() {
  const publicKey = getPublicKeyHex();

  const res = await fetch(`${config.serverUrl}/api/agent/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name,
      public_key: publicKey,
      nostr_pubkey: nostrPubkey || null,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Registration failed:', data.error);
    process.exit(1);
  }

  console.log('Registered successfully!');
  console.log('Agent ID:', data.agentId);
  console.log('Name:', data.name);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
```

**Step 3: Create intent.ts**

```typescript
import { getPrivateKeyHex } from '../lib/wallet.js';
import { apiPost, apiGet, apiDelete } from '../lib/api.js';

const command = process.argv[2];

function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  const argv = process.argv.slice(3);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--') && argv[i + 1]) {
      args[argv[i].slice(2)] = argv[i + 1];
      i++;
    }
  }
  return args;
}

async function main() {
  const privateKey = getPrivateKeyHex();

  switch (command) {
    case 'post': {
      const args = parseArgs();
      if (!args.description || !args.type) {
        console.log('Usage: npx tsx scripts/intent.ts post --description "..." --type <sell|buy> [--category ...] [--price ...] [--location ...]');
        process.exit(1);
      }

      const result = await apiPost('/api/intents', {
        description: args.description,
        intent_type: args.type,
        category: args.category,
        price: args.price ? parseFloat(args.price) : undefined,
        currency: args.currency || 'UCT',
        location: args.location,
      }, privateKey);

      console.log('Intent posted!');
      console.log('Intent ID:', result.intentId);
      console.log('Expires:', result.expiresAt);
      break;
    }

    case 'list': {
      const result = await apiGet('/api/intents', privateKey);
      if (result.intents.length === 0) {
        console.log('No intents found.');
        return;
      }
      for (const intent of result.intents) {
        console.log(`[${intent.id}] ${intent.intent_type.toUpperCase()} - ${intent.category || 'uncategorized'} - ${intent.price || 'no price'} ${intent.currency} (${intent.status})`);
      }
      break;
    }

    case 'close': {
      const intentId = process.argv[3];
      if (!intentId) {
        console.log('Usage: npx tsx scripts/intent.ts close <intent-id>');
        process.exit(1);
      }
      await apiDelete(`/api/intents/${intentId}`, privateKey);
      console.log('Intent closed.');
      break;
    }

    default:
      console.log('Usage: npx tsx scripts/intent.ts <post|list|close>');
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
```

**Step 4: Create search.ts**

```typescript
import { apiPublicPost } from '../lib/api.js';

const query = process.argv.slice(2).join(' ');

if (!query) {
  console.log('Usage: npx tsx scripts/search.ts <search query>');
  console.log('Example: npx tsx scripts/search.ts vintage furniture in good condition');
  process.exit(1);
}

async function main() {
  const result = await apiPublicPost('/api/search', {
    query,
    limit: 10,
  });

  if (result.intents.length === 0) {
    console.log('No matching intents found.');
    return;
  }

  console.log(`Found ${result.count} results:\n`);

  for (const intent of result.intents) {
    console.log(`─────────────────────────────────────`);
    console.log(`ID: ${intent.id}`);
    console.log(`Type: ${intent.intent_type.toUpperCase()}`);
    console.log(`Description: ${intent.description}`);
    if (intent.price) console.log(`Price: ${intent.price} ${intent.currency}`);
    if (intent.category) console.log(`Category: ${intent.category}`);
    if (intent.location) console.log(`Location: ${intent.location}`);
    console.log(`Contact: ${intent.contact_method} - ${intent.contact_handle}`);
    console.log(`Score: ${(intent.score * 100).toFixed(1)}%`);
    console.log('');
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
```

**Step 5: Commit**

```bash
git add vector-skill/scripts/
git commit -m "feat: add skill CLI scripts (wallet, register, intent, search)"
```

---

### Task 14: Create SKILL.md Documentation

**Files:**
- Create: `vector-skill/SKILL.md`

**Step 1: Create SKILL.md**

```markdown
# Vector Sphere — Marketplace Skill

Vector Sphere is a decentralized marketplace for buying and selling anything. Use semantic search to discover listings and NOSTR for peer-to-peer communication.

## Setup (one time)

Run these commands in order:

1. **Initialize wallet** — creates your keypair
   ```
   npx tsx scripts/wallet.ts init
   ```

2. **Register** — create your Vector Sphere account
   ```
   npx tsx scripts/register.ts <your-agent-name> [nostr-pubkey]
   ```

## Posting Intents

Post something for sale:
```
npx tsx scripts/intent.ts post --description "Vintage wooden desk, excellent condition" --type sell --category furniture --price 150 --location "San Francisco"
```

Post something you want to buy:
```
npx tsx scripts/intent.ts post --description "Looking for a working Nintendo 64" --type buy --category electronics --price 100
```

### Options
- `--description` (required): Natural language description
- `--type` (required): `sell` or `buy`
- `--category`: Category for filtering (electronics, furniture, clothing, vehicles, services, real-estate, collectibles, other)
- `--price`: Price in tokens
- `--currency`: Token type (default: UCT)
- `--location`: Location for local deals

## Searching

Search for anything using natural language:
```
npx tsx scripts/search.ts vintage furniture in good condition
npx tsx scripts/search.ts someone selling Pokemon cards
npx tsx scripts/search.ts laptop under 500 dollars
```

The search uses semantic similarity, so it finds relevant results even without exact keyword matches.

## Managing Intents

List your active intents:
```
npx tsx scripts/intent.ts list
```

Close an intent (mark as no longer available):
```
npx tsx scripts/intent.ts close <intent-id>
```

## Contacting Sellers

Search results include a `contact_handle` field with the seller's NOSTR public key. Use your NOSTR client to send them a direct message to negotiate.

## Configuration

Set `VECTOR_SPHERE_SERVER` environment variable to point to a different server (default: http://localhost:3001).

## How It Works

1. **Post**: Your intent description is converted to a vector embedding and stored in Qdrant
2. **Search**: Your query is embedded and compared against all intents using cosine similarity
3. **Contact**: Use NOSTR to message the seller directly
4. **Pay**: Send tokens via Unicity to complete the transaction
```

**Step 2: Commit**

```bash
git add vector-skill/SKILL.md
git commit -m "docs: add SKILL.md for agent usage"
```

---

## Phase 5: Makefile and Final Integration

### Task 15: Update Root Makefile

**Files:**
- Modify: `Makefile`

**Step 1: Update Makefile with backend commands**

Add these targets to the existing Makefile:

```makefile
# =============================================================================
# Backend Development
# =============================================================================

BACKEND_DIR := $(ROOT_DIR)/backend
SKILL_DIR := $(ROOT_DIR)/vector-skill

backend-dev:
	@echo "Starting backend development environment..."
	@echo "Requires OPENAI_API_KEY environment variable"
	cd $(BACKEND_DIR) && docker compose -f docker-compose.dev.yml up --build

backend-down:
	cd $(BACKEND_DIR) && docker compose -f docker-compose.dev.yml down

backend-reset:
	@echo "Resetting backend (deleting all data)..."
	cd $(BACKEND_DIR) && docker compose -f docker-compose.dev.yml down -v
	$(MAKE) backend-dev

backend-logs:
	cd $(BACKEND_DIR) && docker compose -f docker-compose.dev.yml logs -f

backend-shell:
	cd $(BACKEND_DIR) && docker compose -f docker-compose.dev.yml exec backend sh

db-shell:
	cd $(BACKEND_DIR) && docker compose -f docker-compose.dev.yml exec db psql -U vectorsphere

# =============================================================================
# Skill Development
# =============================================================================

skill-install:
	cd $(SKILL_DIR) && npm install

skill-test:
	@echo "Testing skill setup..."
	cd $(SKILL_DIR) && npx tsx scripts/wallet.ts show || echo "No wallet yet - run: make skill-init"

skill-init:
	cd $(SKILL_DIR) && npx tsx scripts/wallet.ts init

skill-register:
	@echo "Usage: cd vector-skill && npx tsx scripts/register.ts <name>"

# =============================================================================
# Full Stack
# =============================================================================

dev-all:
	@echo "Starting full development stack..."
	@echo "1. Backend + DB + Qdrant on ports 3001, 5432, 6333"
	@echo "2. Frontend on port 3000"
	@echo ""
	$(MAKE) backend-dev &
	sleep 5
	$(MAKE) dev

install-all:
	cd $(FRONTEND_DIR) && npm install
	cd $(BACKEND_DIR) && npm install
	cd $(SKILL_DIR) && npm install
```

**Step 2: Commit**

```bash
git add Makefile
git commit -m "feat: add backend and skill targets to Makefile"
```

---

### Task 16: Create Environment Example File

**Files:**
- Create: `backend/.env.example`

**Step 1: Create .env.example**

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional (defaults shown)
PORT=3001
DATABASE_URL=postgres://vectorsphere:vectorsphere@db:5432/vectorsphere
QDRANT_URL=http://qdrant:6333
NODE_ENV=development
```

**Step 2: Commit**

```bash
git add backend/.env.example
git commit -m "docs: add environment example file"
```

---

### Task 17: Final Integration Test

**Step 1: Install all dependencies**

```bash
make install-all
```

**Step 2: Start backend**

```bash
export OPENAI_API_KEY=sk-...
make backend-dev
```

**Step 3: Initialize skill wallet**

```bash
cd vector-skill
npx tsx scripts/wallet.ts init
```

**Step 4: Register agent**

```bash
npx tsx scripts/register.ts test-agent
```

**Step 5: Post a test intent**

```bash
npx tsx scripts/intent.ts post --description "Testing the marketplace with a sample listing" --type sell --category other --price 10
```

**Step 6: Search for the intent**

```bash
npx tsx scripts/search.ts marketplace test sample
```

**Step 7: Verify results show the posted intent**

Expected output should include the test intent with a high similarity score.

**Step 8: Commit final state**

```bash
git add -A
git commit -m "feat: complete agent intents infrastructure"
```

---

## Summary

This plan creates:

1. **Docker Compose Infrastructure**
   - Express backend on port 3001
   - PostgreSQL for agent/intent metadata
   - Qdrant for vector search

2. **Backend API**
   - `POST /api/agent/register` - Agent registration
   - `GET /api/agent/me` - Agent profile (authenticated)
   - `POST /api/intents` - Post intent (authenticated)
   - `GET /api/intents` - List own intents (authenticated)
   - `DELETE /api/intents/:id` - Close intent (authenticated)
   - `POST /api/search` - Semantic search (public)

3. **Openclaw Skill**
   - `wallet.ts` - Key management
   - `register.ts` - Agent registration
   - `intent.ts` - Post/list/close intents
   - `search.ts` - Semantic search
   - `SKILL.md` - Documentation for agents

All components use the same secp256k1 signature authentication pattern as PolyClaw.
