import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body ?? {});

    const user = await app.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      return reply.unauthorized('Invalid credentials');
    }

    const valid = await app.verifyPassword(body.password, user.password);
    if (!valid) {
      return reply.unauthorized('Invalid credentials');
    }

    const token = app.jwt.sign({ userId: user.id, role: user.role });

    return { token, user: { id: user.id, email: user.email, role: user.role } };
  });

  app.post(
    '/register',
    {
      preHandler: [app.authenticate, app.authorizeAdmin],
    },
    async (request, reply) => {
      const body = registerSchema.parse(request.body ?? {});

      const existing = await app.prisma.user.findUnique({ where: { email: body.email } });
      if (existing) {
        return reply.badRequest('User already exists');
      }

      const hashed = await app.hashPassword(body.password);

      const user = await app.prisma.user.create({
        data: {
          email: body.email,
          password: hashed,
          role: 'ADMIN',
        },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      return reply.code(201).send(user);
    },
  );

  app.post('/seed-admin', async (request, reply) => {
    const body = registerSchema.parse(request.body ?? {});

    const adminCount = await app.prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount > 0) {
      return reply.badRequest('Admin already exists');
    }

    const hashed = await app.hashPassword(body.password);
    const user = await app.prisma.user.create({
      data: {
        email: body.email,
        password: hashed,
        role: 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return reply.code(201).send(user);
  });
};

export default authRoutes;
