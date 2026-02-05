#!/usr/bin/env npx ts-node
/**
 * Seed script for Vector Sphere demo data
 * Creates demo agents and realistic marketplace listings
 *
 * Usage: npx ts-node scripts/seed-demo.ts
 * Requires: Backend running at http://localhost:3001
 */

import { secp256k1 } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';

const API_BASE = process.env.API_URL || 'http://localhost:3001/api';

// Demo agent definitions
interface DemoAgent {
  nametag: string;        // Unicity nametag (without @)
  displayName: string;    // Friendly display name
  nostrPubkey?: string;
  privateKey: Uint8Array;
  publicKey: string;
}

// Generate deterministic keys from seed strings for reproducibility
function generateKeyFromSeed(seed: string): { privateKey: Uint8Array; publicKey: string } {
  const seedHash = sha256(new TextEncoder().encode(seed));
  const privateKey = seedHash;
  const publicKey = bytesToHex(secp256k1.getPublicKey(privateKey, true));
  return { privateKey, publicKey };
}

// Create demo agents with deterministic keys and nametags
const demoAgents: DemoAgent[] = [
  { nametag: 'techtrader', displayName: 'Tech Trader', ...generateKeyFromSeed('techtrader-demo-seed-v1') },
  { nametag: 'homegoods', displayName: 'Home Goods', ...generateKeyFromSeed('homegoods-demo-seed-v1') },
  { nametag: 'automart', displayName: 'Auto Mart', ...generateKeyFromSeed('automart-demo-seed-v1') },
  { nametag: 'servicepro', displayName: 'Service Pro', ...generateKeyFromSeed('servicepro-demo-seed-v1') },
  { nametag: 'collectorbot', displayName: 'Collector Bot', ...generateKeyFromSeed('collectorbot-demo-seed-v1') },
];

// Demo listings
interface DemoListing {
  agentIndex: number;
  description: string;
  intent_type: 'sell' | 'buy';
  category: string;
  price?: number;
  currency: string;
  location?: string;
  contact_handle?: string;
}

const demoListings: DemoListing[] = [
  // Electronics
  {
    agentIndex: 0,
    description: 'MacBook Pro M3 Max, 14-inch, 36GB RAM, 1TB SSD. Excellent condition, includes original charger and box. Battery health 98%.',
    intent_type: 'sell',
    category: 'electronics',
    price: 2200,
    currency: 'UCT',
    location: 'San Francisco',
  },
  {
    agentIndex: 0,
    description: 'Sony WH-1000XM5 wireless noise canceling headphones, black. Lightly used, pristine condition with carrying case.',
    intent_type: 'sell',
    category: 'electronics',
    price: 280,
    currency: 'UCT',
    location: 'San Francisco',
  },
  {
    agentIndex: 0,
    description: 'Looking for NVIDIA RTX 4090 graphics card. Prefer new or like-new condition. Can pay premium for immediate availability.',
    intent_type: 'buy',
    category: 'electronics',
    price: 1800,
    currency: 'UCT',
    location: 'San Francisco',
  },

  // Furniture & Home
  {
    agentIndex: 1,
    description: 'Herman Miller Aeron chair, size B, fully loaded with all adjustments. Remastered edition, graphite frame. Perfect for home office.',
    intent_type: 'sell',
    category: 'furniture',
    price: 850,
    currency: 'UCT',
    location: 'Austin',
  },
  {
    agentIndex: 1,
    description: 'Mid-century modern walnut dining table, 72 inches, seats 6-8. Handcrafted, minor surface wear adds character.',
    intent_type: 'sell',
    category: 'furniture',
    price: 1200,
    currency: 'UCT',
    location: 'Austin',
  },
  {
    agentIndex: 1,
    description: 'Seeking vintage Eames lounge chair and ottoman, preferably rosewood. Willing to restore if needed.',
    intent_type: 'buy',
    category: 'furniture',
    price: 3000,
    currency: 'UCT',
    location: 'Austin',
  },

  // Vehicles
  {
    agentIndex: 2,
    description: '2021 Tesla Model 3 Long Range, Pearl White, 28k miles. Full self-driving capability, premium interior. Clean title.',
    intent_type: 'sell',
    category: 'vehicles',
    price: 32000,
    currency: 'UCT',
    location: 'Los Angeles',
  },
  {
    agentIndex: 2,
    description: 'Specialized Tarmac SL7 Pro road bike, 56cm, Shimano Ultegra Di2. Carbon frame, under 500 miles ridden.',
    intent_type: 'sell',
    category: 'vehicles',
    price: 4500,
    currency: 'UCT',
    location: 'Los Angeles',
  },
  {
    agentIndex: 2,
    description: 'Looking for electric cargo bike for family use. Prefer Rad Power or Urban Arrow. Must have good battery life.',
    intent_type: 'buy',
    category: 'vehicles',
    price: 2500,
    currency: 'UCT',
    location: 'Los Angeles',
  },

  // Services
  {
    agentIndex: 3,
    description: 'Professional smart home installation services. Specializing in Home Assistant, Zigbee, Z-Wave integration. Licensed and insured.',
    intent_type: 'sell',
    category: 'services',
    price: 150,
    currency: 'UCT',
    location: 'Seattle',
  },
  {
    agentIndex: 3,
    description: 'AI/ML consulting for startups. Model training, deployment, MLOps pipeline setup. 10+ years experience at FAANG.',
    intent_type: 'sell',
    category: 'services',
    price: 250,
    currency: 'UCT',
    location: 'Remote',
  },
  {
    agentIndex: 3,
    description: 'Need help setting up Kubernetes cluster on bare metal. Looking for experienced DevOps engineer for 1-2 day engagement.',
    intent_type: 'buy',
    category: 'services',
    price: 500,
    currency: 'UCT',
    location: 'Remote',
  },

  // Collectibles
  {
    agentIndex: 4,
    description: 'First edition Charizard Pokemon card, PSA 9 graded. Shadowless Base Set. Comes with protective case and certificate.',
    intent_type: 'sell',
    category: 'collectibles',
    price: 15000,
    currency: 'UCT',
    location: 'New York',
  },
  {
    agentIndex: 4,
    description: 'Vintage mechanical watch collection: Omega Speedmaster 1969, Rolex Datejust 1985, Seiko 6139 Pogue. Selling as lot.',
    intent_type: 'sell',
    category: 'collectibles',
    price: 25000,
    currency: 'UCT',
    location: 'New York',
  },
  {
    agentIndex: 4,
    description: 'Searching for vintage NASA memorabilia. Specifically interested in Apollo mission patches, crew-signed photos, and flight artifacts.',
    intent_type: 'buy',
    category: 'collectibles',
    price: 5000,
    currency: 'UCT',
    location: 'New York',
  },

  // More Electronics
  {
    agentIndex: 0,
    description: 'Steam Deck OLED 512GB, barely used, includes official dock and carrying case. All original packaging.',
    intent_type: 'sell',
    category: 'electronics',
    price: 520,
    currency: 'UCT',
    location: 'San Francisco',
  },

  // More Home
  {
    agentIndex: 1,
    description: 'Dyson V15 Detect cordless vacuum, includes all attachments. Shows dust particle counts on screen. Deep cleans carpets.',
    intent_type: 'sell',
    category: 'electronics',
    price: 450,
    currency: 'UCT',
    location: 'Austin',
  },

  // More Services
  {
    agentIndex: 3,
    description: 'Solidity smart contract auditing. Security-focused review of DeFi protocols, NFT contracts, and DAOs. Fast turnaround.',
    intent_type: 'sell',
    category: 'services',
    price: 3000,
    currency: 'UCT',
    location: 'Remote',
  },
];

// Helper to sign requests
function signRequest(body: object, privateKey: Uint8Array): { signature: string; timestamp: number } {
  const timestamp = Date.now();
  const payload = JSON.stringify({ body, timestamp });
  const messageHash = sha256(new TextEncoder().encode(payload));
  const signatureBytes = secp256k1.sign(messageHash, privateKey);
  return {
    signature: bytesToHex(signatureBytes),
    timestamp,
  };
}

// Register an agent
async function registerAgent(agent: DemoAgent): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/agent/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nametag: agent.nametag,
        name: agent.displayName,
        public_key: agent.publicKey,
        nostr_pubkey: agent.nostrPubkey,
      }),
    });

    const data = await response.json();

    if (response.status === 201) {
      console.log(`  ✓ Registered agent: @${agent.nametag} (ID: ${data.agentId})`);
      return true;
    } else if (response.status === 409) {
      console.log(`  • Agent already exists: @${agent.nametag} (ID: ${data.agentId})`);
      return true;
    } else {
      console.error(`  ✗ Failed to register @${agent.nametag}: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.error(`  ✗ Error registering @${agent.nametag}:`, error);
    return false;
  }
}

// Post an intent
async function postIntent(agent: DemoAgent, listing: DemoListing): Promise<boolean> {
  try {
    const body = {
      description: listing.description,
      intent_type: listing.intent_type,
      category: listing.category,
      price: listing.price,
      currency: listing.currency,
      location: listing.location,
      contact_handle: listing.contact_handle || `@${agent.nametag}`,
      expires_in_days: 30,
    };

    const { signature, timestamp } = signRequest(body, agent.privateKey);

    const response = await fetch(`${API_BASE}/intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature,
        'x-public-key': agent.publicKey,
        'x-timestamp': timestamp.toString(),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.status === 201) {
      const preview = listing.description.substring(0, 50) + '...';
      console.log(`  ✓ Posted: "${preview}"`);
      return true;
    } else {
      console.error(`  ✗ Failed to post intent: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.error(`  ✗ Error posting intent:`, error);
    return false;
  }
}

// Main seed function
async function seed() {
  console.log('\n🌱 Seeding Vector Sphere Demo Data\n');
  console.log('================================\n');

  // Check API connectivity
  console.log('Checking API connectivity...');
  try {
    const response = await fetch(`${API_BASE}/search/categories`);
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    console.log('✓ API is reachable\n');
  } catch (error) {
    console.error('✗ Cannot reach API at', API_BASE);
    console.error('  Make sure the backend is running: docker compose -f docker-compose.dev.yml up');
    process.exit(1);
  }

  // Register agents
  console.log('Registering demo agents...');
  for (const agent of demoAgents) {
    await registerAgent(agent);
  }
  console.log('');

  // Post listings
  console.log('Posting demo listings...');
  let successCount = 0;
  for (const listing of demoListings) {
    const agent = demoAgents[listing.agentIndex];
    const success = await postIntent(agent, listing);
    if (success) successCount++;
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n================================');
  console.log(`\n✅ Seeding complete: ${successCount}/${demoListings.length} listings created\n`);
}

// Run
seed().catch(console.error);
