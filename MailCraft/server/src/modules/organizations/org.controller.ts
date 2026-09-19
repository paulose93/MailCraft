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

    const members = await prisma.user.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch members.' });
  }
};
