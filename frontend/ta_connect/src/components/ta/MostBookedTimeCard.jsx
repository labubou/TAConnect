import strings from '../../strings/analyticsStrings';

const MostBookedTimeCard = ({ timeData, isDark }) => {
  if (!timeData) {
    return (
      <div className={`p-4 sm:p-6 rounded-xl shadow-md transition-all duration-300 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-start justify-between mb-4">
          <h3 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {strings.backendAnalytics.mostBookedTime}
          </h3>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
            <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00-.293.707l-.707.707a1 1 0 101.414 1.414l1.414-1.414A1 1 0 0011 9.414V6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {strings.backendAnalytics.noMostBookedTime}
        </p>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {strings.backendAnalytics.mostBookedTime}
        </h3>
        <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
          <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00-.293.707l-.707.707a1 1 0 101.414 1.414l1.414-1.414A1 1 0 0011 9.414V6z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div>
          <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {strings.backendAnalytics.time}
          </p>
          <p className={`text-3xl sm:text-4xl font-bold mt-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
            {timeData.time}
          </p>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            (Hour {timeData.hour})
          </p>
        </div>

        <div className={`p-3 sm:p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
            {strings.backendAnalytics.bookings}
          </p>
          <p className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
            {timeData.booking_count}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MostBookedTimeCard;
