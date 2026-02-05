import { Request, Response, NextFunction } from 'express';
import { secp256k1 } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha2';
import { hexToBytes } from '@noble/hashes/utils';
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
