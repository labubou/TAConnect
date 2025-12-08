import { Bell, BellOff, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import usePushNotifications from '../../hooks/usePushNotifications';
import strings from '../../strings/pushNotificationStrings';

export default function PushNotificationToggle({ className = '' }) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = strings[language];
  const isDark = theme === 'dark';
  
  const {
    isSupported,
    isSubscribed,
    permission,
    loading,
    error,
    toggle
  } = usePushNotifications();

  const handleToggle = async () => {
    const result = await toggle();
    if (!result.success) {
      console.error('Failed to toggle push notifications:', result.error);
    }
  };

  if (!isSupported) {
    return (
      <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} p-4 sm:p-6 ${className}`}>
        <div className={`flex items-start gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <BellOff className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
          <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t.title}
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t.notSupported}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} overflow-hidden ${className}`}>
      <div className="p-4 sm:p-6">
        <div className={`flex items-start gap-3 sm:gap-4 mb-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/20' : 'bg-purple-100'}`}>
            <Bell className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <h2 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t.title}
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.description}
            </p>
          </div>
        </div>

        {permission === 'denied' && (
          <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
            <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
              {t.permissionDenied}
            </p>
          </div>
        )}

        {error && (
          <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
            <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
              {error}
            </p>
          </div>
        )}

        <div
          onClick={() => !loading && permission !== 'denied' && handleToggle()}
          className={`rounded-xl p-4 border-2 transition-all ${
            loading || permission === 'denied' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          } ${
            isSubscribed
              ? isDark
                ? 'border-purple-600 bg-purple-900/20'
                : 'border-purple-500 bg-purple-50'
              : isDark
              ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
              : 'border-gray-200 hover:border-gray-300 bg-gray-50'
          }`}
        >
          <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-12 h-6 rounded-full relative transition-all ${
                isSubscribed
                  ? isDark ? 'bg-purple-600' : 'bg-purple-500'
                  : isDark ? 'bg-gray-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                  isSubscribed ? 'left-6' : 'left-0.5'
                }`}
              />
            </div>
            <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {isSubscribed ? t.disable : t.enable}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {isSubscribed ? t.enabled : t.disabled}
              </p>
            </div>
            {loading ? (
              <Loader2 className={`w-5 h-5 animate-spin ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            ) : (
              <Bell className={`w-5 h-5 ${
                isSubscribed
                  ? isDark ? 'text-purple-400' : 'text-purple-600'
                  : isDark ? 'text-gray-600' : 'text-gray-400'
              }`} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
