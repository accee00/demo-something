import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { createTestRouter } from './src/controllers/testController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// WebSocket Server for real-time live execution logs & telemetry
const wss = new WebSocketServer({ server, path: '/ws' });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  try {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'WS_CONNECTED', message: 'Connected to SentinelQA Real-time Telemetry Stream' }));
    }
  } catch (_) {}

  ws.on('close', () => {
    clients.delete(ws);
  });

  ws.on('error', () => {
    clients.delete(ws);
  });
});

// Broadcast event to all active WebSocket clients
const broadcast = (data) => {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
};

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'SentinelQA Autonomous UI Testing Engine',
    timestamp: new Date().toISOString(),
    clientsCount: clients.size,
    aiModel: process.env.GEMINI_API_KEY ? 'gemini-2.5-flash (Active)' : 'Deterministic Template Engine (Active)',
    jiraIntegration: process.env.JIRA_HOST ? 'Connected' : 'Mock Mode (Ready)'
  });
});

// Mount test routes
app.use('/api', createTestRouter(broadcast));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Start Server
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🛡️  SentinelQA Backend Running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket Stream Live on ws://localhost:${PORT}/ws`);
  console.log(`🧠 AI Engine: ${process.env.GEMINI_API_KEY ? 'Gemini 2.5 Active' : 'Deterministic Mode'}`);
  console.log(`📋 Jira Mode: ${process.env.JIRA_HOST ? 'Cloud Connected' : 'Mock Mode Ready'}`);
  console.log(`=======================================================`);
});

