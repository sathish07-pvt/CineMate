import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CineMate database with demo data...');

  // Hash common password
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Demo Users
  const alex = await prisma.user.upsert({
    where: { email: 'alex@cinemate.io' },
    update: {},
    create: {
      username: 'alex_cinephile',
      email: 'alex@cinemate.io',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: 'Sci-Fi enthusiast, Nolan disciple, and 70mm IMAX purist.',
      preferredRegion: 'US',
      preferredLanguages: 'en,fr',
      favoriteGenres: '878,12,53', // Sci-Fi, Adventure, Thriller
    },
  });

  const sophia = await prisma.user.upsert({
    where: { email: 'sophia@cinemate.io' },
    update: {},
    create: {
      username: 'sophia_movies',
      email: 'sophia@cinemate.io',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: 'Film festival curator & screenplay analyst. Loves psychological thrillers and Korean cinema.',
      preferredRegion: 'US',
      preferredLanguages: 'en,ko',
      favoriteGenres: '53,18,9648', // Thriller, Drama, Mystery
    },
  });

  const marcus = await prisma.user.upsert({
    where: { email: 'marcus@cinemate.io' },
    update: {},
    create: {
      username: 'marcus_stream',
      email: 'marcus@cinemate.io',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      bio: 'Weekend watch-party organizer. Always down for horror and popcorn blockbusters.',
      preferredRegion: 'GB',
      preferredLanguages: 'en',
      favoriteGenres: '28,35,878', // Action, Comedy, Sci-Fi
    },
  });

  console.log('✅ Created demo users: alex_cinephile, sophia_movies, marcus_stream (Password: password123)');

  // 2. Add Friendships
  await prisma.friendship.upsert({
    where: {
      senderId_receiverId: { senderId: alex.id, receiverId: sophia.id },
    },
    update: {},
    create: {
      senderId: alex.id,
      receiverId: sophia.id,
      status: 'ACCEPTED',
    },
  });

  await prisma.friendship.upsert({
    where: {
      senderId_receiverId: { senderId: marcus.id, receiverId: alex.id },
    },
    update: {},
    create: {
      senderId: marcus.id,
      receiverId: alex.id,
      status: 'ACCEPTED',
    },
  });

  console.log('✅ Established friendships');

  // 3. Seed Watchlist Items for Alex
  const alexWatchlist = [
    {
      tmdbId: 157336,
      mediaType: 'movie',
      title: 'Interstellar',
      posterPath: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      backdropPath: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
      voteAverage: 8.4,
      releaseDate: '2014-11-05',
      isWatched: true,
    },
    {
      tmdbId: 693134,
      mediaType: 'movie',
      title: 'Dune: Part Two',
      posterPath: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      backdropPath: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520Wio.jpg',
      voteAverage: 8.2,
      releaseDate: '2024-02-27',
      isWatched: true,
    },
    {
      tmdbId: 27205,
      mediaType: 'movie',
      title: 'Inception',
      posterPath: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
      backdropPath: 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
      voteAverage: 8.4,
      releaseDate: '2010-07-15',
      isWatched: false,
    },
    {
      tmdbId: 66732,
      mediaType: 'tv',
      title: 'Stranger Things',
      posterPath: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
      backdropPath: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
      voteAverage: 8.6,
      releaseDate: '2016-07-15',
      isWatched: true,
    },
  ];

  for (const item of alexWatchlist) {
    await prisma.watchlistItem.upsert({
      where: {
        userId_tmdbId_mediaType: {
          userId: alex.id,
          tmdbId: item.tmdbId,
          mediaType: item.mediaType,
        },
      },
      update: {},
      create: {
        userId: alex.id,
        ...item,
      },
    });
  }

  // 4. Seed Community Reviews
  await prisma.movieReview.upsert({
    where: {
      userId_tmdbId_mediaType: {
        userId: alex.id,
        tmdbId: 157336,
        mediaType: 'movie',
      },
    },
    update: {},
    create: {
      userId: alex.id,
      tmdbId: 157336,
      mediaType: 'movie',
      title: 'Interstellar',
      posterPath: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      rating: 10,
      content: 'Hans Zimmer’s pipe organ score paired with Thorne’s accurate gravitational physics makes this a crowning achievement of contemporary cinema. The docking sequence remains unmatched.',
    },
  });

  await prisma.movieReview.upsert({
    where: {
      userId_tmdbId_mediaType: {
        userId: sophia.id,
        tmdbId: 496243,
        mediaType: 'movie',
      },
    },
    update: {},
    create: {
      userId: sophia.id,
      tmdbId: 496243,
      mediaType: 'movie',
      title: 'Parasite',
      posterPath: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
      rating: 10,
      content: 'A masterclass in spatial architecture and visual metaphor. Every staircase descent tells a sociological story. Bong Joon-ho at the height of his powers.',
    },
  });

  await prisma.movieReview.upsert({
    where: {
      userId_tmdbId_mediaType: {
        userId: marcus.id,
        tmdbId: 693134,
        mediaType: 'movie',
      },
    },
    update: {},
    create: {
      userId: marcus.id,
      tmdbId: 693134,
      mediaType: 'movie',
      title: 'Dune: Part Two',
      posterPath: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      rating: 9,
      content: 'The sound design alone shakes the room. Austin Butler as Feyd-Rautha was chilling, and the worm-riding scene delivered complete visual spectacle.',
    },
  });

  console.log('✅ Added community reviews');

  // 5. Seed a Featured Watch Room
  const watchRoom = await prisma.watchRoom.upsert({
    where: { roomCode: 'CNM-777' },
    update: {},
    create: {
      roomCode: 'CNM-777',
      hostId: alex.id,
      tmdbId: 157336,
      mediaType: 'movie',
      title: 'Interstellar',
      posterPath: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      backdropPath: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
      status: 'WAITING',
      providerName: 'Paramount Plus',
      providerUrl: 'https://www.paramountplus.com',
      participants: {
        create: [
          { userId: alex.id, isReady: true },
          { userId: sophia.id, isReady: true },
        ],
      },
      messages: {
        create: [
          {
            userId: alex.id,
            content: 'Welcome to the Interstellar 10th anniversary watch party! Grab your popcorn 🍿',
            type: 'CHAT',
          },
          {
            userId: sophia.id,
            content: 'Ready! Syncing our soundbars now 🚀',
            type: 'CHAT',
          },
          {
            userId: alex.id,
            content: '🔥',
            type: 'REACTION',
          },
        ],
      },
    },
  });

  console.log(`✅ Created active watch room: ${watchRoom.roomCode}`);
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
