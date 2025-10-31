import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import Logo2 from '../../assets/Logo2.png';
import strings from '../../strings/loginPageStrings';
import Footer from '../../components/Footer';


function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { theme } = useTheme();
    const handleChange = (e) => {
        setCredentials({
        ...credentials,
        [e.target.name]: e.target.value
        });
        setError('');
    };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login/', credentials);

      if (response.data) {
        await login({
          access: response.data.access,
          refresh: response.data.refresh,
          user: response.data.user
        });
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed');
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
      setError(strings.googleLoginError);
      setGoogleLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <nav className={`w-full flex items-center justify-between p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} cursor-pointer`} 
            onClick={() => navigate('/')}>
        <img src={Logo2} alt="TA Connect Logo" className="logo" />        
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.location.href = 'https://youtu.be/1t7SYmGC_Lo?si=KjUCp7h_DTkM2lf2'}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {strings.registerButton}
          </button>
          <ThemeToggle />
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg w-full max-w-md`}>
          <h1 className={`text-3xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {strings.welcomeBack}
          </h1>
          <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            {strings.loginMessage}
          </p>

          {error && (
            <div className={`mb-4 p-3 ${isDark ? 'bg-red-900 border-red-600 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} border rounded`}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {strings.usernameLabel}
              </label>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                placeholder={strings.usernamePlaceholder}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {strings.passwordLabel}
              </label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                placeholder={strings.passwordPlaceholder}
              />
            </div>

            <div className="flex justify-end">
            <button
                onClick={() => navigate('/forgot-password')}
                className="px-4 py-2 rounded-lg text-white transition shadow bg-blue-900 hover:bg-blue-950 dark:bg-blue-900/80 dark:hover:bg-blue-900"


            >
                {strings.forgotPassword}
                </button>

            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-white transition shadow bg-blue-900 hover:bg-blue-950 dark:bg-blue-900/80 dark:hover:bg-blue-900"


            >
              {loading ? strings.loggingInButton : strings.loginButton}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                  {strings.continueWith}
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
              {googleLoading ? 'Redirecting...' : strings.googleButton}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {strings.noAccount}{' '}
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 rounded-lg text-white transition shadow bg-blue-900 hover:bg-blue-950 dark:bg-blue-900/80 dark:hover:bg-blue-900"


              >
                {strings.registerHere}
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