import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import allStrings from '../../../strings/manageBookingsStrings';

export default function UpdateModal({
  show,
  booking,
  availableDates,
  availableTimes,
  newDate,
  newTime,
  formatDate,
  formatTime,
  onDateSelect,
  onTimeSelect,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 my-4 sm:my-8`}>
        <h3 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3 sm:mb-4`}>
          {t.modals.updateTitle}
        </h3>
        
        <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg mb-6`}>
          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t.modals.currentBooking}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`} dir="ltr">
            📅 {formatDate(booking.date)}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`} dir="ltr">
            🕐 {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
          </p>
        </div>

        <div className="mb-6">
          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
            {t.modals.selectNewDate}
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {availableDates.map((date, index) => {
              // Use local timezone date formatting to avoid UTC conversion issues
              const yyyy = date.getFullYear();
              const mm = String(date.getMonth() + 1).padStart(2, '0');
              const dd = String(date.getDate()).padStart(2, '0');
              const dateStr = `${yyyy}-${mm}-${dd}`;
              return (
                <button
                  key={index}
                  onClick={() => onDateSelect(dateStr)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    newDate === dateStr
                      ? isDark ? 'border-[#366c6b] bg-[#366c6b]/20' : 'border-[#366c6b] bg-[#366c6b]/10'
                      : isDark ? 'border-gray-600 hover:border-gray-500 bg-gray-700' : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(date)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {newDate && (
          <div className="mb-6">
            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
              {t.modals.selectNewTime}
            </h4>
            {availableTimes.length === 0 ? (
              <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t.modals.noAvailableTimes}
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {availableTimes.map((time, index) => (
                  <button
                    key={index}
                    onClick={() => onTimeSelect(time)}
                    className={`p-2 sm:p-2.5 rounded-lg border-2 text-center transition-all font-medium text-xs sm:text-sm ${
                      newTime === time
                        ? isDark ? 'border-[#366c6b] bg-[#366c6b]/20 text-white' : 'border-[#366c6b] bg-[#366c6b]/10 text-[#366c6b]'
                        : isDark ? 'border-gray-600 hover:border-gray-500 bg-gray-700 text-gray-300' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    {formatTime(time)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'} rounded-lg transition-all duration-300 font-medium`}
          >
            {t.modals.cancelButton}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || !newDate || !newTime}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              t.modals.confirmUpdate
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
