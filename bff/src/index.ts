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
  if (req.path.startsWith('/ai/') || req.path.startsWith('/agent/') || req.path.startsWith('/research-agents/')) {
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

// Body parsers only for AI routes
app.use('/api/ai', express.json({ limit: '10mb' }));
app.use('/api/ai', aiRoutes);
app.use('/api/agent', express.json({ limit: '10mb' }));
app.use('/api/agent', agentRoutes);
app.use('/api/research-agents', express.json({ limit: '10mb' }));
app.use('/api/research-agents', researchAgentRoutes);

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

app.listen(PORT, () => {
  console.log(`🚀 BFF Server running at http://localhost:${PORT}`);
  console.log(`   Java Backend: ${JAVA_BACKEND_URL}`);
  console.log(`   Frontend: ${frontendDist}`);
});
