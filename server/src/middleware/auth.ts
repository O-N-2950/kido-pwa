// ============================================================
// KIDO — Auth Middleware
// Pattern: boom-contact → JWT + token_version for revocation
// ============================================================
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { db, schema } from '../db/index.js';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'kido-dev-secret-change-in-prod';

export interface JwtPayload {
  userId: string;
  familyId: string;
  role: 'parent' | 'child';
  tokenVersion: number;
}

export function signToken(payload: JwtPayload, expiresIn = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

declare global {
  namespace Express {
    interface Request { user?: JwtPayload; }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Token version check (revocation) — pattern boom-contact
    const [user] = await db.select({ tokenVersion: schema.users.tokenVersion })
      .from(schema.users)
      .where(eq(schema.users.id, payload.userId))
      .limit(1);

    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ error: 'Token révoqué' });
    }

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

export function requireParent(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'parent') return res.status(403).json({ error: 'Réservé aux parents' });
  next();
}

export function requireChild(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'child') return res.status(403).json({ error: 'Réservé aux enfants' });
  next();
}
