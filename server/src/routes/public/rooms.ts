import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const roomsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => {
    const rooms = await app.prisma.room.findMany({
      orderBy: { price: 'asc' },
    });
    return rooms;
  });

  app.get('/:slug', async (request, reply) => {
    const params = z.object({ slug: z.string() }).parse(request.params ?? {});

    const room = await app.prisma.room.findUnique({
      where: { slug: params.slug },
    });

    if (!room) {
      return reply.notFound('Room not found');
    }

    return room;
  });
};

export default roomsRoutes;
