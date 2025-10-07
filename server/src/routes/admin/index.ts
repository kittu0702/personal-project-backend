import { FastifyPluginAsync } from 'fastify';

import authRoutes from './auth';
import roomsRoutes from './rooms';
import amenitiesRoutes from './amenities';
import diningRoutes from './dining';
import galleryRoutes from './gallery';
import bookingsRoutes from './bookings';
import eventsRoutes from './events';
import testimonialsRoutes from './testimonials';

const adminRoutes: FastifyPluginAsync = async (app) => {
  app.register(authRoutes, { prefix: '/auth' });

  app.register(roomsRoutes, { prefix: '/rooms' });
  app.register(amenitiesRoutes, { prefix: '/amenities' });
  app.register(diningRoutes, { prefix: '/dining' });
  app.register(galleryRoutes, { prefix: '/gallery' });
  app.register(bookingsRoutes, { prefix: '/bookings' });
  app.register(eventsRoutes, { prefix: '/events' });
  app.register(testimonialsRoutes, { prefix: '/testimonials' });
};

export default adminRoutes;
