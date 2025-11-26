import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import TAnavbar from '../../components/ta/TAnavbar';
import BookingsChart from '../../components/ta/BookingsChart';
import FeedbackChart from '../../components/ta/FeedbackChart';
import StudentActivityChart from '../../components/ta/StudentActivityChart';
import ErrorBoundary from '../../components/ErrorBoundary';
import Footer from '../../components/Footer';
import {
  getAnalyticsData,
  processBookingsForChart,
  processFeedbackForChart,
  processStudentActivityForChart,
  calculateStatistics
} from '../../services/analyticsService';
import strings from '../../strings/analyticsStrings';

export default function AnalyticsDashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingsData, setBookingsData] = useState([]);
  const [feedbackData, setFeedbackData] = useState(null);
  const [studentActivityData, setStudentActivityData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');
      const analyticsData = await getAnalyticsData(dateRange.start, dateRange.end);
      
      // Process data for charts
      const bookings = processBookingsForChart(analyticsData.bookings);
      const feedback = processFeedbackForChart(analyticsData.slots);
      const activity = processStudentActivityForChart(analyticsData.bookings);
      const stats = calculateStatistics(analyticsData.bookings, analyticsData.slots);

      setBookingsData(bookings);
      setFeedbackData(feedback);
      setStudentActivityData(activity);
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setError(err.response?.data?.error || strings.dashboard.errorLoading);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilter = () => {
    fetchAnalyticsData();
  };

  const handleClearFilter = () => {
    setDateRange({ start: '', end: '' });
    fetchAnalyticsData();
  };

  // StatCard Component
  const StatCard = ({ label, value, icon, color }) => (
    <div className={`p-4 sm:p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {label}
          </p>
          <p className={`text-2xl sm:text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <TAnavbar onToggle={setIsNavbarOpen} />
      
      <div 
        className={`flex-1 transition-all duration-300 ${isNavbarOpen ? 'ml-0 sm:ml-64' : 'ml-0'} pt-20`}
        style={{ minHeight: 'calc(100vh - 4rem)' }}
      >
        <main className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-3 sm:p-6 lg:p-8`}>
          <div className={`max-w-7xl mx-auto ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg`}>
            
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {strings.dashboard.title}
              </h1>
              <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {strings.dashboard.description}
              </p>
            </div>

            {/* Date Filter */}
            <div className={`mb-6 sm:mb-8 p-3 sm:p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {strings.dashboard.startDate}
                  </label>
                  <input
                    type="date"
                    name="start"
                    value={dateRange.start}
                    onChange={handleDateFilterChange}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-gray-600 border-gray-500 text-white focus:border-[#366c6b]'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-[#366c6b]'
                    } focus:outline-none focus:ring-1 focus:ring-[#366c6b]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {strings.dashboard.endDate}
                  </label>
                  <input
                    type="date"
                    name="end"
                    value={dateRange.end}
                    onChange={handleDateFilterChange}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-gray-600 border-gray-500 text-white focus:border-[#366c6b]'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-[#366c6b]'
                    } focus:outline-none focus:ring-1 focus:ring-[#366c6b]`}
                  />
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleApplyFilter}
                  className="px-6 py-2 bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                >
                  {strings.dashboard.applyFilter}
                </button>
                <button
                  onClick={handleClearFilter}
                  className={`px-6 py-2 rounded-lg transition-all duration-300 text-sm sm:text-base ${
                    isDark
                      ? 'bg-gray-600 text-white hover:bg-gray-500'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  {strings.dashboard.clearFilter}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950 dark:border-red-900 text-sm">
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Statistics Cards */}
            {!loading && statistics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <StatCard
                  label={strings.dashboard.stats.totalBookings}
                  value={statistics.totalBookings}
                  icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM15 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM5 13a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM15 13a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" /></svg>}
                  color="bg-blue-500"
                />
                <StatCard
                  label={strings.dashboard.stats.activeBookings}
                  value={statistics.activeBookings}
                  icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                  color="bg-green-500"
                />
                <StatCard
                  label={strings.dashboard.stats.cancelledBookings}
                  value={statistics.cancelledBookings}
                  icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>}
                  color="bg-red-500"
                />
                <StatCard
                  label={strings.dashboard.stats.uniqueStudents}
                  value={statistics.uniqueStudents}
                  icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 12a6 6 0 11-12 0 6 6 0 0112 0z" /><path d="M14.5 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /></svg>}
                  color="bg-purple-500"
                />
                <StatCard
                  label={strings.dashboard.stats.totalSlots}
                  value={statistics.totalSlots}
                  icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" /></svg>}
                  color="bg-yellow-500"
                />
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="relative w-12 h-12">
                  <div className={`absolute inset-0 rounded-full border-4 border-transparent border-t-[#366c6b] animate-spin`}></div>
                  <div className={`absolute inset-2 rounded-full border-4 border-transparent border-r-[#1a3535] animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                </div>
              </div>
            )}

            {/* Charts Grid */}
            {!loading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Bookings Chart */}
                <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border border-opacity-10`}>
                  <h2 className={`text-xl sm:text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {strings.dashboard.charts.bookingsOverTime}
                  </h2>
                  <ErrorBoundary>
                    <BookingsChart data={bookingsData} isDark={isDark} />
                  </ErrorBoundary>
                </div>

                {/* Feedback Chart */}
                <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border border-opacity-10`}>
                  <h2 className={`text-xl sm:text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {strings.dashboard.charts.feedbackDistribution}
                  </h2>
                  <ErrorBoundary>
                    <FeedbackChart data={feedbackData} isDark={isDark} />
                  </ErrorBoundary>
                </div>
              </div>
            )}

            {/* Student Activity Chart - Full Width */}
            {!loading && (
              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border border-opacity-10`}>
                <h2 className={`text-xl sm:text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {strings.dashboard.charts.studentActivity}
                </h2>
                <ErrorBoundary>
                  <StudentActivityChart data={studentActivityData} isDark={isDark} />
                </ErrorBoundary>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
