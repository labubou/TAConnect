import strings from '../../strings/analyticsStrings';

const SummaryStatistics = ({ summary, isDark }) => {
  const StatItem = ({ label, value, icon, color }) => (
    <div className={`p-3 sm:p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {label}
          </p>
          <p className={`text-lg sm:text-2xl font-bold mt-1 ${color}`}>
            {value}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-600/50' : 'bg-white'}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (!summary) {
    return null;
  }

  return (
    <div className={`p-4 sm:p-6 rounded-xl shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg sm:text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {strings.backendAnalytics.summary}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatItem
          label={strings.backendAnalytics.averageBookingsPerSlot}
          value={summary.average_bookings_per_slot?.toFixed(2) || '0'}
          icon={<svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>}
          color={isDark ? 'text-orange-400' : 'text-orange-600'}
        />
        <StatItem
          label={strings.backendAnalytics.totalUniqueSlots}
          value={summary.total_unique_slots || '0'}
          icon={<svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM15 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM5 13a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM15 13a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" /></svg>}
          color={isDark ? 'text-green-400' : 'text-green-600'}
        />
        <StatItem
          label={strings.backendAnalytics.totalUniqueTimes}
          value={summary.total_unique_times || '0'}
          icon={<svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00-.293.707l-.707.707a1 1 0 101.414 1.414l1.414-1.414A1 1 0 0011 9.414V6z" clipRule="evenodd" /></svg>}
          color={isDark ? 'text-indigo-400' : 'text-indigo-600'}
        />
      </div>
    </div>
  );
};

export default SummaryStatistics;
