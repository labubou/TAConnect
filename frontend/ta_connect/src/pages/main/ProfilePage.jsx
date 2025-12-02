import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGlobalLoading } from '../../contexts/GlobalLoadingContext';
import TAnavbar from '../../components/ta/TAnavbar';
import StudentNavbar from '../../components/student/studentNavbar';
import allStrings from '../../strings/TaprofilePage';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = allStrings[language];
  const { startLoading, stopLoading, isLoading: globalIsLoading } = useGlobalLoading();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  const [form, setForm] = useState({
    username: user?.username || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });

  // Sync form with user data when user updates
  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [user]);

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

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((f) => ({ ...f, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateEmailForm = () => {
    const errors = {};

    if (!emailForm.newEmail.trim()) {
      errors.newEmail = t.emailModal.newEmailRequired;
    } else if (!validateEmail(emailForm.newEmail)) {
      errors.newEmail = t.emailModal.invalidEmail;
    } else if (emailForm.newEmail === user?.email) {
      errors.newEmail = t.emailModal.emailMustDiffer;
    }

    if (!emailForm.confirmEmail.trim()) {
      errors.confirmEmail = t.emailModal.confirmEmailRequired;
    } else if (emailForm.newEmail !== emailForm.confirmEmail) {
      errors.confirmEmail = t.emailModal.emailsDoNotMatch;
    }

    setEmailErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = t.passwordModal.currentPasswordRequired;
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = t.passwordModal.newPasswordRequired;
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = t.passwordModal.passwordMinLength;
    } else if (!/[A-Z]/.test(passwordForm.newPassword)) {
      errors.newPassword = t.passwordModal.passwordUppercase;
    } else if (!/[a-z]/.test(passwordForm.newPassword)) {
      errors.newPassword = t.passwordModal.passwordLowercase;
    } else if (!/[0-9]/.test(passwordForm.newPassword)) {
      errors.newPassword = t.passwordModal.passwordNumber;
    } else if (passwordForm.newPassword === passwordForm.currentPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = t.passwordModal.confirmPasswordRequired;
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = t.passwordModal.passwordsDoNotMatch;
    }

    setPasswordErrors(errors);
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
        setMessage(t.profilePage.success);
      } else {
        stopLoading('update-profile');
        setError(t.profilePage.unexpectedError);
      }
    } catch (err) {
      stopLoading('update-profile');
      setError(err.response?.data?.error || err.message || t.profilePage.failed);
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
        text: t.emailModal.successMessage
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
        text: err.response?.data?.error || t.emailModal.errorMessage
      });
      console.error('Email change error:', err);
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setPasswordLoading(true);
    startLoading('change-password', 'Changing password...');
    setPasswordMessage('');

    try {
      const res = await axios.post('/api/profile/change-password/', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        confirm_password: passwordForm.confirmPassword,
      });

      stopLoading('change-password');
      setPasswordMessage({
        type: 'success',
        text: t.passwordModal.successMessage
      });

      // Reset form after success
      setTimeout(() => {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordModal(false);
        setPasswordMessage('');
      }, 2000);
    } catch (err) {
      stopLoading('change-password');
      setPasswordMessage({
        type: 'error',
        text: err.response?.data?.error || err.response?.data?.message || t.passwordModal.errorMessage
      });
      console.error('Password change error:', err);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (!deletePassword.trim()) {
      setDeleteError(t.deleteModal.passwordRequired);
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');
    startLoading('delete-account', t.deleteModal.deleting);

    try {
      await axios.post('/api/auth/delete-account/', {
        password: deletePassword,
      });

      stopLoading('delete-account');
      // Clear auth and redirect to login
      localStorage.removeItem('token');
      navigate('/login', { 
        state: { message: t.deleteModal.successMessage } 
      });
    } catch (err) {
      stopLoading('delete-account');
      setDeleteError(err.response?.data?.error || t.deleteModal.errorMessage);
    } finally {
      setDeleteLoading(false);
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
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Card */}
          <div className={`${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'} p-8 rounded-2xl shadow-xl border-2`}>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-[#366c6b] to-[#1a3535] rounded-2xl shadow-lg flex items-center justify-center text-white font-bold text-4xl">
                {user?.first_name ? user.first_name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t.profilePage.title}
                </h1>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-lg`}>
                  {t.profilePage.description}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    isDark ? 'bg-[#366c6b]/30 text-[#4a9d9c]' : 'bg-[#366c6b]/10 text-[#366c6b]'
                  }`}>
                    {user?.user_type === 'instructor' ? t.profilePage.instructor : t.profilePage.student}
                  </span>
                  {user?.email_verify && (
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1 ${
                      isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                    }`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t.profilePage.verified}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
              isDark ? 'bg-red-900/20 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          {message && (
            <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
              isDark ? 'bg-green-900/20 border-green-700 text-green-200' : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {message}
            </div>
          )}

          {/* Profile Form Card */}
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-8 rounded-2xl shadow-xl border-2`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${isDark ? 'bg-gradient-to-br from-[#366c6b] to-[#1a3535]' : 'bg-gradient-to-br from-[#4a9d9c] to-[#366c6b]'} shadow-lg`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t.profilePage.personalInformation}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {t.profilePage.username}
                  </label>
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#366c6b]/50 ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
                        : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                    }`}
                    placeholder="Enter your username"
                  />
                </div>

                {/* First Name */}
                <div>
                  <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t.profilePage.firstName}
                  </label>
                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#366c6b]/50 ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
                        : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                    }`}
                    placeholder="Enter your first name"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t.profilePage.lastName}
                  </label>
                  <input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#366c6b]/50 ${
                      isDark
                        ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
                        : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                    }`}
                    placeholder="Enter your last name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {t.profilePage.email}
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                        isDark
                          ? 'border-gray-600 bg-gray-700/50 text-gray-400'
                          : 'border-gray-300 bg-gray-100 text-gray-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(true)}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      {t.profilePage.change}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row gap-4 pt-6 border-t-2 border-gray-700 dark:border-gray-600">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t.profilePage.saving}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t.profilePage.save}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className={`flex-1 px-6 py-3 rounded-xl border-2 font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-gray-900 border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  {t.profilePage.changePassword}
                </button>
              </div>

              {/* Danger Zone - Delete Account */}
              <div className="mt-6 pt-6 border-t-2 border-red-600/30">
                <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${
                  isDark ? 'text-red-400' : 'text-red-600'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {t.profilePage.dangerZone}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full px-6 py-3 rounded-xl border-2 border-red-600 bg-red-600/10 text-red-600 dark:text-red-400 font-semibold transition-all duration-300 hover:bg-red-600 hover:text-white hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t.profilePage.deleteAccountButton}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Email Change Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-slideUp`}>
            {/* Modal Header */}
            <div className={`border-b-2 ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <svg className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t.emailModal.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailForm({ newEmail: '', confirmEmail: '' });
                  setEmailErrors({});
                  setEmailMessage('');
                }}
                className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEmailSubmit} className="p-6 space-y-5">
              {/* Success/Error Message */}
              {emailMessage && (
                <div className={`p-4 rounded-xl border-2 flex items-start gap-3 ${
                  emailMessage.type === 'success'
                    ? isDark ? 'bg-green-900/20 border-green-700 text-green-200' : 'bg-green-50 border-green-200 text-green-800'
                    : isDark ? 'bg-red-900/20 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    {emailMessage.type === 'success' ? (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    )}
                  </svg>
                  <p className="text-sm font-medium">{emailMessage.text}</p>
                </div>
              )}

              {/* Current Email (Read-only) */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  Current Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    isDark
                      ? 'border-gray-600 bg-gray-700/50 text-gray-400'
                      : 'border-gray-300 bg-gray-100 text-gray-600'
                  }`}
                />
              </div>

              {/* New Email */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {t.emailModal.newEmail} *
                </label>
                <input
                  type="email"
                  name="newEmail"
                  value={emailForm.newEmail}
                  onChange={handleEmailChange}
                  placeholder="Enter new email address"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 ${
                    emailErrors.newEmail
                      ? isDark ? 'border-red-600 bg-red-900/10 focus:ring-red-500' : 'border-red-500 bg-red-50 focus:ring-red-500'
                      : isDark ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 focus:ring-[#366c6b]/50' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:ring-[#366c6b]/50'
                  }`}
                />
                {emailErrors.newEmail && (
                  <p className={`text-sm mt-2 flex items-center gap-1.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {emailErrors.newEmail}
                  </p>
                )}
              </div>

              {/* {t.emailModal.confirmEmail} */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t.emailModal.confirmEmail} *
                </label>
                <input
                  type="email"
                  name="confirmEmail"
                  value={emailForm.confirmEmail}
                  onChange={handleEmailChange}
                  placeholder="Confirm new email address"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 ${
                    emailErrors.confirmEmail
                      ? isDark ? 'border-red-600 bg-red-900/10 focus:ring-red-500' : 'border-red-500 bg-red-50 focus:ring-red-500'
                      : isDark ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 focus:ring-[#366c6b]/50' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:ring-[#366c6b]/50'
                  }`}
                />
                {emailErrors.confirmEmail && (
                  <p className={`text-sm mt-2 flex items-center gap-1.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {emailErrors.confirmEmail}
                  </p>
                )}
              </div>

              {/* Info Notice */}
              <div className={`p-4 rounded-xl border-2 flex items-start gap-3 ${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                  <span className="font-semibold">{t.emailModal.importantNotice}</span> {t.emailModal.verificationNotice}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailForm({ newEmail: '', confirmEmail: '' });
                    setEmailErrors({});
                    setEmailMessage('');
                  }}
                  className={`flex-1 px-5 py-3 rounded-xl font-semibold transition-all ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  } ${emailLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                  disabled={emailLoading}
                >
                  {t.emailModal.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl"
                  disabled={emailLoading}
                >
                  {emailLoading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t.emailModal.sending}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                      </svg>
                      {t.emailModal.sendVerification}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-slideUp`}>
            {/* Modal Header */}
            <div className={`border-b-2 ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                  <svg className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t.passwordModal.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordErrors({});
                  setPasswordMessage('');
                }}
                className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
              {/* Success/Error Message */}
              {passwordMessage && (
                <div className={`p-4 rounded-xl border-2 flex items-start gap-3 ${
                  passwordMessage.type === 'success'
                    ? isDark ? 'bg-green-900/20 border-green-700 text-green-200' : 'bg-green-50 border-green-200 text-green-800'
                    : isDark ? 'bg-red-900/20 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    {passwordMessage.type === 'success' ? (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    )}
                  </svg>
                  <p className="text-sm font-medium">{passwordMessage.text}</p>
                </div>
              )}

              {/* {t.passwordModal.currentPassword} */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {t.passwordModal.currentPassword} *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 ${
                      passwordErrors.currentPassword
                        ? isDark ? 'border-red-600 bg-red-900/10 focus:ring-red-500' : 'border-red-500 bg-red-50 focus:ring-red-500'
                        : isDark ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 focus:ring-[#366c6b]/50' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:ring-[#366c6b]/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                      isDark ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {!showCurrentPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className={`text-sm mt-2 flex items-center gap-1.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* {t.passwordModal.newPassword} */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  {t.passwordModal.newPassword} *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 ${
                      passwordErrors.newPassword
                        ? isDark ? 'border-red-600 bg-red-900/10 focus:ring-red-500' : 'border-red-500 bg-red-50 focus:ring-red-500'
                        : isDark ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 focus:ring-[#366c6b]/50' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:ring-[#366c6b]/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                      isDark ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {!showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className={`text-sm mt-2 flex items-center gap-1.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {passwordErrors.newPassword}
                  </p>
                )}
                {!passwordErrors.newPassword && passwordForm.newPassword && (
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Must be at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                )}
              </div>

              {/* {t.passwordModal.confirmPassword} */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Confirm {t.passwordModal.newPassword} *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 ${
                      passwordErrors.confirmPassword
                        ? isDark ? 'border-red-600 bg-red-900/10 focus:ring-red-500' : 'border-red-500 bg-red-50 focus:ring-red-500'
                        : isDark ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 focus:ring-[#366c6b]/50' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:ring-[#366c6b]/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                      isDark ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {!showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className={`text-sm mt-2 flex items-center gap-1.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordErrors({});
                    setPasswordMessage('');
                  }}
                  className={`flex-1 px-5 py-3 rounded-xl font-semibold transition-all ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  } ${passwordLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                  disabled={passwordLoading}
                >
                  {t.passwordModal.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t.passwordModal.changing}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t.passwordModal.changePassword}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-slideUp`}>
            {/* Modal Header */}
            <div className={`border-b-2 ${isDark ? 'border-red-900/30' : 'border-red-200'} p-6 flex items-center justify-between bg-red-500/10`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isDark ? 'bg-red-900/50' : 'bg-red-100'}`}>
                  <svg className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  {t.deleteModal.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className={`p-2 rounded-lg transition-all ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleDeleteAccount} className="p-6">
              {/* Warning Message */}
              <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border-2`}>
                <div className="flex items-start gap-3">
                  <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className={`font-bold ${isDark ? 'text-red-400' : 'text-red-600'} mb-1`}>
                      {t.deleteModal.warning}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.deleteModal.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-6">
                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  {t.deleteModal.password}
                </label>
                <div className="relative">
                  <input
                    type={showDeletePassword ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setDeleteError('');
                    }}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all ${
                      deleteError
                        ? 'border-red-500 focus:border-red-600'
                        : isDark
                        ? 'border-gray-600 bg-gray-700 text-white focus:border-red-500'
                        : 'border-gray-300 bg-white text-gray-900 focus:border-red-500'
                    } focus:outline-none`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                      isDark ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {!showDeletePassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {deleteError && (
                  <p className={`text-sm mt-2 flex items-center gap-1.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {deleteError}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteError('');
                  }}
                  className={`flex-1 px-5 py-3 rounded-xl font-semibold transition-all ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  } ${deleteLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                  disabled={deleteLoading}
                >
                  {t.deleteModal.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t.deleteModal.deleting}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {t.deleteModal.deleteAccount}
                    </>
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
