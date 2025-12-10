import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import allStrings from '../../../strings/manageBookingsStrings';
import BookingCard from './BookingCard';

export default function BookingsList({
  title,
  bookings,
  status = 'active', // 'active', 'cancelled', 'completed'
  emptyIcon,
  emptyMessage,
  formatDate,
  formatTime,
  onUpdate,
  onCancel,
  gridCols = 'grid-cols-1 lg:grid-cols-2' // default for active/cancelled
}) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = allStrings[language];
  const isDark = theme === 'dark';

  const getEmptyIcon = () => {
    if (emptyIcon) return emptyIcon;
    
    switch (status) {
      case 'pending':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        );
      case 'cancelled':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        );
      case 'completed':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        );
      default:
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        );
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg mb-4 sm:mb-6 p-4 sm:p-6`}>
      <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 sm:mb-6`}>
        {title} ({bookings.length})
      </h2>
    
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <svg className={`mx-auto h-12 w-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {getEmptyIcon()}
          </svg>
          <p className={`mt-4 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className={`grid ${gridCols} gap-3 sm:gap-4`}>
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              status={status}
              formatDate={formatDate}
              formatTime={formatTime}
              onUpdate={onUpdate}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
