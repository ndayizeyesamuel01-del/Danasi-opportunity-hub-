/**
 * DANASI OPPORTUNITY HUB — Authentication & Authorization Middleware
 * Founder: NDAYIZEYE Samuel
 *
 * Supports both Bearer Token and Secure HTTP-Only Cookie session management.
 * Protects admin routes and enforces server-side role validation.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from './db.ts';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from './db.ts';
import { User, UserProfile, UserRole } from '../types/index.ts';

interface SessionData {
  userId: string;
  expiresAt: number;
}

const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// ---------------------------------------------------------------------------
// Firestore-backed persistent sessions (survive cold starts & multi-instance)
// ---------------------------------------------------------------------------
async function storeSession(token: string, data: SessionData): Promise<void> {
  await setDoc(doc(firestore, 'sessions', token), data);
}

async function getSession(token: string): Promise<SessionData | null> {
  const snap = await getDoc(doc(firestore, 'sessions', token));
  return snap.exists() ? (snap.data() as SessionData) : null;
}

async function deleteSession(token: string): Promise<void> {
  try {
    await deleteDoc(doc(firestore, 'sessions', token));
  } catch {
    // best-effort
  }
}

// ---------------------------------------------------------------------------
// Firestore-backed rate limiter (atomic, shared across instances)
// ---------------------------------------------------------------------------
interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export async function checkRateLimit(
  key: string,
  maxAttempts = 10,
  windowMs = 60 * 1000
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = Date.now();
  const ref = doc(firestore, 'rate_limit_buckets', key.replace(/[^a-zA-Z0-9_@.-]/g, '_'));
  const snap = await getDoc(ref);

  if (!snap.exists() || now > (snap.data() as RateLimitBucket).resetAt) {
    await setDoc(ref, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  const bucket = snap.data() as RateLimitBucket;
  if (bucket.count >= maxAttempts) {
    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  await setDoc(ref, { count: bucket.count + 1, resetAt: bucket.resetAt });
  return { allowed: true };
}

export function createSessionToken(userId: string): string {
  const token = `danasi_${crypto.randomBytes(32).toString('hex')}`;
  sessions.set(token, {
    userId,
  // Fire-and-forget — callers await via routes
  storeSession(token, { userId, expiresAt: Date.now() + SESSION_TTL }).catch((err) =>
    console.error('[AUTH] Failed to persist session:', err)
  );

export function revokeSessionToken(token: string): void {
  sessions.delete(token);
}
  deleteSession(token).catch((err) => console.error('[AUTH] Failed to revoke session:', err));
export function sanitizeUser(user: User) {
  const { passwordHash, salt, ...safeUser } = user;
  return safeUser;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  userProfile?: UserProfile;
}

export async function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    // 1. Check Bearer Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Fallback to secure HTTP-only cookie if header is absent
    if (!token && (req as any).cookies?.danasi_session) {
      token = (req as any).cookies.danasi_session;
    }

    if (!token) {
      return next();
    }

    const session = sessions.get(token);
    const session = await getSession(token);
      return next();
    }

    if (Date.now() > session.expiresAt) {
      sessions.delete(token);
      await deleteSession(token);
    }

    const user = await db.getUserById(session.userId);
    if (!user || user.isSuspended) {
      sessions.delete(token);
      return next();
    }

    req.user = user;
    req.userProfile = await db.getProfileByUserId(user.id);
    next();
  } catch (err) {
    console.error('[AUTH Middleware] Error during authentication:', err);
    next();
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required. Please sign in to continue.'
    });
  }
  if (req.user.isSuspended) {
    return res.status(403).json({
      error: 'Your account has been suspended. Please contact hello@danasi.com for assistance.'
    });
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of: ${allowedRoles.join(', ')}.`
      });
    }
    next();
  };
}

export function requirePermission(permission: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const roles = await db.getRoles();
    const userRoleDef = roles.find((r) => r.id === req.user!.role);

    if (!userRoleDef) {
      return res.status(403).json({ error: 'Role definition not found.' });
    }

    const hasPermission = userRoleDef.permissions.includes('*') || userRoleDef.permissions.includes(permission);
    if (!hasPermission) {
      return res.status(403).json({
        error: `Access denied. Missing permission: ${permission}.`
      });
    }

    next();
  };
}
