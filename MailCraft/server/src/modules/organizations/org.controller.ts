import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/authenticate';

export const getOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) {
      res.status(400).json({ error: 'No organization associated.' });
      return;
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        brandKit: true,
        _count: {
          select: {
            subscribers: true,
            campaigns: true,
            templates: true,
            users: true,
          },
        },
      },
    });

    if (!org) {
      res.status(404).json({ error: 'Organization not found.' });
      return;
    }

    res.json({ organization: org });
  } catch (error) {
    console.error('Get org error:', error);
    res.status(500).json({ error: 'Failed to fetch organization.' });
  }
};

export const updateOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) {
      res.status(400).json({ error: 'No organization associated.' });
      return;
    }

    const { name, description, logoUrl } = req.body;

    const org = await prisma.organization.update({
      where: { id: orgId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(logoUrl !== undefined && { logoUrl }),
      },
    });

    res.json({ organization: org });
  } catch (error) {
    console.error('Update org error:', error);
    res.status(500).json({ error: 'Failed to update organization.' });
  }
};

export const getOrganizationMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) {
      res.status(400).json({ error: 'No organization associated.' });
      return;
    }

    const memberships = await prisma.userOrganization.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    const members = memberships.map(m => m.user);

    res.json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch members.' });
  }
};

export const createOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Organization name is required.' });
      return;
    }

    const userId = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // Create org slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug exists
    const existingOrg = await prisma.organization.findUnique({ where: { slug } });
    const finalSlug = existingOrg ? `${slug}-${Date.now().toString(36)}` : slug;

    const organization = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name,
          slug: finalSlug,
          status: 'REQUESTED',
        },
      });

      // Link user as owner
      await tx.userOrganization.create({
        data: {
          userId,
          organizationId: org.id,
          role: 'ORG_OWNER',
        },
      });

      // Default brand kit
      await tx.brandKit.create({
        data: {
          companyName: name,
          organizationId: org.id,
        },
      });

      // Default org settings
      await tx.orgSettings.create({
        data: {
          senderName: name,
          senderEmail: user.email,
          organizationId: org.id,
        },
      });

      return org;
    });

    res.status(201).json({ message: 'Organization created successfully', organization });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({ error: 'Failed to create organization.' });
  }
};
