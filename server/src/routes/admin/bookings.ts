import { BookingStatus, PaymentStatus } from '@prisma/client';
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

const bookingFilterSchema = z.object({
  status: z
    .string()
    .optional()
    .transform((value) => (value ? value.trim().toUpperCase() : undefined)),
  paymentStatus: z
    .string()
    .optional()
    .transform((value) => (value ? value.trim().toUpperCase() : undefined)),
  roomId: z.coerce.number().int().positive().optional(),
  email: z.string().email().optional(),
});

const bookingUpdateSchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  notes: z.string().max(500).optional(),
});

const bookingsRoutes: FastifyPluginAsync = async (app) => {
  const guard = { preHandler: [app.authenticate, app.authorizeAdmin] };

  app.get('/', guard, async (request) => {
    const filters = bookingFilterSchema.parse(request.query ?? {});

    const bookingStatuses = new Set(Object.values(BookingStatus) as string[]);
    const paymentStatuses = new Set(Object.values(PaymentStatus) as string[]);

    if (filters.status && !bookingStatuses.has(filters.status)) {
      return [];
    }

    if (filters.paymentStatus && !paymentStatuses.has(filters.paymentStatus)) {
      return [];
    }

    const statusFilter = filters.status
      ? (filters.status as BookingStatus)
      : undefined;
    const paymentStatusFilter = filters.paymentStatus
      ? (filters.paymentStatus as PaymentStatus)
      : undefined;

    return app.prisma.booking.findMany({
      where: {
        status: statusFilter,
        paymentStatus: paymentStatusFilter,
        roomId: filters.roomId,
        customerEmail: filters.email,
      },
      include: { room: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  app.get('/:id', guard, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params ?? {});

    const booking = await app.prisma.booking.findUnique({
      where: { id },
      include: { room: true, user: true },
    });

    if (!booking) {
      return reply.notFound('Booking not found');
    }

    return booking;
  });

  app.patch('/:id', guard, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params ?? {});
    const data = bookingUpdateSchema.parse(request.body ?? {});

    const booking = await app.prisma.booking.update({
      where: { id },
      data,
      include: { room: true, user: true },
    });

    return booking;
  });

  app.delete('/:id', guard, async (request, reply) => {
    const { id } = idParamSchema.parse(request.params ?? {});
    await app.prisma.booking.delete({ where: { id } });
    return reply.code(204).send();
  });
};

export default bookingsRoutes;
