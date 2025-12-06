import prisma from '../lib/prisma';

export class AdminService {
  static async getDashboardStats() {
    const [
      usersCount,
      universitiesCount,
      articlesCount,
      reviewsCount,
      pendingReviews,
      savedCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.university.count(),
      prisma.article.count(),
      prisma.review.count(),
      prisma.review.count({ where: { status: 'PENDING' } }),
      prisma.savedUniversity.count(),
    ]);

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        avatarUrl: true,
      },
    });

    const recentReviews = await prisma.review.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true } },
        university: { select: { name: true } }
      }
    });

    return {
      counts: {
        users: usersCount,
        universities: universitiesCount,
        articles: articlesCount,
        reviews: reviewsCount,
        pendingReviews,
        savedItems: savedCount
      },
      recentUsers,
      recentReviews
    };
  }
}
