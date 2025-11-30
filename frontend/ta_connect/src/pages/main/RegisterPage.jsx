import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGlobalLoading } from '../../contexts/GlobalLoadingContext';
import ThemeToggle from '../../components/General/ThemeToggle';
import LanguageToggle from '../../components/General/LanguageToggle';
import Footer from '../../components/General/Footer';
import Logo2 from '../../assets/Logo2.png';
import strings from '../../strings/registerPageStrings';
import axios from 'axios';

function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { startLoading, stopLoading, isLoading: globalIsLoading } = useGlobalLoading();
  const t = strings[language];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const returnUrl = searchParams.get('returnUrl');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    user_type: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
    setError('');
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation ya karim ya bassem ya joseph x2 

    if (!formData.first_name.trim()) {
      newErrors.first_name = t.validation.firstNameRequired;
    }


    if (!formData.last_name.trim()) {
      newErrors.last_name = t.validation.lastNameRequired;
    }


    if (!formData.username.trim()) {
      newErrors.username = t.validation.usernameRequired;
    }


    if (!formData.email.trim()) {
      newErrors.email = t.validation.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.validation.invalidEmail;
    }


    if (!formData.password) {
      newErrors.password = t.validation.passwordRequired;
    } else if (formData.password.length < 8) {
      newErrors.password = t.validation.passwordMinLength;
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = t.validation.passwordUppercase;
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = t.validation.passwordLowercase;
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = t.validation.passwordNumber;
    }


    if (!formData.password2) {
      newErrors.password2 = t.validation.confirmPasswordRequired;
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = t.validation.passwordsDoNotMatch;
    }

    if (!formData.user_type) {
      newErrors.user_type = t.validation.userTypeRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    startLoading('register', 'Creating account...');
    setError('');
    setSuccess('');

    try {
      console.log('Submitting registration data:', formData);
      const response = await axios.post('/api/auth/register/', formData);
      console.log('Registration response:', response.data);
      
      if (response.data) {
        stopLoading('register');
        setSuccess(response.data.message || t.messages.success);
        
        // If there's a returnUrl (e.g., from booking link), redirect to login with returnUrl
        if (returnUrl) {
          // Show success message briefly, then redirect
          setTimeout(() => {
            navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&registered=true`);
          }, 1500);
        } else {
          // Clear the form for regular registration
          setFormData({
            username: '',
            email: '',
            password: '',
            password2: '',
            first_name: '',
            last_name: '',
            user_type: '',
          });
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle rate limiting
      if (err.response?.status === 429) {
        setError('Too many registration attempts. Please wait an hour and try again.');
        return;
      }
      
      // Handle detailed error messages
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Check if there are field-specific errors
        if (typeof errorData === 'object' && !errorData.error && !errorData.message && !errorData.detail) {
          // Handle field-specific errors
          const fieldErrors = {};
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key])) {
              fieldErrors[key] = errorData[key][0];
            } else {
              fieldErrors[key] = errorData[key];
            }
          });
          setErrors(fieldErrors);
          setError('Please check the form for errors.');
        } else {
          // Handle general error message
          setError(errorData.error || errorData.message || errorData.detail || t.messages.error);
        }
      } else {
        setError(t.messages.error);
      }
      stopLoading('register');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navbar */}
      <nav className={`w-full flex items-center justify-between p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div 
          className="cursor-pointer"
          onClick={() => navigate('/')}
        >
          <img src={Logo2} alt="TA Connect Logo" className="logo" />
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {t.navbar.login}
          </button>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4 py-8">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg w-full max-w-2xl`}>
          <h1 className={`text-3xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t.heading.title}
          </h1>
          <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            {t.heading.subtitle}
          </p>

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
          {success && (
            <div className={`mb-4 p-4 ${isDark ? 'bg-green-900 border-green-600 text-green-200' : 'bg-green-100 border-green-400 text-green-700'} border rounded`}>
              <div className="flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-lg mb-1">✉️ {success}</p>
                  <p className="text-sm">{t.messages.successSubtext}</p>
                  <p className="text-sm mt-2">Check your spam folder if you don't see the email.</p>
                  <button
                    onClick={() => navigate(returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login')}
                    className={`mt-3 px-4 py-2 ${isDark ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white rounded transition`}
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  {t.form.firstName} *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.first_name 
                      ? 'border-red-500' 
                      : isDark ? 'border-gray-600' : 'border-gray-300'
                  } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-black'} rounded-lg focus:ring-2 focus:ring-blue-500 transition-transform focus:scale-105`}
                  placeholder={t.form.firstNamePlaceholder}
                />
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  {t.form.lastName} *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.last_name 
                      ? 'border-red-500' 
                      : isDark ? 'border-gray-600' : 'border-gray-300'
                  } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-black'} rounded-lg focus:ring-2 focus:ring-blue-500 transition-transform focus:scale-105`}
                  placeholder={t.form.lastNamePlaceholder}
                />
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {t.form.username} *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.username 
                    ? 'border-red-500' 
                    : isDark ? 'border-gray-600' : 'border-gray-300'
                } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-black'} rounded-lg focus:ring-2 focus:ring-blue-500 transition-transform focus:scale-105`}
                placeholder={t.form.usernamePlaceholder}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {t.form.email} *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.email 
                    ? 'border-red-500' 
                    : isDark ? 'border-gray-600' : 'border-gray-300'
                } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-black'} rounded-lg focus:ring-2 focus:ring-blue-500 transition-transform focus:scale-105`}
                placeholder={t.form.emailPlaceholder}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  {t.form.password} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 pr-10 border ${
                      errors.password 
                        ? 'border-red-500' 
                        : isDark ? 'border-gray-600' : 'border-gray-300'
                    } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-black'} rounded-lg focus:ring-2 focus:ring-blue-500 transition-transform focus:scale-105`}
                    placeholder={t.form.passwordPlaceholder}
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
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  {t.form.confirmPassword} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword2 ? 'text' : 'password'}
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 pr-10 border ${
                      errors.password2 
                        ? 'border-red-500' 
                        : isDark ? 'border-gray-600' : 'border-gray-300'
                    } ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-black'} rounded-lg focus:ring-2 focus:ring-blue-500 transition-transform focus:scale-105`}
                    placeholder={t.form.confirmPasswordPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword2(!showPassword2)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-transparent focus:outline-none"
                  >
                    <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword2 ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      )}
                    </svg>
                  </button>
                </div>
                {errors.password2 && (
                  <p className="text-red-500 text-xs mt-1">{errors.password2}</p>
                )}
              </div>
            </div>

            {/* User Type */}
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                {t.form.userType} *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, user_type: 'student' })}
                  className={`p-4 rounded-lg border-2 transition ${
                    formData.user_type === 'student'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-2xl mb-2">🎓</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t.form.userTypeStudent}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, user_type: 'instructor' })}
                  className={`p-4 rounded-lg border-2 transition ${
                    formData.user_type === 'instructor'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-2xl mb-2">👨‍🏫</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t.form.userTypeInstructor}
                    </span>
                  </div>
                </button>
              </div>
              {errors.user_type && (
                <p className="text-red-500 text-xs mt-1">{errors.user_type}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition font-medium"
            >
              {loading ? t.form.registeringButton : t.form.registerButton}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.footer.haveAccount}{' '}
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-lg text-white transition shadow bg-blue-900 hover:bg-blue-950 dark:bg-blue-900/80 dark:hover:bg-blue-900"

              >
                {t.footer.loginLink}
              </button>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default RegisterPage;

