import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import strings from '../../strings/analyticsStrings';
import { SkeletonLoader } from '../General/SkeletonLoader';

const AllTimesAnalytics = ({ timesData, isDark, isLoading }) => {
  if (isLoading) {
    return (
      <div className={`p-4 sm:p-6 rounded-xl shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg sm:text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {strings.backendAnalytics.allTimes}
        </h3>
        <SkeletonLoader isDark={isDark} count={1} height="h-80" />
      </div>
    );
  }

  if (!timesData || timesData.length === 0) {
    return (
      <div className={`p-4 sm:p-6 rounded-xl shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg sm:text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {strings.backendAnalytics.allTimes}
        </h3>
        <div className={`w-full h-64 sm:h-80 flex items-center justify-center rounded-xl border-2 border-dashed ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'}`}>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {strings.backendAnalytics.noTimesData}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 rounded-xl shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {strings.backendAnalytics.allTimes}
      </h3>

      <div className="w-full h-64 sm:h-80 lg:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={timesData}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#374151' : '#e5e7eb'}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: isDark ? '#374151' : '#e5e7eb' }}
            />
            <YAxis
              tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: isDark ? '#374151' : '#e5e7eb' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '0.5rem',
                color: isDark ? '#f3f4f6' : '#111827'
              }}
              labelStyle={{ color: isDark ? '#f3f4f6' : '#111827' }}
              formatter={(value) => [value, 'Bookings']}
            />
            <Bar
              dataKey="bookingCount"
              fill={isDark ? '#3b82f6' : '#366c6b'}
              radius={[8, 8, 0, 0]}
              name="Bookings"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AllTimesAnalytics;
