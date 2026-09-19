import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId: string | null;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access denied. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
    };

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      res.status(401).json({ error: 'User no longer exists.' });
      return;
    }

    // Resolve organizationId from UserOrganization junction table
    let organizationId: string | null = null;

    // Check for explicit org header (for multi-org switching in the future)
    const headerOrgId = req.headers['x-organization-id'] as string | undefined;

    if (headerOrgId) {
      // Verify membership
      const membership = await prisma.userOrganization.findUnique({
        where: { userId_organizationId: { userId: user.id, organizationId: headerOrgId } },
      });
      if (membership) {
        organizationId = headerOrgId;
      }
    }

    // Fall back to the user's first organization membership
    if (!organizationId && user.role !== 'SUPER_ADMIN') {
      const firstMembership = await prisma.userOrganization.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      });
      if (firstMembership) {
        organizationId = firstMembership.organizationId;
      }
    }

    // Check if org is active (for non-admin users)
    if (organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
      });
      if (org && org.status !== 'ACTIVE') {
        const path = req.originalUrl || req.url;
        if (!path.includes('/auth/me') && !path.includes('/auth/refresh')) {
          res.status(403).json({ error: 'Organization is not active.' });
          return;
        }
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired.' });
      return;
    }
    res.status(401).json({ error: 'Invalid token.' });
  }
};
