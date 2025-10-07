import { DiningType } from '@prisma/client';
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const diningBaseSchema = z.object({
  name: z.string().min(2),
  type: z.nativeEnum(DiningType),
  floor: z.number().int().optional(),
  hours: z.string().min(3),
  description: z.string().min(10),
  menuUrl: z.string().url().optional(),
  images: z.array(z.string().url()).min(1).optional().default([]),
});

const diningCreateSchema = diningBaseSchema;
const diningUpdateSchema = diningBaseSchema.partial();
const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

const diningRoutes: FastifyPluginAsync = async (app) => {
  const guard = { preHandler: [app.authenticate, app.authorizeAdmin] };

  app.get('/', guard, async () => {
    return app.prisma.diningVenue.findMany({ orderBy: { createdAt: 'desc' } });
  });

  app.get('/:id', guard, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params ?? {});
    const venue = await app.prisma.diningVenue.findUnique({ where: { id } });
    if (!venue) {
      return reply.notFound('Dining venue not found');
    }
    return venue;
  });

  app.post('/', guard, async (request, reply) => {
    const data = diningCreateSchema.parse(request.body ?? {});
    const venue = await app.prisma.diningVenue.create({ data });
    return reply.code(201).send(venue);
  });

  app.patch('/:id', guard, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params ?? {});
    const data = diningUpdateSchema.parse(request.body ?? {});

    const venue = await app.prisma.diningVenue.update({
      where: { id },
      data,
    });

    return venue;
  });

  app.delete('/:id', guard, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params ?? {});
    await app.prisma.diningVenue.delete({ where: { id } });
    return reply.code(204).send();
  });
};

export default diningRoutes;
