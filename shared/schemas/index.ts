// ============================================================
// KIDO — Zod Schemas (shared client + server)
// Pattern: boom-contact → Zod everywhere, validate before use
// ============================================================
import { z } from 'zod';

export const LocationSchema = z.object({
  lat:        z.number().min(-90).max(90),
  lng:        z.number().min(-180).max(180),
  accuracy:   z.number().optional(),
  speed:      z.number().optional(),
  heading:    z.number().optional(),
  recordedAt: z.string().datetime(),
});

export const MoodSchema = z.object({
  value: z.union([z.literal(1),z.literal(2),z.literal(3),z.literal(4),z.literal(5)]),
  note:  z.string().max(200).optional(),
});

export const CheckinSchema = z.object({
  type:       z.enum(['ok','arriving','late','callback','custom']),
  message:    z.string().max(200).optional(),
  etaMinutes: z.number().int().min(1).max(480).optional(),
});

export const GeofenceSchema = z.object({
  name:    z.string().min(1).max(100),
  type:    z.enum(['home','school','sport','custom']),
  lat:     z.number(),
  lng:     z.number(),
  radius:  z.number().int().min(50).max(5000).default(200), // metres
  active:  z.boolean().default(true),
  childIds: z.array(z.string()).optional(), // null = all children
});

export const NegotiationSchema = z.object({
  title:       z.string().min(1).max(200),
  location:    z.string().max(200).optional(),
  contactName: z.string().max(100).optional(),
  startAt:     z.string().datetime(),
  endAt:       z.string().datetime(),
  reason:      z.string().max(500).optional(),
});

export const PacteTermSchema = z.object({
  childId:         z.string(),
  gpsSharedUntilAge: z.number().int().min(10).max(18).default(13),
  checkInRequired: z.boolean().default(true),
  sosEnabled:      z.boolean().default(true),
  circleEnabled:   z.boolean().default(true),
  parentCommits:   z.array(z.string()),   // engagements du parent
  childCommits:    z.array(z.string()),   // engagements de l'enfant
});

export const RegisterFamilySchema = z.object({
  parentName:  z.string().min(2).max(100),
  email:       z.string().email(),
  password:    z.string().min(8),
  familyName:  z.string().min(1).max(100),
  consentCGU:  z.literal(true),
});

export const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const AddChildSchema = z.object({
  name:   z.string().min(1).max(100),
  age:    z.number().int().min(4).max(17),
  avatar: z.string().max(10).optional(),
});

export type LocationInput       = z.infer<typeof LocationSchema>;
export type MoodInput           = z.infer<typeof MoodSchema>;
export type CheckinInput        = z.infer<typeof CheckinSchema>;
export type GeofenceInput       = z.infer<typeof GeofenceSchema>;
export type NegotiationInput    = z.infer<typeof NegotiationSchema>;
export type PacteTermInput      = z.infer<typeof PacteTermSchema>;
export type RegisterFamilyInput = z.infer<typeof RegisterFamilySchema>;
export type LoginInput          = z.infer<typeof LoginSchema>;
export type AddChildInput       = z.infer<typeof AddChildSchema>;
