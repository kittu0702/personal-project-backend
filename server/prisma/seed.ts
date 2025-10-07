import { PrismaClient, AmenityCategory, DiningType, GalleryCategory, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const seed = async () => {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@lumina.com' },
    update: {},
    create: {
      email: 'admin@lumina.com',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const rooms = await prisma.room.createMany({
    data: [
      {
        name: 'Quantum Suite',
        slug: 'quantum-suite',
        description:
          'Experience luxury in our flagship suite featuring floor-to-ceiling smart glass, holographic concierge, and panoramic skyline views.',
        price: 599,
        sizeSqm: 120,
        occupancy: 4,
        images: [
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
        ],
        highlights: ['Holographic Concierge', 'Smart Glass Walls', 'Infinity Skydeck'],
      },
      {
        name: 'Cyber Deluxe',
        slug: 'cyber-deluxe',
        description:
          'Modern comfort infused with adaptive lighting, immersive entertainment pods, and skyline lounge access.',
        price: 399,
        sizeSqm: 80,
        occupancy: 3,
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        ],
        highlights: ['Adaptive Lighting', 'Immersive Entertainment Pod', 'Lounge Access'],
      },
      {
        name: 'Neo Standard',
        slug: 'neo-standard',
        description:
          'Sleek and functional room outfitted with smart controls, ultra-fast connectivity, and wellness-focused amenities.',
        price: 249,
        sizeSqm: 55,
        occupancy: 2,
        images: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
        ],
        highlights: ['Smart Controls', 'All-day Room Service', 'Wellness Lighting'],
      },
    ],
    skipDuplicates: true,
  });

  console.log(`🛏️ Seeded rooms: ${rooms.count}`);

  const amenities = await prisma.amenity.createMany({
    data: [
      {
        name: 'Skyline Infinity Pool',
        description: 'Heated rooftop pool with skyline vistas and ambient lighting.',
        category: AmenityCategory.LEISURE,
        hours: '06:00 - 23:00',
        images: ['https://images.unsplash.com/photo-1567552379232-c32f3d64d251?w=800'],
      },
      {
        name: 'Lumina Wellness Spa',
        description: 'Holistic treatments, meditation pods, and sensory saunas.',
        category: AmenityCategory.WELLNESS,
        hours: '09:00 - 21:00',
        images: ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'],
      },
      {
        name: 'Quantum Fitness Lab',
        description: 'AI-personalized workouts, VR cycling, and strength zones.',
        category: AmenityCategory.FITNESS,
        hours: '24 Hours',
        images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'],
      },
    ],
    skipDuplicates: true,
  });

  console.log(`🎯 Seeded amenities: ${amenities.count}`);

  const dining = await prisma.diningVenue.createMany({
    data: [
      {
        name: 'Quantum Kitchen',
        type: DiningType.FINE_DINING,
        floor: 45,
        hours: '17:00 - 23:00',
        description: 'Progressive gastronomy with molecular techniques and skyline dining.',
        menuUrl: 'https://example.com/menus/quantum-kitchen.pdf',
        images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
      },
      {
        name: 'Cyber Café',
        type: DiningType.CAFE,
        floor: 1,
        hours: '07:00 - 22:00',
        description: 'Artisanal coffee, smart charging stations, and productive lounges.',
        menuUrl: 'https://example.com/menus/cyber-cafe.pdf',
        images: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800'],
      },
      {
        name: 'Neo Sushi Bar',
        type: DiningType.CASUAL,
        floor: 38,
        hours: '12:00 - 23:00',
        description: 'Contemporary sushi theater with chef-led tastings and sake pairings.',
        menuUrl: 'https://example.com/menus/neo-sushi.pdf',
        images: ['https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800'],
      },
    ],
    skipDuplicates: true,
  });

  console.log(`🍽️ Seeded dining venues: ${dining.count}`);

  const gallery = await prisma.galleryItem.createMany({
    data: [
      {
        title: 'Lumina Exterior at Night',
        category: GalleryCategory.EXTERIOR,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
        caption: 'The Lumina skyline glowing against the city nightscape.',
      },
      {
        title: 'Quantum Suite Living Room',
        category: GalleryCategory.ROOM,
        imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200',
        caption: 'Lounge in holographic-lit comfort with panoramic views.',
      },
      {
        title: 'Skyline Infinity Pool',
        category: GalleryCategory.AMENITY,
        imageUrl: 'https://images.unsplash.com/photo-1567552379232-c32f3d64d251?w=1200',
        caption: 'Sunset reflections over the city from our rooftop pool.',
      },
    ],
    skipDuplicates: true,
  });

  console.log(`🖼️ Seeded gallery items: ${gallery.count}`);

  const testimonials = await prisma.testimonial.createMany({
    data: [
      {
        guestName: 'Ava Clarkson',
        content: 'The Lumina experience is beyond imagination—AI concierge remembered every preference!',
        rating: 5,
      },
      {
        guestName: 'Jasper Lin',
        content: 'Loved the Quantum Suite. The holographic art installations are out of this world.',
        rating: 5,
      },
    ],
    skipDuplicates: true,
  });

  console.log(`💬 Seeded testimonials: ${testimonials.count}`);

  console.log('✅ Seed completed');
};

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
