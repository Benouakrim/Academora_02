import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';

interface ProfileVisibilitySettings {
  showEmail?: boolean;
  showTestScores?: boolean;
  showBadges?: boolean;
  showAcademicInfo?: boolean;
  showSavedCount?: boolean;
  showReviews?: boolean;
  showArticles?: boolean;
  showHobbies?: boolean;
  showLanguages?: boolean;
  showCareerGoals?: boolean;
}

const DEFAULT_VISIBILITY_SETTINGS: ProfileVisibilitySettings = {
  showEmail: false,
  showTestScores: false, // Hide by default - sensitive
  showBadges: true,
  showAcademicInfo: true,
  showSavedCount: true,
  showReviews: true,
  showArticles: true,
  showHobbies: true,
  showLanguages: true,
  showCareerGoals: true,
};

export class PublicProfileService {
  /**
   * Get public profile by username
   * Returns filtered data based on profile visibility settings
   */
  static async getPublicProfile(username: string) {
    const user = await (prisma.user.findUnique as any)({
      where: { username },
      include: {
        academicProfile: true,
        badges: {
          include: { badge: true },
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          where: { status: 'APPROVED' },
          include: {
            university: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5, // Show last 5 reviews
        },
        articles: {
          where: { status: 'PUBLISHED' },
          orderBy: { createdAt: 'desc' },
          take: 5, // Show last 5 articles
        },
        _count: {
          select: {
            reviews: { where: { status: 'APPROVED' } },
            articles: { where: { status: 'PUBLISHED' } },
            savedUniversities: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User profile not found');
    }

    // Check if profile is private and requesting user is not the owner
    if ((user as any).profileVisibility === 'PRIVATE') {
      return this.getPrivateProfileResponse();
    }

    // Get visibility settings (merge with defaults)
    const settings: ProfileVisibilitySettings = {
      ...DEFAULT_VISIBILITY_SETTINGS,
      ...((user as any).profileSettings as ProfileVisibilitySettings | null),
    };

    // Build public profile response with filtered data
    return this.buildPublicProfileResponse(user, settings);
  }

  /**
   * Response for private profiles
   */
  private static getPrivateProfileResponse() {
    return {
      isPrivate: true,
      message: 'This profile is private',
    };
  }

  /**
   * Build filtered public profile response
   */
  private static buildPublicProfileResponse(user: any, settings: ProfileVisibilitySettings) {
    const profile: any = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      profileVisibility: user.profileVisibility,
    };

    // Conditionally include optional fields based on visibility settings
    if (settings.showEmail && user.email) {
      profile.email = user.email;
    }

    // Academic information
    if (settings.showAcademicInfo) {
      profile.academicInfo = {
        gpa: user.gpa,
        preferredMajor: user.preferredMajor,
        focusArea: user.focusArea,
        personaRole: user.personaRole,
      };

      if (settings.showTestScores && user.academicProfile) {
        profile.academicInfo.testScores = {
          sat: user.academicProfile.testScores?.SAT?.total,
          act: user.academicProfile.testScores?.ACT?.composite,
        };
      }
    }

    // Personal interests
    if (settings.showHobbies && user.hobbies?.length > 0) {
      profile.hobbies = user.hobbies;
    }

    if (settings.showLanguages && user.languagesSpoken?.length > 0) {
      profile.languagesSpoken = user.languagesSpoken;
    }

    if (settings.showCareerGoals && user.careerGoals?.length > 0) {
      profile.careerGoals = user.careerGoals;
    }

    if (user.dreamJobTitle) {
      profile.dreamJobTitle = user.dreamJobTitle;
    }

    // Badges
    if (settings.showBadges && user.badges?.length > 0) {
      profile.badges = user.badges.map((ub: any) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        slug: ub.badge.slug,
        description: ub.badge.description,
        iconUrl: ub.badge.iconUrl,
        category: ub.badge.category,
        earnedAt: ub.createdAt,
      }));
    }

    // Activity statistics
    profile.stats = {
      reviewsCount: user._count.reviews || 0,
      articlesCount: user._count.articles || 0,
      savedUniversitiesCount: settings.showSavedCount ? user._count.savedUniversities : undefined,
    };

    // Recent activity
    if (settings.showReviews && user.reviews?.length > 0) {
      profile.recentReviews = user.reviews.map((review: any) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        universityName: review.university.name,
        universitySlug: review.university.slug,
        createdAt: review.createdAt,
      }));
    }

    if (settings.showArticles && user.articles?.length > 0) {
      profile.recentArticles = user.articles.map((article: any) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        createdAt: article.createdAt,
      }));
    }

    profile.createdAt = user.createdAt;

    return profile;
  }

  /**
   * Update privacy settings for a user
   */
  static async updatePrivacySettings(
    userId: string,
    updates: {
      username?: string;
      profileVisibility?: string;
      profileSettings?: ProfileVisibilitySettings;
    }
  ) {
    const currentUser = await (prisma.user.findUnique as any)({
      where: { id: userId },
      select: { profileSettings: true },
    });

    if (!currentUser) {
      throw new AppError(404, 'User not found');
    }

    const mergedSettings = {
      ...DEFAULT_VISIBILITY_SETTINGS,
      ...(currentUser.profileSettings as ProfileVisibilitySettings | null),
      ...(updates.profileSettings || {}),
    };

    const updateData: any = {
      profileVisibility: updates.profileVisibility,
      profileSettings: mergedSettings,
    };

    // Only update username if provided
    if (updates.username !== undefined) {
      updateData.username = updates.username;
    }

    const user = await (prisma.user.update as any)({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        profileVisibility: true,
        profileSettings: true,
      },
    });

    return user;
  }

  /**
   * Check if username is available
   */
  static async isUsernameAvailable(username: string): Promise<boolean> {
    const existingUser = await (prisma.user.findUnique as any)({
      where: { username },
    });

    return !existingUser;
  }

  /**
   * Get privacy settings for authenticated user
   */
  static async getPrivacySettings(userId: string) {
    const user = await (prisma.user.findUnique as any)({
      where: { id: userId },
      select: {
        username: true,
        profileVisibility: true,
        profileSettings: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return {
      username: user.username,
      profileVisibility: user.profileVisibility,
      profileSettings: {
        ...DEFAULT_VISIBILITY_SETTINGS,
        ...(user.profileSettings as ProfileVisibilitySettings | null),
      },
    };
  }
}
