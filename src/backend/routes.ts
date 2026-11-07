/**
 * DANASI OPPORTUNITY HUB — Complete Backend API Routes (Cloud Firestore Edition)
 * Founder: NDAYIZEYE Samuel
 */

import { Router, Response } from 'express';
import crypto from 'crypto';
import { db, hashPassword, verifyPassword } from './db.ts';
import {
  authenticate,
  requireAuth,
  requireRole,
  requirePermission,
  createSessionToken,
  revokeSessionToken,
  sanitizeUser,
  checkRateLimit,
  AuthenticatedRequest,
  getReliableClientIp
} from './auth.ts';
import { EducationLevel, LanguageCode, UserRole } from '../types/index.ts';
import { syncManager } from './sync/SyncManager.ts';
import { getProvider, getAllProviders } from './providers/index.ts';

export const apiRouter = Router();

// Middleware to populate req.user from Bearer token or HTTP-only cookie
apiRouter.use(authenticate);

function getClientIp(req: AuthenticatedRequest): string {
  return getReliableClientIp(req);
}

function setSessionCookie(res: Response, token: string) {
  res.cookie('danasi_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

/* -------------------------------------------------------------------------- */
/* AUTHENTICATION ROUTES                                                      */
/* -------------------------------------------------------------------------- */

apiRouter.post('/auth/register', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clientIp = getClientIp(req);
    const rateCheck = await checkRateLimit(`register_${clientIp}`, 5, 60 * 1000);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: `Too many registration attempts. Please wait ${rateCheck.retryAfter} seconds.`
      });
    }

    const {
      email,
      password,
      fullName,
      phone,
      country,
      city,
      accountType,
      educationLevel,
      professionalInterests,
      preferredCategories,
      preferredLanguage
    } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const settings = await db.getPlatformSettings();
    if (!settings.registrationOpen) {
      return res.status(403).json({ error: 'User registration is currently paused by platform administrators.' });
    }

    const now = new Date().toISOString();
    const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const { hash, salt } = hashPassword(password);

    // Assign role safely: Allow OPPORTUNITY_PROVIDER if explicitly selected, otherwise default to STUDENT_JOBSEEKER
    const userRole: UserRole = accountType === 'OPPORTUNITY_PROVIDER' ? 'OPPORTUNITY_PROVIDER' : 'STUDENT_JOBSEEKER';

    const newUser = {
      id: userId,
      email: email.trim().toLowerCase(),
      passwordHash: hash,
      salt,
      role: userRole,
      emailVerified: false,
      isSuspended: false,
      createdAt: now,
      updatedAt: now
    };

    const newProfile = {
      userId,
      fullName: fullName.trim(),
      phone: phone?.trim() || undefined,
      country: country || 'Rwanda',
      city: city || 'Kigali',
      educationLevel: (educationLevel as EducationLevel) || "Bachelor's Degree",
      professionalInterests: Array.isArray(professionalInterests) ? professionalInterests : ['Education', 'Technology'],
      preferredCategories: Array.isArray(preferredCategories) ? preferredCategories : ['scholarships', 'jobs'],
      preferredLanguage: (preferredLanguage as LanguageCode) || 'en',
      createdAt: now,
      updatedAt: now
    };

    const newPreferences = {
      userId,
      emailNotifications: true,
      opportunityAlerts: true,
      weeklyDigest: true,
      theme: 'light' as const,
      updatedAt: now
    };

    // Atomic transaction in Firestore
    await db.createUser(newUser, newProfile, newPreferences);

    // Welcome notification
    await db.addNotification({
      id: `notif_${Date.now()}`,
      userId,
      title: 'Welcome to DANASI Opportunity Hub',
      message: 'Your account is active. Complete your profile details to unlock tailored global opportunities.',
      type: 'success',
      read: false,
      createdAt: now
    });

    // Audit log
    await db.addAuditLog({
      actorId: userId,
      actorEmail: newUser.email,
      action: 'USER_REGISTER',
      entity: 'User',
      entityId: userId,
      details: `New candidate account registered from ${newProfile.country}.`,
      ipAddress: getClientIp(req)
    });

    const token = await createSessionToken(userId);
    setSessionCookie(res, token);

    return res.status(201).json({
      message: 'Account created successfully.',
      user: sanitizeUser(newUser),
      profile: newProfile,
      token
    });
  } catch (err) {
    console.error('[API] Register error:', err);
    return res.status(500).json({ error: 'Failed to complete registration. Please try again.' });
  }
});

apiRouter.post('/auth/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clientIp = getClientIp(req);
    const rawEmail = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    // Rate limit both by reliable IP and normalized account email identifier
    const ipRateCheck = await checkRateLimit(`login_ip_${clientIp}`, 10, 60 * 1000);
    if (!ipRateCheck.allowed) {
      return res.status(429).json({
        error: `Too many login attempts from this network. Please wait ${ipRateCheck.retryAfter} seconds.`
      });
    }

    if (rawEmail) {
      const emailRateCheck = await checkRateLimit(`login_email_${rawEmail}`, 5, 60 * 1000);
      if (!emailRateCheck.allowed) {
        return res.status(429).json({
          error: `Too many login attempts for this account. Please wait ${emailRateCheck.retryAfter} seconds.`
        });
      }
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await db.getUserByEmail(email.trim().toLowerCase());
    if (!user || !user.passwordHash || !user.salt) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        error: 'Your account has been suspended. Please contact hello@danasi.com for assistance.'
      });
    }

    const profile = await db.getProfileByUserId(user.id);
    const token = await createSessionToken(user.id);
    setSessionCookie(res, token);

    await db.addAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: 'USER_LOGIN',
      entity: 'Session',
      entityId: token.substring(0, 10),
      details: `User logged in with role ${user.role}.`,
      ipAddress: getClientIp(req)
    });

    return res.json({
      message: 'Signed in successfully.',
      user: sanitizeUser(user),
      profile: profile || null,
      token
    });
  } catch (err) {
    console.error('[API] Login error:', err);
    return res.status(500).json({ error: 'Login service encountered an issue.' });
  }
});

apiRouter.post('/auth/logout', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      await revokeSessionToken(token);
    }
    const cookieToken = (req as any).cookies?.danasi_session;
    if (cookieToken) {
      await revokeSessionToken(cookieToken);
    }
  } catch (err) {
    console.error('[API] Logout revocation error:', err);
  }
  res.clearCookie('danasi_session');
  return res.json({ message: 'Logged out successfully.' });
});

apiRouter.get('/auth/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const profile = await db.getProfileByUserId(req.user!.id);
  const preferences = await db.getPreferencesByUserId(req.user!.id);
  return res.json({
    user: sanitizeUser(req.user!),
    profile: profile || null,
    preferences: preferences || null
  });
});

apiRouter.post('/auth/forgot-password', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clientIp = getClientIp(req);
    const rawEmail = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!rawEmail) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const ipLimit = await checkRateLimit(`forgot_ip_${clientIp}`, 5, 15 * 60 * 1000);
    const emailLimit = await checkRateLimit(`forgot_email_${rawEmail}`, 3, 15 * 60 * 1000);

    if (!ipLimit.allowed || !emailLimit.allowed) {
      return res.status(429).json({
        error: 'Too many password reset requests. Please wait a few minutes before trying again.'
      });
    }

    const user = await db.getUserByEmail(rawEmail);
    if (user && !user.isSuspended) {
      // Generate cryptographically secure single-use 256-bit token
      const resetToken = crypto.randomBytes(32).toString('hex');
      // Store token hash server-side in Firestore with 15-minute expiration
      await db.createPasswordReset(user.id, rawEmail, resetToken, 15 * 60 * 1000);

      // In production, token is emailed via SMTP. If email is unconfigured, system safely fails without leaking or faking.
      await db.addAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        action: 'PASSWORD_RESET_REQUEST',
        entity: 'User',
        entityId: user.id,
        details: 'Password reset token generated and dispatched.',
        ipAddress: clientIp
      });
    }

    // Generic response to avoid user enumeration / account disclosure
    return res.json({
      message: 'If an account exists with this email, password reset instructions have been dispatched.'
    });
  } catch (err) {
    console.error('[API] Forgot-password error:', err);
    return res.status(500).json({ error: 'Failed to process password reset request.' });
  }
});

apiRouter.post('/auth/reset-password', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clientIp = getClientIp(req);
    const { email, newPassword, token } = req.body;
    const resetToken = token || req.body.recoveryCode;

    if (!email || !newPassword || !resetToken) {
      return res.status(400).json({ error: 'Email, reset token, and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const rawEmail = String(email).trim().toLowerCase();
    const rateCheck = await checkRateLimit(`reset_attempt_${rawEmail}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: `Too many failed password reset attempts. Please wait ${rateCheck.retryAfter} seconds.`
      });
    }

    // Atomically verify and consume the token hash
    const verification = await db.verifyAndConsumePasswordReset(rawEmail, String(resetToken).trim());
    if (!verification.valid || !verification.userId) {
      return res.status(400).json({
        error: 'Invalid or expired password reset token. Please request a new link.'
      });
    }

    const { hash, salt } = hashPassword(newPassword);
    await db.updateUser(verification.userId, { passwordHash: hash, salt });

    await db.addAuditLog({
      actorId: verification.userId,
      actorEmail: rawEmail,
      action: 'PASSWORD_RESET_SUCCESS',
      entity: 'User',
      entityId: verification.userId,
      details: 'Password successfully changed via validated single-use reset token.',
      ipAddress: clientIp
    });

    return res.json({ message: 'Password has been successfully reset. You may now sign in.' });
  } catch (err) {
    console.error('[API] Reset-password error:', err);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

apiRouter.post('/auth/verify-email', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const updatedUser = await db.updateUser(req.user!.id, { emailVerified: true });
  await db.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    action: 'EMAIL_VERIFIED',
    entity: 'User',
    entityId: req.user!.id,
    details: 'Email address verified.',
    ipAddress: getClientIp(req)
  });
  return res.json({ message: 'Email verified successfully.', user: sanitizeUser(updatedUser!) });
});

/* -------------------------------------------------------------------------- */
/* USER PROFILE & PREFERENCES                                                 */
/* -------------------------------------------------------------------------- */

apiRouter.put('/user/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const updates = req.body;

  delete updates.userId;
  delete updates.createdAt;

  const updatedProfile = await db.updateProfile(userId, updates);
  if (!updatedProfile) {
    return res.status(404).json({ error: 'Profile not found.' });
  }

  await db.addAuditLog({
    actorId: userId,
    actorEmail: req.user!.email,
    action: 'PROFILE_UPDATE',
    entity: 'UserProfile',
    entityId: userId,
    details: 'User updated personal profile details.',
    ipAddress: getClientIp(req)
  });

  return res.json({ message: 'Profile updated successfully.', profile: updatedProfile });
});

apiRouter.put('/user/preferences', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const updates = req.body;
  delete updates.userId;

  const updatedPreferences = await db.updatePreferences(userId, updates);
  return res.json({ message: 'Preferences updated.', preferences: updatedPreferences });
});

apiRouter.put('/user/password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
  }

  const user = await db.getUserById(req.user!.id);
  if (!user || !user.passwordHash || !user.salt) {
    return res.status(404).json({ error: 'User record invalid.' });
  }

  if (!verifyPassword(currentPassword, user.passwordHash, user.salt)) {
    return res.status(400).json({ error: 'Current password does not match.' });
  }

  const { hash, salt } = hashPassword(newPassword);
  await db.updateUser(user.id, { passwordHash: hash, salt });

  await db.addAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    action: 'PASSWORD_CHANGE',
    entity: 'User',
    entityId: user.id,
    details: 'User updated password securely.',
    ipAddress: getClientIp(req)
  });

  return res.json({ message: 'Password updated successfully.' });
});

apiRouter.get('/user/notifications', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const notifs = await db.getNotificationsForUser(req.user!.id);
  return res.json({ notifications: notifs });
});

apiRouter.post('/user/notifications/:id/read', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  await db.markNotificationRead(req.params.id);
  return res.json({ success: true });
});

apiRouter.get('/user/saved-items', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const items = await db.getSavedItems(req.user!.id);
  return res.json({ savedItems: items });
});

apiRouter.post('/user/saved-items', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { itemType, itemId, title, notes } = req.body;
  if (!itemType || !itemId || !title) {
    return res.status(400).json({ error: 'itemType, itemId and title are required.' });
  }
  const saved = await db.addSavedItem(req.user!.id, { itemType, itemId, title, notes });
  return res.status(201).json({ savedItem: saved });
});

apiRouter.delete('/user/saved-items/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const removed = await db.removeSavedItem(req.user!.id, req.params.id);
  return res.json({ success: removed });
});

/* -------------------------------------------------------------------------- */
/* PUBLIC ROUTES                                                              */
/* -------------------------------------------------------------------------- */

apiRouter.post('/contact', async (req: AuthenticatedRequest, res: Response) => {
  const { fullName, email, subject, message } = req.body;
  if (!fullName || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields (full name, email, subject, message) are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const msg = await db.addContactMessage({
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim()
  });

  await db.addAuditLog({
    actorId: req.user ? req.user.id : 'guest',
    actorEmail: email,
    action: 'CONTACT_SUBMIT',
    entity: 'ContactMessage',
    entityId: msg.id,
    details: `Contact inquiry received regarding: ${subject}`,
    ipAddress: getClientIp(req)
  });

  return res.status(201).json({
    message: 'Your message has been received by the DANASI OPPORTUNITY HUB team. We will review and respond shortly.',
    id: msg.id
  });
});

apiRouter.get('/categories', async (_req: AuthenticatedRequest, res: Response) => {
  const allCategories = await db.getCategories();
  const categories = allCategories.filter((c) => c.isActive);
  return res.json({ categories });
});

apiRouter.get('/platform-info', async (_req: AuthenticatedRequest, res: Response) => {
  const settings = await db.getPlatformSettings();
  const users = await db.getUsers();
  const categories = await db.getCategories();
  return res.json({
    platformName: settings.platformName,
    tagline: settings.tagline,
    founder: settings.founder,
    contactEmail: settings.contactEmail,
    supportPhone: settings.supportPhone,
    defaultLanguage: settings.defaultLanguage,
    systemNotice: settings.systemNotice,
    stats: {
      registeredScholars: users.length,
      categoriesCount: categories.length,
      verifiedRegions: ['Rwanda', 'East Africa', 'Pan-African', 'Europe', 'North America', 'Asia']
    }
  });
});

/* -------------------------------------------------------------------------- */
/* ADMIN ROUTES (ROLE PROTECTED)                                              */
/* -------------------------------------------------------------------------- */

apiRouter.get(
  '/admin/overview',
  requireAuth,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (_req: AuthenticatedRequest, res: Response) => {
    const users = await db.getUsers();
    const categories = await db.getCategories();
    const messages = await db.getContactMessages();
    const auditLogs = await db.getAuditLogs(10);

    const roleDistribution = users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return res.json({
      metrics: {
        totalUsers: users.length,
        activeUsers: users.filter((u) => !u.isSuspended).length,
        suspendedUsers: users.filter((u) => u.isSuspended).length,
        verifiedEmails: users.filter((u) => u.emailVerified).length,
        categoriesCount: categories.length,
        pendingInquiries: messages.filter((m) => m.status === 'new').length,
        totalInquiries: messages.length,
        roleDistribution
      },
      recentActivity: auditLogs
    });
  }
);

apiRouter.get(
  '/admin/users',
  requireAuth,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    const { search, role, status } = req.query;
    let users = await db.getUsers();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      const filtered: typeof users = [];
      for (const u of users) {
        const profile = await db.getProfileByUserId(u.id);
        if (
          u.email.toLowerCase().includes(q) ||
          (profile && profile.fullName.toLowerCase().includes(q)) ||
          (profile && profile.country.toLowerCase().includes(q))
        ) {
          filtered.push(u);
        }
      }
      users = filtered;
    }

    if (role && typeof role === 'string' && role !== 'ALL') {
      users = users.filter((u) => u.role === role);
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      const isSuspended = status === 'suspended';
      users = users.filter((u) => u.isSuspended === isSuspended);
    }

    const enhanced = await Promise.all(
      users.map(async (u) => ({
        ...sanitizeUser(u),
        profile: (await db.getProfileByUserId(u.id)) || null
      }))
    );

    return res.json({ users: enhanced });
  }
);

apiRouter.put(
  '/admin/users/:id/role',
  requireAuth,
  requireRole(['SUPER_ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { newRole } = req.body;

    const validRoles: UserRole[] = [
      'SUPER_ADMIN',
      'ADMIN',
      'CONTENT_MANAGER',
      'OPPORTUNITY_PROVIDER',
      'STUDENT_JOBSEEKER'
    ];

    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ error: 'Invalid role assignment requested.' });
    }

    const targetUser = await db.getUserById(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    if (targetUser.role === 'SUPER_ADMIN' && newRole !== 'SUPER_ADMIN') {
      const allUsers = await db.getUsers();
      const allSuperAdmins = allUsers.filter((u) => u.role === 'SUPER_ADMIN');
      if (allSuperAdmins.length <= 1) {
        return res.status(400).json({ error: 'Cannot demote the sole Super Administrator.' });
      }
    }

    const updated = await db.updateUser(id, { role: newRole });

    await db.addAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      action: 'ROLE_CHANGE',
      entity: 'User',
      entityId: id,
      details: `Role updated from ${targetUser.role} to ${newRole} by ${req.user!.email}`,
      ipAddress: getClientIp(req)
    });

    return res.json({ message: 'User role updated successfully.', user: sanitizeUser(updated!) });
  }
);

apiRouter.put(
  '/admin/users/:id/status',
  requireAuth,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { isSuspended } = req.body;

    if (id === req.user!.id) {
      return res.status(400).json({ error: 'You cannot alter your own account status.' });
    }

    const targetUser = await db.getUserById(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    if (req.user!.role !== 'SUPER_ADMIN' && (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'ADMIN')) {
      return res.status(403).json({ error: 'Cannot modify administrative account status.' });
    }

    const updated = await db.updateUser(id, { isSuspended: Boolean(isSuspended) });

    await db.addAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      action: isSuspended ? 'USER_SUSPEND' : 'USER_REACTIVATE',
      entity: 'User',
      entityId: id,
      details: `Account ${isSuspended ? 'suspended' : 'reactivated'} by ${req.user!.email}`,
      ipAddress: getClientIp(req)
    });

    return res.json({ message: 'User account status updated.', user: sanitizeUser(updated!) });
  }
);

apiRouter.get(
  '/admin/roles',
  requireAuth,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (_req: AuthenticatedRequest, res: Response) => {
    const roles = await db.getRoles();
    return res.json({ roles });
  }
);

apiRouter.get(
  '/admin/audit-logs',
  requireAuth,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 60;
    const logs = await db.getAuditLogs(limit);
    return res.json({ auditLogs: logs });
  }
);

apiRouter.get(
  '/admin/messages',
  requireAuth,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (_req: AuthenticatedRequest, res: Response) => {
    const messages = await db.getContactMessages();
    return res.json({ messages });
  }
);

apiRouter.put(
  '/admin/messages/:id/status',
  requireAuth,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    const { status } = req.body;
    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ error: 'Invalid message status.' });
    }
    const updated = await db.updateContactMessageStatus(req.params.id, status as any);
    if (!updated) {
      return res.status(404).json({ error: 'Message not found.' });
    }
    return res.json({ message: 'Message status updated.', contactMessage: updated });
  }
);

apiRouter.get(
  '/admin/categories',
  requireAuth,
  requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']),
  async (_req: AuthenticatedRequest, res: Response) => {
    const categories = await db.getCategories();
    return res.json({ categories });
  }
);

apiRouter.put(
  '/admin/categories/:id',
  requireAuth,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    const updated = await db.updateCategory(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    await db.addAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      action: 'CATEGORY_UPDATE',
      entity: 'OpportunityCategory',
      entityId: req.params.id,
      details: `Category ${updated.slug} modified by ${req.user!.email}`,
      ipAddress: getClientIp(req)
    });
    return res.json({ message: 'Category updated.', category: updated });
  }
);

apiRouter.get(
  '/admin/settings',
  requireAuth,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (_req: AuthenticatedRequest, res: Response) => {
    const settings = await db.getPlatformSettings();
    return res.json({ settings });
  }
);

apiRouter.put(
  '/admin/settings',
  requireAuth,
  requireRole(['SUPER_ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    const updated = await db.updatePlatformSettings(req.body);
    await db.addAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      action: 'SETTINGS_UPDATE',
      entity: 'PlatformSettings',
      entityId: 'global',
      details: `Platform settings updated by ${req.user!.email}`,
      ipAddress: getClientIp(req)
    });
    return res.json({ message: 'Platform settings saved.', settings: updated });
  }
);

/* -------------------------------------------------------------------------- */
/* DANASI JOBS MODULE ROUTES                                                  */
/* -------------------------------------------------------------------------- */

// 1. Get Job Categories (12 Mandatory Categories)
apiRouter.get('/job-categories', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await db.getJobCategories();
    return res.json({ categories });
  } catch (err) {
    console.error('[API] Error fetching job categories:', err);
    return res.status(500).json({ error: 'Failed to retrieve job categories.' });
  }
});

// 2. Discover Jobs (Search, Multi-Filter, Sorting, Pagination)
apiRouter.get('/jobs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      keyword,
      country,
      city,
      categorySlug,
      employmentType,
      experienceLevel,
      educationRequirement,
      workplaceArrangement,
      status,
      source,
      includeDemo,
      sortBy,
      limit,
      offset
    } = req.query;

    // Check if requester is an admin/staff to allow viewing unverified/pending jobs
    const isStaff = req.user && ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'].includes(req.user.role);
    let effectiveStatus: any = 'VERIFIED';

    if (isStaff && status) {
      effectiveStatus = status; // Can be ALL, PENDING_REVIEW, REJECTED, SUSPENDED, EXPIRED, VERIFIED
    }

    const result = await db.getJobs({
      keyword: typeof keyword === 'string' ? keyword : undefined,
      country: typeof country === 'string' ? country : undefined,
      city: typeof city === 'string' ? city : undefined,
      categorySlug: typeof categorySlug === 'string' ? categorySlug : undefined,
      employmentType: typeof employmentType === 'string' ? employmentType : undefined,
      experienceLevel: typeof experienceLevel === 'string' ? experienceLevel : undefined,
      educationRequirement: typeof educationRequirement === 'string' ? educationRequirement : undefined,
      workplaceArrangement: typeof workplaceArrangement === 'string' ? workplaceArrangement : undefined,
      status: effectiveStatus,
      source: typeof source === 'string' ? source : undefined,
      includeDemo: includeDemo === 'false' ? false : undefined,
      sortBy: sortBy === 'deadline' || sortBy === 'relevance' ? sortBy : 'latest',
      limitCount: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0
    });

    return res.json(result);
  } catch (err) {
    console.error('[API] Error searching jobs:', err);
    return res.status(500).json({ error: 'Failed to search job listings.' });
  }
});

// 3. Get Single Job Details
apiRouter.get('/jobs/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const job = await db.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Opportunity listing not found.' });
    }

    const isStaff = req.user && ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'].includes(req.user.role);
    const isOwner = req.user && req.user.id === job.providerId;

    // Non-staff and non-owners cannot see non-verified/rejected listings unless published
    if (job.status !== 'VERIFIED' && !isStaff && !isOwner) {
      return res.status(403).json({ error: 'This opportunity listing is currently pending moderation review.' });
    }

    return res.json({ job });
  } catch (err) {
    console.error('[API] Error fetching job by id:', err);
    return res.status(500).json({ error: 'Failed to load opportunity details.' });
  }
});

// 4. Submit Job Listing (Opportunity Providers, Admins, or Authenticated Members)
apiRouter.post('/jobs', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      employerId,
      employerName,
      employerLogo,
      country,
      city,
      workplaceArrangement,
      employmentType,
      categorySlug,
      experienceLevel,
      educationRequirement,
      salaryRange,
      requiredSkills,
      description,
      responsibilities,
      applicationRequirements,
      deadline,
      originalSourceUrl,
      sourceOrganization
    } = req.body;

    if (!title || !employerName || !country || !categorySlug || !originalSourceUrl) {
      return res.status(400).json({
        error: 'Title, employer name, country, category, and genuine application URL are mandatory.'
      });
    }

    // Require valid URL
    try {
      new URL(originalSourceUrl);
    } catch {
      return res.status(400).json({ error: 'Please provide a valid application URL starting with https://' });
    }

    const skills = Array.isArray(requiredSkills)
      ? requiredSkills.map((s: string) => s.trim()).filter(Boolean)
      : typeof requiredSkills === 'string'
      ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const resps = Array.isArray(responsibilities)
      ? responsibilities.filter(Boolean)
      : typeof responsibilities === 'string'
      ? responsibilities.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];

    const reqs = Array.isArray(applicationRequirements)
      ? applicationRequirements.filter(Boolean)
      : typeof applicationRequirements === 'string'
      ? applicationRequirements.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];

    const result = await db.createJob(
      {
        title: title.trim(),
        employerId: employerId || `emp_${Date.now()}`,
        employerName: employerName.trim(),
        employerLogo: employerLogo || '',
        country: country.trim(),
        city: (city || 'National / Remote').trim(),
        workplaceArrangement: workplaceArrangement || 'on-site',
        employmentType: employmentType || 'Full-Time',
        categorySlug,
        experienceLevel: experienceLevel || 'Entry-Level',
        educationRequirement: educationRequirement || "Bachelor's Degree",
        salaryRange: salaryRange?.trim() || undefined,
        requiredSkills: skills.length > 0 ? skills : ['General Competence'],
        description: description?.trim() || 'Official vacancy description submitted by opportunity provider.',
        responsibilities: resps.length > 0 ? resps : ['Fulfill organizational duties and deliver required objectives.'],
        applicationRequirements: reqs.length > 0 ? reqs : ['Submit updated CV and credentials to original career portal.'],
        deadline: deadline || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
        originalSourceUrl: originalSourceUrl.trim(),
        sourceOrganization: sourceOrganization?.trim() || employerName.trim(),
        isDemo: false
      },
      req.user!.id,
      req.user!.email
    );

    await db.addAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      action: 'JOB_SUBMIT',
      entity: 'Job',
      entityId: result.job.id,
      details: `Submitted vacancy "${result.job.title}" for ${result.job.employerName}. Duplicate warning: ${result.duplicateWarning ? 'YES' : 'NO'}.`,
      ipAddress: getClientIp(req)
    });

    return res.status(201).json({
      message: 'Job submitted successfully. All listings undergo DANASI quality verification prior to public discovery.',
      job: result.job,
      duplicateWarning: result.duplicateWarning
    });
  } catch (err) {
    console.error('[API] Error creating job:', err);
    return res.status(500).json({ error: 'Failed to submit job listing.' });
  }
});

// 5. Employers Directory
apiRouter.get('/employers', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const employers = await db.getEmployers();
    return res.json({ employers });
  } catch (err) {
    console.error('[API] Error fetching employers:', err);
    return res.status(500).json({ error: 'Failed to retrieve employer directory.' });
  }
});

apiRouter.post('/employers', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, logo, website, description, country, city, industry } = req.body;
    if (!name || !country || !industry) {
      return res.status(400).json({ error: 'Employer name, country, and industry are required.' });
    }

    const emp = await db.createEmployer(
      {
        name: name.trim(),
        logo: logo || '',
        website: website || '',
        description: description?.trim() || '',
        country: country.trim(),
        city: (city || 'Kigali').trim(),
        industry: industry.trim()
      },
      req.user!.id
    );

    return res.status(201).json({ employer: emp, message: 'Employer profile registered.' });
  } catch (err) {
    console.error('[API] Error creating employer:', err);
    return res.status(500).json({ error: 'Failed to create employer profile.' });
  }
});

// 6. Report Suspicious / Fraudulent Vacancy
apiRouter.post('/jobs/:id/report', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason, details } = req.body;
    const jobId = req.params.id;

    const job = await db.getJobById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job listing not found.' });
    }

    if (!reason || !details) {
      return res.status(400).json({ error: 'Reason and explanatory details are required.' });
    }

    const report = await db.reportJob({
      jobId,
      jobTitle: job.title,
      employerName: job.employerName,
      reporterId: req.user ? req.user.id : 'anonymous',
      reporterEmail: req.user ? req.user.email : 'guest@danasi.com',
      reason,
      details: details.trim()
    });

    return res.status(201).json({
      message: 'Thank you for protecting the DANASI community. Our verification team has been notified.',
      report
    });
  } catch (err) {
    console.error('[API] Error reporting job:', err);
    return res.status(500).json({ error: 'Failed to submit vacancy report.' });
  }
});

// 7. Candidate Saved Jobs
apiRouter.get('/user/saved-jobs', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const savedJobs = await db.getSavedJobs(req.user!.id);
    return res.json({ savedJobs });
  } catch (err) {
    console.error('[API] Error fetching saved jobs:', err);
    return res.status(500).json({ error: 'Failed to load saved jobs.' });
  }
});

apiRouter.post('/user/saved-jobs', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required.' });
    }

    const job = await db.getJobById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job listing not found.' });
    }

    const saved = await db.saveJob(req.user!.id, job);
    return res.status(201).json({ savedJob: saved, message: 'Job saved to your bookmarks.' });
  } catch (err) {
    console.error('[API] Error saving job:', err);
    return res.status(500).json({ error: 'Failed to bookmark job.' });
  }
});

apiRouter.delete('/user/saved-jobs/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = await db.removeSavedJob(req.user!.id, req.params.id);
    return res.json({ success, message: 'Saved job removed.' });
  } catch (err) {
    console.error('[API] Error deleting saved job:', err);
    return res.status(500).json({ error: 'Failed to remove saved job.' });
  }
});

// 8. Candidate Job Application Tracker
apiRouter.get('/user/job-applications', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const applications = await db.getJobApplications(req.user!.id);
    return res.json({ applications });
  } catch (err) {
    console.error('[API] Error fetching applications:', err);
    return res.status(500).json({ error: 'Failed to load tracked job applications.' });
  }
});

apiRouter.post('/user/job-applications', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { jobId, jobTitle, employerName, workplaceArrangement, status, appliedDate, deadline, notes, originalSourceUrl } = req.body;

    if (!jobId || !jobTitle || !employerName) {
      return res.status(400).json({ error: 'Job ID, title, and employer name are required.' });
    }

    const trackerPayload: any = {
      userId: req.user!.id,
      jobId,
      jobTitle,
      employerName,
      workplaceArrangement: workplaceArrangement || 'on-site',
      status: status || 'INTERESTED',
      deadline: deadline || '',
      notes: notes || '',
      originalSourceUrl: originalSourceUrl || ''
    };

    if (appliedDate) {
      trackerPayload.appliedDate = appliedDate;
    }

    const application = await db.trackJobApplication(trackerPayload);

    return res.status(201).json({ application, message: 'Application tracker record updated.' });
  } catch (err) {
    console.error('[API] Error saving job application track:', err);
    return res.status(500).json({ error: 'Failed to track job application.' });
  }
});

apiRouter.put('/user/job-applications/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await db.updateJobApplication(req.params.id, req.user!.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Application tracking entry not found.' });
    }
    return res.json({ application: updated, message: 'Tracker updated.' });
  } catch (err) {
    console.error('[API] Error updating job application tracker:', err);
    return res.status(500).json({ error: 'Failed to update tracker.' });
  }
});

// 9. Admin Moderation & Verification Records
apiRouter.post(
  '/admin/jobs/:id/moderate',
  requireAuth,
  requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, notes, rejectionReason } = req.body;
      const validStatuses = ['VERIFIED', 'REJECTED', 'PENDING_REVIEW', 'EXPIRED', 'SUSPENDED'];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid moderation status requested.' });
      }

      const updated = await db.moderateJob(
        req.params.id,
        status,
        req.user!.id,
        req.user!.email,
        notes,
        rejectionReason
      );

      if (!updated) {
        return res.status(404).json({ error: 'Job listing not found.' });
      }

      return res.json({
        message: `Opportunity listing status updated to ${status}.`,
        job: updated
      });
    } catch (err) {
      console.error('[API] Error moderating job:', err);
      return res.status(500).json({ error: 'Failed to moderate opportunity.' });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* REAL JOB DATA PROVIDERS & SYNCHRONIZATION ROUTES                           */
/* -------------------------------------------------------------------------- */

apiRouter.get(
  '/admin/job-sources',
  requireAuth,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const sources = await db.getJobSources();
      return res.json({ sources });
    } catch (err) {
      console.error('[API] Error fetching job sources:', err);
      return res.status(500).json({ error: 'Failed to load job sources.' });
    }
  }
);

apiRouter.post(
  '/admin/job-sources/:id/sync',
  requireAuth,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sourceId = req.params.id;
      const result = await syncManager.syncProvider(sourceId, req.user!.email, 'MANUAL');
      return res.json({ message: `Provider ${sourceId} synchronization initiated.`, syncRun: result });
    } catch (err: any) {
      console.error('[API] Error synchronizing job provider:', err);
      return res.status(500).json({ error: err.message || 'Failed to synchronize job provider.' });
    }
  }
);

apiRouter.post(
  '/admin/job-sources/sync-all',
  requireAuth,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const results = await syncManager.syncAllActive(req.user!.email, 'MANUAL');
      return res.json({ message: 'Synchronized all active job data providers.', syncRuns: results });
    } catch (err: any) {
      console.error('[API] Error synchronizing all active providers:', err);
      return res.status(500).json({ error: err.message || 'Failed to sync providers.' });
    }
  }
);

apiRouter.get(
  '/admin/job-sources/sync-runs',
  requireAuth,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 30;
      const syncRuns = await db.getSyncRuns(limit);
      return res.json({ syncRuns });
    } catch (err) {
      console.error('[API] Error loading sync runs:', err);
      return res.status(500).json({ error: 'Failed to retrieve sync runs.' });
    }
  }
);

apiRouter.get(
  '/admin/verification-records',
  requireAuth,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const jobId = typeof req.query.jobId === 'string' ? req.query.jobId : undefined;
      const records = await db.getVerificationRecords(jobId);
      return res.json({ records });
    } catch (err) {
      console.error('[API] Error fetching verification records:', err);
      return res.status(500).json({ error: 'Failed to load verification history.' });
    }
  }
);

apiRouter.get(
  '/admin/job-reports',
  requireAuth,
  requireRole(['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']),
  async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const reports = await db.getJobReports();
      return res.json({ reports });
    } catch (err) {
      console.error('[API] Error fetching job reports:', err);
      return res.status(500).json({ error: 'Failed to load vacancy reports.' });
    }
  }
);

apiRouter.put(
  '/admin/job-reports/:id',
  requireAuth,
  requireRole(['SUPER_ADMIN', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status } = req.body;
      if (!['resolved', 'dismissed'].includes(status)) {
        return res.status(400).json({ error: 'Status must be resolved or dismissed.' });
      }
      const updated = await db.updateJobReportStatus(req.params.id, status, req.user!.email);
      if (!updated) {
        return res.status(404).json({ error: 'Report not found.' });
      }
      return res.json({ report: updated, message: 'Report status updated.' });
    } catch (err) {
      console.error('[API] Error updating job report status:', err);
      return res.status(500).json({ error: 'Failed to update report status.' });
    }
  }
);
