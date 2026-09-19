import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions.' });
      return;
    }

    next();
  };
};

// Convenience middleware for common role checks
export const adminOnly = authorize('SUPER_ADMIN');
export const orgOwnerOrAbove = authorize('SUPER_ADMIN', 'ORG_OWNER');
export const anyAuthenticated = authorize('SUPER_ADMIN', 'ORG_OWNER', 'ORG_MEMBER');
