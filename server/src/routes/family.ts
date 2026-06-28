// ============================================================
// KIDO — Family Routes (parent dashboard data)
// ============================================================
import { Router } from 'express';
import { eq, desc, and, sql } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { requireAuth, requireParent } from '../middleware/auth.js';
import { getTrustLevel, MOOD_MAP } from '@kido/shared';

export const familyRouter = Router();
familyRouter.use(requireAuth);

// GET /family — full dashboard snapshot
familyRouter.get('/', async (req, res) => {
  const familyId = req.user!.familyId;

  const children = await db.select().from(schema.users)
    .where(and(eq(schema.users.familyId, familyId), eq(schema.users.role, 'child')));

  const enriched = await Promise.all(children.map(async (child) => {
    // Latest location
    const [loc] = await db.select().from(schema.locations)
      .where(eq(schema.locations.userId, child.id))
      .orderBy(desc(schema.locations.recordedAt)).limit(1);

    // Latest mood
    const [mood] = await db.select().from(schema.moods)
      .where(eq(schema.moods.userId, child.id))
      .orderBy(desc(schema.moods.createdAt)).limit(1);

    // Active countdown
    const [countdown] = await db.select().from(schema.checkins)
      .where(and(eq(schema.checkins.userId, child.id), eq(schema.checkins.type, 'arriving'), sql`${schema.checkins.resolvedAt} IS NULL`))
      .orderBy(desc(schema.checkins.createdAt)).limit(1);

    // Pending negotiations
    const pending = await db.select().from(schema.negotiations)
      .where(and(eq(schema.negotiations.childId, child.id), eq(schema.negotiations.status, 'pending')));

    return {
      id: child.id, name: child.name, age: child.age, avatar: child.avatar,
      trustScore: child.trustScore, trustLevel: getTrustLevel(child.trustScore),
      lastLocation: loc ?? null,
      mood: mood ? { value: mood.value, ...MOOD_MAP[mood.value as 1|2|3|4|5], at: mood.createdAt } : null,
      activeCountdown: countdown ? {
        id: countdown.id, etaMinutes: countdown.etaMinutes, startedAt: countdown.createdAt,
      } : null,
      pendingNegotiations: pending.length,
    };
  }));

  const [family] = await db.select().from(schema.families).where(eq(schema.families.id, familyId)).limit(1);
  const geofences = await db.select().from(schema.geofences).where(eq(schema.geofences.familyId, familyId));
  const circleMembers = await db.select().from(schema.circle).where(and(eq(schema.circle.familyId, familyId), eq(schema.circle.active, true)));

  return res.json({ family, children: enriched, geofences, circle: circleMembers });
});

// GET /family/events — live feed
familyRouter.get('/events', async (req, res) => {
  const familyId = req.user!.familyId;
  const children = await db.select({ id: schema.users.id }).from(schema.users)
    .where(and(eq(schema.users.familyId, familyId), eq(schema.users.role, 'child')));
  const childIds = children.map(c => c.id);
  if (!childIds.length) return res.json([]);

  // Mix of recent events from multiple tables
  const geoEvents = await db.select({
    type: sql<string>`'geo'`, at: schema.geofenceEvents.createdAt,
    userId: schema.geofenceEvents.userId, data: sql<string>`json_build_object('zone', ${schema.geofences.name}, 'event', ${schema.geofenceEvents.eventType})`,
  }).from(schema.geofenceEvents)
    .innerJoin(schema.geofences, eq(schema.geofenceEvents.geofenceId, schema.geofences.id))
    .where(sql`${schema.geofenceEvents.userId} = ANY(${JSON.stringify(childIds)}::varchar[])`)
    .orderBy(desc(schema.geofenceEvents.createdAt)).limit(10);

  return res.json(geoEvents);
});
