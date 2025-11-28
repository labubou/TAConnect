import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import Footer from '../../components/Footer';
import Logo2 from '../../assets/Logo2.png';
import axios from 'axios';

function VerifyEmailChangePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { refreshUser, isAuthenticated } = useAuth();
  const { uid, token, newEmail } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your new email...');

  useEffect(() => {
    const verifyEmailChange = async () => {
      // Validate URL parameters
      if (!uid || !token || !newEmail) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
        return;
      }

      try {
        const response = await axios.post('/api/profile/verify-email-change/', {
          uid,
          token,
          new_email: decodeURIComponent(newEmail),
        });

        if (response.data) {
          setStatus('success');
          setMessage(response.data.message || 'Your email has been updated successfully!');

          // If user is logged in, refresh their data
          if (isAuthenticated) {
            try {
              await refreshUser();
            } catch (err) {
              console.error('Failed to refresh user after email change:', err);
            }
          }

          // Redirect to profile after 3 seconds
          setTimeout(() => {
            if (isAuthenticated) {
              navigate('/ta/profile');
            } else {
              navigate('/login');
            }
          }, 3000);
        }
      } catch (err) {
        console.error('Email change verification error:', err);
        console.error('Response data:', err.response?.data);
        console.error('Request data sent:', { uid, token, new_email: decodeURIComponent(newEmail) });
        setStatus('error');
        
        // Handle rate limiting specifically
        if (err.response?.status === 429) {
          setMessage('Too many verification attempts. Please wait a while before trying again.');
        } else if (err.response?.data?.detail) {
          setMessage(err.response.data.detail);
        } else if (err.response?.data?.error) {
          setMessage(err.response.data.error);
        } else {
          setMessage('Failed to verify email change. The link may be invalid or expired.');
        }
      }
    };

    verifyEmailChange();
  }, [uid, token, newEmail, navigate, isAuthenticated, refreshUser]);

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
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login
          </button>
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg w-full max-w-md`}>
          <div className="text-center">
            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
              status === 'verifying' 
                ? isDark ? 'bg-blue-900' : 'bg-blue-100' 
                : status === 'success'
                ? isDark ? 'bg-green-900' : 'bg-green-100'
                : isDark ? 'bg-red-900' : 'bg-red-100'
            } mb-4`}>
              {status === 'verifying' && (
                <svg className={`w-10 h-10 ${isDark ? 'text-blue-400' : 'text-blue-600'} animate-spin`} fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {status === 'success' && (
                <svg className={`w-10 h-10 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {status === 'error' && (
                <svg className={`w-10 h-10 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* Title */}
            <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {status === 'verifying' && 'Updating Email'}
              {status === 'success' && 'Email Updated!'}
              {status === 'error' && 'Update Failed'}
            </h1>

            {/* Message */}
            <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {message}
            </p>

            {/* Actions */}
            {status === 'success' && (
              <div className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg mb-4`}>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Redirecting you to your profile in a few seconds...
                </p>
              </div>
            )}

            <div className="space-y-3">
              {status === 'success' && (
                <button
                  onClick={() => navigate('/ta/profile')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Go to Profile Now
                </button>
              )}

              {status === 'error' && (
                <>
                  <button
                    onClick={() => navigate('/ta/profile')}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Back to Profile
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className={`w-full ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${isDark ? 'text-white' : 'text-gray-900'} py-3 rounded-lg transition font-medium`}
                  >
                    Back to Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default VerifyEmailChangePage;
