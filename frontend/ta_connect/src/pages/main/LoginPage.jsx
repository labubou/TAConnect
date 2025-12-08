import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ThemeToggle from '../../components/General/ThemeToggle';
import LanguageToggle from '../../components/General/LanguageToggle';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGlobalLoading } from '../../contexts/GlobalLoadingContext';
import axios from 'axios';
import Logo from '../../assets/Logo.png';
import strings from '../../strings/loginPageStrings';
import Footer from '../../components/General/Footer';


function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const { startLoading, stopLoading, isLoading } = useGlobalLoading();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { theme } = useTheme();
    const { language } = useLanguage();
    const t = strings[language];
    const returnUrl = searchParams.get('returnUrl');
    const registered = searchParams.get('registered');
    const [infoMessage, setInfoMessage] = useState(
        registered === 'true' ? 'Registration successful! Please login to continue.' : ''
    );
    
    const handleChange = (e) => {
        setCredentials({
        ...credentials,
        [e.target.name]: e.target.value
        });
        setError('');
    };

  const handleSubmit = async () => {
    setLoading(true);
    startLoading('login', 'Logging in...');
    setError('');

    try {
      const response = await axios.post('/api/auth/login/', credentials);

      if (response.data) {
        // Set tokens immediately and update Authorization header synchronously
        const { access, refresh } = response.data;
        
        // Set Authorization header immediately before AuthContext useEffect runs
        if (access) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        }
        
        // Login and let AuthContext handle fetching user data
        await login({
          access,
          refresh,
          user: response.data.user
        });
        
        // Fetch user data to get user_type for navigation
        try {
          const userResponse = await axios.get('/api/user-data/');
          const userType = userResponse.data?.user_type;
          
          stopLoading('login');
          
          // If there's a returnUrl, redirect to it
          if (returnUrl) {
            navigate(returnUrl);
          }
          // Otherwise navigate based on user type
          else if (userType === 'instructor') {
            navigate('/ta');
          } else if (userType === 'student') {
            navigate('/student');
          }
        } catch (fetchErr) {
          stopLoading('login');
          console.error('Failed to fetch user data:', fetchErr);
          // If fetching user data fails, try to navigate anyway
          // If there's a returnUrl, use it; otherwise default to /ta
          navigate(returnUrl || '/ta');
        }
      }
    } catch (err) {
      // Extract error message properly
      let errorMessage = 'Login failed';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Check for different error formats
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.error) {
          // If error is an object, extract the message
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (typeof errorData.error === 'object') {
            // Handle validation errors from serializer
            const firstKey = Object.keys(errorData.error)[0];
            const firstError = errorData.error[firstKey];
            errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else {
          // If error is an object with unknown structure, try to get first value
          const firstKey = Object.keys(errorData)[0];
          if (firstKey) {
            const firstValue = errorData[firstKey];
            errorMessage = Array.isArray(firstValue) ? firstValue[0] : String(firstValue);
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      stopLoading('login');
    } finally {
      setLoading(false);
    }
  };

  const getGoogleAuthUrl = async () => {
    try {
      const response = await axios.get('/api/auth/google/url/');
      return response.data.auth_url;
    } catch (error) {
      console.error('Failed to get Google auth URL:', error);
      throw error;
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    
    try {
      setGoogleLoading(true);
      const authUrl = await getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      setError(t.googleLoginError);
      setGoogleLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <nav className={`w-full flex items-center justify-between p-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} cursor-pointer`} 
            onClick={() => navigate('/')}>
        <img src={Logo} alt="TA Connect Logo" className="h-14 sm:h-16 md:h-20 w-auto object-contain cursor-pointer transition-transform duration-300 hover:scale-110" />        
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(returnUrl ? `/register?returnUrl=${encodeURIComponent(returnUrl)}` : '/register')}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 hover:scale-105 text-sm sm:text-base font-medium"
          >
            {t.registerButton}
          </button>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg w-full max-w-md`}>
          <h1 className={`text-3xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t.welcomeBack}
          </h1>
          <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            {t.loginMessage}
          </p>

          {infoMessage && (
            <div className={`mb-4 p-3 ${isDark ? 'bg-green-900 border-green-600 text-green-200' : 'bg-green-100 border-green-400 text-green-700'} border rounded`}>
              {infoMessage}
            </div>
          )}

          {error && (
            <div className={`mb-4 p-3 ${isDark ? 'bg-red-900 border-red-600 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} border rounded`}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {t.usernameLabel}
              </label>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                placeholder={t.usernamePlaceholder}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {t.passwordLabel}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                  placeholder={t.passwordPlaceholder}
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
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg text-white transition shadow bg-blue-900 hover:bg-blue-950 dark:bg-blue-900/80 dark:hover:bg-blue-900"
              >
                {loading ? t.loggingInButton : t.loginButton}
              </button>

              <button
                onClick={() => navigate('/forgot-password')}
                className="flex-1 px-4 py-2 rounded-lg text-white transition shadow bg-blue-900 hover:bg-blue-950 dark:bg-blue-900/80 dark:hover:bg-blue-900"
              >
                {t.forgotPassword}
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                  {t.continueWith}
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              className={`w-full flex items-center justify-center gap-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} ${isDark ? 'text-white' : 'text-gray-700'} border ${isDark ? 'border-gray-600' : 'border-gray-300'} py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? 'Redirecting...' : t.googleButton}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.noAccount}{' '}
              <button
                onClick={() => navigate(returnUrl ? `/register?returnUrl=${encodeURIComponent(returnUrl)}` : '/register')}
                className="px-4 py-2 rounded-lg text-white transition shadow bg-blue-900 hover:bg-blue-950 dark:bg-blue-900/80 dark:hover:bg-blue-900"


              >
                {t.registerHere}
              </button>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default LoginPage;