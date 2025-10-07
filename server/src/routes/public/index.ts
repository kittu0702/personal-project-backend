import { FastifyPluginAsync } from 'fastify';

import roomsRoutes from './rooms';
import amenitiesRoutes from './amenities';
import diningRoutes from './dining';
import galleryRoutes from './gallery';
import bookingsRoutes from './bookings';
import testimonialsRoutes from './testimonials';

const publicRoutes: FastifyPluginAsync = async (app) => {
  app.register(roomsRoutes, { prefix: '/rooms' });
  app.register(amenitiesRoutes, { prefix: '/amenities' });
  app.register(diningRoutes, { prefix: '/dining' });
  app.register(galleryRoutes, { prefix: '/gallery' });
  app.register(bookingsRoutes, { prefix: '/bookings' });
  app.register(testimonialsRoutes, { prefix: '/testimonials' });
};

export default publicRoutes;
