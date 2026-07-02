// ============================================================
// VIVOKID — Push Routes (subscribe/unsubscribe + clé publique)
// ============================================================
import { Router } from 'express';
import { z } from 'zod';
import { db, schema } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';
import { getVapidPublicKey, isPushConfigured, pushToUser } from '../services/push.service.js';

const SubSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
});

export const pushRouter = Router();

// GET /push/vapid — clé publique (pas d'auth : nécessaire avant login PWA)
pushRouter.get('/vapid', (_req, res) => {
  res.json({ publicKey: getVapidPublicKey(), enabled: isPushConfigured() });
});

pushRouter.use(requireAuth);

// POST /push/subscribe
pushRouter.post('/subscribe', async (req, res) => {
  const parsed = SubSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { endpoint, keys } = parsed.data;

  await db.insert(schema.pushSubscriptions)
    .values({
      userId: req.user!.userId, endpoint,
      p256dh: keys.p256dh, auth: keys.auth,
      userAgent: req.get('user-agent')?.slice(0, 250) ?? null,
    })
    .onConflictDoUpdate({
      target: schema.pushSubscriptions.endpoint,
      set: { userId: req.user!.userId, p256dh: keys.p256dh, auth: keys.auth, active: true },
    });

  return res.status(201).json({ ok: true });
});

// POST /push/unsubscribe
pushRouter.post('/unsubscribe', async (req, res) => {
  const { endpoint } = req.body ?? {};
  if (!endpoint) return res.status(400).json({ error: 'endpoint requis' });
  await db.update(schema.pushSubscriptions)
    .set({ active: false })
    .where(eq(schema.pushSubscriptions.endpoint, endpoint));
  return res.json({ ok: true });
});

// POST /push/test — s'auto-envoyer une notif (debug)
pushRouter.post('/test', async (req, res) => {
  const sent = await pushToUser(req.user!.userId, {
    title: '🛡️ VIVOkid', body: 'Les notifications fonctionnent parfaitement !', tag: 'test',
  });
  return res.json({ sent });
});
