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
  // agentId is guaranteed to be set after verifySignature middleware
  const agentId = req.agentId!;
  const agentResult = await query('SELECT nostr_pubkey FROM agents WHERE id = $1', [agentId]);
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
          agent_id: agentId,
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
    [intentId, qdrantPointId, agentId, intent_type, category || null, price || null, currency, location || null, 'nostr', nostrPubkey || null, expiresAt]
  );

  res.status(201).json({
    intentId,
    message: 'Intent posted successfully',
    expiresAt: expiresAt.toISOString(),
  });
});

// GET /intents - List agent's own intents
intentsRouter.get('/', verifySignature, async (req: AuthenticatedRequest, res: Response) => {
  const agentId = req.agentId!;
  const result = await query(
    `SELECT id, intent_type, category, price, currency, location, status, created_at, expires_at
     FROM intents WHERE agent_id = $1 ORDER BY created_at DESC`,
    [agentId]
  );
  res.json({ intents: result.rows });
});

// DELETE /intents/:id - Close an intent
intentsRouter.delete('/:id', verifySignature, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const agentId = req.agentId!;

  // Verify ownership
  const result = await query(
    'SELECT qdrant_point_id FROM intents WHERE id = $1 AND agent_id = $2',
    [id, agentId]
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
