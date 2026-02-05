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
