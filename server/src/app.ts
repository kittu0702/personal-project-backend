import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import jwt from '@fastify/jwt';

import { config } from './env';
import prismaPlugin from './plugins/prisma';
import authPlugin from './plugins/auth';
import healthRoutes from './routes/health';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';

export const buildApp = (): FastifyInstance => {
  const app = Fastify({
    logger: {
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
            }
          : undefined,
    },
  });

  app.register(sensible);
  app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  app.register(jwt, {
    secret: config.jwtSecret,
  });

  app.register(prismaPlugin);
  app.register(authPlugin);

  app.register(healthRoutes, { prefix: '/health' });
  app.register(publicRoutes, { prefix: '/api/v1' });
  app.register(adminRoutes, { prefix: '/api/v1/admin' });

  app.get('/', async () => ({
    message: 'Lumina Hotel API is running',
    docs: {
      health: '/health',
      public: '/api/v1',
      admin: '/api/v1/admin',
    },
  }));

  return app;
};
