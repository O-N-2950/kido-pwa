// ============================================================
// KIDO — Child-facing Routes
// Mood, Check-in, SOS, Countdown — all child-initiated actions
// ============================================================
import { Router } from 'express';
import { nanoid } from 'nanoid';
import { eq, sql, and } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { MoodSchema, CheckinSchema } from '@kido/shared';
import { applyTrustAction } from '../services/trust.service.js';
import type { Server as SocketServer } from 'socket.io';

export function createChildRouter(io: SocketServer) {
  const router = Router();
  router.use(requireAuth);

  // POST /child/mood — Mood Check-in (🌡️ Exclusive Feature #1)
  router.post('/mood', async (req, res) => {
    const parsed = MoodSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const userId   = req.user!.userId;
    const familyId = req.user!.familyId;

    const [mood] = await db.insert(schema.moods)
      .values({ userId, value: parsed.data.value, note: parsed.data.note })
      .returning();

    // Emit to parents immediately
    io.to(`family:${familyId}`).emit('mood:update', {
      userId, value: parsed.data.value, note: parsed.data.note, at: mood.createdAt,
    });

    // Trust points for sharing
    await applyTrustAction(userId, 'mood_shared');

    return res.status(201).json(mood);
  });

  // POST /child/checkin — Check-in rapide (⏱️ Feature #3 + #4)
  router.post('/checkin', async (req, res) => {
    const parsed = CheckinSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const userId   = req.user!.userId;
    const familyId = req.user!.familyId;

    const [checkin] = await db.insert(schema.checkins)
      .values({ userId, type: parsed.data.type, message: parsed.data.message, etaMinutes: parsed.data.etaMinutes })
      .returning();

    // Emit countdown to family
    io.to(`family:${familyId}`).emit('checkin:new', {
      userId, type: parsed.data.type, message: parsed.data.message,
      etaMinutes: parsed.data.etaMinutes, id: checkin.id, at: checkin.createdAt,
    });

    await applyTrustAction(userId, 'checkin_sent');

    return res.status(201).json(checkin);
  });

  // POST /child/checkin/:id/resolve — enfant arrive, countdown stopped
  router.post('/checkin/:id/resolve', async (req, res) => {
    const userId   = req.user!.userId;
    const familyId = req.user!.familyId;

    await db.update(schema.checkins)
      .set({ resolvedAt: new Date() })
      .where(and(eq(schema.checkins.id, parseInt(req.params.id)), eq(schema.checkins.userId, userId)));

    io.to(`family:${familyId}`).emit('checkin:resolved', { id: req.params.id, userId, at: new Date().toISOString() });
    return res.status(204).end();
  });

  // POST /child/sos — SOS Discret (🤫 Feature #4)
  router.post('/sos', async (req, res) => {
    const userId   = req.user!.userId;
    const familyId = req.user!.familyId;
    const { type = 'button', lat, lng } = req.body;

    const [sos] = await db.insert(schema.sosAlerts)
      .values({ childId: userId, type, lat, lng })
      .returning();

    // PRIORITY emit — bypasses normal queue
    io.to(`family:${familyId}`).emit('sos:alert', {
      userId, type, lat, lng, id: sos.id, at: sos.createdAt,
      priority: 'CRITICAL',
    });

    return res.status(201).json({ id: sos.id });
  });

  // POST /child/negotiate — Moteur de Négociation (Feature #4)
  router.post('/negotiate', async (req, res) => {
    const userId   = req.user!.userId;
    const familyId = req.user!.familyId;
    const { title, location, contactName, startAt, endAt, reason } = req.body;

    const id = nanoid(20);
    const [neg] = await db.insert(schema.negotiations)
      .values({ id, childId: userId, familyId, title, location, contactName, startAt: new Date(startAt), endAt: new Date(endAt), reason })
      .returning();

    io.to(`family:${familyId}`).emit('negotiation:new', {
      id, userId, title, location, contactName, startAt, endAt, reason, at: neg.createdAt,
    });

    return res.status(201).json(neg);
  });

  // POST /child/pulse — Pouls Familial quotidien
  router.post('/pulse', async (req, res) => {
    const { value } = req.body;
    if (!value || value < 1 || value > 5) return res.status(400).json({ error: 'Value 1-5 required' });

    const userId   = req.user!.userId;
    const familyId = req.user!.familyId;

    const [pulse] = await db.insert(schema.pulses)
      .values({ userId, value })
      .returning();

    io.to(`family:${familyId}`).emit('pulse:update', { userId, value, at: pulse.createdAt });
    return res.status(201).json(pulse);
  });

  return router;
}
