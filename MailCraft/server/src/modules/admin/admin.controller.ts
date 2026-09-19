import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/authenticate';

export const getPlatformStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalOrgs,
      activeOrgs,
      suspendedOrgs,
      totalUsers,
      totalSubscribers,
      totalCampaigns,
      sentCampaigns,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { status: 'ACTIVE' } }),
      prisma.organization.count({ where: { status: 'SUSPENDED' } }),
      prisma.user.count({ where: { role: { not: 'SUPER_ADMIN' } } }),
      prisma.subscriber.count(),
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'SENT' } }),
    ]);

    const emailStats = await prisma.campaign.aggregate({
      _sum: { sentCount: true, failedCount: true },
    });

    res.json({
      stats: {
        totalOrgs,
        activeOrgs,
        suspendedOrgs,
        totalUsers,
        totalSubscribers,
        totalCampaigns,
        sentCampaigns,
        totalEmailsSent: emailStats._sum.sentCount || 0,
        totalEmailsFailed: emailStats._sum.failedCount || 0,
      },
    });
  } catch (error) {
    console.error('Platform stats error:', error);
    res.status(500).json({ error: 'Failed to fetch platform stats.' });
  }
};

export const getAllOrganizations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, status, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { slug: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status as string;

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { subscribers: true, campaigns: true, users: true } },
        },
      }),
      prisma.organization.count({ where }),
    ]);

    res.json({
      organizations,
      pagination: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error) {
    console.error('Get all orgs error:', error);
    res.status(500).json({ error: 'Failed to fetch organizations.' });
  }
};

export const suspendOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const org = await prisma.organization.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });

    res.json({ message: 'Organization suspended.', organization: org });
  } catch (error) {
    console.error('Suspend org error:', error);
    res.status(500).json({ error: 'Failed to suspend organization.' });
  }
};

export const restoreOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const org = await prisma.organization.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    res.json({ message: 'Organization restored.', organization: org });
  } catch (error) {
    console.error('Restore org error:', error);
    res.status(500).json({ error: 'Failed to restore organization.' });
  }
};

export const deleteOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    await prisma.organization.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    res.json({ message: 'Organization deleted.' });
  } catch (error) {
    console.error('Delete org error:', error);
    res.status(500).json({ error: 'Failed to delete organization.' });
  }
};

export const reviewOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const org = await prisma.organization.update({
      where: { id },
      data: { status: 'UNDER_REVIEW' },
    });
    res.json({ message: 'Organization is now under review.', organization: org });
  } catch (error) {
    console.error('Review org error:', error);
    res.status(500).json({ error: 'Failed to review organization.' });
  }
};

export const approveOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const org = await prisma.organization.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
    res.json({ message: 'Organization approved.', organization: org });
  } catch (error) {
    console.error('Approve org error:', error);
    res.status(500).json({ error: 'Failed to approve organization.' });
  }
};

export const rejectOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const org = await prisma.organization.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
    res.json({ message: 'Organization rejected.', organization: org });
  } catch (error) {
    console.error('Reject org error:', error);
    res.status(500).json({ error: 'Failed to reject organization.' });
  }
};

export const getAllCampaigns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          organization: { select: { name: true, slug: true } },
        },
      }),
      prisma.campaign.count(),
    ]);

    res.json({
      campaigns,
      pagination: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error) {
    console.error('Get all campaigns error:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns.' });
  }
};
