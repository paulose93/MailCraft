import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import { config } from '../../config';
import { AuthRequest } from '../../middleware/authenticate';

const generateTokens = (user: { id: string; email: string; role: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as any
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn } as any
  );

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, organizationName } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'User with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create org slug from name
    const slug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug exists
    const existingOrg = await prisma.organization.findUnique({ where: { slug } });
    const finalSlug = existingOrg ? `${slug}-${Date.now().toString(36)}` : slug;

    // Create organization, user, and membership in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug: finalSlug,
          status: 'REQUESTED',
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'ORG_OWNER',
        },
      });

      // Create the many-to-many membership
      await tx.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: 'ORG_OWNER',
        },
      });

      // Create default brand kit
      await tx.brandKit.create({
        data: {
          companyName: organizationName,
          organizationId: organization.id,
        },
      });

      // Create default org settings
      await tx.orgSettings.create({
        data: {
          senderName: organizationName,
          senderEmail: email,
          organizationId: organization.id,
        },
      });

      return { user, organization };
    });

    const tokens = generateTokens({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug,
          status: result.organization.status,
        },
        organizations: [
          {
            role: 'ORG_OWNER',
            organization: {
              id: result.organization.id,
              name: result.organization.name,
              slug: result.organization.slug,
              logoUrl: result.organization.logoUrl,
              status: result.organization.status,
            },
          },
        ],
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          include: { organization: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Get the user's first organization (primary)
    const primaryMembership = user.organizations[0];
    const org = primaryMembership?.organization;

    // Users (except SUPER_ADMIN) must belong to at least one organization to log in
    if (user.role !== 'SUPER_ADMIN' && (!user.organizations || user.organizations.length === 0)) {
      res.status(403).json({ error: 'Your account is pending admin approval.' });
      return;
    }

    // Check if org is active
    if (org) {
      if (org.status === 'REQUESTED' || org.status === 'UNDER_REVIEW') {
        res.status(403).json({ error: 'Your account is pending admin approval.' });
        return;
      }
      if (org.status === 'REJECTED') {
        res.status(403).json({ error: 'Your request for an account was rejected.' });
        return;
      }
      if (org.status !== 'ACTIVE') {
        res.status(403).json({ error: 'Your organization has been suspended.' });
        return;
      }
    }

    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organization: org
          ? {
              id: org.id,
              name: org.name,
              slug: org.slug,
              status: org.status,
            }
          : null,
        organizations: user.organizations.map((m) => ({
          role: m.role,
          organization: {
            id: m.organization.id,
            name: m.organization.name,
            slug: m.organization.slug,
            logoUrl: m.organization.logoUrl,
            status: m.organization.status,
          },
        })),
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        organizations: {
          include: { organization: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // Use the org resolved by the middleware, or fall back to first membership
    const activeOrgId = req.user!.organizationId;
    const membership = user.organizations.find(m => m.organizationId === activeOrgId) || user.organizations[0];
    const org = membership?.organization;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organization: org
          ? {
              id: org.id,
              name: org.name,
              slug: org.slug,
              logoUrl: org.logoUrl,
              status: org.status,
            }
          : null,
        organizations: user.organizations.map((m) => ({
          role: m.role,
          organization: {
            id: m.organization.id,
            name: m.organization.name,
            slug: m.organization.slug,
            logoUrl: m.organization.logoUrl,
            status: m.organization.status,
          },
        })),
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    const decoded = jwt.verify(token, config.jwt.refreshSecret) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid refresh token.' });
      return;
    }

    const tokens = generateTokens(user);

    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token.' });
  }
};
