// ============================================================
// KIDO — Shared Types
// © 2025 Groupe NEO — PEP's Swiss SA
// ============================================================

export type UserRole = 'parent' | 'child';
export type PlanType = 'free' | 'family' | 'pro' | 'school';
export type MoodValue = 1 | 2 | 3 | 4 | 5;
export type TrustLevel = 'seedling' | 'growing' | 'reliable' | 'excellent' | 'champion';
export type CheckinType = 'ok' | 'arriving' | 'late' | 'callback' | 'custom';
export type GeofenceEvent = 'enter' | 'exit';
export type NegotiationStatus = 'pending' | 'approved' | 'rejected' | 'modified';
export type SosType = 'shake' | 'volume' | 'button';

export interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;    // m/s — détecte montée en voiture
  heading?: number;
  recordedAt: string; // ISO
}

export interface MoodEntry {
  value: MoodValue;
  label: string;
  emoji: string;
  note?: string;
}

export const MOOD_MAP: Record<MoodValue, { label: string; emoji: string; color: string }> = {
  1: { label: 'Pas bien',  emoji: '😔', color: '#ef4444' },
  2: { label: 'Fatigué',   emoji: '😴', color: '#f97316' },
  3: { label: 'Ça va',     emoji: '😐', color: '#eab308' },
  4: { label: 'Heureux',   emoji: '😊', color: '#22c55e' },
  5: { label: 'Super !',   emoji: '🤩', color: '#14b8a6' },
};

export const TRUST_LEVELS: Record<TrustLevel, {
  min: number; max: number; label: string; icon: string;
  gpsInterval: number;    // secondes
  perks: string[];
  color: string;
}> = {
  seedling:  { min: 0,  max: 30, label: 'Débutant',   icon: '🌱', gpsInterval: 30,   color: '#ef4444', perks: ['GPS toutes les 30s', 'Toutes les alertes'] },
  growing:   { min: 30, max: 60, label: 'En progrès', icon: '🌿', gpsInterval: 300,  color: '#f97316', perks: ['GPS toutes les 5 min', 'Peut demander +1h'] },
  reliable:  { min: 60, max: 80, label: 'Fiable',     icon: '🌳', gpsInterval: 900,  color: '#eab308', perks: ['GPS toutes les 15 min', '+2h autonomie/sem'] },
  excellent: { min: 80, max: 95, label: 'Excellent',  icon: '⭐', gpsInterval: 1800, color: '#14b8a6', perks: ['GPS à la demande', 'Mode week-end libre'] },
  champion:  { min: 95, max: 101, label: 'Champion',  icon: '🏆', gpsInterval: 3600, color: '#22c55e', perks: ['Confiance totale', 'Notifications réduites'] },
};

export const TRUST_ACTIONS: Record<string, { points: number; label: string }> = {
  arrived_on_time:    { points: +5,  label: 'Rentré à l\'heure' },
  checkin_sent:       { points: +3,  label: 'Check-in envoyé' },
  followed_route:     { points: +4,  label: 'Trajet habituel suivi' },
  mood_shared:        { points: +2,  label: 'Humeur partagée' },
  sos_false_alarm:    { points: -3,  label: 'Fausse alerte SOS' },
  left_zone_no_warn:  { points: -8,  label: 'Sorti de zone sans prévenir' },
  late_no_checkin:    { points: -5,  label: 'En retard sans check-in' },
  negotiation_kept:   { points: +6,  label: 'Accord respecté' },
};

export function getTrustLevel(score: number): TrustLevel {
  if (score >= 95) return 'champion';
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'reliable';
  if (score >= 30) return 'growing';
  return 'seedling';
}

export function clampTrust(score: number): number {
  return Math.min(100, Math.max(0, score));
}
