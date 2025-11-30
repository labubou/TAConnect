import strings from '../../strings/analyticsStrings';
import { SkeletonLoader } from '../General/SkeletonLoader';

const AllSlotsAnalytics = ({ slotsData, isDark, isLoading }) => {
  if (isLoading) {
    return (
      <div className={`p-4 sm:p-6 rounded-xl shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg sm:text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {strings.backendAnalytics.allSlots}
        </h3>
        <SkeletonLoader isDark={isDark} count={3} height="h-12" />
      </div>
    );
  }

  if (!slotsData || slotsData.length === 0) {
    return (
      <div className={`p-4 sm:p-6 rounded-xl shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg sm:text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {strings.backendAnalytics.allSlots}
        </h3>
        <div className={`p-6 text-center rounded-lg border-2 border-dashed ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-300 bg-gray-50'}`}>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {strings.backendAnalytics.noSlotsData}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 rounded-xl shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg sm:text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {strings.backendAnalytics.allSlots}
      </h3>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <th className={`text-left px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {strings.backendAnalytics.slotDetails}
              </th>
              <th className={`text-left px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {strings.backendAnalytics.room}
              </th>
              <th className={`text-center px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {strings.backendAnalytics.bookings}
              </th>
            </tr>
          </thead>
          <tbody>
            {slotsData.map((slot, index) => (
              <tr key={index} className={`border-b transition-colors hover:${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <td className={`px-2 sm:px-4 py-3 text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="font-medium">{slot.startTime} - {slot.endTime}</div>
                </td>
                <td className={`px-2 sm:px-4 py-3 text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {slot.room}
                </td>
                <td className={`px-2 sm:px-4 py-3 text-center`}>
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    {slot.bookingCount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-2">
        {slotsData.map((slot, index) => (
          <div key={index} className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {strings.backendAnalytics.slotDetails}
                </p>
                <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {slot.startTime} - {slot.endTime}
                </p>
              </div>
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                {slot.bookingCount}
              </span>
            </div>
            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {strings.backendAnalytics.room}: <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{slot.room}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllSlotsAnalytics;
