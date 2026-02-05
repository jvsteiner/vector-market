import { QdrantClient } from '@qdrant/js-client-rest';

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
});

export const COLLECTION_NAME = 'intents';
export const VECTOR_SIZE = 1536; // text-embedding-3-small dimension
