import { Response } from 'express';
import { parse } from 'csv-parse/sync';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/authenticate';

export const getSubscribers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const { search, status, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = { organizationId: orgId };
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status as string;
    }

    const [subscribers, total] = await Promise.all([
      prisma.subscriber.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.subscriber.count({ where }),
    ]);

    res.json({
      subscribers,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ error: 'Failed to fetch subscribers.' });
  }
};

export const createSubscriber = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const { email, firstName, lastName } = req.body;

    const existing = await prisma.subscriber.findUnique({
      where: { email_organizationId: { email, organizationId: orgId } },
    });

    if (existing) {
      res.status(409).json({ error: 'Subscriber already exists.' });
      return;
    }

    const subscriber = await prisma.subscriber.create({
      data: { email, firstName, lastName, organizationId: orgId },
    });

    res.status(201).json({ subscriber });
  } catch (error) {
    console.error('Create subscriber error:', error);
    res.status(500).json({ error: 'Failed to create subscriber.' });
  }
};

export const updateSubscriber = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const id = req.params.id as string;
    const { firstName, lastName, status } = req.body;

    const subscriber = await prisma.subscriber.updateMany({
      where: { id, organizationId: orgId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(status && { status }),
      },
    });

    if (subscriber.count === 0) {
      res.status(404).json({ error: 'Subscriber not found.' });
      return;
    }

    const updated = await prisma.subscriber.findUnique({ where: { id: id } });
    res.json({ subscriber: updated });
  } catch (error) {
    console.error('Update subscriber error:', error);
    res.status(500).json({ error: 'Failed to update subscriber.' });
  }
};

export const deleteSubscriber = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const id = req.params.id as string;

    const result = await prisma.subscriber.deleteMany({
      where: { id, organizationId: orgId },
    });

    if (result.count === 0) {
      res.status(404).json({ error: 'Subscriber not found.' });
      return;
    }

    res.json({ message: 'Subscriber deleted.' });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({ error: 'Failed to delete subscriber.' });
  }
};

export const importCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    if (!req.file) {
      res.status(400).json({ error: 'No CSV file uploaded.' });
      return;
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const record of records) {
      const email = record.email || record.Email || record.EMAIL;
      if (!email) {
        skipped++;
        continue;
      }

      try {
        await prisma.subscriber.upsert({
          where: { email_organizationId: { email, organizationId: orgId } },
          create: {
            email,
            firstName: record.firstName || record.first_name || record.FirstName || null,
            lastName: record.lastName || record.last_name || record.LastName || null,
            organizationId: orgId,
          },
          update: {
            firstName: record.firstName || record.first_name || record.FirstName || undefined,
            lastName: record.lastName || record.last_name || record.LastName || undefined,
          },
        });
        imported++;
      } catch (err) {
        skipped++;
        errors.push(`Failed to import: ${email}`);
      }
    }

    res.json({
      message: `Import complete. ${imported} imported, ${skipped} skipped.`,
      imported,
      skipped,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    console.error('CSV import error:', error);
    res.status(500).json({ error: 'Failed to import CSV.' });
  }
};
