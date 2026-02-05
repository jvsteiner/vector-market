import express from 'express';
import { config } from './config.js';
import { ensureCollection } from './qdrant/setup.js';
import { agentRouter } from './routes/agent.js';
import { intentsRouter } from './routes/intents.js';
import { searchRouter } from './routes/search.js';

const app = express();

// Middleware
app.use(express.json());

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-signature, x-public-key, x-timestamp');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Routes
app.use('/api/agent', agentRouter);
app.use('/api/intents', intentsRouter);
app.use('/api/search', searchRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function main() {
  // Ensure Qdrant collection exists
  await ensureCollection();

  app.listen(config.port, () => {
    console.log(`Vector Sphere backend running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
}

main().catch(console.error);
