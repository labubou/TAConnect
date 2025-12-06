import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { GlobalLoadingProvider } from './contexts/GlobalLoadingContext'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import ProtectedRoute from './components/General/ProtectedRoute';
import PublicRoute from './components/General/PublicRoute';
import PublicBookingRedirect from './components/General/PublicBookingRedirect';
import { SkeletonLoader } from './components/General/SkeletonLoader';
import GlobalLoadingOverlay from './components/General/GlobalLoadingOverlay';
import { useTheme } from './contexts/ThemeContext';

// Eager-loaded critical pages
import LandingPage from './pages/main/LandingPage'
import LoginPage from './pages/main/LoginPage';
import RegisterPage from './pages/main/RegisterPage';
import GoogleCallback from './pages/main/GoogleCallback';
import SelectUserType from './pages/main/SelectUserType';
import PublicBookingPage from './pages/public/PublicBookingPage';

// Lazy-loaded pages for better code splitting
const VerifyEmailPage = lazy(() => import('./pages/main/VerifyEmailPage'));
const VerifyEmailChangePage = lazy(() => import('./pages/main/VerifyEmailChangePage'));
const ForgotPasswordPage = lazy(() => import('./pages/main/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/main/ResetPasswordPage'));
const ProfilePage = lazy(() => import('./pages/main/ProfilePage'));
const TAPage = lazy(() => import('./pages/ta/TAPage'));
const ManageCourses = lazy(() => import('./pages/ta/ManageCourses'));
const Dashboard = lazy(() => import('./pages/ta/Dashboard'));
const AnalyticsDashboard = lazy(() => import('./pages/ta/AnalyticsDashboard'));
const EmailPreferencesPage = lazy(() => import('./pages/ta/EmailPreferencesPage'));
const InstructorManageBookings = lazy(() => import('./pages/ta/ManageBookings'));
const StudentHomePage = lazy(() => import('./pages/student/studentHomePage'));
const BookPage = lazy(() => import('./pages/student/BookPage'));
const ManageBookingsPage = lazy(() => import('./pages/student/ManageBookingsPage'));
const StudentSettingsPage = lazy(() => import('./pages/student/SettingsPage'));

/**
 * Fallback component displayed while lazy-loaded pages are loading
 */
const PageLoader = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full max-w-md mx-auto px-4">
        <SkeletonLoader isDark={isDark} count={5} height="h-16" className="mb-4" />
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <GlobalLoadingProvider>
            <Router>
              <GlobalLoadingOverlay />
              <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
                <Routes>
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <LandingPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route 
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />
              <Route 
                path="/verify-email"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <VerifyEmailPage />
                  </Suspense>
                }
              />  
              <Route 
                path="/verify-email/:uid/:token"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <VerifyEmailPage />
                  </Suspense>
                }
              />
              <Route 
                path="/verify-email-change/:uid/:token/:newEmail"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <VerifyEmailChangePage />
                  </Suspense>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <Suspense fallback={<PageLoader />}>
                      <ForgotPasswordPage />
                    </Suspense>
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ResetPasswordPage />
                  </Suspense>
                }
              />
              <Route
                path="/auth/google/callback"
                element={<GoogleCallback />}
              />
              <Route
                path="/select-user-type"
                element={<SelectUserType />}
              />
              <Route
                path="/book"
                element={<PublicBookingPage />}
              />
              <Route 
                path="/ta" 
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <Dashboard />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ta/profile" 
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <ProfilePage />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ta/manage-courses" 
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <ManageCourses />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ta/analytics" 
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <AnalyticsDashboard />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ta/email-preferences" 
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <EmailPreferencesPage />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ta/manage-bookings" 
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <InstructorManageBookings />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />

              {/* Student Routes */}
              <Route 
                path="/student" 
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <StudentHomePage />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/profile" 
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <ProfilePage />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/book" 
                element={
                  <PublicBookingRedirect>
                    <ProtectedRoute>
                      <Suspense fallback={<PageLoader />}>
                        <BookPage />
                      </Suspense>
                    </ProtectedRoute>
                  </PublicBookingRedirect>
                } 
              />
              <Route 
                path="/student/manage-booked" 
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <ManageBookingsPage />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/settings" 
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <StudentSettingsPage />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
            </Routes>
              </div>
            </Router>
          </GlobalLoadingProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
