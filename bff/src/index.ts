import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const JAVA_BACKEND_URL = process.env.JAVA_BACKEND_URL || 'http://localhost:8080';

app.use(cors());

// ══════════════════════════════════════════════════════════════════════════════
// ── API Proxy to Java Backend (must be before body parsers) ────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// Proxy all /api/* requests to Java backend (except AI routes)
const apiProxy = createProxyMiddleware({
  target: JAVA_BACKEND_URL,
  changeOrigin: true,
  logLevel: 'debug',
  timeout: 60000,
  proxyTimeout: 60000,
});

// Proxy non-AI routes to Java backend (before body parsing)
app.use('/api', (req, res, next) => {
  const path = req.path;
  if (path.startsWith('/ai/') || path.startsWith('/agent/') || path.startsWith('/research-agents/') || path.startsWith('/object-explorer/') || path.startsWith('/function-types') || path.startsWith('/neo4j/')) {
    return next();
  }
  return apiProxy(req, res, next);
});

// ══════════════════════════════════════════════════════════════════════════════
// ── AI Routes (handled by BFF) ────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

import aiRoutes from './routes/ai.js';
import agentRoutes from './routes/agent.js';
import researchAgentRoutes from './routes/research-agents.js';
import objectExplorerRoutes from './routes/object-explorer.js';
import functionTypeRoutes from './routes/function-types.js';
import neo4jRoutes from './routes/neo4j.js';
import { initNeo4j, closeNeo4j } from './neo4j.js';

// Body parsers only for AI routes
app.use('/api/ai', express.json({ limit: '10mb' }));
app.use('/api/ai', aiRoutes);
app.use('/api/agent', express.json({ limit: '10mb' }));
app.use('/api/agent', agentRoutes);
app.use('/api/research-agents', express.json({ limit: '10mb' }));
app.use('/api/research-agents', researchAgentRoutes);
app.use('/api/object-explorer', express.json({ limit: '10mb' }));
app.use('/api/object-explorer', objectExplorerRoutes);
app.use('/api/function-types', express.json({ limit: '10mb' }));
app.use('/api/function-types', functionTypeRoutes);
app.use('/api/neo4j', express.json({ limit: '10mb' }));
app.use('/api/neo4j', neo4jRoutes);

// ══════════════════════════════════════════════════════════════════════════════
// ── Static Files (Frontend) ───────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// ══════════════════════════════════════════════════════════════════════════════
// ── Start Server ──────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

app.listen(PORT, async () => {
  console.log(`🚀 BFF Server running at http://localhost:${PORT}`);
  console.log(`   Java Backend: ${JAVA_BACKEND_URL}`);
  console.log(`   Frontend: ${frontendDist}`);
  
  // 初始化Neo4j连接
  await initNeo4j();
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n正在关闭服务...');
  await closeNeo4j();
  process.exit(0);
});
