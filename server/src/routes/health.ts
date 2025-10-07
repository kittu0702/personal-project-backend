import { FastifyPluginAsync } from 'fastify';

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
};

export default healthRoutes;
