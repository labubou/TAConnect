import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError('');
    setMessage('');
  };

  const handleSubmit = async () => {
    // Validation ya karim ya bassem ya joseph
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post('/api/auth/password-reset/', { email: email.trim() });
      const data = res.data;
      setMessage(data.message || 'If an account with this email exists, a reset link has been sent.');
      setEmail('');
    } catch (err) {
      const resp = err.response;
      if (resp && resp.data) {
        setError(resp.data.error || JSON.stringify(resp.data));
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
              Forgot Password?
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
              No worries! Enter your email and we'll send you reset instructions.
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
                  <p className="text-sm mt-1">Please check your email inbox and spam folder.</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onKeyPress={handleKeyPress}
                className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-black placeholder-gray-500'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                placeholder="Enter your email address"
                disabled={loading}
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Enter the email associated with your account
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !email.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'border-gray-300 bg-white text-black placeholder-gray-500'} hover:underline flex items-center justify-center mx-auto transition`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </button>
          </div>

          <div className={`mt-6 p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium mb-2`}>
              Need help?
            </p>
            <ul className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
              <li>• Make sure you enter the correct email address</li>
              <li>• Check your spam folder if you don't receive the email</li>
              <li>• Contact support if you continue to have issues</li>
            </ul>
          </div>
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

export default ForgotPasswordPage;