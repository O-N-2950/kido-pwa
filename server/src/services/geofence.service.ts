// ============================================================
// KIDO — Geofence Service
// Haversine distance check, triggered on each GPS update
// ============================================================
import { db, schema } from '../db/index.js';
import { eq, and, desc } from 'drizzle-orm';
import { applyTrustAction } from './trust.service.js';
import { pushGeofence } from './push.service.js';
import type { Server as SocketServer } from 'socket.io';

// Haversine formula — distance in metres
function haversineMetres(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Called on every GPS update from a child
export async function checkGeofences(
  userId: string,
  familyId: string,
  lat: number,
  lng: number,
  io: SocketServer,
) {
  const zones = await db.select().from(schema.geofences)
    .where(and(eq(schema.geofences.familyId, familyId), eq(schema.geofences.active, true)));

  for (const zone of zones) {
    if (zone.childIds && !(zone.childIds as string[]).includes(userId)) continue;

    const dist = haversineMetres(lat, lng, zone.lat, zone.lng);
    const inside = dist <= zone.radius;

    // Get last event for this user+zone to detect transitions
    const [lastEvent] = await db.select({ eventType: schema.geofenceEvents.eventType })
      .from(schema.geofenceEvents)
      .where(and(
        eq(schema.geofenceEvents.userId, userId),
        eq(schema.geofenceEvents.geofenceId, zone.id),
      ))
      .orderBy(desc(schema.geofenceEvents.createdAt))
      .limit(1);

    const wasInside = lastEvent?.eventType === 'enter';
    const transition = inside !== wasInside;

    if (transition) {
      const eventType = inside ? 'enter' : 'exit';
      await db.insert(schema.geofenceEvents).values({ userId, geofenceId: zone.id, eventType, lat, lng });

      // Emit to family room
      io.to(`family:${familyId}`).emit('geofence:event', {
        userId, zoneName: zone.name, zoneType: zone.type, eventType, at: new Date().toISOString(),
      });

      // 📲 Push aux parents (app fermée incluse)
      const [child] = await db.select({ name: schema.users.name })
        .from(schema.users).where(eq(schema.users.id, userId)).limit(1);
      pushGeofence(familyId, child?.name ?? 'Votre enfant', zone.name, inside).catch(() => {});

      // Trust score: arrived at school/home zone on time → +points handled by countdown service
      if (inside && zone.type === 'home') {
        await applyTrustAction(userId, 'arrived_on_time');
      }
    }
  }
}
