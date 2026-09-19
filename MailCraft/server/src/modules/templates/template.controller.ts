import { Response } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/authenticate';

export const getTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    const { category } = req.query;

    const where: any = {
      OR: [
        { isBuiltIn: true },
        ...(orgId ? [{ organizationId: orgId }] : []),
      ],
    };

    if (category && category !== 'all') {
      where.category = category as string;
    }

    const templates = await prisma.template.findMany({
      where,
      orderBy: [{ isBuiltIn: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates.' });
  }
};

export const getTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;

    const template = await prisma.template.findFirst({
      where: {
        id: req.params.id as string,
        OR: [
          { isBuiltIn: true },
          ...(orgId ? [{ organizationId: orgId }] : []),
        ],
      },
    });

    if (!template) {
      res.status(404).json({ error: 'Template not found.' });
      return;
    }

    res.json({ template });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to fetch template.' });
  }
};

export const createTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const { name, description, content, designJson, category, thumbnailUrl } = req.body;

    const template = await prisma.template.create({
      data: {
        name,
        description,
        content: content || '',
        designJson,
        category: category || 'general',
        thumbnailUrl,
        organizationId: orgId,
      },
    });

    res.status(201).json({ template });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template.' });
  }
};

export const updateTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const existing = await prisma.template.findFirst({
      where: { id: req.params.id as string, organizationId: orgId, isBuiltIn: false },
    });

    if (!existing) {
      res.status(404).json({ error: 'Template not found or cannot be edited.' });
      return;
    }

    const { name, description, content, designJson, category, thumbnailUrl } = req.body;

    const template = await prisma.template.update({
      where: { id: req.params.id as string },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        ...(designJson !== undefined && { designJson }),
        ...(category && { category }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
      },
    });

    res.json({ template });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template.' });
  }
};

export const deleteTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId;
    if (!orgId) { res.status(400).json({ error: 'No organization.' }); return; }

    const result = await prisma.template.deleteMany({
      where: { id: req.params.id as string, organizationId: orgId, isBuiltIn: false },
    });

    if (result.count === 0) {
      res.status(404).json({ error: 'Template not found or cannot be deleted.' });
      return;
    }

    res.json({ message: 'Template deleted.' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template.' });
  }
};
