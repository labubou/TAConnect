import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/main/LandingPage'
import LoginPage from './pages/main/LoginPage';
import RegisterPage from './pages/main/RegisterPage';
import VerifyEmailPage from './pages/main/VerifyEmailPage';
import ForgotPasswordPage from './pages/main/ForgotPasswordPage';
import ResetPasswordPage from './pages/main/ResetPasswordPage';
import GoogleCallback from './pages/main/GoogleCallback';
import SelectUserType from './pages/main/SelectUserType';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import TAPage from './pages/ta/TAPage';
import ProfilePage from './pages/main/ProfilePage';
import ManageCourses from "./pages/ta/ManageCourses";
import StudentHomePage from './pages/student/studentHomePage';
import BookPage from './pages/student/BookPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
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
                element={<VerifyEmailPage />}
              />  
              <Route 
                path="/verify-email/:uid/:token"
                element={<VerifyEmailPage />}
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPasswordPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={<ResetPasswordPage />}
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
                path="/ta" 
                element={
                  <ProtectedRoute>
                    <TAPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ta/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ta/manage-courses" 
                element={
                  <ProtectedRoute>
                    <ManageCourses />
                  </ProtectedRoute>
                } 
              />

              {/* Student Routes */}
              <Route 
                path="/student" 
                element={
                  <ProtectedRoute>
                    <StudentHomePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/book" 
                element={
                  <ProtectedRoute>
                    <BookPage />
                  </ProtectedRoute>
                } 
              />


              {/* Add more routes here */}
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
