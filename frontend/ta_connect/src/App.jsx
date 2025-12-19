import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { GlobalLoadingProvider } from './contexts/GlobalLoadingContext'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import ProtectedRoute from './components/General/ProtectedRoute';
import TARoute from './components/General/TARoute';
import StudentRoute from './components/General/StudentRoute';
import PublicRoute from './components/General/PublicRoute';
import PublicBookingRedirect from './components/General/PublicBookingRedirect';
import { SkeletonLoader } from './components/General/SkeletonLoader';
import GlobalLoadingOverlay from './components/General/GlobalLoadingOverlay';
import { useTheme } from './contexts/ThemeContext';
import { registerServiceWorker } from './utils/registerServiceWorker';

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
const AboutPage = lazy(() => import('./pages/main/AboutPage'));
const ContactPage = lazy(() => import('./pages/main/ContactPage'));
const TAPage = lazy(() => import('./pages/ta/TAPage'));
const ManageCourses = lazy(() => import('./pages/ta/ManageCourses'));
const Dashboard = lazy(() => import('./pages/ta/Dashboard'));
const TASettingsPage = lazy(() => import('./pages/ta/SettingsPage'));
const InstructorManageBookings = lazy(() => import('./pages/ta/ManageBookings'));
const PendingBookingsPage = lazy(() => import('./pages/ta/PendingBookingsPage'));
const StudentHomePage = lazy(() => import('./pages/student/studentHomePage'));
const BookPage = lazy(() => import('./pages/student/BookPage'));
const ManageBookingsPage = lazy(() => import('./pages/student/ManageBookingsPage'));
const StudentSettingsPage = lazy(() => import('./pages/student/SettingsPage'));

// PWA Components
const InstallPrompt = lazy(() => import('./components/pwa/InstallPrompt'));
const OfflineIndicator = lazy(() => import('./components/pwa/OfflineIndicator'));
const UpdatePrompt = lazy(() => import('./components/pwa/UpdatePrompt'));
const InstallButton = lazy(() => import('./components/pwa/InstallButton'));

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
  // Register service worker on app mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <GlobalLoadingProvider>
            <Router>
              <GlobalLoadingOverlay />
              <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
                {/* Global PWA Components */}
                <InstallPrompt />
                <OfflineIndicator />
                <UpdatePrompt />
                <Routes>
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <LandingPage />
                    <InstallButton className="fixed bottom-4 right-4 z-50" />
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
                path="/about"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AboutPage />
                  </Suspense>
                }
              />
              <Route 
                path="/contact"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ContactPage />
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
                  <TARoute>
                    <Suspense fallback={<PageLoader />}>
                      <Dashboard />
                    </Suspense>
                  </TARoute>
                } 
              />
              <Route 
                path="/ta/settings" 
                element={
                  <TARoute>
                    <Suspense fallback={<PageLoader />}>
                      <TASettingsPage />
                    </Suspense>
                  </TARoute>
                } 
              />
              <Route 
                path="/ta/profile" 
                element={
                  <TARoute>
                    <Suspense fallback={<PageLoader />}>
                      <ProfilePage />
                    </Suspense>
                  </TARoute>
                } 
              />
              <Route 
                path="/ta/manage-courses" 
                element={
                  <TARoute>
                    <Suspense fallback={<PageLoader />}>
                      <ManageCourses />
                    </Suspense>
                  </TARoute>
                } 
              />
              <Route 
                path="/ta/manage-bookings" 
                element={
                  <TARoute>
                    <Suspense fallback={<PageLoader />}>
                      <InstructorManageBookings />
                    </Suspense>
                  </TARoute>
                } 
              />
              <Route 
                path="/ta/pending-bookings" 
                element={
                  <TARoute>
                    <Suspense fallback={<PageLoader />}>
                      <PendingBookingsPage />
                    </Suspense>
                  </TARoute>
                } 
              />

              {/* Student Routes */}
              <Route 
                path="/student" 
                element={
                  <StudentRoute>
                    <Suspense fallback={<PageLoader />}>
                      <StudentHomePage />
                    </Suspense>
                  </StudentRoute>
                } 
              />
              <Route 
                path="/student/profile" 
                element={
                  <StudentRoute>
                    <Suspense fallback={<PageLoader />}>
                      <ProfilePage />
                    </Suspense>
                  </StudentRoute>
                } 
              />
              <Route 
                path="/student/book" 
                element={
                  <PublicBookingRedirect>
                    <StudentRoute>
                      <Suspense fallback={<PageLoader />}>
                        <BookPage />
                      </Suspense>
                    </StudentRoute>
                  </PublicBookingRedirect>
                } 
              />
              <Route 
                path="/student/manage-booked" 
                element={
                  <StudentRoute>
                    <Suspense fallback={<PageLoader />}>
                      <ManageBookingsPage />
                    </Suspense>
                  </StudentRoute>
                } 
              />
              <Route 
                path="/student/settings" 
                element={
                  <StudentRoute>
                    <Suspense fallback={<PageLoader />}>
                      <StudentSettingsPage />
                    </Suspense>
                  </StudentRoute>
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
