import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import { config } from '../../config';
import { AuthRequest } from '../../middleware/authenticate';

const generateTokens = (user: { id: string; email: string; role: string; organizationId: string | null }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId },
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

    // Create organization and user in a transaction
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
          organizationId: organization.id,
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
      organizationId: result.user.organizationId,
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
      include: { organization: true },
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

    // Check if org is active
    if (user.organization) {
      if (user.organization.status === 'REQUESTED' || user.organization.status === 'UNDER_REVIEW') {
        res.status(403).json({ error: 'Your account is pending admin approval.' });
        return;
      }
      if (user.organization.status === 'REJECTED') {
        res.status(403).json({ error: 'Your request for an account was rejected.' });
        return;
      }
      if (user.organization.status !== 'ACTIVE') {
        res.status(403).json({ error: 'Your organization has been suspended.' });
        return;
      }
    }

    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organization: user.organization
          ? {
              id: user.organization.id,
              name: user.organization.name,
              slug: user.organization.slug,
              status: user.organization.status,
            }
          : null,
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
      include: { organization: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organization: user.organization
          ? {
              id: user.organization.id,
              name: user.organization.name,
              slug: user.organization.slug,
              logoUrl: user.organization.logoUrl,
              status: user.organization.status,
            }
          : null,
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
      select: { id: true, email: true, role: true, organizationId: true },
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
