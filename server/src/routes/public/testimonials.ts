import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const testimonialsRoutes: FastifyPluginAsync = async (app) => {
  const querySchema = z.object({
    limit: z.coerce.number().min(1).max(100).optional(),
  });

  app.get('/', async (request) => {
    const query = querySchema.parse(request.query ?? {});

    const testimonials = await app.prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
      take: query.limit,
    });

    return testimonials;
  });
};

export default testimonialsRoutes;
