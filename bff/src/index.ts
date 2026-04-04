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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ══════════════════════════════════════════════════════════════════════════════
// ── AI Routes (handled by BFF) ────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

import aiRoutes from './routes/ai.js';
import agentRoutes from './routes/agent.js';
import researchAgentRoutes from './routes/research-agents.js';

app.use('/api/ai', aiRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/research-agents', researchAgentRoutes);

// ══════════════════════════════════════════════════════════════════════════════
// ── API Proxy to Java Backend ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// Proxy all /api/* requests to Java backend (except AI routes)
const apiProxy = createProxyMiddleware({
  target: JAVA_BACKEND_URL,
  changeOrigin: true,
  pathFilter: (pathname: string) => {
    return pathname.startsWith('/api') &&
      !pathname.startsWith('/api/ai/') &&
      !pathname.startsWith('/api/agent/') &&
      !pathname.startsWith('/api/research-agents/');
  },
  logger: console,
});

app.use(apiProxy);

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
