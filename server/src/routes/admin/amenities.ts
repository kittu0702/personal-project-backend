import { AmenityCategory } from '@prisma/client';
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const amenityBaseSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  category: z.nativeEnum(AmenityCategory),
  hours: z.string().optional(),
  images: z.array(z.string().url()).min(1).optional().default([]),
});

const amenityCreateSchema = amenityBaseSchema;
const amenityUpdateSchema = amenityBaseSchema.partial();
const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

const amenitiesRoutes: FastifyPluginAsync = async (app) => {
  const preHandler = { preHandler: [app.authenticate, app.authorizeAdmin] };

  app.get('/', preHandler, async () => {
    return app.prisma.amenity.findMany({ orderBy: { createdAt: 'desc' } });
  });

  app.get('/:id', preHandler, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params ?? {});
    const amenity = await app.prisma.amenity.findUnique({ where: { id } });
    if (!amenity) {
      return reply.notFound('Amenity not found');
    }
    return amenity;
  });

  app.post('/', preHandler, async (request, reply) => {
    const data = amenityCreateSchema.parse(request.body ?? {});
    const amenity = await app.prisma.amenity.create({ data });
    return reply.code(201).send(amenity);
  });

  app.patch('/:id', preHandler, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params ?? {});
    const data = amenityUpdateSchema.parse(request.body ?? {});

    const amenity = await app.prisma.amenity.update({
      where: { id },
      data,
    });

    return amenity;
  });

  app.delete('/:id', preHandler, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params ?? {});
    await app.prisma.amenity.delete({ where: { id } });
    return reply.code(204).send();
  });
};

export default amenitiesRoutes;
