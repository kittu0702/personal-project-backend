import { GalleryCategory } from '@prisma/client';
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const galleryBaseSchema = z.object({
  title: z.string().min(2),
  category: z.nativeEnum(GalleryCategory),
  imageUrl: z.string().url(),
  caption: z.string().optional(),
});

const galleryCreateSchema = galleryBaseSchema;
const galleryUpdateSchema = galleryBaseSchema.partial();
const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

const galleryRoutes: FastifyPluginAsync = async (app) => {
  const guard = { preHandler: [app.authenticate, app.authorizeAdmin] };

  app.get('/', guard, async () => {
    return app.prisma.galleryItem.findMany({ orderBy: { createdAt: 'desc' } });
  });

  app.post('/', guard, async (request, reply) => {
    const data = galleryCreateSchema.parse(request.body ?? {});
    const item = await app.prisma.galleryItem.create({ data });
    return reply.code(201).send(item);
  });

  app.patch('/:id', guard, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params ?? {});
    const data = galleryUpdateSchema.parse(request.body ?? {});

    const updated = await app.prisma.galleryItem.update({ where: { id }, data });
    return updated;
  });

  app.delete('/:id', guard, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params ?? {});
    await app.prisma.galleryItem.delete({ where: { id } });
    return reply.code(204).send();
  });
};

export default galleryRoutes;
