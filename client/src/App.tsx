import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import './App.css';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const RootLayout = lazy(() => import('@/layouts/RootLayout'));
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const ProtectedRoute = lazy(() => import('@/components/auth/ProtectedRoute'));
const LandingPage = lazy(() => import('@/pages/landing/LandingPage'));
const SearchPage = lazy(() => import('@/pages/search/SearchPage'));
const UniversityPage = lazy(() => import('@/pages/university/UniversityPage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminUniversitiesPage = lazy(() => import('@/pages/admin/universities/AdminUniversitiesPage'));
const UniversityEditorPage = lazy(() => import('@/pages/admin/universities/UniversityEditorPage'));
const AdminHealthPage = lazy(() => import('@/pages/admin/AdminHealthPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const SavedPage = lazy(() => import('@/pages/dashboard/SavedPage'));
const ProfilePage = lazy(() => import('@/pages/dashboard/profile/ProfilePage'));
const SignIn = lazy(() => import('@clerk/clerk-react').then(m => ({ default: m.SignIn })));
const SignUp = lazy(() => import('@clerk/clerk-react').then(m => ({ default: m.SignUp })));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<RootLayout />}> 
            <Route index element={<LandingPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="university/:slug" element={<UniversityPage />} />
            <Route path="sign-in" element={<SignIn routing="path" path="/sign-in" />} />
            <Route path="sign-up" element={<SignUp routing="path" path="/sign-up" />} />
          </Route>

          <Route element={<ProtectedRoute />}> 
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="saved" element={<SavedPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute />}> 
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="universities" element={<AdminUniversitiesPage />} />
              <Route path="universities/new" element={<UniversityEditorPage />} />
              <Route path="universities/:id" element={<UniversityEditorPage />} />
              <Route path="health" element={<AdminHealthPage />} />
            </Route>
          </Route>

          <Route path="*" element={<div className="p-6">Not Found</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
