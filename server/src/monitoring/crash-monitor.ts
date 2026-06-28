// ============================================================
// KIDO — Crash Monitor
// Pattern: swissrh → adapté depuis boom-contact → swissrh → kido
// Startup check + heartbeat 5min + alerte après 2 échecs
// ============================================================
import { db, schema } from '../db/index.js';

const state = {
  consecutiveFailures: 0,
  isDegraded: false,
  startupTime: new Date(),
};

async function checkDatabase(): Promise<{ ok: boolean; error?: string }> {
  try {
    await db.select({ id: schema.families.id }).from(schema.families).limit(1);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function startCrashMonitor() {
  console.log('[crash-monitor] Starting...');

  const check = async () => {
    const { ok, error } = await checkDatabase();
    if (!ok) {
      state.consecutiveFailures++;
      console.error(`[crash-monitor] DB check failed (${state.consecutiveFailures}): ${error}`);
      if (state.consecutiveFailures >= 2 && !state.isDegraded) {
        state.isDegraded = true;
        console.error('[crash-monitor] DEGRADED — alerting');
        // In production: send alert via Resend to olivier.neukomm@bluewin.ch
      }
    } else {
      if (state.isDegraded) {
        console.log('[crash-monitor] RECOVERED');
        state.isDegraded = false;
      }
      state.consecutiveFailures = 0;
    }
  };

  // Initial check
  await check();
  // Heartbeat every 5 minutes — pattern swissrh
  setInterval(check, 5 * 60 * 1000);
}

export function getMonitorStatus() {
  return {
    isDegraded: state.isDegraded,
    consecutiveFailures: state.consecutiveFailures,
    uptime: Math.floor((Date.now() - state.startupTime.getTime()) / 1000),
  };
}
