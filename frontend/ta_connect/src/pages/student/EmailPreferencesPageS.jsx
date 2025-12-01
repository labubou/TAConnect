import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Mail, X, Save, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useGlobalLoading } from '../../contexts/GlobalLoadingContext';
import StudentNavbar from '../../components/student/studentNavbar';
import Footer from '../../components/General/Footer';
import { emailPreferencesStrings as allStrings } from '../../strings/emailPreferencesSTUStrings';

export default function EmailPreferencesPage() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = allStrings[language];
  const { user } = useAuth();
  const { startLoading, stopLoading, isLoading } = useGlobalLoading();
  const isDark = theme === 'dark';
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  const [preferences, setPreferences] = useState({
    email_on_booking: true,
    email_on_cancellation: true,
    email_on_update: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPreferences();
  }, []);

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
        email_on_update: data.email_on_update !== false,
      });
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
      setMessage({ 
        type: 'error', 
        text: t.messages.loadError
      });
      setPreferences({
        email_on_booking: true,
        email_on_cancellation: true,
        email_on_update: true,
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

  const handleReset = () => {
    setPreferences({
      email_on_booking: true,
      email_on_cancellation: true,
      email_on_update: true,
    });
    setMessage({ 
      type: 'success', 
      text: t.messages.resetSuccess
    });
  };

  // ==================================================================================
  // BACKEND CONNECTION - SAVE PREFERENCES
  // Endpoint: PATCH /api/profile/email-preferences/
  // Request Payload: { email_on_booking: boolean, email_on_cancellation: boolean, email_on_update: boolean }
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

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <StudentNavbar onToggle={setIsNavbarOpen} />

      <main
        className={`transition-all duration-300 flex-1 ${
          isNavbarOpen ? 'ml-64' : 'ml-0'
        } pt-20 px-3 sm:px-6 lg:px-10 pb-20`}
      >
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} p-4 sm:p-6`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-xl ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
                  <Bell className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t.header.title}
                  </h1>
                  <p className={`text-sm sm:text-base mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t.header.subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                disabled={saving || isLoading}
                className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } ${(saving || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Reset to default"
              >
                <RefreshCw className={`w-5 h-5 ${(saving || isLoading) ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium hidden sm:inline">{t.buttons.reset}</span>
              </button>
            </div>
          </div>

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
          {/* Email on Booking */}
          <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} overflow-hidden`}>
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
                  <Mail className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <h2 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t.bookingSection.title}
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t.bookingSection.subtitle}
                  </p>
                </div>
              </div>

              <div
                onClick={() => !saving && handleToggle('email_on_booking')}
                className={`rounded-xl p-4 border-2 transition-all cursor-pointer ${
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
                <div className="flex items-start gap-3">
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
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
                  <Mail className={`w-5 h-5 flex-shrink-0 ${
                    preferences.email_on_booking
                      ? isDark ? 'text-blue-400' : 'text-blue-600'
                      : isDark ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* Email on Cancellation */}
          <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} overflow-hidden`}>
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-red-900/20' : 'bg-red-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <div className="flex-1">
                  <h2 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t.cancellationSection.title}
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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
                <div className="flex items-start gap-3">
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
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
                  <Mail className={`w-5 h-5 flex-shrink-0 ${
                    preferences.email_on_cancellation
                      ? isDark ? 'text-blue-400' : 'text-blue-600'
                      : isDark ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* Email on Update */}
          <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} overflow-hidden`}>
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-100'}`}>
                  <RefreshCw className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                </div>
                <div className="flex-1">
                  <h2 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t.updateSection.title}
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t.updateSection.subtitle}
                  </p>
                </div>
              </div>

              <div
                onClick={() => !saving && handleToggle('email_on_update')}
                className={`rounded-xl p-4 border-2 transition-all cursor-pointer ${
                  saving ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  preferences.email_on_update
                    ? isDark
                      ? 'border-blue-600 bg-blue-900/20'
                      : 'border-blue-500 bg-blue-50'
                    : isDark
                    ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      preferences.email_on_update
                        ? isDark
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-blue-500 bg-blue-500'
                        : isDark
                        ? 'border-gray-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {preferences.email_on_update && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t.updateSection.optionTitle}
                      </p>
                      {preferences.email_on_update && (
                        <span className={`text-xs px-2 py-0.5 rounded-full inline-block w-fit ${isDark ? 'bg-blue-700 text-blue-100' : 'bg-blue-200 text-blue-800'}`}>
                          {t.status.enabled}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t.updateSection.optionDescription}
                    </p>
                  </div>
                  <Mail className={`w-5 h-5 flex-shrink-0 ${
                    preferences.email_on_update
                      ? isDark ? 'text-blue-400' : 'text-blue-600'
                      : isDark ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                </div>
              </div>
            </div>
          </div>

          

          {/* Save Button */}
          <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} p-4 sm:p-6`}>
            <button
              onClick={handleSave}
              disabled={saving || loading || isLoading}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
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
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  {t.buttons.saving}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {t.buttons.save}
                </>
              )}
            </button>
          </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
