import { DiningType } from '@prisma/client';
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const diningRoutes: FastifyPluginAsync = async (app) => {
  const querySchema = z.object({
    type: z.nativeEnum(DiningType).optional(),
  });

  app.get('/', async (request) => {
    const query = querySchema.parse(request.query ?? {});

    const venues = await app.prisma.diningVenue.findMany({
      where: query.type ? { type: query.type } : undefined,
      orderBy: { name: 'asc' },
    });

    return venues;
  });
};

export default diningRoutes;
