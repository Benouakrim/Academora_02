import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface ProfileVisibilitySettings {
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

export interface PublicProfile {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS_ONLY';
  email?: string;
  academicInfo?: {
    gpa?: number;
    preferredMajor?: string;
    focusArea?: string;
    personaRole?: string;
    testScores?: {
      sat?: number;
      act?: number;
      gre?: number;
    };
  };
  hobbies?: string[];
  languagesSpoken?: string[];
  careerGoals?: string[];
  dreamJobTitle?: string;
  badges?: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    iconUrl?: string;
    category?: string;
    earnedAt: string;
  }>;
  stats?: {
    reviewsCount: number;
    articlesCount: number;
    savedUniversitiesCount?: number;
  };
  recentReviews?: Array<{
    id: string;
    rating: number;
    title: string;
    content: string;
    universityName: string;
    universitySlug: string;
    createdAt: string;
  }>;
  recentArticles?: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    createdAt: string;
  }>;
  createdAt: string;
  isPrivate?: boolean;
  message?: string;
}

/**
 * Hook to fetch public profile by username
 */
export function usePublicProfile(username: string | null | undefined) {
  return useQuery({
    queryKey: ['publicProfile', username],
    queryFn: async () => {
      if (!username) return null;
      const { data } = await api.get(`/profiles/${username}`);
      return data.data as PublicProfile;
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
