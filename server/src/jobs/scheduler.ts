// ============================================================
// VIVOKID — Scheduler (Luna quotidien + Pouls + Countdown watcher)
// Pattern: winwin-v2 nightly agents — setInterval simple, robuste,
// zéro dépendance cron externe. Heure suisse (Europe/Zurich).
// ============================================================
import { db, schema } from '../db/index.js';
import { eq, and, sql, isNull, lt } from 'drizzle-orm';
import { lunaDaily } from '../agents/luna.js';
import { pushPulseReminder, pushCountdownExpired } from '../services/push.service.js';
import { applyTrustAction } from '../services/trust.service.js';
import type { Server as SocketServer } from 'socket.io';

function swissHourMinute(): { h: number; m: number } {
  const now = new Date().toLocaleString('fr-CH', { timeZone: 'Europe/Zurich', hour: '2-digit', minute: '2-digit', hour12: false });
  const [h, m] = now.split(':').map(Number);
  return { h, m };
}

let lastLunaRun = '';   // 'YYYY-MM-DD' — évite les doubles exécutions
let lastPulseRun = '';

export function startScheduler(io: SocketServer) {
  console.log('[scheduler] démarré — Luna 21h00 · Pouls 20h30 · Countdown watcher 60s');

  // ── Tick horaire précis: vérifie chaque minute ─────────────
  setInterval(async () => {
    const { h, m } = swissHourMinute();
    const today = new Date().toISOString().slice(0, 10);

    // 🌙 Pouls Familial — 20h30, notification à toute la famille
    if (h === 20 && m === 30 && lastPulseRun !== today) {
      lastPulseRun = today;
      try {
        const users = await db.select({ id: schema.users.id }).from(schema.users);
        for (const u of users) await pushPulseReminder(u.id);
        console.log(`[scheduler] Pouls envoyé à ${users.length} membres`);
      } catch (e) { console.error('[scheduler] Pouls KO:', e); }
    }

    // 🤖 Luna — 21h00, analyse quotidienne par famille
    if (h === 21 && m === 0 && lastLunaRun !== today) {
      lastLunaRun = today;
      try {
        const fams = await db.select({ id: schema.families.id }).from(schema.families);
        for (const f of fams) {
          await lunaDaily(f.id, io).catch(e => console.error(`[luna] famille ${f.id} KO:`, e));
        }
        console.log(`[scheduler] Luna a analysé ${fams.length} familles`);
      } catch (e) { console.error('[scheduler] Luna KO:', e); }
    }
  }, 60_000);

  // ── Countdown watcher — chaque 60s: timers expirés ─────────
  setInterval(async () => {
    try {
      // Check-ins 'arriving' non résolus dont l'ETA est dépassée de > 2 min (marge)
      const expired = await db.select({
        id: schema.checkins.id,
        userId: schema.checkins.userId,
        name: schema.users.name,
        familyId: schema.users.familyId,
      })
        .from(schema.checkins)
        .innerJoin(schema.users, eq(schema.checkins.userId, schema.users.id))
        .where(and(
          eq(schema.checkins.type, 'arriving'),
          isNull(schema.checkins.resolvedAt),
          sql`${schema.checkins.createdAt} + (${schema.checkins.etaMinutes} + 2) * interval '1 minute' < now()`,
        ));

      for (const c of expired) {
        // Marquer résolu (expiré) pour ne pas re-notifier
        await db.update(schema.checkins).set({ resolvedAt: new Date() })
          .where(eq(schema.checkins.id, c.id));

        // Push haute priorité aux parents + socket + malus trust léger
        await pushCountdownExpired(c.familyId, c.name);
        io.to(`family:${c.familyId}`).emit('countdown:expired', {
          userId: c.userId, name: c.name, at: new Date().toISOString(),
        });
        await applyTrustAction(c.userId, 'late_no_checkin').catch(() => {});
        console.log(`[scheduler] Countdown expiré: ${c.name}`);
      }
    } catch (e) { console.error('[scheduler] countdown watcher KO:', e); }
  }, 60_000);
}
