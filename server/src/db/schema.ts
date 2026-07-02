// ============================================================
// KIDO — Database Schema (Drizzle ORM)
// Pattern: boom-contact → typed JSONB, proper indexes, migrations
// ============================================================
import {
  pgTable,
  text,
  timestamp,
  jsonb,
  varchar,
  integer,
  boolean,
  index,
  real,
  serial,
  uniqueIndex,
  numeric,
} from 'drizzle-orm/pg-core';
import type { Location, MoodValue } from '@kido/shared';

// ── Families ─────────────────────────────────────────────────
export const families = pgTable('families', {
  id:              varchar('id', { length: 20 }).primaryKey(),
  name:            text('name').notNull(),
  plan:            varchar('plan', { length: 20 }).notNull().default('free'),
  stripeCustomer:  text('stripe_customer'),
  stripePriceId:   text('stripe_price_id'),
  planExpiresAt:   timestamp('plan_expires_at'),
  createdAt:       timestamp('created_at').notNull().defaultNow(),
});

// ── Users (parents + children) ────────────────────────────────
export const users = pgTable('users', {
  id:              varchar('id', { length: 20 }).primaryKey(),
  familyId:        varchar('family_id', { length: 20 }).notNull().references(() => families.id, { onDelete: 'cascade' }),
  role:            varchar('role', { length: 10 }).notNull(), // 'parent' | 'child'
  name:            text('name').notNull(),
  email:           text('email'),
  passwordHash:    text('password_hash'),
  avatar:          text('avatar').default('👤'),
  age:             integer('age'),
  trustScore:      integer('trust_score').notNull().default(50),
  tokenVersion:    integer('token_version').notNull().default(0), // JWT revocation
  fcmToken:        text('fcm_token'),     // Firebase push token
  lastSeenAt:      timestamp('last_seen_at'),
  consentCGU:      boolean('consent_cgu').notNull().default(false),
  consentCGUAt:    timestamp('consent_cgu_at'),
  createdAt:       timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  familyIdx:  index('users_family_idx').on(t.familyId),
  emailIdx:   uniqueIndex('users_email_idx').on(t.email),
  roleIdx:    index('users_role_idx').on(t.role),
}));

// ── Locations (GPS timeseries) ────────────────────────────────
export const locations = pgTable('locations', {
  id:         serial('id').primaryKey(),
  userId:     varchar('user_id', { length: 20 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  lat:        real('lat').notNull(),
  lng:        real('lng').notNull(),
  accuracy:   real('accuracy'),
  speed:      real('speed'),     // m/s — > 3 m/s = probablement en véhicule
  heading:    real('heading'),
  recordedAt: timestamp('recorded_at').notNull().defaultNow(),
}, (t) => ({
  userTimeIdx: index('locations_user_time_idx').on(t.userId, t.recordedAt),
  recentIdx:   index('locations_recent_idx').on(t.recordedAt),
}));

// ── Moods ──────────────────────────────────────────────────────
export const moods = pgTable('moods', {
  id:        serial('id').primaryKey(),
  userId:    varchar('user_id', { length: 20 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  value:     integer('value').notNull(), // 1-5
  note:      text('note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  userIdx: index('moods_user_idx').on(t.userId, t.createdAt),
}));

// ── Check-ins ──────────────────────────────────────────────────
export const checkins = pgTable('checkins', {
  id:         serial('id').primaryKey(),
  userId:     varchar('user_id', { length: 20 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  type:       varchar('type', { length: 20 }).notNull(),
  message:    text('message'),
  etaMinutes: integer('eta_minutes'),
  resolvedAt: timestamp('resolved_at'), // null = countdown still active
  createdAt:  timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  userIdx: index('checkins_user_idx').on(t.userId),
}));

// ── Trust Score Events ─────────────────────────────────────────
export const trustEvents = pgTable('trust_events', {
  id:          serial('id').primaryKey(),
  userId:      varchar('user_id', { length: 20 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  action:      text('action').notNull(),
  pointsDelta: integer('points_delta').notNull(),
  scoreBefore: integer('score_before').notNull(),
  scoreAfter:  integer('score_after').notNull(),
  reason:      text('reason'),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  userIdx: index('trust_events_user_idx').on(t.userId, t.createdAt),
}));

// ── Geofences ──────────────────────────────────────────────────
export const geofences = pgTable('geofences', {
  id:       varchar('id', { length: 20 }).primaryKey(),
  familyId: varchar('family_id', { length: 20 }).notNull().references(() => families.id, { onDelete: 'cascade' }),
  name:     text('name').notNull(),
  type:     varchar('type', { length: 20 }).notNull().default('custom'),
  lat:      real('lat').notNull(),
  lng:      real('lng').notNull(),
  radius:   integer('radius').notNull().default(200), // metres
  active:   boolean('active').notNull().default(true),
  childIds: jsonb('child_ids').$type<string[] | null>(), // null = all children
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  familyIdx: index('geofences_family_idx').on(t.familyId),
}));

// ── Geofence Events ────────────────────────────────────────────
export const geofenceEvents = pgTable('geofence_events', {
  id:          serial('id').primaryKey(),
  userId:      varchar('user_id', { length: 20 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  geofenceId:  varchar('geofence_id', { length: 20 }).notNull().references(() => geofences.id, { onDelete: 'cascade' }),
  eventType:   varchar('event_type', { length: 10 }).notNull(), // 'enter' | 'exit'
  lat:         real('lat').notNull(),
  lng:         real('lng').notNull(),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
});

// ── Learned Routes ─────────────────────────────────────────────
export const routes = pgTable('routes', {
  id:          varchar('id', { length: 20 }).primaryKey(),
  userId:      varchar('user_id', { length: 20 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:        text('name').notNull(),        // ex: "École → Maison"
  fromZoneId:  varchar('from_zone_id', { length: 20 }),
  toZoneId:    varchar('to_zone_id', { length: 20 }),
  corridor:    jsonb('corridor').notNull(),    // [{lat, lng, radiusMetres}]
  learnedFrom: integer('learned_from').notNull().default(0), // nb of trips used
  active:      boolean('active').notNull().default(false), // true after 5 trips
  createdAt:   timestamp('created_at').notNull().defaultNow(),
});

// ── Pacte Familial ─────────────────────────────────────────────
export const pactes = pgTable('pactes', {
  id:                 varchar('id', { length: 20 }).primaryKey(),
  familyId:           varchar('family_id', { length: 20 }).notNull().references(() => families.id, { onDelete: 'cascade' }),
  childId:            varchar('child_id', { length: 20 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  terms:              jsonb('terms').notNull(),
  parentCommits:      jsonb('parent_commits').$type<string[]>().notNull().default([]),
  childCommits:       jsonb('child_commits').$type<string[]>().notNull().default([]),
  signedByParentAt:   timestamp('signed_by_parent_at'),
  signedByChildAt:    timestamp('signed_by_child_at'),
  createdAt:          timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  familyChildIdx: uniqueIndex('pactes_family_child_idx').on(t.familyId, t.childId),
}));

// ── Negotiations ───────────────────────────────────────────────
export const negotiations = pgTable('negotiations', {
  id:             varchar('id', { length: 20 }).primaryKey(),
  childId:        varchar('child_id', { length: 20 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  familyId:       varchar('family_id', { length: 20 }).notNull().references(() => families.id, { onDelete: 'cascade' }),
  title:          text('title').notNull(),
  location:       text('location'),
  contactName:    text('contact_name'),
  startAt:        timestamp('start_at').notNull(),
  endAt:          timestamp('end_at').notNull(),
  reason:         text('reason'),
  status:         varchar('status', { length: 20 }).notNull().default('pending'),
  parentResponse: text('parent_response'),
  respondedAt:    timestamp('responded_at'),
  createdAt:      timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  childIdx:  index('negotiations_child_idx').on(t.childId),
  familyIdx: index('negotiations_family_idx').on(t.familyId),
}));

// ── Circle (trusted adults) ────────────────────────────────────
export const circle = pgTable('circle', {
  id:          varchar('id', { length: 20 }).primaryKey(),
  familyId:    varchar('family_id', { length: 20 }).notNull().references(() => families.id, { onDelete: 'cascade' }),
  name:        text('name').notNull(),
  email:       text('email'),
  phone:       text('phone'),
  relation:    text('relation'),           // "Mamie", "Oncle", etc.
  childIds:    jsonb('child_ids').$type<string[]>().notNull().default([]),
  accessToken: text('access_token').notNull(), // read-only JWT
  active:      boolean('active').notNull().default(true),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  familyIdx: index('circle_family_idx').on(t.familyId),
}));

// ── SOS Alerts ────────────────────────────────────────────────
export const sosAlerts = pgTable('sos_alerts', {
  id:          serial('id').primaryKey(),
  childId:     varchar('child_id', { length: 20 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  type:        varchar('type', { length: 20 }).notNull(), // 'shake' | 'volume' | 'button'
  lat:         real('lat'),
  lng:         real('lng'),
  resolvedAt:  timestamp('resolved_at'),
  resolvedBy:  varchar('resolved_by', { length: 20 }),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
});

// ── Daily Pulse (Pouls Familial) ───────────────────────────────
export const pulses = pgTable('pulses', {
  id:        serial('id').primaryKey(),
  userId:    varchar('user_id', { length: 20 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  value:     integer('value').notNull(), // 1-5
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  userDayIdx: index('pulses_user_day_idx').on(t.userId, t.createdAt),
}));


// ── AI Usage (KPI coûts IA — souverain Infomaniak / fallback Anthropic) ──
export const aiUsage = pgTable('ai_usage', {
  id:               serial('id').primaryKey(),
  familyId:         varchar('family_id', { length: 20 }).references(() => families.id, { onDelete: 'set null' }),
  feature:          text('feature').notNull(),
  provider:         text('provider').notNull(),
  model:            text('model').notNull(),
  promptTokens:     integer('prompt_tokens').notNull().default(0),
  completionTokens: integer('completion_tokens').notNull().default(0),
  totalTokens:      integer('total_tokens').notNull().default(0),
  estCostChf:       numeric('est_cost_chf', { precision: 12, scale: 6 }).notNull().default('0'),
  createdAt:        timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  createdIdx: index('ai_usage_created_idx').on(t.createdAt),
  featureIdx: index('ai_usage_feature_idx').on(t.feature),
}));


// ── Push Subscriptions (Web Push VAPID — souverain, zéro Firebase) ──
export const pushSubscriptions = pgTable('push_subscriptions', {
  id:        serial('id').primaryKey(),
  userId:    varchar('user_id', { length: 20 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint:  text('endpoint').notNull(),
  p256dh:    text('p256dh').notNull(),
  auth:      text('auth').notNull(),
  userAgent: text('user_agent'),
  active:    boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  userIdx:     index('push_subs_user_idx').on(t.userId),
  endpointIdx: uniqueIndex('push_subs_endpoint_idx').on(t.endpoint),
}));
