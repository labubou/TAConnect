import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/main/LandingPage'
import LoginPage from './pages/main/LoginPage';
import RegisterPage from './pages/main/RegisterPage';
import VerifyEmailPage from './pages/main/VerifyEmailPage';
import ForgotPasswordPage from './pages/main/ForgotPasswordPage';
import ResetPasswordPage from './pages/main/ResetPasswordPage';
import GoogleCallback from './pages/main/GoogleCallback';
import SelectUserType from './pages/main/SelectUserType';
import PublicRoute from './components/PublicRoute';
import CreateCourse from './pages/ta/CreateCourse';
import TAPage from './pages/ta/TAPage';
import ProfilePage from './pages/ta/ProfilePage';

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
                  <div>
                    <LandingPage />
                  </div>
                } 
              />
               <Route 
                path="/login"
                element={<LoginPage />}
              />
              <Route 
                path="/register"
                element={<RegisterPage />}
              />
              <Route 
                path="/verify-email"
                element={<VerifyEmailPage />}
              />
              <Route
                path="/forgot-password"
                element={<ForgotPasswordPage />}
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
              <Route path="/ta" element={<TAPage />} />
              <Route path="/ta/profile" element={<ProfilePage />} />
              <Route path="/ta/create-course" element={<CreateCourse />} />
              {/* Add more routes here */}
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
