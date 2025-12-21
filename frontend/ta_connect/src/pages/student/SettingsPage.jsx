import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Settings, Mail, X, Save, RefreshCw, User, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useGlobalLoading } from '../../contexts/GlobalLoadingContext';
import StudentNavbar from '../../components/student/studentNavbar';
import Footer from '../../components/General/Footer';
import { settingsStrings as allStrings } from '../../strings/settingsSTUStrings';
import PushNotificationToggle from '../../components/General/PushNotificationToggle';

export default function SettingsPage() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = allStrings[language];
  const { user, updateUser } = useAuth();
  const { startLoading, stopLoading, isLoading } = useGlobalLoading();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('emailPreferences');

  const [preferences, setPreferences] = useState({
    email_on_booking: true,
    email_on_cancellation: true,
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
    fetchPreferences();
  }, []);

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


  // ==================================================================================
  // BACKEND CONNECTION - FETCH PREFERENCES
  // Endpoint: GET /api/profile/email-preferences/
  // Expected Response: { email_on_booking: boolean, email_on_cancellation: boolean }
  // This fetches the user's current email notification preferences from the backend
  // ==================================================================================
  const fetchPreferences = async () => {
    try {
      setLoading(true);
      startLoading('fetch-email-prefs', 'Loading preferences...');
      const response = await axios.get('/api/profile/email-preferences/');
      const data = response.data;
      
      setPreferences({
        email_on_booking: data.email_on_booking !== false,
        email_on_cancellation: data.email_on_cancellation !== false,
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
        text: t.messages.loadError
      });
      setPreferences({
        email_on_booking: true,
        email_on_cancellation: true,
      });
    } finally {
      stopLoading('fetch-email-prefs');
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

  const handleDisconnectGoogleCalendar = async () => {
    if (!window.confirm(t.googleCalendar?.disconnectConfirm || 'Are you sure you want to disconnect Google Calendar? This will remove all calendar integration.')) {
      return;
    }

    setGoogleCalendarLoading(true);
    startLoading('google-calendar-disconnect', t.googleCalendar?.disconnecting || 'Disconnecting Google Calendar...');

    try {
      await axios.post('/api/auth/google/calendar/disconnect/');
      setGoogleCalendarConnected(false);
      setGoogleCalendarEnabled(false);
      setGoogleCalendarEmail(null);
      stopLoading('google-calendar-disconnect');
      setMessage({
        type: 'success',
        text: t.googleCalendar?.disconnectSuccess || 'Google Calendar disconnected successfully.'
      });
    } catch (err) {
      stopLoading('google-calendar-disconnect');
      setMessage({
        type: 'error',
        text: err.response?.data?.error || t.googleCalendar?.disconnectError || 'Failed to disconnect Google Calendar. Please try again.'
      });
    } finally {
      setGoogleCalendarLoading(false);
    }
  };

  const handleGoogleCalendarConnect = async (code) => {
    if (!code) return;
    
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

  // Handle Google Calendar callback - must be after handleGoogleCalendarConnect is defined
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const googleCalendar = urlParams.get('google_calendar');

    if (code && googleCalendar === 'true') {
      handleGoogleCalendarConnect(code);
      // Clean up URL - remove query params but keep pathname
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (error && googleCalendar === 'true') {
      setMessage({
        type: 'error',
        text: t.googleCalendar?.connectionCancelled || 'Google Calendar connection cancelled or failed.'
      });
      // Clean up URL - remove query params but keep pathname
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    setPreferences({
      email_on_booking: true,
      email_on_cancellation: true,
    });
    setMessage({ 
      type: 'success', 
      text: t.messages.resetSuccess
    });
  };

  // ==================================================================================
  // BACKEND CONNECTION - SAVE PREFERENCES
  // Endpoint: PATCH /api/profile/email-preferences/
  // Request Payload: { email_on_booking: boolean, email_on_cancellation: boolean }
  // Expected Response: { status: 200 } or { error: string }
  // This sends the updated preferences to the backend and saves them to the database
  // ==================================================================================
  const handleSave = async () => {
    try {
      setSaving(true);
      startLoading('save-email-prefs', 'Saving preferences...');
      setMessage({ type: '', text: '' });

      const response = await axios.patch('/api/profile/email-preferences/', {
        email_on_booking: preferences.email_on_booking,
        email_on_cancellation: preferences.email_on_cancellation,
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
        setProfileMessage(t.profilePage.success);
      } else {
        setProfileMessage(t.profilePage.unexpectedError);
      }
    } catch (err) {
      stopLoading('update-profile');
      const errMsg = err.response?.data?.message || err.response?.data?.error || t.profilePage.failed;
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
      errors.newEmail = t.emailModal.newEmailRequired;
    } else if (!validateEmail(emailForm.newEmail)) {
      errors.newEmail = t.emailModal.invalidEmail;
    } else if (emailForm.newEmail.toLowerCase() === user?.email?.toLowerCase()) {
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

    if (!passwordForm.currentPassword.trim()) {
      errors.currentPassword = t.passwordModal.currentPasswordRequired;
    }

    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = t.passwordModal.newPasswordRequired;
    } else {
      if (passwordForm.newPassword.length < 8) {
        errors.newPassword = t.passwordModal.passwordMinLength;
      } else if (!/[A-Z]/.test(passwordForm.newPassword)) {
        errors.newPassword = t.passwordModal.passwordUppercase;
      } else if (!/[a-z]/.test(passwordForm.newPassword)) {
        errors.newPassword = t.passwordModal.passwordLowercase;
      } else if (!/[0-9]/.test(passwordForm.newPassword)) {
        errors.newPassword = t.passwordModal.passwordNumber;
      }
    }

    if (!passwordForm.confirmPassword.trim()) {
      errors.confirmPassword = t.passwordModal.confirmPasswordRequired;
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = t.passwordModal.passwordsDoNotMatch;
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
      const res = await axios.put('/api/profile/update/', {
        email: emailForm.newEmail,
      });

      stopLoading('change-email');
      setEmailMessage({
        type: 'success',
        text: t.emailModal.successMessage
      });

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

      setTimeout(() => {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordModal(false);
        setPasswordMessage('');
      }, 2000);
    } catch (err) {
      stopLoading('change-password');
      
      let errorMessage = t.passwordModal.errorMessage;
      
      if (err.response?.status === 429) {
        errorMessage = t.passwordModal.rateLimitError;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setPasswordMessage({
        type: 'error',
        text: errorMessage
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
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <StudentNavbar onToggle={setIsNavbarOpen} />

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
                  {t.header.title}
                </h1>
                <p className={`text-xs sm:text-sm md:text-base mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'} ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t.header.subtitle}
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
                  <span className="hidden sm:inline">{t.tabs.emailPreferences}</span>
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
                  <span className="hidden sm:inline">{t.tabs.profile}</span>
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
                      {t.messages.loading}
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
                  <button
                    onClick={() => setMessage({ type: '', text: '' })}
                    className={`p-2 rounded-lg transition-all opacity-50 hover:opacity-100 ${
                      message.type === 'success'
                        ? isDark
                          ? 'text-green-100'
                          : 'text-green-900'
                        : isDark
                        ? 'text-red-100'
                        : 'text-red-900'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Preferences Section - Hidden while loading */}
              {!loading && (
                <>
                  {/* Push Notifications Toggle - Add this before email sections */}
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
                            {t.bookingSection.title}
                          </h2>
                          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'} ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            {t.bookingSection.subtitle}
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
                                {t.bookingSection.optionTitle}
                              </p>
                              {preferences.email_on_booking && (
                                <span className={`text-xs px-2 py-0.5 rounded-full inline-block w-fit ${isDark ? 'bg-blue-700 text-blue-100' : 'bg-blue-200 text-blue-800'}`}>
                                  {t.status.enabled}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t.bookingSection.optionDescription}
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
                          <X className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                        </div>
                        <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <h2 className={`text-base sm:text-lg md:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            {t.cancellationSection.title}
                          </h2>
                          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'} ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            {t.cancellationSection.subtitle}
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => !saving && handleToggle('email_on_cancellation')}
                        className={`rounded-xl p-4 border-2 transition-all cursor-pointer ${
                          saving ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          preferences.email_on_cancellation
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
                            preferences.email_on_cancellation
                              ? isDark ? 'text-blue-400' : 'text-blue-600'
                              : isDark ? 'text-gray-600' : 'text-gray-400'
                          }`} />}
                          <div
                            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              preferences.email_on_cancellation
                                ? isDark
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-blue-500 bg-blue-500'
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
                                {t.cancellationSection.optionTitle}
                              </p>
                              {preferences.email_on_cancellation && (
                                <span className={`text-xs px-2 py-0.5 rounded-full inline-block w-fit ${isDark ? 'bg-blue-700 text-blue-100' : 'bg-blue-200 text-blue-800'}`}>
                                  {t.status.enabled}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t.cancellationSection.optionDescription}
                            </p>
                          </div>
                          {language !== 'ar' && <Mail className={`w-5 h-5 flex-shrink-0 ${
                            preferences.email_on_cancellation
                              ? isDark ? 'text-blue-400' : 'text-blue-600'
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

                      {googleCalendarConnected && (
                        <div className="mt-4">
                          <button
                            onClick={handleDisconnectGoogleCalendar}
                            disabled={googleCalendarLoading}
                            className={`w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                              isDark
                                ? 'border-red-600 bg-red-900/20 text-red-400 hover:bg-red-900/30 hover:border-red-500'
                                : 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-600'
                            }`}
                          >
                            {googleCalendarLoading ? (
                              <>
                                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t.googleCalendar?.disconnecting || 'Disconnecting...'}
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                {t.googleCalendar?.disconnectButton || 'Disconnect Google Calendar'}
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} p-3 sm:p-4 md:p-6`}>
                    <button
                      onClick={handleSave}
                      disabled={saving || loading || isLoading}
                      className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                        (saving || loading || isLoading)
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:shadow-lg hover:scale-105'
                      } ${
                        isDark
                          ? 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b] hover:from-[#3d8584] hover:to-[#2d5857] text-white'
                          : 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b] hover:from-[#3d8584] hover:to-[#2d5857] text-white'
                      }`}
                    >
                      {saving || isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          {t.buttons.saving}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                          {t.buttons.save}
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              {/* Alerts */}
              {profileError && (
                <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''} ${
                  isDark ? 'bg-red-900/20 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {profileError}
                </div>
              )}
              {profileMessage && (
                <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''} ${
                  isDark ? 'bg-green-900/20 border-green-700 text-green-200' : 'bg-green-50 border-green-200 text-green-800'
                }`}>
                  <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {profileMessage}
                </div>
              )}

              {/* Profile Header Card */}
              <div className={`${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'} p-3 sm:p-4 md:p-8 rounded-2xl shadow-xl border-2 w-full`}>
                <div className={`flex flex-col sm:flex-row ${language === 'ar' ? 'items-center sm:items-start sm:flex-row-reverse' : 'items-center sm:items-start'} gap-3 sm:gap-6`}>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#366c6b] to-[#1a3535] rounded-2xl shadow-lg flex items-center justify-center text-white font-bold text-2xl sm:text-3xl md:text-4xl flex-shrink-0">
                    {user?.first_name ? user.first_name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className={`flex-1 w-full sm:w-auto ${language === 'ar' ? 'text-center sm:text-right' : 'text-center sm:text-left'}`}>
                    <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t.profilePage.title}
                    </h1>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm sm:text-base md:text-lg`}>
                      {t.profilePage.description}
                    </p>
                    <div className={`mt-2 sm:mt-3 flex items-center ${language === 'ar' ? 'justify-center sm:justify-end' : 'justify-center sm:justify-start'} gap-2 flex-wrap`}>
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                        isDark ? 'bg-[#366c6b]/30 text-[#4a9d9c]' : 'bg-[#366c6b]/10 text-[#366c6b]'
                      }`}>
                        {t.profilePage.student}
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

              {/* Profile Form Card */}
              <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-3 sm:p-4 md:p-8 rounded-2xl shadow-xl border-2`}>
                <div className={`flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-2 sm:p-2.5 md:p-3 rounded-xl ${isDark ? 'bg-gradient-to-br from-[#366c6b] to-[#1a3535]' : 'bg-gradient-to-br from-[#4a9d9c] to-[#366c6b]'} shadow-lg`}>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className={`text-base sm:text-lg md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t.profilePage.personalInformation}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    {/* Username */}
                    <div>
                      <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {t.profilePage.username}
                      </label>
                      <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#366c6b]/50 ${language === 'ar' ? 'text-right' : 'text-left'} ${
                          isDark
                            ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
                            : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                        }`}
                        placeholder="Enter your username"
                      />
                    </div>

                    {/* First Name */}
                    <div>
                      <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {t.profilePage.firstName}
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
                        {t.profilePage.lastName}
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
                        {t.profilePage.email}
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
                          {t.profilePage.change}
                        </button>
                      </div>
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
                          {t.profilePage.saving}
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {t.profilePage.save}
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
                      {t.profilePage.changePassword}
                    </button>
                  </div>

                  {/* Danger Zone - Delete Account */}
                  <div className="mt-3 sm:mt-4 md:mt-6 pt-3 sm:pt-4 md:pt-6 border-t-2 border-red-600/30">
                    <h3 className={`text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2 ${
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
                      className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 border-red-600 bg-red-600/10 text-red-600 dark:text-red-400 font-semibold transition-all duration-300 hover:bg-red-600 hover:text-white hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {t.profilePage.deleteAccountButton}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Email Change Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-slideUp`}>
            <div className={`border-b-2 ${isDark ? 'border-gray-700' : 'border-gray-200'} p-3 sm:p-4 md:p-6 flex items-center justify-between`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-1.5 sm:p-2 rounded-xl ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <form onSubmit={handleEmailSubmit} className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-5">
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

              <div>
                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  Current Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${language === 'ar' ? 'text-right' : 'text-left'} ${
                    isDark
                      ? 'border-gray-600 bg-gray-700/50 text-gray-400'
                      : 'border-gray-300 bg-gray-100 text-gray-600'
                  }`}
                />
              </div>

              <div>
                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  {t.emailModal.newEmail} *
                </label>
                <input
                  type="email"
                  name="newEmail"
                  value={emailForm.newEmail}
                  onChange={handleEmailChange}
                  placeholder="Enter new email address"
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 ${language === 'ar' ? 'text-right' : 'text-left'} ${
                    emailErrors.newEmail
                      ? isDark ? 'border-red-600 bg-red-900/10 focus:ring-red-500' : 'border-red-500 bg-red-50 focus:ring-red-500'
                      : isDark ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 focus:ring-[#366c6b]/50' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:ring-[#366c6b]/50'
                  }`}
                />
                {emailErrors.newEmail && (
                  <p className={`text-sm mt-2 flex items-center gap-1.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {emailErrors.newEmail}
                  </p>
                )}
              </div>

              <div>
                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  {t.emailModal.confirmEmail} *
                </label>
                <input
                  type="email"
                  name="confirmEmail"
                  value={emailForm.confirmEmail}
                  onChange={handleEmailChange}
                  placeholder="Confirm new email address"
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 ${language === 'ar' ? 'text-right' : 'text-left'} ${
                    emailErrors.confirmEmail
                      ? isDark ? 'border-red-600 bg-red-900/10 focus:ring-red-500' : 'border-red-500 bg-red-50 focus:ring-red-500'
                      : isDark ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 focus:ring-[#366c6b]/50' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:ring-[#366c6b]/50'
                  }`}
                />
                {emailErrors.confirmEmail && (
                  <p className={`text-sm mt-2 flex items-center gap-1.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {emailErrors.confirmEmail}
                  </p>
                )}
              </div>

              <div className={`p-4 rounded-xl border-2 flex items-start gap-3 ${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                  <span className="font-semibold">{t.emailModal.importantNotice}</span> {t.emailModal.verificationNotice}
                </p>
              </div>

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-slideUp`}>
            <div className={`border-b-2 ${isDark ? 'border-gray-700' : 'border-gray-200'} p-3 sm:p-4 md:p-6 flex items-center justify-between`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-1.5 sm:p-2 rounded-xl ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                  <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className={`text-base sm:text-lg md:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
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

            <form onSubmit={handlePasswordSubmit} className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-5">
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

              <div>
                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  {t.passwordModal.currentPassword} *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 ${language === 'ar' ? 'text-right pr-4 pl-12' : 'text-left'} ${
                      passwordErrors.currentPassword
                        ? isDark ? 'border-red-600 bg-red-900/10 focus:ring-red-500' : 'border-red-500 bg-red-50 focus:ring-red-500'
                        : isDark ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 focus:ring-[#366c6b]/50' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:ring-[#366c6b]/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                      isDark ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className={`text-sm mt-2 flex items-center gap-1.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              <div>
                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  {t.passwordModal.newPassword} *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 ${language === 'ar' ? 'text-right pr-4 pl-12' : 'text-left'} ${
                      passwordErrors.newPassword
                        ? isDark ? 'border-red-600 bg-red-900/10 focus:ring-red-500' : 'border-red-500 bg-red-50 focus:ring-red-500'
                        : isDark ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 focus:ring-[#366c6b]/50' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:ring-[#366c6b]/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                      isDark ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className={`text-sm mt-2 flex items-center gap-1.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  Confirm {t.passwordModal.newPassword} *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 ${language === 'ar' ? 'text-right pr-4 pl-12' : 'text-left'} ${
                      passwordErrors.confirmPassword
                        ? isDark ? 'border-red-600 bg-red-900/10 focus:ring-red-500' : 'border-red-500 bg-red-50 focus:ring-red-500'
                        : isDark ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 focus:ring-[#366c6b]/50' : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:ring-[#366c6b]/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                      isDark ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className={`text-sm mt-2 flex items-center gap-1.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-slideUp`}>
            <div className={`border-b-2 ${isDark ? 'border-red-900/30' : 'border-red-200'} p-3 sm:p-4 md:p-6 flex items-center justify-between bg-red-500/10`}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-1.5 sm:p-2 rounded-xl ${isDark ? 'bg-red-900/50' : 'bg-red-100'}`}>
                  <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className={`text-base sm:text-lg md:text-xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
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

            <form onSubmit={handleDeleteAccount} className="p-3 sm:p-4 md:p-6">
              <div className={`mb-3 sm:mb-4 md:mb-6 p-3 sm:p-4 rounded-xl ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border-2`}>
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

              <div className="mb-3 sm:mb-4 md:mb-6">
                <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
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
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base rounded-xl border-2 transition-all ${language === 'ar' ? 'text-right pr-3 sm:pr-4 pl-10 sm:pl-12' : 'text-left'} ${
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
                    className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                      isDark ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showDeletePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {deleteError && (
                  <p className={`text-sm mt-2 flex items-center gap-1.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {deleteError}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteError('');
                  }}
                  className={`flex-1 px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl font-semibold transition-all ${
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
                  className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl"
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

      <Footer />
    </div>
  );
}
