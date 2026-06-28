// ============================================================
// KIDO — Trust Score Service
// Core business logic — central to Kido's differentiator
// ============================================================
import { db, schema } from '../db/index.js';
import { eq, sql } from 'drizzle-orm';
import { TRUST_ACTIONS, getTrustLevel, clampTrust } from '@kido/shared';

export async function applyTrustAction(
  userId: string,
  action: keyof typeof TRUST_ACTIONS,
  reason?: string,
): Promise<{ before: number; after: number; level: string }> {
  const def = TRUST_ACTIONS[action];
  if (!def) throw new Error(`Unknown trust action: ${action}`);

  const [user] = await db.select({ trustScore: schema.users.trustScore })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!user) throw new Error('User not found');

  const before = user.trustScore;
  const after  = clampTrust(before + def.points);

  await db.transaction(async (tx) => {
    await tx.update(schema.users)
      .set({ trustScore: after })
      .where(eq(schema.users.id, userId));

    await tx.insert(schema.trustEvents).values({
      userId,
      action,
      pointsDelta: def.points,
      scoreBefore: before,
      scoreAfter:  after,
      reason: reason ?? def.label,
    });
  });

  return { before, after, level: getTrustLevel(after) };
}

export async function getTrustHistory(userId: string, limit = 20) {
  return db.select()
    .from(schema.trustEvents)
    .where(eq(schema.trustEvents.userId, userId))
    .orderBy(sql`${schema.trustEvents.createdAt} DESC`)
    .limit(limit);
}
