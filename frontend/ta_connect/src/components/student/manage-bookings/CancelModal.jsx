import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import allStrings from '../../../strings/manageBookingsStrings';

export default function CancelModal({
  show,
  booking,
  formatDate,
  formatTime,
  onConfirm,
  onClose,
  isLoading
}) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = allStrings[language];
  const isDark = theme === 'dark';

  if (!show || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6`}>
        <h3 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3 sm:mb-4`}>
          {t.modals.cancelTitle}
        </h3>
        <p className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 sm:mb-6`}>
          {t.modals.cancelMessage}
        </p>
        
        <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-3 sm:p-4 rounded-lg mb-4`}>
          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {booking.course_name}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`} dir="ltr">
            📅 {formatDate(booking.date)}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`} dir="ltr">
            🕐 {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'} rounded-lg transition-all duration-300 font-medium`}
          >
            {t.modals.keepBooking}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              t.modals.confirmCancel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
