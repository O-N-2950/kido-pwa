// ============================================================
// KIDO — Server Entry Point v2
// Patterns from ALL 58 NEO repos combined:
// boom-contact: helmet/cors/ratelimit/socket.io/health
// swissrh: crash-monitor, SSO
// winwin-v2: agent scheduler
// moneasy: voice + AI parse
// umbra: RGPD, nLPD sovereign hosting
// ============================================================
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { authRouter }           from './routes/auth.js';
import { familyRouter }         from './routes/family.js';
import { createLocationRouter } from './routes/location.js';
import { createChildRouter }    from './routes/child.js';
import { createVoiceRouter }    from './routes/voice.js';
import { pushRouter }           from './routes/push.js';
import { startScheduler }       from './jobs/scheduler.js';
import { createAdminRouter }    from './routes/admin.js';
import { startCrashMonitor, getMonitorStatus } from './monitoring/crash-monitor.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const PORT     = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'kido-dev-secret-change-in-prod';

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  'https://vivokid.ch',
  'https://www.vivokid.ch',
  'https://app.vivokid.ch',
  'capacitor://localhost',    // Capacitor iOS
  'https://localhost',         // Capacitor Android
  ...(NODE_ENV !== 'production' ? ['http://localhost:5173', 'http://localhost:4173'] : []),
].filter(Boolean) as string[];

const app  = express();
const http = createServer(app);

app.disable('x-powered-by');
app.set('trust proxy', 1); // Railway + Infomaniak Jelastic

// ── Redirection HTTP → HTTPS (le LB pose X-Forwarded-Proto=https sur le 443 ; absent sur le 80) ──
app.use((req, res, next) => {
  const proto = req.get('x-forwarded-proto');
  const host = (req.headers.host || '').split(':')[0];
  if (process.env.FORCE_HTTPS !== 'false'
      && proto !== 'https'
      && /(^|\.)vivokid\.ch$/i.test(host)
      && req.path !== '/health'
      && !req.path.startsWith('/.well-known/')) {
    return res.redirect(301, 'https://' + req.headers.host + req.originalUrl);
  }
  next();
});

// ── Socket.io ─────────────────────────────────────────────────
export const io = new SocketServer(http, {
  cors: { origin: ALLOWED_ORIGINS, credentials: true },
  pingTimeout: 20000, pingInterval: 25000, connectTimeout: 20000,
  maxHttpBufferSize: 1e6,
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const p = jwt.verify(token, JWT_SECRET) as { userId: string; familyId: string; role: string };
    socket.data.userId = p.userId;
    socket.data.familyId = p.familyId;
    socket.data.role = p.role;
    next();
  } catch { next(new Error('Invalid token')); }
});

io.on('connection', (socket) => {
  const { userId, familyId, role } = socket.data;
  socket.join(`family:${familyId}`);
  socket.join(`user:${userId}`);
  console.log(`[socket] ${role} ${userId} → family:${familyId}`);
  socket.on('disconnect', () => console.log(`[socket] ${userId} left`));
});

// ── Middleware ─────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: NODE_ENV === 'production' }));
app.use(compression());
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev', {
  skip: (req) => req.url === '/health', // pattern boom-contact — no log spam
}));

// ── Rate limiting (pattern boom-contact) ──────────────────────
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use('/api/voice', rateLimit({ windowMs: 1 * 60 * 1000, max: 10 }));

// ── Health check (Railway + Infomaniak + neo-watcher) ──────────
app.get('/health', async (_req, res) => {
  try {
    const { db, schema } = await import('./db/index.js');
    await db.select({ id: schema.families.id }).from(schema.families).limit(1);
    const monitor = getMonitorStatus();
    res.json({
      status: monitor.isDegraded ? 'degraded' : 'ok',
      db: 'ok',
      uptime: monitor.uptime,
      ts: new Date().toISOString(),
      env: NODE_ENV,
      version: '2.0.0',
    });
  } catch (e) {
    res.status(503).json({ status: 'error', db: 'error', error: String(e) });
  }
});

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth',     authRouter);
app.use('/api/family',   familyRouter);
app.use('/api/location', createLocationRouter(io));
app.use('/api/child',    createChildRouter(io));
app.use('/api/voice',    createVoiceRouter(io));
app.use('/api/admin',    createAdminRouter());
app.use('/api/push',     pushRouter);

// ── Serve built PWA client (SPA) ───────────────────────────────
const __dir = path.dirname(fileURLToPath(import.meta.url));
const clientDist = [
  path.resolve(__dir, '../../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
].find((p) => fs.existsSync(path.join(p, 'index.html')));
if (clientDist) {
  const cd: string = clientDist;
  app.use(express.static(cd));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path === '/health' || req.path.startsWith('/socket.io')) return next();
    res.sendFile(path.join(cd, 'index.html'));
  });
  console.log(`🖥️  PWA servi depuis ${cd}`);
} else {
  console.warn('⚠️  client/dist introuvable — PWA non servi');
}

// ── 404 + Error handler ────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: NODE_ENV === 'production' ? 'Internal error' : err.message });
});

// ── Start ──────────────────────────────────────────────────────
http.listen(PORT, '0.0.0.0', async () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🛡️  KIDO — Family Safety Platform');
  console.log(`📡  http://0.0.0.0:${PORT}`);
  console.log(`🌍  ENV: ${NODE_ENV}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  // Crash monitor — pattern swissrh
  await startCrashMonitor();
  // Scheduler — Luna 21h00 · Pouls 20h30 · Countdown watcher (pattern winwin-v2)
  startScheduler(io);
});

export default app;
