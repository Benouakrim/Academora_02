import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import './App.css';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// Layouts
const RootLayout = lazy(() => import('@/layouts/RootLayout'));
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const ProtectedRoute = lazy(() => import('@/components/auth/ProtectedRoute'));

// Pages
const LandingPage = lazy(() => import('@/pages/landing/LandingPage'));
const SearchPage = lazy(() => import('@/pages/search/SearchPage'));
const ComparePage = lazy(() => import('@/pages/compare/ComparePage'));
const UniversityPage = lazy(() => import('@/pages/university/UniversityPage'));
const UniversityClaimPage = lazy(() => import('@/pages/university/UniversityClaimPage'));
const BlogPage = lazy(() => import('@/pages/blog/BlogPage'));
const ArticlePage = lazy(() => import('@/pages/blog/ArticlePage'));
const UserArticleEditor = lazy(() => import('@/pages/blog/UserArticleEditor'));
const StaticContentPage = lazy(() => import('@/pages/StaticContentPage'));

// Dashboard & Auth
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const SavedPage = lazy(() => import('@/pages/dashboard/SavedPage'));
const ProfilePage = lazy(() => import('@/pages/dashboard/profile/ProfilePage'));
const ReferralDashboardPage = lazy(() => import('@/pages/dashboard/ReferralDashboardPage'));
const MatchingEnginePage = lazy(() => import('@/pages/dashboard/MatchingEnginePage'));
const SignIn = lazy(() => import('@clerk/clerk-react').then(m => ({ default: m.SignIn })));
const SignUp = lazy(() => import('@clerk/clerk-react').then(m => ({ default: m.SignUp })));

// Admin
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminUniversitiesPage = lazy(() => import('@/pages/admin/universities/AdminUniversitiesPage'));
const UniversityEditorPage = lazy(() => import('@/pages/admin/universities/UniversityEditorPage'));
const ArticlesList = lazy(() => import('@/pages/admin/ArticlesList'));
const ArticleEditorPage = lazy(() => import('@/pages/admin/articles/ArticleEditorPage'));
const ReviewModerationPage = lazy(() => import('@/pages/admin/reviews/ReviewModerationPage'));
const AdminHealthPage = lazy(() => import('@/pages/admin/AdminHealthPage'));
const AdminGroupsPage = lazy(() => import('@/pages/admin/AdminGroupsPage'));
const GroupEditorPage = lazy(() => import('@/pages/admin/GroupEditorPage'));
const AdminClaimsPage = lazy(() => import('@/pages/admin/AdminClaimsPage'));
const AdminMicroContentPage = lazy(() => import('@/pages/admin/AdminMicroContentPage'));

// User Pages
const MyClaimsPage = lazy(() => import('@/pages/dashboard/MyClaimsPage'));
const GroupsPage = lazy(() => import('@/pages/GroupsPage'));
const GroupDetailPage = lazy(() => import('@/pages/GroupDetailPage'));

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<RootLayout />}> 
              <Route index element={<LandingPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="compare" element={<ComparePage />} />
              <Route path="blog" element={<BlogPage />} />
              <Route path="blog/:slug" element={<ArticlePage />} />
              <Route path="university/:slug" element={<UniversityPage />} />
              <Route path="university-claims/claim" element={<UniversityClaimPage />} />
              <Route path="groups" element={<GroupsPage />} />
              <Route path="groups/:slug" element={<GroupDetailPage />} />
              <Route path="about" element={<StaticContentPage slug="about" />} />
              <Route path="contact" element={<StaticContentPage slug="contact" />} />
              <Route path="privacy" element={<StaticContentPage slug="privacy" />} />
              <Route path="terms" element={<StaticContentPage slug="terms" />} />
              <Route path="sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
              <Route path="sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
            </Route>

            <Route element={<ProtectedRoute />}> 
              <Route path="/write" element={<UserArticleEditor />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="saved" element={<SavedPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="referrals" element={<ReferralDashboardPage />} />
                <Route path="claims" element={<MyClaimsPage />} />
                <Route path="matching-engine" element={<MatchingEnginePage />} />
              </Route>
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute />}> 
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="universities" element={<AdminUniversitiesPage />} />
                <Route path="universities/new" element={<UniversityEditorPage />} />
                <Route path="universities/:id" element={<UniversityEditorPage />} />
                <Route path="groups" element={<AdminGroupsPage />} />
                <Route path="groups/new" element={<GroupEditorPage />} />
                <Route path="groups/:id" element={<GroupEditorPage />} />
                <Route path="articles" element={<ArticlesList />} />
                <Route path="articles/new" element={<ArticleEditorPage />} />
                <Route path="articles/edit/:id" element={<ArticleEditorPage />} />
                <Route path="reviews" element={<ReviewModerationPage />} />
                <Route path="claims" element={<AdminClaimsPage />} />
                <Route path="micro-content" element={<AdminMicroContentPage />} />
                <Route path="health" element={<AdminHealthPage />} />
              </Route>
            </Route>

            <Route path="*" element={<div className="p-10 text-center">404 - Page Not Found</div>} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
