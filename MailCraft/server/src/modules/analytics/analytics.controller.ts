import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/authenticate';

export const getDashboardAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const [
      totalSubscribers,
      activeSubscribers,
      totalCampaigns,
      sentCampaigns,
      draftCampaigns,
    ] = await Promise.all([
      prisma.subscriber.count({ where: { organizationId: orgId } }),
      prisma.subscriber.count({ where: { organizationId: orgId, status: 'ACTIVE' } }),
      prisma.campaign.count({ where: { organizationId: orgId } }),
      prisma.campaign.count({ where: { organizationId: orgId, status: 'SENT' } }),
      prisma.campaign.count({ where: { organizationId: orgId, status: 'DRAFT' } }),
    ]);

    // Get total sent/failed from campaigns
    const emailStats = await prisma.campaign.aggregate({
      where: { organizationId: orgId },
      _sum: { sentCount: true, failedCount: true },
    });

    // Get recent campaigns with stats
    const recentCampaigns = await prisma.campaign.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        subject: true,
        status: true,
        sentCount: true,
        failedCount: true,
        totalRecipients: true,
        sentAt: true,
        createdAt: true,
      },
    });

    // Monthly campaign data for charts (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyCampaigns = await prisma.campaign.findMany({
      where: {
        organizationId: orgId,
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        sentCount: true,
        failedCount: true,
        createdAt: true,
        status: true,
      },
    });

    // Group by month
    const monthlyData: Record<string, { sent: number; failed: number; campaigns: number }> = {};
    monthlyCampaigns.forEach((c) => {
      const month = c.createdAt.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { sent: 0, failed: 0, campaigns: 0 };
      }
      monthlyData[month].sent += c.sentCount;
      monthlyData[month].failed += c.failedCount;
      monthlyData[month].campaigns += 1;
    });

    // Subscriber growth (last 6 months)
    const subscriberGrowth = await prisma.subscriber.groupBy({
      by: ['createdAt'],
      where: {
        organizationId: orgId,
        createdAt: { gte: sixMonthsAgo },
      },
      _count: true,
    });

    res.json({
      overview: {
        totalSubscribers,
        activeSubscribers,
        totalCampaigns,
        sentCampaigns,
        draftCampaigns,
        totalEmailsSent: emailStats._sum.sentCount || 0,
        totalEmailsFailed: emailStats._sum.failedCount || 0,
      },
      recentCampaigns,
      monthlyData: Object.entries(monthlyData).map(([month, data]) => ({
        month,
        ...data,
      })),
      subscriberGrowth: subscriberGrowth.length,
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
};

export const getCampaignAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const campaign: any = await prisma.campaign.findFirst({
      where: { id: req.params.id as string, organizationId: orgId },
      include: {
        analytics: {
          orderBy: { sentAt: 'desc' as const },
        },
      },
    });

    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found.' });
      return;
    }

    const analyticsRecords = campaign.analytics || [];
    const sentCount = analyticsRecords.filter((a: any) => a.status === 'sent').length;
    const failedCount = analyticsRecords.filter((a: any) => a.status === 'failed').length;

    res.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        status: campaign.status,
        sentAt: campaign.sentAt,
        totalRecipients: campaign.totalRecipients,
        sentCount,
        failedCount,
        deliveryRate: campaign.totalRecipients > 0
          ? ((sentCount / campaign.totalRecipients) * 100).toFixed(1)
          : '0',
      },
      analytics: analyticsRecords,
    });
  } catch (error) {
    console.error('Campaign analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch campaign analytics.' });
  }
};
