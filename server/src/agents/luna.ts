// ============================================================
// KIDO — Luna, l'Agent Gardien IA
// Pattern: winwin-v2 agents (Tina, Sophie, Camille...)
// Luna observe les comportements, détecte les anomalies,
// PROPOSE aux parents — ne décide jamais seule.
// ============================================================
import { db, schema } from '../db/index.js';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import { applyTrustAction } from '../services/trust.service.js';
import { aiComplete } from '../services/ai.service.js';
import type { Server as SocketServer } from 'socket.io';

export interface LunaObservation {
  childId: string;
  familyId: string;
  type: 'mood_pattern' | 'route_anomaly' | 'battery_pattern' | 'trust_trend' | 'checkin_gap' | 'speed_anomaly';
  severity: 'info' | 'attention' | 'alert';
  title: string;
  body: string;
  suggestedAction?: string;
  data?: Record<string, unknown>;
}

// ── Analyse quotidienne par Luna (scheduler 21:00 chaque soir)
export async function lunaDaily(familyId: string, io: SocketServer): Promise<LunaObservation[]> {
  const children = await db.select().from(schema.users)
    .where(and(eq(schema.users.familyId, familyId), eq(schema.users.role, 'child')));

  const observations: LunaObservation[] = [];

  for (const child of children) {
    const childObs = await analyzeChild(child, familyId);
    observations.push(...childObs);
  }

  if (observations.length > 0) {
    // Summarize with Claude
    const summary = await lunaReport(observations, familyId);
    io.to(`family:${familyId}`).emit('luna:daily', { observations, summary, at: new Date().toISOString() });
  }

  return observations;
}

async function analyzeChild(child: typeof schema.users.$inferSelect, familyId: string): Promise<LunaObservation[]> {
  const observations: LunaObservation[] = [];
  const since30Days = new Date(Date.now() - 30 * 24 * 3600 * 1000);

  // ── 1. Mood Pattern — "Emma est systématiquement triste le lundi"
  const moods = await db.select({
    value: schema.moods.value,
    dow: sql<number>`EXTRACT(DOW FROM ${schema.moods.createdAt})`,
    createdAt: schema.moods.createdAt,
  }).from(schema.moods)
    .where(and(eq(schema.moods.userId, child.id), gte(schema.moods.createdAt, since30Days)))
    .orderBy(desc(schema.moods.createdAt));

  if (moods.length >= 7) {
    const byDow: Record<number, number[]> = {};
    moods.forEach(m => {
      if (!byDow[m.dow]) byDow[m.dow] = [];
      byDow[m.dow].push(m.value);
    });
    const DAYS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    for (const [dow, vals] of Object.entries(byDow)) {
      if (vals.length >= 3) {
        const avg = vals.reduce((a,b) => a+b, 0) / vals.length;
        if (avg <= 2.5) {
          observations.push({
            childId: child.id, familyId,
            type: 'mood_pattern', severity: 'attention',
            title: `${child.name} semble souvent triste le ${DAYS[+dow]}`,
            body: `Humeur moyenne de ${avg.toFixed(1)}/5 sur les ${vals.length} derniers ${DAYS[+dow]}s. Ce pattern mérite attention.`,
            suggestedAction: `Discuter en famille de ce que ${child.name} vit le ${DAYS[+dow]}`,
          });
        }
      }
    }
  }

  // ── 2. Check-in Gap — "Noah n'envoie plus de check-ins depuis 3 jours"
  const lastCheckin = await db.select().from(schema.checkins)
    .where(eq(schema.checkins.userId, child.id))
    .orderBy(desc(schema.checkins.createdAt)).limit(1);

  if (lastCheckin.length > 0) {
    const daysSince = (Date.now() - new Date(lastCheckin[0].createdAt).getTime()) / 86400000;
    if (daysSince > 3) {
      observations.push({
        childId: child.id, familyId,
        type: 'checkin_gap', severity: 'info',
        title: `${child.name} n'a plus envoyé de check-in depuis ${Math.floor(daysSince)} jours`,
        body: `Les check-ins sont un bon signe d'engagement. Un rappel doux pourrait aider.`,
        suggestedAction: `Envoyer un message bienveillant à ${child.name}`,
      });
    }
  }

  // ── 3. Trust Trend — "Le score de confiance de Zoé baisse"
  const recentTrust = await db.select().from(schema.trustEvents)
    .where(and(eq(schema.trustEvents.userId, child.id), gte(schema.trustEvents.createdAt, new Date(Date.now() - 7 * 86400000))))
    .orderBy(desc(schema.trustEvents.createdAt));

  if (recentTrust.length >= 3) {
    const totalDelta = recentTrust.reduce((a, b) => a + b.pointsDelta, 0);
    if (totalDelta < -10) {
      observations.push({
        childId: child.id, familyId,
        type: 'trust_trend', severity: 'attention',
        title: `Score de confiance de ${child.name} en baisse cette semaine`,
        body: `${Math.abs(totalDelta)} points perdus en 7 jours. Une conversation sur les attentes mutuelles pourrait être utile.`,
        suggestedAction: 'Proposer un Pacte mis à jour ou une discussion famille',
      });
    }
  }

  return observations;
}

// ── Luna résume via l'IA souveraine Infomaniak (fallback Anthropic) + KPI
async function lunaReport(observations: LunaObservation[], familyId?: string): Promise<string> {
  return aiComplete({
    feature: 'luna_daily_report',
    familyId,
    maxTokens: 300,
    system: `Tu es Luna, l'agent gardien bienveillant de VIVOkid.
Tu analyses les observations sur les enfants d'une famille et tu formules un résumé parental
chaleureux, bienveillant et actionnable en 2-3 phrases maximum.
Tu ne juges pas. Tu proposes. Tu rassures quand c'est possible.
Tu t'exprimes en français, avec douceur et précision.`,
    user: `Voici les observations de la soirée:
${JSON.stringify(observations, null, 2)}

Rédige un résumé bienveillant pour les parents.`,
  });
}

// ── Luna real-time: called on each GPS update for instant anomaly detection
export async function lunaRealtime(
  childId: string,
  familyId: string,
  lat: number,
  lng: number,
  speed: number | null,
  io: SocketServer,
) {
  // Speed anomaly: > 8 m/s (29 km/h) while child should be on foot
  if (speed && speed > 8) {
    const child = await db.select({ name: schema.users.name })
      .from(schema.users).where(eq(schema.users.id, childId)).limit(1);

    io.to(`family:${familyId}`).emit('luna:realtime', {
      childId,
      type: 'speed_anomaly',
      severity: 'alert',
      title: `${child[0]?.name ?? 'Votre enfant'} se déplace à ${(speed * 3.6).toFixed(0)} km/h`,
      body: 'Cette vitesse suggère un déplacement en véhicule. Vérifiez que tout va bien.',
      at: new Date().toISOString(),
    } as unknown as LunaObservation);
  }
}
