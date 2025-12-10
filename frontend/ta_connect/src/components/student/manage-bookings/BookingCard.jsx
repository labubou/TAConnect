import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import allStrings from '../../../strings/manageBookingsStrings';

export default function BookingCard({
  booking,
  status = 'active', // 'active', 'cancelled', 'completed'
  formatDate,
  formatTime,
  onUpdate,
  onCancel
}) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = allStrings[language];
  const isDark = theme === 'dark';

  const getCardStyles = () => {
    switch (status) {
      case 'pending':
        return `${isDark ? 'bg-gradient-to-br from-yellow-900/20 to-gray-700 border-yellow-600/40' : 'bg-gradient-to-br from-yellow-50 to-white border-yellow-400/40'} border-2 rounded-xl p-4 sm:p-6 transition-all duration-300 hover:shadow-lg`;
      case 'cancelled':
        return `${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'} border-2 rounded-xl p-4 sm:p-6 opacity-75`;
      case 'completed':
        return `${isDark ? 'bg-gradient-to-br from-gray-700 to-gray-750 border-green-600/30' : 'bg-gradient-to-br from-green-50 to-white border-green-300'} border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-lg`;
      default:
        return `${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-br from-[#eaf6f6] to-white border-[#366c6b]/20'} border-2 rounded-xl p-4 sm:p-6 transition-all duration-300 hover:shadow-lg`;
    }
  };

  const getStatusBadge = () => {
    if (status === 'pending') {
      return (
        <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded ${isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700'}`}>
          {t.status.pending}
        </span>
      );
    }
    if (status === 'cancelled') {
      return (
        <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
          {t.status.cancelled}
        </span>
      );
    }
    if (status === 'completed') {
      return (
        <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}`}>
          {t.status.completed}
        </span>
      );
    }
    return null;
  };

  const getTextColor = () => {
    if (status === 'cancelled') {
      return isDark ? 'text-gray-400' : 'text-gray-600';
    }
    if (status === 'completed') {
      return isDark ? 'text-gray-300' : 'text-gray-700';
    }
    return isDark ? 'text-gray-300' : 'text-gray-700';
  };

  return (
    <div className={getCardStyles()}>
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div>
          <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {booking.course_name}
          </h3>
          {booking.section && status === 'active' && (
            <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.bookingCard.section} {booking.section}
            </p>
          )}
          {getStatusBadge()}
        </div>
      </div>
      
      <div className={`space-y-1.5 sm:space-y-2 ${status === 'active' ? 'mb-3 sm:mb-4' : ''} text-sm sm:text-base ${getTextColor()}`}>
        <p className="flex items-center gap-2">
          <span>👨‍🏫</span>
          <span className={status === 'completed' ? 'truncate' : ''} dir="ltr">{booking.instructor?.full_name || 'Instructor'}</span>
        </p>
        <p className="flex items-center gap-2">
          <span>📅</span>
          <span dir="ltr">{formatDate(booking.date)}</span>
        </p>
        <p className="flex items-center gap-2">
          <span>🕐</span>
          <span dir="ltr">{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
        </p>
        {booking.room && (
          <p className="flex items-center gap-2">
            <span>📍</span>
            <span className={status === 'completed' ? 'truncate' : ''} dir="ltr">{booking.room}</span>
          </p>
        )}
      </div>

      {(status === 'active' || status === 'pending') && (
        <div className="flex flex-col xs:flex-row gap-2">
          <button
            onClick={() => onUpdate(booking)}
            className="flex-1 px-4 py-2 sm:py-2.5 bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm font-medium"
          >
            {t.buttons.update}
          </button>
          <button
            onClick={() => onCancel(booking)}
            className={`flex-1 px-4 py-2 sm:py-2.5 ${isDark ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50' : 'bg-red-100 text-red-700 hover:bg-red-200'} rounded-lg transition-all duration-300 text-xs sm:text-sm font-medium`}
          >
            {t.buttons.cancel}
          </button>
        </div>
      )}
    </div>
  );
}
