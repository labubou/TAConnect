import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Mail, X, Save, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import TAnavbar from '../../components/ta/TAnavbar';
import Footer from '../../components/Footer';
import strings from '../../strings/TANavbarStrings';

export default function EmailPreferencesPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  const [preferences, setPreferences] = useState({
    email_on_booking: true,
    email_on_cancellation: true,
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
      const response = await axios.get('/api/profile/email-preferences/');
      const data = response.data;
      
      setPreferences({
        email_on_booking: data.email_on_booking !== false,
        email_on_cancellation: data.email_on_cancellation !== false,
      });
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
      setMessage({ 
        type: 'error', 
        text: strings.emailPreferences?.fetchError || 'Failed to load preferences'
      });
      setPreferences({
        email_on_booking: true,
        email_on_cancellation: true,
      });
    } finally {
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
    });
    setMessage({ 
      type: 'success', 
      text: 'Preferences reset to default'
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
      setMessage({ type: '', text: '' });

      const response = await axios.patch('/api/profile/email-preferences/', {
        email_on_booking: preferences.email_on_booking,
        email_on_cancellation: preferences.email_on_cancellation,
      });

      if (response.status === 200) {
        setMessage({ 
          type: 'success', 
          text: strings.emailPreferences?.saved || 'Preferences saved successfully'
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || strings.emailPreferences?.error || 'Failed to save preferences';
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
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <TAnavbar onToggle={setIsNavbarOpen} />

      <main
        className={`transition-all duration-300 flex-1 ${
          isNavbarOpen ? 'ml-64' : 'ml-0'
        } pt-20 px-3 sm:px-6 lg:px-10 pb-20`}
      >
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className={`rounded-2xl ${isDark ? 'bg-gray-900/60' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-800' : 'border-gray-100'} p-4 sm:p-6`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-xl ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-100'}`}>
                  <Bell className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                <div>
                  <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {strings.emailPreferences?.title || 'Email Preferences'}
                  </h1>
                  <p className={`text-sm sm:text-base mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Manage your email notification settings
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                disabled={saving}
                className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Reset to default"
              >
                <RefreshCw className={`w-5 h-5 ${saving ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">Reset to Default</span>
              </button>
            </div>
          </div>

          {/* Message Banner */}
          {message.text && (
            <div
              className={`rounded-2xl px-4 py-3 border flex items-center justify-between gap-4 ${
                message.type === 'success'
                  ? isDark
                    ? 'bg-emerald-900/20 border-emerald-700 text-emerald-200'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
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
                      ? 'text-emerald-100'
                      : 'text-emerald-900'
                    : isDark
                    ? 'text-red-100'
                    : 'text-red-900'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Email on Booking */}
          <div className={`rounded-2xl ${isDark ? 'bg-gray-900/60' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-800' : 'border-gray-100'} overflow-hidden`}>
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
                  <Mail className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <h2 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {strings.emailPreferences?.bookingLabel || 'Email on Booking'}
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Get notified when students book a session
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
                      ? 'border-emerald-600 bg-emerald-900/20'
                      : 'border-emerald-500 bg-emerald-50'
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
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-emerald-500 bg-emerald-500'
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
                        {strings.emailPreferences?.bookingLabel || 'Email on Booking'}
                      </p>
                      {preferences.email_on_booking && (
                        <span className={`text-xs px-2 py-0.5 rounded-full inline-block w-fit ${isDark ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-200 text-emerald-800'}`}>
                          Enabled
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Receive email when a student books your office hours
                    </p>
                  </div>
                  <Mail className={`w-5 h-5 flex-shrink-0 ${
                    preferences.email_on_booking
                      ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                      : isDark ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* Email on Cancellation */}
          <div className={`rounded-2xl ${isDark ? 'bg-gray-900/60' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-800' : 'border-gray-100'} overflow-hidden`}>
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-red-900/20' : 'bg-red-100'}`}>
                  <X className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <div className="flex-1">
                  <h2 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {strings.emailPreferences?.cancellationLabel || 'Email on Cancellation'}
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Get notified when students cancel their bookings
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
                      ? 'border-emerald-600 bg-emerald-900/20'
                      : 'border-emerald-500 bg-emerald-50'
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
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-emerald-500 bg-emerald-500'
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
                        {strings.emailPreferences?.cancellationLabel || 'Email on Cancellation'}
                      </p>
                      {preferences.email_on_cancellation && (
                        <span className={`text-xs px-2 py-0.5 rounded-full inline-block w-fit ${isDark ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-200 text-emerald-800'}`}>
                          Enabled
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Receive email when a student cancels a booking
                    </p>
                  </div>
                  <Mail className={`w-5 h-5 flex-shrink-0 ${
                    preferences.email_on_cancellation
                      ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                      : isDark ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className={`rounded-2xl ${isDark ? 'bg-gray-900/60' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-800' : 'border-gray-100'} p-4 sm:p-6`}>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                saving || loading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-lg hover:scale-105'
              } ${
                isDark
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  {strings.emailPreferences?.saving || 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {strings.emailPreferences?.save || 'Save Preferences'}
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
