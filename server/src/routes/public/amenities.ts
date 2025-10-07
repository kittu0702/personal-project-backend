import { AmenityCategory } from '@prisma/client';
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const amenitiesRoutes: FastifyPluginAsync = async (app) => {
  const querySchema = z.object({
    category: z.nativeEnum(AmenityCategory).optional(),
  });

  app.get('/', async (request) => {
    const query = querySchema.parse(request.query ?? {});

    const amenities = await app.prisma.amenity.findMany({
      where: query.category ? { category: query.category } : undefined,
      orderBy: { name: 'asc' },
    });

    return amenities;
  });
};

export default amenitiesRoutes;
