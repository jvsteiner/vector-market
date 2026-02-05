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
    agent_nametag: r.payload?.agent_nametag,
    agent_public_key: r.payload?.agent_public_key,
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
