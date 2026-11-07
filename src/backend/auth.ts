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
import { User, UserProfile, UserRole } from '../types/index.ts';

interface SessionData {
  userId: string;
  expiresAt: number;
}

const sessions = new Map<string, SessionData>();
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// Rate limiter storage for IP authentication attempts
interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitBucket>();

export function checkRateLimit(key: string, maxAttempts = 10, windowMs = 60 * 1000): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const bucket = rateLimitMap.get(key);

  if (!bucket || now > bucket.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= maxAttempts) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  bucket.count++;
  return { allowed: true };
}

export function createSessionToken(userId: string): string {
  const token = `danasi_${crypto.randomBytes(32).toString('hex')}`;
  sessions.set(token, {
    userId,
    expiresAt: Date.now() + SESSION_TTL
  });
  return token;
}

export function revokeSessionToken(token: string): void {
  sessions.delete(token);
}

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
    if (!session) {
      return next();
    }

    if (Date.now() > session.expiresAt) {
      sessions.delete(token);
      return next();
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
