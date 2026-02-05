import { Router, Request, Response } from 'express';
import { secp256k1 } from '@noble/curves/secp256k1';
import { hexToBytes } from '@noble/hashes/utils';
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
