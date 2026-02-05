import { qdrant, COLLECTION_NAME, VECTOR_SIZE } from './client.js';

export async function ensureCollection(): Promise<void> {
  try {
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
  } catch (error) {
    console.error('Failed to initialize Qdrant collection:', error);
    throw error;
  }
}
