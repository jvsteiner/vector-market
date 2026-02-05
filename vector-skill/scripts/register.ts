import { getPublicKeyHex } from '../lib/wallet.js';
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
