import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const eventBaseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  date: z.string().datetime(),
  venue: z.string().min(2),
  imageUrl: z.string().url().optional(),
});

const eventCreateSchema = eventBaseSchema;
const eventUpdateSchema = eventBaseSchema.partial();
const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

const eventsRoutes: FastifyPluginAsync = async (app) => {
  const guard = { preHandler: [app.authenticate, app.authorizeAdmin] };

  app.get('/', guard, async () => {
    return app.prisma.event.findMany({ orderBy: { date: 'asc' } });
  });

  app.post('/', guard, async (request, reply) => {
    const data = eventCreateSchema.parse(request.body ?? {});
    const event = await app.prisma.event.create({
      data: { ...data, date: new Date(data.date) },
    });
    return reply.code(201).send(event);
  });

  app.patch('/:id', guard, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params ?? {});
    const data = eventUpdateSchema.parse(request.body ?? {});

    const event = await app.prisma.event.update({
      where: { id },
      data: { ...data, date: data.date ? new Date(data.date) : undefined },
    });

    return event;
  });

  app.delete('/:id', guard, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params ?? {});
    await app.prisma.event.delete({ where: { id } });
    return reply.code(204).send();
  });
};

export default eventsRoutes;
