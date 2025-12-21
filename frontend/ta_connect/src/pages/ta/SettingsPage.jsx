import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Settings, Mail, X, Save, RefreshCw, User, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useGlobalLoading } from '../../contexts/GlobalLoadingContext';
import TAnavbar from '../../components/ta/TAnavbar';
import Footer from '../../components/General/Footer';
import { settingsStrings as allStrings } from '../../strings/settingsSTUStrings';
import PushNotificationToggle from '../../components/General/PushNotificationToggle';

export default function TASettingsPage() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = allStrings[language];
  const { user, updateUser } = useAuth();
  const { startLoading, stopLoading, isLoading } = useGlobalLoading();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('emailPreferences');

  // Email Preferences State
  const [preferences, setPreferences] = useState({
    email_on_booking: true,
    email_on_cancellation: true,
    email_on_update: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Google Calendar state
  const [googleCalendarEnabled, setGoogleCalendarEnabled] = useState(false);
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
  const [googleCalendarLoading, setGoogleCalendarLoading] = useState(false);
  const [googleCalendarEmail, setGoogleCalendarEmail] = useState(null);

  // Profile form state
  const [form, setForm] = useState({
    username: user?.username || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  // Email change modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    confirmEmail: '',
  });
  const [emailErrors, setEmailErrors] = useState({});
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');

  // Password change modal state
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

  useEffect(() => {
    if (activeTab === 'emailPreferences') {
      fetchPreferences();
    }
  }, [activeTab]);

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

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Handle Google Calendar callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const googleCalendar = urlParams.get('google_calendar');

    if (code && googleCalendar === 'true') {
      handleGoogleCalendarConnect(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error && googleCalendar === 'true') {
      setMessage({
        type: 'error',
        text: t.googleCalendar?.connectionCancelled || 'Google Calendar connection cancelled or failed.'
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // ==================================================================================
  // BACKEND CONNECTION - FETCH PREFERENCES
  // Endpoint: GET /api/profile/email-preferences/
  // Expected Response: { email_on_booking: boolean, email_on_cancellation: boolean, email_on_update: boolean }
  // ==================================================================================
  const fetchPreferences = async () => {
    try {
      setLoading(true);
      startLoading('fetch-ta-email-prefs', 'Loading preferences...');
      const response = await axios.get('/api/profile/email-preferences/');
      const data = response.data;
      
      setPreferences({
        email_on_booking: data.email_on_booking !== false,
        email_on_cancellation: data.email_on_cancellation !== false,
        email_on_update: data.email_on_update !== false,
      });

      // Fetch Google Calendar status
      try {
        const calendarResponse = await axios.get('/api/auth/google/calendar/status/');
        setGoogleCalendarConnected(calendarResponse.data.connected);
        setGoogleCalendarEnabled(calendarResponse.data.calendar_enabled);
        setGoogleCalendarEmail(calendarResponse.data.google_email || null);
      } catch (calendarErr) {
        console.error('Failed to fetch Google Calendar status:', calendarErr);
      }
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
      setMessage({ 
        type: 'error', 
        text: t.messages.loadError || 'Failed to load preferences'
      });
      setPreferences({
        email_on_booking: true,
        email_on_cancellation: true,
        email_on_update: true,
      });
    } finally {
      stopLoading('fetch-ta-email-prefs');
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleConnectGoogleCalendar = async () => {
    try {
      setGoogleCalendarLoading(true);
      startLoading('google-calendar-url', t.googleCalendar?.gettingUrl || 'Getting Google Calendar connection URL...');
      const res = await axios.get('/api/auth/google/calendar/url/?from=settings');
      stopLoading('google-calendar-url');
      // Redirect to Google OAuth
      window.location.href = res.data.auth_url;
    } catch (err) {
      stopLoading('google-calendar-url');
      setMessage({
        type: 'error',
        text: err.response?.data?.error || t.googleCalendar?.urlError || 'Failed to get Google Calendar connection URL. Please try again.'
      });
      setGoogleCalendarLoading(false);
    }
  };

  const handleGoogleCalendarToggle = async () => {
    if (!googleCalendarConnected) {
      // If not connected, trigger connection flow
      handleConnectGoogleCalendar();
      return;
    }

    const newValue = !googleCalendarEnabled;
    setGoogleCalendarLoading(true);
    startLoading('toggle-google-calendar', newValue ? (t.googleCalendar?.enabling || 'Enabling Google Calendar...') : (t.googleCalendar?.disabling || 'Disabling Google Calendar...'));

    try {
      const response = await axios.post('/api/auth/google/calendar/toggle/', {
        enabled: newValue
      });
      
      setGoogleCalendarEnabled(response.data.calendar_enabled);
      stopLoading('toggle-google-calendar');
      setMessage({
        type: 'success',
        text: response.data.message || (newValue ? (t.googleCalendar?.toggleEnabled || 'Google Calendar enabled successfully.') : (t.googleCalendar?.toggleDisabled || 'Google Calendar disabled successfully.'))
      });
    } catch (err) {
      stopLoading('toggle-google-calendar');
      setMessage({
        type: 'error',
        text: err.response?.data?.error || t.googleCalendar?.toggleError || 'Failed to update Google Calendar settings. Please try again.'
      });
    } finally {
      setGoogleCalendarLoading(false);
    }
  };

  const handleGoogleCalendarConnect = async (code) => {
    setGoogleCalendarLoading(true);
    setMessage({ type: '', text: '' });
    startLoading('google-calendar-connect', t.googleCalendar?.connecting || 'Connecting Google Calendar...');

    try {
      const res = await axios.post('/api/auth/google/calendar/connect/', { code });
      setGoogleCalendarConnected(true);
      setGoogleCalendarEnabled(res.data.calendar_enabled);
      setGoogleCalendarEmail(res.data.google_email || null);
      setMessage({ type: 'success', text: res.data.message || t.googleCalendar?.connectionSuccess || 'Google Calendar connected successfully!' });
      stopLoading('google-calendar-connect');
    } catch (err) {
      stopLoading('google-calendar-connect');
      setMessage({
        type: 'error',
        text: err.response?.data?.error || t.googleCalendar?.connectionError || 'Failed to connect Google Calendar. Please try again.'
      });
    } finally {
      setGoogleCalendarLoading(false);
    }
  };

  const handleReset = () => {
    setPreferences({
      email_on_booking: true,
      email_on_cancellation: true,
      email_on_update: true,
    });
    setMessage({ 
      type: 'success', 
      text: t.messages.resetSuccess || 'Preferences reset to default'
    });
  };

  // ==================================================================================
  // BACKEND CONNECTION - SAVE PREFERENCES
  // Endpoint: PATCH /api/profile/email-preferences/
  // Request Payload: { email_on_booking: boolean, email_on_cancellation: boolean, email_on_update: boolean }
  // ==================================================================================
  const handleSave = async () => {
    try {
      setSaving(true);
      startLoading('save-email-prefs', 'Saving preferences...');
      setMessage({ type: '', text: '' });

      const response = await axios.patch('/api/profile/email-preferences/', {
        email_on_booking: preferences.email_on_booking,
        email_on_cancellation: preferences.email_on_cancellation,
        email_on_update: preferences.email_on_update,
      });

      if (response.status === 200) {
        stopLoading('save-email-prefs');
        setMessage({ 
          type: 'success', 
          text: t.messages.saveSuccess
        });
      }
    } catch (err) {
      stopLoading('save-email-prefs');
      const errorMsg = err.response?.data?.error || t.messages.saveError;
      setMessage({ 
        type: 'error', 
        text: errorMsg
      });
      console.error('Error saving preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  // Profile handlers
  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage('');
    setProfileError('');
    startLoading('update-profile', 'Updating profile...');

    try {
      const res = await axios.put('/api/profile/update/', form);
      stopLoading('update-profile');
      
      if (res.data?.user) {
        // Merge updated user data with existing user to preserve fields like user_type
        const mergedUser = {
          ...user,
          ...res.data.user,
          user_type: user?.user_type, // Preserve user_type as it's not in the response
        };
        updateUser(mergedUser);
        setProfileMessage(t.profilePage?.success || 'Profile updated successfully');
      } else {
        setProfileMessage(t.profilePage?.unexpectedError || 'Profile updated');
      }
    } catch (err) {
      stopLoading('update-profile');
      const errMsg = err.response?.data?.message || err.response?.data?.error || t.profilePage?.failed || 'Failed to update profile';
      setProfileError(errMsg);
    } finally {
      setProfileLoading(false);
    }
  };

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
      errors.newEmail = t.emailModal?.newEmailRequired || 'New email is required';
    } else if (!validateEmail(emailForm.newEmail)) {
      errors.newEmail = t.emailModal?.invalidEmail || 'Invalid email format';
    } else if (emailForm.newEmail.toLowerCase() === user?.email?.toLowerCase()) {
      errors.newEmail = t.emailModal?.emailMustDiffer || 'New email must be different from current email';
    }

    if (!emailForm.confirmEmail.trim()) {
      errors.confirmEmail = t.emailModal?.confirmEmailRequired || 'Email confirmation is required';
    } else if (emailForm.newEmail !== emailForm.confirmEmail) {
      errors.confirmEmail = t.emailModal?.emailsDoNotMatch || 'Emails do not match';
    }

    setEmailErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.currentPassword.trim()) {
      errors.currentPassword = t.passwordModal?.currentPasswordRequired || 'Current password is required';
    }

    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = t.passwordModal?.newPasswordRequired || 'New password is required';
    } else {
      if (passwordForm.newPassword.length < 8) {
        errors.newPassword = t.passwordModal?.passwordMinLength || 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(passwordForm.newPassword)) {
        errors.newPassword = t.passwordModal?.passwordUppercase || 'Password must contain an uppercase letter';
      } else if (!/[a-z]/.test(passwordForm.newPassword)) {
        errors.newPassword = t.passwordModal?.passwordLowercase || 'Password must contain a lowercase letter';
      } else if (!/[0-9]/.test(passwordForm.newPassword)) {
        errors.newPassword = t.passwordModal?.passwordNumber || 'Password must contain a number';
      }
    }

    if (!passwordForm.confirmPassword.trim()) {
      errors.confirmPassword = t.passwordModal?.confirmPasswordRequired || 'Password confirmation is required';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = t.passwordModal?.passwordsDoNotMatch || 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmailForm()) {
      return;
    }

    setEmailLoading(true);
    startLoading('change-email', 'Sending verification email...');
    setEmailMessage('');

    try {
      const res = await axios.post('/api/profile/change-email/', {
        new_email: emailForm.newEmail,
      });
      stopLoading('change-email');
      setEmailMessage(t.emailModal?.successMessage || 'Verification email sent. Please check your inbox.');
      setEmailForm({ newEmail: '', confirmEmail: '' });
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailMessage('');
      }, 3000);
    } catch (err) {
      stopLoading('change-email');
      setEmailMessage(err.response?.data?.error || t.emailModal?.failureMessage || 'Failed to change email');
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
      });
      stopLoading('change-password');
      setPasswordMessage(t.passwordModal?.successMessage || 'Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMessage('');
      }, 3000);
    } catch (err) {
      stopLoading('change-password');
      setPasswordMessage(err.response?.data?.error || t.passwordModal?.failureMessage || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (!deletePassword.trim()) {
      setDeleteError(t.deleteModal?.passwordRequired || 'Password is required');
      return;
    }

    setDeleteLoading(true);
    startLoading('delete-account', 'Deleting account...');
    setDeleteError('');

    try {
      const res = await axios.delete('/api/profile/', {
        data: { password: deletePassword },
      });
      stopLoading('delete-account');
      navigate('/');
    } catch (err) {
      stopLoading('delete-account');
      setDeleteError(err.response?.data?.error || t.deleteModal?.errorMessage || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <TAnavbar onToggle={setIsNavbarOpen} />

      <main
        className="flex-1 pt-16 md:pt-20 px-3 sm:px-6 lg:px-10 pb-12 sm:pb-20"
      >
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
          {/* Header */}
          <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} p-3 sm:p-4 md:p-6`}>
            <div className={`flex items-start gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-1.5 sm:p-2 md:p-3 rounded-xl ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
                <Settings className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1">
                <h1 className={`text-lg sm:text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t.header?.title || 'Settings'}
                </h1>
                <p className={`text-xs sm:text-sm md:text-base mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'} ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t.header?.subtitle || 'Manage your profile and notifications'}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className={`flex gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-100'}`}>
              <button
                onClick={() => setActiveTab('emailPreferences')}
                className={`flex-1 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'emailPreferences'
                    ? isDark
                      ? 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b] text-white shadow-lg'
                      : 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b] text-white shadow-lg'
                    : isDark
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{t.tabs?.emailPreferences || 'Email'}</span>
                  <span className="sm:hidden text-xs">{language === 'ar' ? 'البريد' : 'Email'}</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'profile'
                    ? isDark
                      ? 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b] text-white shadow-lg'
                      : 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b] text-white shadow-lg'
                    : isDark
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{t.tabs?.profile || 'Profile'}</span>
                  <span className="sm:hidden text-xs">{language === 'ar' ? 'الملف' : 'Profile'}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Email Preferences Tab */}
          {activeTab === 'emailPreferences' && (
            <>
              {/* Loading State */}
              {loading && (
                <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} p-8 flex items-center justify-center`}>
                  <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t.messages?.loading || 'Loading...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Message Banner */}
              {!loading && message.text && (
                <div
                  className={`rounded-2xl px-4 py-3 border flex items-center justify-between gap-4 ${
                    message.type === 'success'
                      ? isDark
                        ? 'bg-green-900/20 border-green-700 text-green-200'
                        : 'bg-green-50 border-green-200 text-green-800'
                      : isDark
                      ? 'bg-red-900/20 border-red-700 text-red-200'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              )}

              {/* Email Preferences Content */}
              {!loading && (
                <>
                  <PushNotificationToggle className="mb-4" />

                  {/* Email on Booking */}
                  <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} overflow-hidden`}>
                    <div className="p-3 sm:p-4 md:p-6">
                      <div className={`flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <div className={`p-1.5 sm:p-2 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
                          <Mail className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                        <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <h2 className={`text-base sm:text-lg md:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            {t.bookingSection?.title || 'Email on Booking'}
                          </h2>
                          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'} ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            {t.bookingSection?.subtitle || 'Get notified when you receive a booking'}
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => !saving && handleToggle('email_on_booking')}
                        className={`rounded-xl p-3 sm:p-4 border-2 transition-all cursor-pointer ${
                          saving ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          preferences.email_on_booking
                            ? isDark
                              ? 'border-blue-600 bg-blue-900/20'
                              : 'border-blue-500 bg-blue-50'
                            : isDark
                            ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className={`flex items-start gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                          {language === 'ar' && <Mail className={`w-5 h-5 flex-shrink-0 ${
                            preferences.email_on_booking
                              ? isDark ? 'text-blue-400' : 'text-blue-600'
                              : isDark ? 'text-gray-600' : 'text-gray-400'
                          }`} />}
                          <div
                            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              preferences.email_on_booking
                                ? isDark
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-blue-500 bg-blue-500'
                                : isDark
                                ? 'border-gray-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {preferences.email_on_booking && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            <div className={`flex w-full flex-col sm:flex-row sm:items-center gap-2 ${language === 'ar' ? 'items-end text-right sm:flex-row-reverse sm:justify-start' : 'items-start text-left sm:justify-start'}`}>
                              <p className={`flex-1 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {t.bookingSection?.optionTitle || 'Email on Booking'}
                              </p>
                              {preferences.email_on_booking && (
                                <span className={`text-xs px-2 py-0.5 rounded-full inline-block w-fit ${isDark ? 'bg-blue-700 text-blue-100' : 'bg-blue-200 text-blue-800'}`}>
                                  {t.status?.enabled || 'Enabled'}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t.bookingSection?.optionDescription || 'Receive notifications for new bookings'}
                            </p>
                          </div>
                          {language !== 'ar' && <Mail className={`w-5 h-5 flex-shrink-0 ${
                            preferences.email_on_booking
                              ? isDark ? 'text-blue-400' : 'text-blue-600'
                              : isDark ? 'text-gray-600' : 'text-gray-400'
                          }`} />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email on Cancellation */}
                  <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} overflow-hidden`}>
                    <div className="p-3 sm:p-4 md:p-6">
                      <div className={`flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <div className={`p-1.5 sm:p-2 rounded-lg ${isDark ? 'bg-red-900/20' : 'bg-red-100'}`}>
                          <Mail className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                        </div>
                        <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <h2 className={`text-base sm:text-lg md:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            {t.cancellationSection?.title || 'Email on Cancellation'}
                          </h2>
                          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'} ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            {t.cancellationSection?.subtitle || 'Get notified when a booking is cancelled'}
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => !saving && handleToggle('email_on_cancellation')}
                        className={`rounded-xl p-3 sm:p-4 border-2 transition-all cursor-pointer ${
                          saving ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          preferences.email_on_cancellation
                            ? isDark
                              ? 'border-red-600 bg-red-900/20'
                              : 'border-red-500 bg-red-50'
                            : isDark
                            ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className={`flex items-start gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                          {language === 'ar' && <Mail className={`w-5 h-5 flex-shrink-0 ${
                            preferences.email_on_cancellation
                              ? isDark ? 'text-red-400' : 'text-red-600'
                              : isDark ? 'text-gray-600' : 'text-gray-400'
                          }`} />}
                          <div
                            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              preferences.email_on_cancellation
                                ? isDark
                                  ? 'border-red-500 bg-red-500'
                                  : 'border-red-500 bg-red-500'
                                : isDark
                                ? 'border-gray-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {preferences.email_on_cancellation && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            <div className={`flex w-full flex-col sm:flex-row sm:items-center gap-2 ${language === 'ar' ? 'items-end text-right sm:flex-row-reverse sm:justify-start' : 'items-start text-left sm:justify-start'}`}>
                              <p className={`flex-1 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {t.cancellationSection?.optionTitle || 'Email on Cancellation'}
                              </p>
                              {preferences.email_on_cancellation && (
                                <span className={`text-xs px-2 py-0.5 rounded-full inline-block w-fit ${isDark ? 'bg-red-700 text-red-100' : 'bg-red-200 text-red-800'}`}>
                                  {t.status?.enabled || 'Enabled'}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t.cancellationSection?.optionDescription || 'Receive notifications for cancelled bookings'}
                            </p>
                          </div>
                          {language !== 'ar' && <Mail className={`w-5 h-5 flex-shrink-0 ${
                            preferences.email_on_cancellation
                              ? isDark ? 'text-red-400' : 'text-red-600'
                              : isDark ? 'text-gray-600' : 'text-gray-400'
                          }`} />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email on Update */}
                  <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} overflow-hidden`}>
                    <div className="p-3 sm:p-4 md:p-6">
                      <div className={`flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <div className={`p-1.5 sm:p-2 rounded-lg ${isDark ? 'bg-amber-900/20' : 'bg-amber-100'}`}>
                          <Mail className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                        </div>
                        <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <h2 className={`text-base sm:text-lg md:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            {t.updateSection?.title || 'Email on Update'}
                          </h2>
                          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'} ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            {t.updateSection?.subtitle || 'Get notified when a booking is updated'}
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => !saving && handleToggle('email_on_update')}
                        className={`rounded-xl p-3 sm:p-4 border-2 transition-all cursor-pointer ${
                          saving ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          preferences.email_on_update
                            ? isDark
                              ? 'border-amber-600 bg-amber-900/20'
                              : 'border-amber-500 bg-amber-50'
                            : isDark
                            ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className={`flex items-start gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                          {language === 'ar' && <Mail className={`w-5 h-5 flex-shrink-0 ${
                            preferences.email_on_update
                              ? isDark ? 'text-amber-400' : 'text-amber-600'
                              : isDark ? 'text-gray-600' : 'text-gray-400'
                          }`} />}
                          <div
                            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              preferences.email_on_update
                                ? isDark
                                  ? 'border-amber-500 bg-amber-500'
                                  : 'border-amber-500 bg-amber-500'
                                : isDark
                                ? 'border-gray-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {preferences.email_on_update && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            <div className={`flex w-full flex-col sm:flex-row sm:items-center gap-2 ${language === 'ar' ? 'items-end text-right sm:flex-row-reverse sm:justify-start' : 'items-start text-left sm:justify-start'}`}>
                              <p className={`flex-1 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {t.updateSection?.optionTitle || 'Email on Update'}
                              </p>
                              {preferences.email_on_update && (
                                <span className={`text-xs px-2 py-0.5 rounded-full inline-block w-fit ${isDark ? 'bg-amber-700 text-amber-100' : 'bg-amber-200 text-amber-800'}`}>
                                  {t.status?.enabled || 'Enabled'}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t.updateSection?.optionDescription || 'Receive notifications for booking updates'}
                            </p>
                          </div>
                          {language !== 'ar' && <Mail className={`w-5 h-5 flex-shrink-0 ${
                            preferences.email_on_update
                              ? isDark ? 'text-amber-400' : 'text-amber-600'
                              : isDark ? 'text-gray-600' : 'text-gray-400'
                          }`} />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Google Calendar Integration */}
                  <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} overflow-hidden`}>
                    <div className="p-3 sm:p-4 md:p-6">
                      <div className={`flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <div className={`p-1.5 sm:p-2 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
                          <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <h2 className={`text-base sm:text-lg md:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            {t.googleCalendar?.title || 'Google Calendar Integration'}
                          </h2>
                          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'} ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            {t.googleCalendar?.subtitle || 'Sync your bookings with Google Calendar'}
                          </p>
                        </div>
                      </div>

                      {!googleCalendarConnected && (
                        <div className="mb-4">
                          <button
                            onClick={handleConnectGoogleCalendar}
                            disabled={googleCalendarLoading}
                            className={`w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                          >
                            {googleCalendarLoading ? (
                              <>
                                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t.googleCalendar?.connecting || 'Connecting...'}
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {t.googleCalendar?.connectButton || 'Connect Google Calendar'}
                              </>
                            )}
                          </button>
                          <p className={`text-xs mt-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t.googleCalendar?.connectDescription || 'Connect any Google account to sync your bookings with Google Calendar'}
                          </p>
                        </div>
                      )}

                      {googleCalendarConnected && (
                        <div
                          onClick={() => !googleCalendarLoading && handleGoogleCalendarToggle()}
                          className={`rounded-xl p-4 border-2 transition-all ${
                            googleCalendarLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          } ${
                            googleCalendarEnabled
                              ? isDark
                                ? 'border-blue-600 bg-blue-900/20'
                                : 'border-blue-500 bg-blue-50'
                              : isDark
                              ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                              : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                          }`}
                        >
                        <div className={`flex items-start gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                          {language === 'ar' && (
                            <svg className={`w-5 h-5 flex-shrink-0 ${
                              googleCalendarEnabled && googleCalendarConnected
                                ? isDark ? 'text-blue-400' : 'text-blue-600'
                                : isDark ? 'text-gray-600' : 'text-gray-400'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                          <div
                            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              googleCalendarEnabled
                                ? isDark
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-blue-500 bg-blue-500'
                                : isDark
                                ? 'border-gray-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {googleCalendarEnabled && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            <div className={`flex w-full flex-col sm:flex-row sm:items-center gap-2 ${language === 'ar' ? 'items-end text-right sm:flex-row-reverse sm:justify-start' : 'items-start text-left sm:justify-start'}`}>
                              <p className={`flex-1 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {t.googleCalendar?.enableSync || 'Enable Calendar Sync'}
                              </p>
                              {googleCalendarEnabled && (
                                <span className={`text-xs px-2 py-0.5 rounded-full inline-block w-fit ${isDark ? 'bg-blue-700 text-blue-100' : 'bg-blue-200 text-blue-800'}`}>
                                  {t.status?.enabled || 'Enabled'}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t.googleCalendar?.syncDescription || 'Automatically add booking events to your Google Calendar'}
                            </p>
                            {googleCalendarEmail && (
                              <div className={`mt-2 flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                <svg className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {t.googleCalendar?.connectedTo || 'Connected to'}: <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{googleCalendarEmail}</span>
                                </p>
                              </div>
                            )}
                          </div>
                          {language !== 'ar' && (
                            <svg className={`w-5 h-5 flex-shrink-0 ${
                              googleCalendarEnabled
                                ? isDark ? 'text-blue-400' : 'text-blue-600'
                                : isDark ? 'text-gray-600' : 'text-gray-400'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                      </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4 md:pt-6 border-t-2 border-gray-700 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={saving}
                      className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        isDark
                          ? 'bg-gray-900 border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                      } ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                      {t.buttons?.reset || 'Reset'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                      <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                      {saving ? t.buttons?.saving || 'Saving...' : t.buttons?.save || 'Save Changes'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              {/* Profile Form */}
              <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} p-3 sm:p-4 md:p-6`}>
                <div className={`flex items-start gap-2 sm:gap-3 md:gap-4 mb-6 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-1.5 sm:p-2 rounded-lg ${isDark ? 'bg-purple-900/20' : 'bg-purple-100'}`}>
                    <User className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t.profilePage?.title || 'Profile Information'}
                    </h2>
                    <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t.profilePage?.subtitle || 'Update your personal information'}
                    </p>
                  </div>
                </div>

                {profileMessage && (
                  <div className={`mb-4 p-3 sm:p-4 rounded-xl border-2 flex items-start gap-3 ${isDark ? 'bg-green-900/20 border-green-700 text-green-200' : 'bg-green-50 border-green-200 text-green-800'}`}>
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium">{profileMessage}</p>
                  </div>
                )}

                {profileError && (
                  <div className={`mb-4 p-3 sm:p-4 rounded-xl border-2 flex items-start gap-3 ${isDark ? 'bg-red-900/20 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium">{profileError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Username */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t.profilePage?.username || 'Username'}
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      disabled
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#366c6b]/50 ${language === 'ar' ? 'text-right' : 'text-left'} ${
                        isDark
                          ? 'border-gray-600 bg-gray-700/50 text-gray-400'
                          : 'border-gray-300 bg-gray-100 text-gray-600'
                      }`}
                      placeholder="Username"
                    />
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {t.profilePage?.usernameDisabled || 'Username cannot be changed'}
                    </p>
                  </div>

                  {/* First Name */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {t.profilePage?.firstName || 'First Name'}
                    </label>
                    <input
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#366c6b]/50 ${language === 'ar' ? 'text-right' : 'text-left'} ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
                          : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                      }`}
                      placeholder="Enter your first name"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {t.profilePage?.lastName || 'Last Name'}
                    </label>
                    <input
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#366c6b]/50 ${language === 'ar' ? 'text-right' : 'text-left'} ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
                          : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                      }`}
                      placeholder="Enter your last name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {t.profilePage?.email || 'Email'}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 ${
                          isDark
                            ? 'border-gray-600 bg-gray-700/50 text-gray-400'
                            : 'border-gray-300 bg-gray-100 text-gray-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmailModal(true)}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        {t.profilePage?.change || 'Change'}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4 md:pt-6 border-t-2 border-gray-700 dark:border-gray-600">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {profileLoading ? (
                        <>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t.profilePage?.saving || 'Saving...'}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                          {t.profilePage?.save || 'Save Changes'}
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(true)}
                      className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 ${
                        isDark
                          ? 'bg-gray-900 border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                      }`}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      {t.profilePage?.changePassword || 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Danger Zone - Delete Account */}
              <div className={`rounded-2xl ${isDark ? 'bg-red-900/10 border border-red-700' : 'bg-red-50 border border-red-200'} p-3 sm:p-4 md:p-6`}>
                <h3 className={`text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2 ${
                  isDark ? 'text-red-400' : 'text-red-600'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {t.profilePage?.dangerZone || 'Danger Zone'}
                </h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t.profilePage?.deleteAccountWarning || 'This action cannot be undone. Please be careful.'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 border-red-600 bg-red-600/10 text-red-600 dark:text-red-400 font-semibold transition-all duration-300 hover:bg-red-600 hover:text-white hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t.profilePage?.deleteAccountButton || 'Delete Account'}
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Email Change Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} max-w-md w-full p-6 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t.emailModal?.title || 'Change Email'}
              </h2>
              <button
                onClick={() => setShowEmailModal(false)}
                className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {emailMessage && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${emailMessage.includes('successfully') || emailMessage.includes('sent') ? isDark ? 'bg-green-900/20 border border-green-700 text-green-200' : 'bg-green-50 border border-green-200 text-green-800' : isDark ? 'bg-red-900/20 border border-red-700 text-red-200' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                {emailMessage}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.emailModal?.newEmailLabel || 'New Email'}
                </label>
                <input
                  type="email"
                  name="newEmail"
                  value={emailForm.newEmail}
                  onChange={handleEmailChange}
                  placeholder={t.emailModal?.newEmailPlaceholder || 'Enter new email'}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    emailErrors.newEmail
                      ? isDark ? 'border-red-500 bg-red-900/20' : 'border-red-500 bg-red-50'
                      : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                {emailErrors.newEmail && <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{emailErrors.newEmail}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.emailModal?.confirmEmailLabel || 'Confirm Email'}
                </label>
                <input
                  type="email"
                  name="confirmEmail"
                  value={emailForm.confirmEmail}
                  onChange={handleEmailChange}
                  placeholder={t.emailModal?.confirmEmailPlaceholder || 'Confirm new email'}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    emailErrors.confirmEmail
                      ? isDark ? 'border-red-500 bg-red-900/20' : 'border-red-500 bg-red-50'
                      : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                {emailErrors.confirmEmail && <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{emailErrors.confirmEmail}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t.buttons?.cancel || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={emailLoading}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                    emailLoading
                      ? isDark ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : isDark ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-teal-500 text-white hover:bg-teal-600'
                  }`}
                >
                  {emailLoading ? t.buttons?.sending || 'Sending...' : t.buttons?.send || 'Send Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} max-w-md w-full p-6 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t.passwordModal?.title || 'Change Password'}
              </h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordMessage && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${passwordMessage.includes('successfully') ? isDark ? 'bg-green-900/20 border border-green-700 text-green-200' : 'bg-green-50 border border-green-200 text-green-800' : isDark ? 'bg-red-900/20 border border-red-700 text-red-200' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                {passwordMessage}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.passwordModal?.currentPasswordLabel || 'Current Password'}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder={t.passwordModal?.currentPasswordPlaceholder || 'Enter current password'}
                    className={`w-full px-4 py-2 pr-10 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      passwordErrors.currentPassword
                        ? isDark ? 'border-red-500 bg-red-900/20' : 'border-red-500 bg-red-50'
                        : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.currentPassword && <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{passwordErrors.currentPassword}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.passwordModal?.newPasswordLabel || 'New Password'}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder={t.passwordModal?.newPasswordPlaceholder || 'Enter new password'}
                    className={`w-full px-4 py-2 pr-10 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      passwordErrors.newPassword
                        ? isDark ? 'border-red-500 bg-red-900/20' : 'border-red-500 bg-red-50'
                        : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.newPassword && <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{passwordErrors.newPassword}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.passwordModal?.confirmPasswordLabel || 'Confirm Password'}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder={t.passwordModal?.confirmPasswordPlaceholder || 'Confirm new password'}
                    className={`w-full px-4 py-2 pr-10 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      passwordErrors.confirmPassword
                        ? isDark ? 'border-red-500 bg-red-900/20' : 'border-red-500 bg-red-50'
                        : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{passwordErrors.confirmPassword}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t.buttons?.cancel || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                    passwordLoading
                      ? isDark ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : isDark ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-teal-500 text-white hover:bg-teal-600'
                  }`}
                >
                  {passwordLoading ? t.buttons?.saving || 'Updating...' : t.buttons?.save || 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} max-w-md w-full p-6`}>
            <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              {t.deleteModal?.title || 'Delete Account'}
            </h2>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.deleteModal?.confirmMessage || 'This action cannot be undone. All your data will be permanently deleted.'}
            </p>

            {deleteError && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${isDark ? 'bg-red-900/20 border border-red-700 text-red-200' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.deleteModal?.passwordLabel || 'Confirm your password'}
                </label>
                <div className="relative">
                  <input
                    type={showDeletePassword ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder={t.deleteModal?.passwordPlaceholder || 'Enter password'}
                    className={`w-full px-4 py-2 pr-10 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {showDeletePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t.buttons?.cancel || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                    deleteLoading
                      ? isDark ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : isDark ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {deleteLoading ? t.buttons?.deleting || 'Deleting...' : t.buttons?.delete || 'Delete Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
