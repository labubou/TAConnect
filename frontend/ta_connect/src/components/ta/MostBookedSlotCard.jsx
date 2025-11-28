import { useTheme } from '../../contexts/ThemeContext';
import strings from '../../strings/analyticsStrings';

const MostBookedSlotCard = ({ slotData, isDark }) => {
  if (!slotData) {
    return (
      <div className={`p-4 sm:p-6 rounded-xl shadow-md transition-all duration-300 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-start justify-between mb-4">
          <h3 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {strings.backendAnalytics.mostBookedSlot}
          </h3>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
            <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
        </div>
        <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {strings.backendAnalytics.noMostBookedSlot}
        </p>
      </div>
    );
  }

  const startTime = slotData.start_time ? new Date(slotData.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const endTime = slotData.end_time ? new Date(slotData.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';

  return (
    <div className={`p-4 sm:p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {strings.backendAnalytics.mostBookedSlot}
        </h3>
        <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
          <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {strings.backendAnalytics.room}
          </p>
          <p className={`text-base sm:text-lg font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {slotData.room || 'N/A'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div>
            <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {strings.backendAnalytics.startTime}
            </p>
            <p className={`text-sm sm:text-base font-semibold mt-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              {startTime}
            </p>
          </div>
          <div>
            <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {strings.backendAnalytics.endTime}
            </p>
            <p className={`text-sm sm:text-base font-semibold mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              {endTime}
            </p>
          </div>
        </div>

        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
            {strings.backendAnalytics.bookings}
          </p>
          <p className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {slotData.booking_count}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MostBookedSlotCard;
