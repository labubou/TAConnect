import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StudentActivityChart = ({ data, isDark }) => {
  if (!data || data.length === 0) {
    return (
      <div className={`w-full h-80 flex items-center justify-center rounded-xl border-2 border-dashed ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'}`}>
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No activity data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80 sm:h-96 lg:h-[450px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? '#374151' : '#e5e7eb'}
          />
          <XAxis 
            dataKey="date"
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '0.875rem' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '0.875rem' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '0.5rem',
              color: isDark ? '#f3f4f6' : '#111827'
            }}
            cursor={{ stroke: isDark ? '#4b5563' : '#d1d5db' }}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '1rem',
              fontSize: '0.875rem'
            }}
            textStyle={{ color: isDark ? '#d1d5db' : '#4b5563' }}
          />
          <Line 
            type="monotone" 
            dataKey="students" 
            stroke="#1a3535" 
            strokeWidth={3}
            dot={{ fill: '#366c6b', r: 5 }}
            activeDot={{ r: 7 }}
            name="Active Students"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudentActivityChart;
