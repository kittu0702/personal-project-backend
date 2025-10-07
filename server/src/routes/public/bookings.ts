import { Prisma } from '@prisma/client';
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const bookingSchema = z.object({
  roomId: z.number().int().positive(),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  guests: z.number().int().positive().max(6),
  notes: z.string().max(500).optional(),
});

const bookingsRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', async (request, reply) => {
    const data = bookingSchema.parse(request.body ?? {});

    const room = await app.prisma.room.findUnique({
      where: { id: data.roomId },
    });

    if (!room) {
      return reply.badRequest('Selected room does not exist');
    }

    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);

    if (Number.isNaN(checkIn.valueOf()) || Number.isNaN(checkOut.valueOf())) {
      return reply.badRequest('Invalid check-in or check-out date');
    }

    if (checkOut <= checkIn) {
      return reply.badRequest('Check-out must be after check-in');
    }

    const diffMs = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const totalPrice = room.price.mul(new Prisma.Decimal(nights));

    const booking = await app.prisma.booking.create({
      data: {
        roomId: data.roomId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        checkIn,
        checkOut,
        guests: data.guests,
        totalPrice,
        notes: data.notes,
      },
      include: {
        room: true,
      },
    });

    return reply.code(201).send(booking);
  });
};

export default bookingsRoutes;
