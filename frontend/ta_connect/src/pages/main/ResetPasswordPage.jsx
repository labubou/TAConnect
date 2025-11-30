import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useGlobalLoading } from '../../contexts/GlobalLoadingContext';
import ThemeToggle from '../../components/General/ThemeToggle';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { theme } = useTheme();
  const { startLoading, stopLoading, isLoading: globalIsLoading } = useGlobalLoading();

  const navigate = useNavigate();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  useEffect(() => {
    validateToken();
  }, []);

  const validateToken = async () => {
    if (!uid || !token) {
      setError('Invalid password reset link');
      setValidating(false);
      return;
    }

    try {
      startLoading('validate-token', 'Validating reset link...');
      const res = await axios.post('/api/auth/password-reset/validate/', { uid, token });
      if (res.data.valid) {
        stopLoading('validate-token');
        setTokenValid(true);
      } else {
        stopLoading('validate-token');
        setError(res.data.error || 'Invalid or expired password reset link');
      }
    } catch (err) {
      stopLoading('validate-token');
      const resp = err.response;
      if (resp && resp.data) {
        setError(resp.data.error || 'Invalid or expired password reset link');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setValidating(false);
    }
  };

  const validatePassword = (password) => {
    // Validation ya karim ya bassem ya joseph 1
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async () => {
    // Validation ya karim ya bassem ya joseph 2
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Please enter both password fields');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    startLoading('reset-password', 'Resetting password...');
    setError('');
    setMessage('');

    try {
      const res = await axios.post('/api/auth/password-reset/confirm/', {
        uid,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      stopLoading('reset-password');
      setMessage(res.data.message || 'Password has been reset successfully!');
      setNewPassword('');
      setConfirmPassword('');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      stopLoading('reset-password');
      const resp = err.response;
      if (resp && resp.data) {
        if (Array.isArray(resp.data.error)) {
          setError(resp.data.error.join(', '));
        } else {
          setError(resp.data.error || JSON.stringify(resp.data));
        }
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const isDark = theme === 'dark';

  const strings = {
    navbar: {
      login: 'Login',
      register: 'Register',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode'
    },
    footer: {
      copyright: 'TA Connect. All rights reserved.',
      github: 'GitHub',
      about: 'About',
      contact: 'Contact'
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <nav className={`w-full flex items-center justify-between p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div 
          className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} cursor-pointer`} 
          onClick={() => navigate('/')}
        >
          TA Connect
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            {strings.navbar.login}
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {strings.navbar.register}
          </button>
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg w-full max-w-md`}>
          {validating ? (
            <div className="text-center py-8">
              <svg className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Validating reset link...</p>
            </div>
          ) : !tokenValid ? (
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${isDark ? 'bg-red-900' : 'bg-red-100'} mb-4`}>
                <svg className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Invalid Link
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                {error || 'This password reset link is invalid or has expired.'}
              </p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Request New Link
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${isDark ? 'bg-blue-900' : 'bg-blue-100'} mb-4`}>
                  <svg 
                    className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
                    />
                  </svg>
                </div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Reset Password
                </h1>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                  Enter your new password below
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className={`mb-4 p-3 ${isDark ? 'bg-red-900 border-red-600 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} border rounded flex items-start`}>
                  <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Success Message */}
              {message && (
                <div className={`mb-4 p-3 ${isDark ? 'bg-green-900 border-green-600 text-green-200' : 'bg-green-100 border-green-400 text-green-700'} border rounded`}>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium">{message}</p>
                      <p className="text-sm mt-1">Redirecting to login page...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError('');
                        setMessage('');
                      }}
                      onKeyPress={handleKeyPress}
                      className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-black placeholder-gray-500'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10`}
                      placeholder="Enter new password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-transparent focus:outline-none"
                    >
                      <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        )}
                      </svg>
                    </button>
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Must be at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                        setMessage('');
                      }}
                      onKeyPress={handleKeyPress}
                      className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-black placeholder-gray-500'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10`}
                      placeholder="Confirm new password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-transparent focus:outline-none"
                    >
                      <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showConfirmPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !newPassword.trim() || !confirmPassword.trim()}
                  className={`w-full ${isDark ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400' : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300'} text-white py-2 px-4 rounded-lg disabled:cursor-not-allowed transition flex items-center justify-center font-medium`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/login')}
                  className={`px-6 py-2 ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg transition flex items-center justify-center mx-auto focus:outline-none font-medium`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Login
                </button>
              </div>

              <div className={`mt-6 p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium mb-2`}>
                  Password Requirements:
                </p>
                <ul className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Contains at least one number</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      <footer className="w-full bg-white dark:bg-gray-800 py-6 mt-12 shadow-inner">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-gray-600 dark:text-gray-300 text-sm">
          <p>&copy; {new Date().getFullYear()} {strings.footer.copyright}</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <a href="https://github.com/Kbassem10/TAConnect" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">
              {strings.footer.github}
            </a>
            <a href="/about" className="hover:text-blue-600 transition">
              {strings.footer.about}
            </a>
            <a href="/contact" className="hover:text-blue-600 transition">
              {strings.footer.contact}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ResetPasswordPage;