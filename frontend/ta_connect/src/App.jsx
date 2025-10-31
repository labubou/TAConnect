import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/main/LandingPage'
import LoginPage from './pages/main/LoginPage';
import ForgotPasswordPage from './pages/main/ForgotPasswordPage';
import ResetPasswordPage from './pages/main/ResetPasswordPage';

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
                path="/forgot-password"
                element={<ForgotPasswordPage />}
              />
              <Route
                path="/reset-password"
                element={<ResetPasswordPage />}
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
