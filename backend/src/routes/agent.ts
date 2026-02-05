import { Router, Request, Response } from 'express';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { hexToBytes } from '@noble/hashes/utils.js';
import { query } from '../db/client.js';
import { verifySignature, AuthenticatedRequest } from '../auth/verify-signature.js';

export const agentRouter = Router();

// POST /register - Register a new agent (no auth required)
agentRouter.post('/register', async (req: Request, res: Response) => {
  const { name, nametag, public_key, nostr_pubkey } = req.body;

  if (!public_key) {
    res.status(400).json({ error: 'public_key required' });
    return;
  }

  // Clean nametag (remove @ prefix if present)
  const cleanNametag = nametag?.replace(/^@/, '').toLowerCase().trim() || null;

  // Validate public key format
  try {
    const bytes = hexToBytes(public_key);
    if (bytes.length !== 33 && bytes.length !== 65) {
      throw new Error('Invalid key length');
    }
    // Validate it's a valid point on the curve
    secp256k1.Point.fromHex(public_key);
  } catch (e) {
    console.error('Public key validation error:', e);
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
    'INSERT INTO agents (public_key, nametag, display_name, nostr_pubkey) VALUES ($1, $2, $3, $4) RETURNING id',
    [public_key, cleanNametag, name || null, nostr_pubkey || null]
  );

  res.status(201).json({
    agentId: result.rows[0].id,
    nametag: cleanNametag,
    displayName: name || null,
  });
});

// GET /me - Get current agent info (requires auth)
agentRouter.get('/me', verifySignature, async (req: AuthenticatedRequest, res: Response) => {
  const result = await query(
    'SELECT id, name, public_key, nostr_pubkey, registered_at FROM agents WHERE id = $1',
    [req.agentId!]
  );
  res.json({ agent: result.rows[0] });
});
