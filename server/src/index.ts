// ============================================================
// KIDO — Server Entry Point
// Pattern: boom-contact → helmet, cors, rate-limit, socket.io,
//          health check, morgan logging, trust proxy for Railway
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
import { authRouter }            from './routes/auth.js';
import { familyRouter }          from './routes/family.js';
import { createLocationRouter }  from './routes/location.js';
import { createChildRouter }     from './routes/child.js';
import jwt from 'jsonwebtoken';

const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'kido-dev-secret-change-in-prod';

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  'https://kido.family',
  'https://www.kido.family',
  'https://app.kido.family',
  ...(NODE_ENV !== 'production' ? ['http://localhost:5173', 'http://localhost:4173'] : []),
].filter(Boolean) as string[];

// ── App setup ──────────────────────────────────────────────────
const app  = express();
const http = createServer(app);

app.disable('x-powered-by');
app.set('trust proxy', 1); // Railway proxy — pattern boom-contact

// ── Socket.io ─────────────────────────────────────────────────
export const io = new SocketServer(http, {
  cors: { origin: ALLOWED_ORIGINS, credentials: true },
  pingTimeout: 20000,
  pingInterval: 25000,
  connectTimeout: 20000,
  maxHttpBufferSize: 1e6,
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; familyId: string; role: string };
    socket.data.userId   = payload.userId;
    socket.data.familyId = payload.familyId;
    socket.data.role     = payload.role;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const { userId, familyId, role } = socket.data;
  socket.join(`family:${familyId}`);
  socket.join(`user:${userId}`);
  console.log(`[socket] ${role} ${userId} joined family:${familyId}`);

  socket.on('disconnect', () => {
    console.log(`[socket] ${role} ${userId} disconnected`);
  });
});

// ── Middleware ─────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: NODE_ENV === 'production' }));
app.use(compression());
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev', {
  skip: (req) => req.url === '/health', // No log spam — boom-contact pattern
}));

// ── Rate limiting ──────────────────────────────────────────────
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api', limiter);
app.use('/api/auth', authLimiter);

// ── Health check (Railway monitoring) ─────────────────────────
app.get('/health', async (_req, res) => {
  try {
    const { db, schema } = await import('./db/index.js');
    await db.select({ n: schema.families.id }).from(schema.families).limit(1);
    res.json({ status: 'ok', db: 'ok', ts: new Date().toISOString(), env: NODE_ENV });
  } catch (e) {
    res.status(503).json({ status: 'error', db: 'error', error: String(e) });
  }
});

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',     authRouter);
app.use('/api/family',   familyRouter);
app.use('/api/location', createLocationRouter(io));
app.use('/api/child',    createChildRouter(io));

// ── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Error handler ──────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[error]', err);
  res.status(500).json({ error: NODE_ENV === 'production' ? 'Internal error' : err.message });
});

// ── Start ─────────────────────────────────────────────────────
http.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🛡️  KIDO API — ${NODE_ENV}`);
  console.log(`📡 http://0.0.0.0:${PORT}`);
  console.log(`❤️  Health: http://0.0.0.0:${PORT}/health\n`);
});

export default app;
