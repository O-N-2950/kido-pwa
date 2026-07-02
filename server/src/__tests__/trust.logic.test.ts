// ============================================================
// VIVOKID — Tests logique Trust (pure functions, zéro DB)
// ============================================================
import { describe, it, expect } from 'vitest';
import { getTrustLevel, clampTrust, TRUST_LEVELS, TRUST_ACTIONS } from '@kido/shared';

describe('Trust Score — niveaux', () => {
  it('mappe correctement chaque borne de niveau (spec: 0-30/30-60/60-80/80-95/95-100)', () => {
    expect(getTrustLevel(0)).toBe('seedling');
    expect(getTrustLevel(29)).toBe('seedling');
    expect(getTrustLevel(30)).toBe('growing');
    expect(getTrustLevel(59)).toBe('growing');
    expect(getTrustLevel(60)).toBe('reliable');
    expect(getTrustLevel(79)).toBe('reliable');
    expect(getTrustLevel(80)).toBe('excellent');
    expect(getTrustLevel(94)).toBe('excellent');
    expect(getTrustLevel(95)).toBe('champion');
    expect(getTrustLevel(100)).toBe('champion');
  });

  it('clamp le score entre 0 et 100', () => {
    expect(clampTrust(-10)).toBe(0);
    expect(clampTrust(0)).toBe(0);
    expect(clampTrust(50)).toBe(50);
    expect(clampTrust(100)).toBe(100);
    expect(clampTrust(150)).toBe(100);
  });

  it('chaque niveau a des perks définis', () => {
    for (const level of Object.values(TRUST_LEVELS)) {
      expect(level.perks.length).toBeGreaterThan(0);
      expect(level.min).toBeLessThanOrEqual(level.max);
    }
  });

  it('les niveaux couvrent 0-100 sans trou (bornes contiguës: min[i] = max[i-1])', () => {
    const sorted = Object.values(TRUST_LEVELS).sort((a, b) => a.min - b.min);
    expect(sorted[0].min).toBe(0);
    expect(sorted[sorted.length - 1].max).toBeGreaterThanOrEqual(100); // sentinel 101: score<max inclut 100
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].min).toBe(sorted[i - 1].max);
    }
  });

  it('les actions positives et négatives existent', () => {
    const points = Object.values(TRUST_ACTIONS).map(a => a.points);
    expect(points.some(p => p > 0)).toBe(true);
    expect(points.some(p => p < 0)).toBe(true);
    expect(TRUST_ACTIONS.late_no_checkin.points).toBeLessThan(0);
  });
});
