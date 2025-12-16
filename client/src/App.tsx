import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import './App.css';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { CookieConsentProvider } from '@/context/CookieConsentContext';
import { CookieConsentBanner } from '@/components/common/CookieConsentBanner';

// Layouts
const RootLayout = lazy(() => import('@/layouts/RootLayout'));
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const ProtectedRoute = lazy(() => import('@/components/auth/ProtectedRoute'));
const AdminOnlyRoute = lazy(() => import('@/components/auth/AdminOnlyRoute'));

// Pages
const LandingPage = lazy(() => import('@/pages/landing/LandingPage'));
const SearchPage = lazy(() => import('@/pages/search/SearchPage'));
const ComparePage = lazy(() => import('@/pages/compare/ComparePage'));
const UniversityPage = lazy(() => import('@/pages/university/UniversityPage'));
const UniversityClaimPage = lazy(() => import('@/pages/university/UniversityClaimPage'));
const BlogPage = lazy(() => import('@/pages/blog/BlogPage'))
const ArticlePage = lazy(() => import('@/pages/blog/ArticlePage'))
const ArticleEditorLayout = lazy(() => import('@/pages/articles/ArticleEditorLayout'))
const CMSDemo = lazy(() => import('@/pages/CMSDemo'))
const StaticContentPage = lazy(() => import('@/pages/StaticContentPage'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));

// Dashboard & Auth
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const SavedPage = lazy(() => import('@/pages/dashboard/SavedPage'));
const SavedComparisonsPage = lazy(() => import('@/pages/dashboard/SavedComparisonsPage'));
const ProfilePage = lazy(() => import('@/pages/dashboard/profile/ProfilePage'));
const BadgesPage = lazy(() => import('@/pages/dashboard/BadgesPage'));
const ReferralDashboardPage = lazy(() => import('@/pages/dashboard/ReferralDashboardPage'));
const MatchingEnginePage = lazy(() => import('@/pages/dashboard/MatchingEnginePage'));
const SignIn = lazy(() => import('@clerk/clerk-react').then(m => ({ default: m.SignIn })));
const SignUp = lazy(() => import('@clerk/clerk-react').then(m => ({ default: m.SignUp })));

// Admin
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AdminAnalyticsPage'))
const AdminUniversitiesPage = lazy(() => import('@/pages/admin/universities/AdminUniversitiesPage'))
const UniversityEditorPage = lazy(() => import('@/pages/admin/universities/UniversityEditorPage'))
const ArticlesList = lazy(() => import('@/pages/admin/ArticlesList'))
const PendingArticlesPage = lazy(() => import('@/pages/admin/articles/PendingArticlesPage'))
const ReviewModerationPage = lazy(() => import('@/pages/admin/reviews/ReviewModerationPage'))
const AdminHealthPage = lazy(() => import('@/pages/admin/AdminHealthPage'));
const AdminGroupsPage = lazy(() => import('@/pages/admin/AdminGroupsPage'));
const GroupEditorPage = lazy(() => import('@/pages/admin/GroupEditorPage'));
const GroupMetricsAdmin = lazy(() => import('@/pages/admin/groups/GroupMetricsAdmin'));
const AdminClaimsPage = lazy(() => import('@/pages/admin/AdminClaimsPage'));
const AdminMicroContentPage = lazy(() => import('@/pages/admin/AdminMicroContentPage'));
const AdminReferralsPage = lazy(() => import('@/pages/admin/AdminReferralsPage'));
const AdminMediaPage = lazy(() => import('@/pages/admin/AdminMediaPage'));

// Dashboard Pages
const MyArticlesPage = lazy(() => import('@/pages/dashboard/MyArticlesPage'));
const MyArticlesAnalyticsPage = lazy(() => import('@/pages/dashboard/MyArticlesAnalyticsPage'));

// User Pages
const MyClaimsPage = lazy(() => import('@/pages/dashboard/MyClaimsPage'));
const NewClaimPage = lazy(() => import('@/pages/dashboard/NewClaimPage'));
const GroupsPage = lazy(() => import('@/pages/GroupsPage'));
const GroupDetailPage = lazy(() => import('@/pages/GroupDetailPage'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const PublicProfilePage = lazy(() => import('@/pages/profile/PublicProfilePage'));

export default function App() {
  // Enable dark mode by default on app load
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.add('dark');
    localStorage.setItem('theme-preference', 'dark');
  }, []);

  return (
    <CookieConsentProvider>
      <BrowserRouter>
        <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <div style={{ transform: 'scale(0.9)', transformOrigin: 'top left', width: '111.111%', height: '111.111%' }}>
            <Routes>
            <Route path="/" element={<RootLayout />}> 
              <Route index element={<LandingPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="compare" element={<ComparePage />} />
              <Route path="blog" element={<BlogPage />} />
              <Route path="blog/:slug" element={<ArticlePage />} />
              <Route path="university/:slug" element={<UniversityPage />} />
              <Route path="university-claims/claim" element={<UniversityClaimPage />} />
              <Route path=":username" element={<PublicProfilePage />} />
              <Route path="@:username" element={<PublicProfilePage />} />
              <Route path="about" element={<StaticContentPage slug="about" />} />
              <Route path="contact" element={<StaticContentPage slug="contact" />} />
              <Route path="privacy" element={<StaticContentPage slug="privacy" />} />                <Route path="cookies" element={<StaticContentPage slug="cookies" />} />              <Route path="terms" element={<StaticContentPage slug="terms" />} />
              <Route path="cms-demo" element={<CMSDemo />} />
              <Route path="sign-in/*" element={<SignIn routing="path" path="/sign-in" afterSignInUrl="/dashboard" />} />
              <Route path="sign-up/*" element={<SignUp routing="path" path="/sign-up" afterSignUpUrl="/dashboard" />} />
            </Route>

            {/* Admin-only public routes (hidden from regular users for launch) */}
            <Route element={<AdminOnlyRoute />}>
              <Route path="/pricing" element={<RootLayout />}>
                <Route index element={<PricingPage />} />
              </Route>
              <Route path="/groups" element={<RootLayout />}>
                <Route index element={<GroupsPage />} />
              </Route>
              <Route path="/groups/:slug" element={<RootLayout />}>
                <Route index element={<GroupDetailPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute />}> 
              <Route path="/articles/:id" element={<ArticleEditorLayout />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="saved" element={<SavedPage />} />
                <Route path="saved-comparisons" element={<SavedComparisonsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="badges" element={<BadgesPage />} />
                <Route path="referrals" element={<ReferralDashboardPage />} />
                <Route path="matching-engine" element={<MatchingEnginePage />} />
              </Route>
            </Route>

            {/* Admin-only dashboard routes (hidden from regular users for launch) */}
            <Route element={<AdminOnlyRoute />}>
              <Route path="/articles/new" element={<ArticleEditorLayout />} />
              <Route path="/dashboard/claims" element={<DashboardLayout />}>
                <Route index element={<MyClaimsPage />} />
              </Route>
              <Route path="/dashboard/claims/new" element={<DashboardLayout />}>
                <Route index element={<NewClaimPage />} />
              </Route>
              <Route path="/dashboard/my-articles" element={<DashboardLayout />}>
                <Route index element={<MyArticlesPage />} />
              </Route>
              <Route path="/dashboard/my-articles/analytics" element={<DashboardLayout />}>
                <Route index element={<MyArticlesAnalyticsPage />} />
              </Route>
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute />}> 
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="universities" element={<AdminUniversitiesPage />} />
                <Route path="universities/new" element={<UniversityEditorPage />} />
                <Route path="universities/:id" element={<UniversityEditorPage />} />
                <Route path="groups" element={<AdminGroupsPage />} />
                <Route path="groups/new" element={<GroupEditorPage />} />
                <Route path="groups/:id" element={<GroupEditorPage />} />
                <Route path="groups/:id/metrics" element={<GroupMetricsAdmin />} />
                <Route path="articles" element={<ArticlesList />} />
                <Route path="articles/pending" element={<PendingArticlesPage />} />
                <Route path="articles/new" element={<ArticleEditorLayout />} />
                <Route path="articles/:id" element={<ArticleEditorLayout />} />
                <Route path="reviews" element={<ReviewModerationPage />} />
                <Route path="claims" element={<AdminClaimsPage />} />
                <Route path="referrals" element={<AdminReferralsPage />} />
                <Route path="micro-content" element={<AdminMicroContentPage />} />
                <Route path="media" element={<AdminMediaPage />} />
                <Route path="health" element={<AdminHealthPage />} />
              </Route>
            </Route>

            <Route path="*" element={<div className="p-10 text-center">404 - Page Not Found</div>} />
          </Routes>
          <CookieConsentBanner />
            </div>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
    </CookieConsentProvider>
  );
}
