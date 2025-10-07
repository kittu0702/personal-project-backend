import { GalleryCategory } from '@prisma/client';
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const galleryRoutes: FastifyPluginAsync = async (app) => {
  const querySchema = z.object({
    category: z.nativeEnum(GalleryCategory).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
  });

  app.get('/', async (request) => {
    const query = querySchema.parse(request.query ?? {});

    const items = await app.prisma.galleryItem.findMany({
      where: query.category ? { category: query.category } : undefined,
      orderBy: { createdAt: 'desc' },
      take: query.limit,
    });

    return items;
  });
};

export default galleryRoutes;
