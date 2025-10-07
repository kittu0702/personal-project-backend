import fp from 'fastify-plugin';
import bcrypt from 'bcryptjs';
import { FastifyReply, FastifyRequest } from 'fastify';
import { UserRole } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorizeAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    hashPassword(password: string): Promise<string>;
    verifyPassword(password: string, hash: string): Promise<boolean>;
  }

  interface FastifyRequest {
    user: {
      userId: number;
      role: UserRole;
    };
  }
}

const authPlugin = fp(async (app) => {
  app.decorate('hashPassword', async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  });

  app.decorate('verifyPassword', async (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
  });

  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.unauthorized('Authentication required');
    }
  });

  app.decorate('authorizeAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      if (request.user.role !== 'ADMIN') {
        return reply.forbidden('Admin privileges required');
      }
    } catch (err) {
      return reply.unauthorized('Authentication required');
    }
  });
});

export default authPlugin;
