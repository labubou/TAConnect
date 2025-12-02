import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGlobalLoading } from '../../contexts/GlobalLoadingContext';
import axios from 'axios';
import strings from '../../strings/googleCallbackStrings';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { startLoading, stopLoading, isLoading: globalIsLoading } = useGlobalLoading();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const hasProcessed = useRef(false);

  const isDark = theme === 'dark';
  const t = strings[language];

  const googleAuth = async (code) => {
    try {
      startLoading('google-auth', t.processing.authenticating);
      const response = await axios.post('/api/auth/google/authenticate/', {
        code,
      });
      
      const { access, refresh, user: userData, is_new_user, needs_user_type } = response.data;
      stopLoading('google-auth');
      
      return { 
        success: true, 
        isNewUser: is_new_user || false,
        needsUserType: needs_user_type || false,
        data: { access, refresh, user: userData }
      };
    } catch (error) {
      stopLoading('google-auth');
      console.error('Google authentication failed:', error);
      
      let errorMessage = t.error.failed;
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 500) {
        errorMessage = t.error.server;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  useEffect(() => {
    const handleGoogleCallback = async () => {
      if (hasProcessed.current) return;
      hasProcessed.current = true;
      
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(t.error.cancelled);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage(t.error.noCode);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        const result = await googleAuth(code);
        
        if (result.success) {
          login(result.data);
          setStatus('success');
          setIsNewUser(result.isNewUser);
          
          // Check if user needs to set user_type
          if (result.needsUserType) {
            setMessage(t.success.messageUserType);
            setTimeout(() => navigate('/select-user-type'), 2000);
          } else {
            if (result.isNewUser) {
              setMessage(t.success.messageNew);
            } else {
              setMessage(t.success.messageLogin);
            }
            
            // Navigate based on user type
            const userType = result.data?.user?.user_type;
            if (userType === 'instructor') {
              setTimeout(() => navigate('/ta'), 2000);
            } else if (userType === 'student') {
              setTimeout(() => navigate('/student'), 2000);
            } else {
              setTimeout(() => navigate('/'), 2000);
            }
          }
        } else {
          setStatus('error');
          setMessage(result.error || 'Google authentication failed.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error) {
        setStatus('error');
        setMessage(t.error.unexpected);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, login, navigate]);

  const getIcon = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-lg border-2 border-gray-100">
            <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6 shadow-lg animate-pulse-slow">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center p-4`}>
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg w-full max-w-md text-center`}>
        {getIcon()}
        
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
          {status === 'processing' && t.processing.title}
          {status === 'success' && (isNewUser ? t.success.titleNew : t.success.titleReturning)}
          {status === 'error' && t.error.title}
        </h1>
        
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
          {message}
        </p>

        {status === 'processing' && (
            <div className="mt-6">
            <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
              <div className="bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
            <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'} text-sm mt-2`}>{t.processing.authenticating}</p>
          </div>
        )}

        {status === 'success' && (
          <div className={`mt-6 p-4 ${isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-xl`}>
            <div className="flex items-center justify-center">
              <svg className={`w-5 h-5 ${isDark ? 'text-blue-300' : 'text-blue-500'} mr-3`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className={`${isDark ? 'text-blue-300' : 'text-blue-700'} font-medium text-sm`}>
                {t.success.redirecting}
              </span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className={`mt-6 p-4 ${isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} border rounded-xl`}>
            <div className="flex items-start">
              <svg className={`w-5 h-5 ${isDark ? 'text-red-300' : 'text-red-500'} mr-3 mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-left">
                <p className={`${isDark ? 'text-red-300' : 'text-red-700'} font-medium text-sm`}>{t.error.heading}</p>
                <p className={`${isDark ? 'text-red-300' : 'text-red-600'} text-sm mt-1`}>{message}</p>
              </div>
            </div>
          </div>
        )}

        <div className={`mt-8 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'} text-xs`}>
            Powered by Google OAuth 2.0 • Secure Authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;
