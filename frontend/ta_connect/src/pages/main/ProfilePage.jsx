import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useGlobalLoading } from '../../contexts/GlobalLoadingContext';
import TAnavbar from '../../components/ta/TAnavbar';
import StudentNavbar from '../../components/student/studentNavbar';
import strings from '../../strings/TaprofilePage';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const { startLoading, stopLoading, isLoading: globalIsLoading } = useGlobalLoading();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  const [form, setForm] = useState({
    username: user?.username || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Email change modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    confirmEmail: '',
  });
  const [emailErrors, setEmailErrors] = useState({});
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((f) => ({ ...f, [name]: value }));
    setEmailErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateEmailForm = () => {
    const errors = {};

    if (!emailForm.newEmail.trim()) {
      errors.newEmail = 'New email is required';
    } else if (!validateEmail(emailForm.newEmail)) {
      errors.newEmail = 'Invalid email format';
    } else if (emailForm.newEmail === user?.email) {
      errors.newEmail = 'New email must be different from current email';
    }

    if (!emailForm.confirmEmail.trim()) {
      errors.confirmEmail = 'Please confirm your email';
    } else if (emailForm.newEmail !== emailForm.confirmEmail) {
      errors.confirmEmail = 'Emails do not match';
    }

    setEmailErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    startLoading('update-profile', 'Updating profile...');

    try {
      const res = await axios.put('/api/profile/update/', form);
      const updated = res.data.user;

      if (updated) {
        const mergedUser = {
          ...user,
          ...updated,
          user_type: user.user_type, 
        };
        updateUser(mergedUser);
        stopLoading('update-profile');
        setMessage(strings.profilePage.success);
      } else {
        stopLoading('update-profile');
        setError(strings.profilePage.unexpectedError);
      }
    } catch (err) {
      stopLoading('update-profile');
      setError(err.response?.data?.error || err.message || strings.profilePage.failed);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmailForm()) {
      return;
    }

    setEmailLoading(true);
    startLoading('change-email', 'Changing email...');
    setEmailMessage('');

    try {
      const res = await axios.put('/api/profile/update/', {
        email: emailForm.newEmail,
      });

      stopLoading('change-email');
      setEmailMessage({
        type: 'success',
        text: res.data.message || 'Verification email sent! Please check your new email to complete the change.'
      });

      // Reset form after success
      setTimeout(() => {
        setEmailForm({ newEmail: '', confirmEmail: '' });
        setShowEmailModal(false);
        setEmailMessage('');
      }, 3000);
    } catch (err) {
      stopLoading('change-email');
      setEmailMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to request email change. Please try again.'
      });
      console.error('Email change error:', err);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {user?.user_type === 'instructor' ? (
        <TAnavbar onToggle={setIsNavbarOpen} />
      ) : (
        <StudentNavbar onToggle={setIsNavbarOpen} />
      )}

      <main
        className={`transition-all duration-300 ${
          isNavbarOpen ? 'ml-64' : 'ml-0'
        } pt-20 p-6`}
        style={{ minHeight: '100vh' }}
      >
        <div
          className={`max-w-2xl mx-auto ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow`}
        >
          <h2
            className={`text-2xl font-bold mb-3 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {strings.profilePage.title}
          </h2>

          <p
            className={`${
              isDark ? 'text-gray-300' : 'text-gray-600'
            } text-sm mb-6`}
          >
            {strings.profilePage.description}
          </p>

          {error && <div className="mb-2 text-red-600">{error}</div>}
          {message && <div className="mb-2 text-green-600">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                {strings.profilePage.username}
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded border ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-300 bg-white text-black'
                }`}
              />
            </div>

            
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                {strings.profilePage.firstName}
              </label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded border ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-300 bg-white text-black'
                }`}
              />
            </div>

            
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                {strings.profilePage.lastName}
              </label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded border ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-300 bg-white text-black'
                }`}
              />
            </div>

            
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                {strings.profilePage.email}
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={`flex-1 px-3 py-2 rounded border ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-gray-400'
                      : 'border-gray-300 bg-gray-100 text-gray-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowEmailModal(true)}
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                >
                  Change
                </button>
              </div>
            </div>

            
            <div className="flex justify-between items-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-60"
              >
                {loading ? strings.profilePage.saving : strings.profilePage.save}
              </button>

              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-400 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                {strings.profilePage.resetPassword}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Email Change Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-md`}>
            <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex items-center justify-between`}>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Change Email
              </h3>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailForm({ newEmail: '', confirmEmail: '' });
                  setEmailErrors({});
                  setEmailMessage('');
                }}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEmailSubmit} className="p-6 space-y-4">
              {emailMessage && (
                <div className={`p-4 rounded-lg ${
                  emailMessage.type === 'success'
                    ? isDark ? 'bg-green-900/20 border border-green-700 text-green-200' : 'bg-green-50 border border-green-200 text-green-800'
                    : isDark ? 'bg-red-900/20 border border-red-700 text-red-200' : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {emailMessage.text}
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Current Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={`w-full px-3 py-2 rounded border ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-gray-400'
                      : 'border-gray-300 bg-gray-100 text-gray-600'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  New Email *
                </label>
                <input
                  type="email"
                  name="newEmail"
                  value={emailForm.newEmail}
                  onChange={handleEmailChange}
                  placeholder="Enter new email"
                  className={`w-full px-3 py-2 rounded border transition-all ${
                    emailErrors.newEmail
                      ? isDark ? 'border-red-600 bg-red-900/10' : 'border-red-500 bg-red-50'
                      : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                {emailErrors.newEmail && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {emailErrors.newEmail}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Confirm Email *
                </label>
                <input
                  type="email"
                  name="confirmEmail"
                  value={emailForm.confirmEmail}
                  onChange={handleEmailChange}
                  placeholder="Confirm new email"
                  className={`w-full px-3 py-2 rounded border transition-all ${
                    emailErrors.confirmEmail
                      ? isDark ? 'border-red-600 bg-red-900/10' : 'border-red-500 bg-red-50'
                      : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                {emailErrors.confirmEmail && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {emailErrors.confirmEmail}
                  </p>
                )}
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                  <span className="font-semibold">Note:</span> A verification email will be sent to your new email address. You must verify it to complete the change.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailForm({ newEmail: '', confirmEmail: '' });
                    setEmailErrors({});
                    setEmailMessage('');
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  } ${emailLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={emailLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  disabled={emailLoading}
                >
                  {emailLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Verification Email'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
