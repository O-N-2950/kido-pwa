// ============================================================
// KIDO — Location Routes
// Pattern: receive GPS from child PWA, emit to family via Socket.io
// ============================================================
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { LocationSchema } from '@kido/shared';
import { db, schema } from '../db/index.js';
import { checkGeofences } from '../services/geofence.service.js';
import type { Server as SocketServer } from 'socket.io';

export function createLocationRouter(io: SocketServer) {
  const router = Router();
  router.use(requireAuth);

  // POST /location — child sends GPS position
  router.post('/', async (req, res) => {
    const parsed = LocationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { lat, lng, accuracy, speed, heading, recordedAt } = parsed.data;
    const userId   = req.user!.userId;
    const familyId = req.user!.familyId;

    // Store
    await db.insert(schema.locations).values({ userId, lat, lng, accuracy, speed, heading });

    // Emit realtime to family room
    io.to(`family:${familyId}`).emit('location:update', {
      userId, lat, lng, accuracy, speed, heading, recordedAt,
    });

    // Check geofences async
    checkGeofences(userId, familyId, lat, lng, io).catch(console.error);

    // Speed alert: > 5 m/s (~18 km/h) while child is on foot route → vehicle alert
    if (speed && speed > 5) {
      io.to(`family:${familyId}`).emit('speed:alert', { userId, speed, lat, lng, at: recordedAt });
    }

    return res.status(204).end();
  });

  // GET /location/:childId/history
  router.get('/:childId/history', async (req, res) => {
    const { childId } = req.params;
    if (req.user!.role !== 'parent') return res.status(403).end();

    const locs = await db.select().from(schema.locations)
      .where(schema.locations.userId === childId as any)
      .orderBy(schema.locations.recordedAt)
      .limit(500);

    return res.json(locs);
  });

  return router;
}
