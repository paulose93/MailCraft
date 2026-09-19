import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/authenticate';

export const getBrandKit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    let brandKit = await prisma.brandKit.findUnique({
      where: { organizationId: orgId },
    });

    if (!brandKit) {
      const org = await prisma.organization.findUnique({ where: { id: orgId } });
      brandKit = await prisma.brandKit.create({
        data: {
          companyName: org?.name || 'My Company',
          organizationId: orgId,
        },
      });
    }

    res.json({ brandKit });
  } catch (error) {
    console.error('Get brand kit error:', error);
    res.status(500).json({ error: 'Failed to fetch brand kit.' });
  }
};

export const updateBrandKit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const {
      companyName,
      logoUrl,
      primaryColor,
      secondaryColor,
      brandDescription,
      writingTone,
      audience,
      mission,
    } = req.body;

    const brandKit = await prisma.brandKit.upsert({
      where: { organizationId: orgId },
      update: {
        ...(companyName && { companyName }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(primaryColor && { primaryColor }),
        ...(secondaryColor && { secondaryColor }),
        ...(brandDescription !== undefined && { brandDescription }),
        ...(writingTone && { writingTone }),
        ...(audience !== undefined && { audience }),
        ...(mission !== undefined && { mission }),
      },
      create: {
        companyName: companyName || 'My Company',
        logoUrl,
        primaryColor: primaryColor || '#6366f1',
        secondaryColor: secondaryColor || '#8b5cf6',
        brandDescription,
        writingTone: writingTone || 'professional',
        audience,
        mission,
        organizationId: orgId,
      },
    });

    res.json({ brandKit });
  } catch (error) {
    console.error('Update brand kit error:', error);
    res.status(500).json({ error: 'Failed to update brand kit.' });
  }
};
