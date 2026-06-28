// ============================================================
// KIDO — Auth Routes
// Pattern: boom-contact → JWT + bcrypt + Zod validation
// ============================================================
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { signToken, signRefreshToken, requireAuth } from '../middleware/auth.js';
import { RegisterFamilySchema, LoginSchema, AddChildSchema } from '@kido/shared';

export const authRouter = Router();

// POST /auth/register
authRouter.post('/register', async (req, res) => {
  const parsed = RegisterFamilySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { parentName, email, password, familyName } = parsed.data;

  const [existing] = await db.select({ id: schema.users.id })
    .from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (existing) return res.status(409).json({ error: 'Email déjà utilisé' });

  const familyId = nanoid(20);
  const userId   = nanoid(20);
  const passwordHash = await bcrypt.hash(password, 12);

  await db.transaction(async (tx) => {
    await tx.insert(schema.families).values({ id: familyId, name: familyName });
    await tx.insert(schema.users).values({
      id: userId, familyId, role: 'parent', name: parentName,
      email, passwordHash, consentCGU: true, consentCGUAt: new Date(),
    });
  });

  const payload = { userId, familyId, role: 'parent' as const, tokenVersion: 0 };
  return res.status(201).json({
    accessToken:  signToken(payload),
    refreshToken: signRefreshToken(payload),
    user: { id: userId, name: parentName, role: 'parent', familyId },
  });
});

// POST /auth/login
authRouter.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [user] = await db.select().from(schema.users)
    .where(eq(schema.users.email, parsed.data.email)).limit(1);
  if (!user || !user.passwordHash) return res.status(401).json({ error: 'Identifiants invalides' });

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Identifiants invalides' });

  await db.update(schema.users).set({ lastSeenAt: new Date() }).where(eq(schema.users.id, user.id));

  const payload = { userId: user.id, familyId: user.familyId, role: user.role as 'parent'|'child', tokenVersion: user.tokenVersion };
  return res.json({
    accessToken:  signToken(payload),
    refreshToken: signRefreshToken(payload),
    user: { id: user.id, name: user.name, role: user.role, familyId: user.familyId, avatar: user.avatar },
  });
});

// POST /auth/add-child (parent only)
authRouter.post('/add-child', requireAuth, async (req, res) => {
  if (req.user!.role !== 'parent') return res.status(403).json({ error: 'Parents only' });

  const parsed = AddChildSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const childId = nanoid(20);
  const pinCode = Math.random().toString().slice(2, 8); // 6-digit PIN
  const passwordHash = await bcrypt.hash(pinCode, 10);

  await db.insert(schema.users).values({
    id: childId, familyId: req.user!.familyId, role: 'child',
    name: parsed.data.name, age: parsed.data.age,
    avatar: parsed.data.avatar ?? '🧒',
    passwordHash, trustScore: 50,
  });

  return res.status(201).json({ childId, pinCode, name: parsed.data.name });
});

// GET /auth/me
authRouter.get('/me', requireAuth, async (req, res) => {
  const [user] = await db.select({
    id: schema.users.id, name: schema.users.name, role: schema.users.role,
    familyId: schema.users.familyId, avatar: schema.users.avatar,
    trustScore: schema.users.trustScore, age: schema.users.age,
  }).from(schema.users).where(eq(schema.users.id, req.user!.userId)).limit(1);

  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  return res.json(user);
});
