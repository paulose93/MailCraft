import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/authenticate';

export const getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const [user, orgSettings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
      }),
      prisma.orgSettings.findUnique({ where: { organizationId: orgId } }),
    ]);

    res.json({ profile: user, settings: orgSettings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    res.json({ profile: user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      res.status(400).json({ error: 'Current password is incorrect.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password.' });
  }
};

export const updateOrgSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const { senderName, senderEmail, replyToEmail, emailFooter, timezone } = req.body;

    const settings = await prisma.orgSettings.upsert({
      where: { organizationId: orgId },
      update: {
        ...(senderName !== undefined && { senderName }),
        ...(senderEmail !== undefined && { senderEmail }),
        ...(replyToEmail !== undefined && { replyToEmail }),
        ...(emailFooter !== undefined && { emailFooter }),
        ...(timezone && { timezone }),
      },
      create: {
        senderName,
        senderEmail,
        replyToEmail,
        emailFooter,
        timezone: timezone || 'UTC',
        organizationId: orgId,
      },
    });

    res.json({ settings });
  } catch (error) {
    console.error('Update org settings error:', error);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
};
