import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const FeedbackChart = ({ data, isDark }) => {
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'];

  if (!data || !data.ratingDistribution || data.ratingDistribution.length === 0) {
    return (
      <div className={`w-full h-80 flex items-center justify-center rounded-xl border-2 border-dashed ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-gray-50'}`}>
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No feedback data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80 sm:h-96 lg:h-[450px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <Pie
            data={data.ratingDistribution}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.ratingDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '0.5rem',
              color: isDark ? '#f3f4f6' : '#111827'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            textStyle={{ color: isDark ? '#d1d5db' : '#4b5563', fontSize: '0.875rem' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FeedbackChart;
