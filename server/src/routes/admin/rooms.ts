import { Prisma } from '@prisma/client';
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import { slugify } from '../../utils/slugify';

const roomCreateSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  sizeSqm: z.number().int().positive(),
  occupancy: z.number().int().positive(),
  images: z.array(z.string().url()).min(1),
  highlights: z.array(z.string().min(2)).min(1),
});

const roomUpdateSchema = roomCreateSchema.partial();

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

const roomsRoutes: FastifyPluginAsync = async (app) => {
  const ensureUniqueSlug = async (name: string, excludeId?: number): Promise<string> => {
    const base = slugify(name) || 'room';
    let candidate = base;
    let counter = 1;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await app.prisma.room.findFirst({
        where: excludeId
          ? { slug: candidate, NOT: { id: excludeId } }
          : { slug: candidate },
        select: { id: true },
      });

      if (!existing) {
        return candidate;
      }

      candidate = `${base}-${counter}`;
      counter += 1;
    }
  };

  app.get('/', { preHandler: [app.authenticate, app.authorizeAdmin] }, async () => {
    return app.prisma.room.findMany({ orderBy: { createdAt: 'desc' } });
  });

  app.get(
    '/:id',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    async (request, reply) => {
      const { id } = idParamSchema.parse(request.params ?? {});
      const room = await app.prisma.room.findUnique({ where: { id } });
      if (!room) {
        return reply.notFound('Room not found');
      }
      return room;
    },
  );

  app.post(
    '/',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    async (request, reply) => {
      const data = roomCreateSchema.parse(request.body ?? {});
      const slug = await ensureUniqueSlug(data.name);

      const room = await app.prisma.room.create({
        data: {
          name: data.name,
          slug,
          description: data.description,
          price: new Prisma.Decimal(data.price),
          sizeSqm: data.sizeSqm,
          occupancy: data.occupancy,
          images: data.images,
          highlights: data.highlights,
        },
      });

      return reply.code(201).send(room);
    },
  );

  app.patch(
    '/:id',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    async (request, reply) => {
      const { id } = idParamSchema.parse(request.params ?? {});
      const data = roomUpdateSchema.parse(request.body ?? {});

      const existing = await app.prisma.room.findUnique({ where: { id } });
      if (!existing) {
        return reply.notFound('Room not found');
      }

      let slug = existing.slug;
      if (data.name && data.name !== existing.name) {
        slug = await ensureUniqueSlug(data.name, id);
      }

      const updated = await app.prisma.room.update({
        where: { id },
        data: {
          ...data,
          slug,
          price: data.price !== undefined ? new Prisma.Decimal(data.price) : undefined,
        },
      });

      return updated;
    },
  );

  app.delete(
    '/:id',
    { preHandler: [app.authenticate, app.authorizeAdmin] },
    async (request, reply) => {
      const { id } = idParamSchema.parse(request.params ?? {});

      await app.prisma.room.delete({ where: { id } });
      return reply.code(204).send();
    },
  );
};

export default roomsRoutes;
