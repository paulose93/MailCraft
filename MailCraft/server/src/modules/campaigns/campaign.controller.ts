import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/authenticate';
import { sendEmail } from '../../config/email';

export const getCampaigns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const { status, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = { organizationId: orgId };
    if (status) where.status = status as string;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.campaign.count({ where }),
    ]);

    res.json({
      campaigns,
      pagination: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns.' });
  }
};

export const getCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id as string, organizationId: orgId },
      include: { analytics: true },
    });

    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found.' });
      return;
    }

    res.json({ campaign });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Failed to fetch campaign.' });
  }
};

export const createCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const { name, subject, previewText, content, designJson } = req.body;

    const campaign = await prisma.campaign.create({
      data: {
        name,
        subject,
        previewText,
        content: content || '',
        designJson,
        organizationId: orgId,
      },
    });

    res.status(201).json({ campaign });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Failed to create campaign.' });
  }
};

export const updateCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const existing = await prisma.campaign.findFirst({
      where: { id: req.params.id as string, organizationId: orgId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Campaign not found.' });
      return;
    }

    if (existing.status === 'SENT' || existing.status === 'SENDING') {
      res.status(400).json({ error: 'Cannot edit a sent/sending campaign.' });
      return;
    }

    const { name, subject, previewText, content, designJson } = req.body;

    const campaign = await prisma.campaign.update({
      where: { id: req.params.id as string },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(previewText !== undefined && { previewText }),
        ...(content !== undefined && { content }),
        ...(designJson !== undefined && { designJson }),
      },
    });

    res.json({ campaign });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Failed to update campaign.' });
  }
};

export const deleteCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const result = await prisma.campaign.deleteMany({
      where: { id: req.params.id as string, organizationId: orgId },
    });

    if (result.count === 0) {
      res.status(404).json({ error: 'Campaign not found.' });
      return;
    }

    res.json({ message: 'Campaign deleted.' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Failed to delete campaign.' });
  }
};

export const sendCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id as string, organizationId: orgId },
    });

    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found.' });
      return;
    }

    if (campaign.status !== 'DRAFT') {
      res.status(400).json({ error: 'Campaign has already been sent.' });
      return;
    }

    // Get active subscribers
    const subscribers = await prisma.subscriber.findMany({
      where: { organizationId: orgId, status: 'ACTIVE' },
    });

    if (subscribers.length === 0) {
      res.status(400).json({ error: 'No active subscribers to send to.' });
      return;
    }

    // Update campaign status to SENDING
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: 'SENDING', totalRecipients: subscribers.length },
    });

    // Send immediately (respond first, process in background)
    res.json({
      message: `Sending campaign to ${subscribers.length} subscribers...`,
      totalRecipients: subscribers.length,
    });

    // Send emails in background
    let sentCount = 0;
    let failedCount = 0;

    for (const subscriber of subscribers) {
      try {
        await sendEmail(subscriber.email, campaign.subject, campaign.content);
        sentCount++;

        // Log analytics
        await prisma.campaignAnalytics.create({
          data: {
            campaignId: campaign.id,
            email: subscriber.email,
            status: 'sent',
          },
        });
      } catch (err) {
        failedCount++;
        await prisma.campaignAnalytics.create({
          data: {
            campaignId: campaign.id,
            email: subscriber.email,
            status: 'failed',
          },
        });
      }
    }

    // Update campaign with final counts
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        status: failedCount === subscribers.length ? 'FAILED' : 'SENT',
        sentCount,
        failedCount,
        sentAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Send campaign error:', error);
    // Only send error if headers haven't been sent
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to send campaign.' });
    }
  }
};
