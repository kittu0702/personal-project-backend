import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const testimonialBaseSchema = z.object({
  guestName: z.string().min(2),
  content: z.string().min(10),
  rating: z.number().int().min(1).max(5),
});

const testimonialCreateSchema = testimonialBaseSchema;
const testimonialUpdateSchema = testimonialBaseSchema.partial();
const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

const testimonialsRoutes: FastifyPluginAsync = async (app) => {
  const guard = { preHandler: [app.authenticate, app.authorizeAdmin] };

  app.get('/', guard, async () => {
    return app.prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
  });

  app.post('/', guard, async (request, reply) => {
    const data = testimonialCreateSchema.parse(request.body ?? {});
    const testimonial = await app.prisma.testimonial.create({ data });
    return reply.code(201).send(testimonial);
  });

  app.patch('/:id', guard, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params ?? {});
    const data = testimonialUpdateSchema.parse(request.body ?? {});

    const testimonial = await app.prisma.testimonial.update({
      where: { id },
      data,
    });

    return testimonial;
  });

  app.delete('/:id', guard, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params ?? {});
    await app.prisma.testimonial.delete({ where: { id } });
    return reply.code(204).send();
  });
};

export default testimonialsRoutes;
