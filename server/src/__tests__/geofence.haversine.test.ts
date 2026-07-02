// ============================================================
// VIVOKID — Tests Haversine (distance géofence)
// ============================================================
import { describe, it, expect } from 'vitest';

// Réimplémentation locale identique à geofence.service.ts pour test pur
function haversineMetres(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

describe('Geofence — Haversine', () => {
  it('distance nulle au même point', () => {
    expect(haversineMetres(46.5, 6.6, 46.5, 6.6)).toBe(0);
  });

  it('Lausanne → Genève ≈ 50 km', () => {
    const d = haversineMetres(46.5197, 6.6323, 46.2044, 6.1432);
    expect(d).toBeGreaterThan(49000);
    expect(d).toBeLessThan(53000);
  });

  it('Delémont gare → Delémont vieille ville ≈ 800 m', () => {
    const d = haversineMetres(47.3617, 7.3400, 47.3665, 7.3448);
    expect(d).toBeGreaterThan(400);
    expect(d).toBeLessThan(1000);
  });

  it('précision courte distance (~100 m)', () => {
    // 0.001° lat ≈ 111 m
    const d = haversineMetres(46.5, 6.6, 46.501, 6.6);
    expect(d).toBeGreaterThan(105);
    expect(d).toBeLessThan(118);
  });

  it('rayon 200m — dedans/dehors', () => {
    const center = { lat: 47.3617, lng: 7.3400 };
    const inside  = haversineMetres(center.lat, center.lng, 47.3625, 7.3405); // ~100 m
    const outside = haversineMetres(center.lat, center.lng, 47.3660, 7.3450); // ~600 m
    expect(inside).toBeLessThan(200);
    expect(outside).toBeGreaterThan(200);
  });
});
