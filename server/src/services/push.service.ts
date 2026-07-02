// ============================================================
// VIVOKID — Web Push souverain (VAPID natif, ZÉRO Google/Firebase)
// Standard W3C Push API — fonctionne Android + iOS 16.4+ (PWA installée)
// Les notifications transitent par le push service du navigateur,
// le contenu est chiffré de bout en bout (RFC 8291). Cohérent nLPD.
// ============================================================
import webpush from 'web-push';
import { db, schema } from '../db/index.js';
import { eq, and, inArray } from 'drizzle-orm';

const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY  || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contact@vivokid.ch';

let configured = false;
if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  configured = true;
  console.log('[push] VAPID configuré ✅');
} else {
  console.warn('[push] VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY manquants — push désactivé');
}

export function getVapidPublicKey(): string { return VAPID_PUBLIC; }
export function isPushConfigured(): boolean { return configured; }

export interface PushPayload {
  title: string;
  body: string;
  tag?: string;              // regroupe les notifs
  url?: string;              // deep link à l'ouverture
  urgency?: 'very-low' | 'low' | 'normal' | 'high';
  renotify?: boolean;
  requireInteraction?: boolean; // reste affichée (SOS)
}

// Envoie à UN utilisateur (toutes ses subscriptions actives)
export async function pushToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!configured) return 0;
  const subs = await db.select().from(schema.pushSubscriptions)
    .where(and(eq(schema.pushSubscriptions.userId, userId), eq(schema.pushSubscriptions.active, true)));

  let sent = 0;
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(payload),
        { urgency: payload.urgency ?? 'normal', TTL: payload.urgency === 'high' ? 300 : 3600 },
      );
      sent++;
    } catch (err: any) {
      // 404/410 = subscription morte → désactiver
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await db.update(schema.pushSubscriptions)
          .set({ active: false })
          .where(eq(schema.pushSubscriptions.id, s.id));
      } else {
        console.warn('[push] envoi KO:', err?.statusCode, String(err?.body || err).slice(0, 100));
      }
    }
  }));
  return sent;
}

// Envoie à TOUS les parents d'une famille (le cas SOS)
export async function pushToParents(familyId: string, payload: PushPayload): Promise<number> {
  if (!configured) return 0;
  const parents = await db.select({ id: schema.users.id }).from(schema.users)
    .where(and(eq(schema.users.familyId, familyId), eq(schema.users.role, 'parent')));
  if (!parents.length) return 0;

  let total = 0;
  for (const p of parents) total += await pushToUser(p.id, payload);
  return total;
}

// Raccourcis métier ──────────────────────────────────────────
export const pushSOS = (familyId: string, childName: string, lat?: number, lng?: number) =>
  pushToParents(familyId, {
    title: `🆘 SOS — ${childName} a besoin de vous`,
    body: 'Alerte silencieuse envoyée. Contactez-le/la immédiatement.',
    tag: 'sos', urgency: 'high', requireInteraction: true, renotify: true,
    url: lat && lng ? `/map?sos=1&lat=${lat}&lng=${lng}` : '/map?sos=1',
  });

export const pushCountdownExpired = (familyId: string, childName: string) =>
  pushToParents(familyId, {
    title: `⏱️ ${childName} n'est pas encore arrivé(e)`,
    body: 'Le timer de retour a expiré. Un petit message pour vérifier ?',
    tag: 'countdown', urgency: 'high', url: '/',
  });

export const pushGeofence = (familyId: string, childName: string, zoneName: string, entered: boolean) =>
  pushToParents(familyId, {
    title: entered ? `📍 ${childName} est arrivé(e) à ${zoneName}` : `📍 ${childName} a quitté ${zoneName}`,
    body: entered ? 'Zone sécurisée ✅' : 'Sortie de zone détectée',
    tag: `geo-${zoneName}`, urgency: 'normal', url: '/map',
  });

export const pushPulseReminder = (userId: string) =>
  pushToUser(userId, {
    title: '🌙 Le Pouls Familial',
    body: 'Comment s\'est passée ta journée ? Un emoji suffit.',
    tag: 'pulse', urgency: 'low', url: '/?pulse=1',
  });

export const pushLevelUp = (userId: string, childName: string, levelLabel: string, levelIcon: string) =>
  pushToUser(userId, {
    title: `${levelIcon} ${childName} passe au niveau ${levelLabel} !`,
    body: 'La confiance grandit. Nouveaux privilèges débloqués 🎉',
    tag: 'levelup', urgency: 'normal', renotify: true, url: '/trust',
  });
