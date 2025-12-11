import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import TAnavbar from '../../components/ta/TAnavbar';
import BookingsChart from '../../components/ta/BookingsChart';
import StudentActivityChart from '../../components/ta/StudentActivityChart';
import MostBookedSlotCard from '../../components/ta/MostBookedSlotCard';
import MostBookedTimeCard from '../../components/ta/MostBookedTimeCard';
import AllSlotsAnalytics from '../../components/ta/AllSlotsAnalytics';
import AllTimesAnalytics from '../../components/ta/AllTimesAnalytics';
import SummaryStatistics from '../../components/ta/SummaryStatistics';
import ErrorBoundary from '../../components/General/ErrorBoundary';
import Footer from '../../components/General/Footer';
import { SkeletonLoader } from '../../components/General/SkeletonLoader';
import {
  processBookingsForChart,
  processStudentActivityForChart,
  calculateStatistics,
  processAllSlotsAnalytics,
  processAllTimesAnalytics
} from '../../services/analyticsService';
import strings from '../../strings/analyticsStrings';
import { useAnalyticsData, useBookingAnalytics } from '../../hooks/useApi';

export default function AnalyticsDashboard() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === 'dark';
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [bookingsData, setBookingsData] = useState([]);
  const [studentActivityData, setStudentActivityData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Use React Query hooks for both analytics endpoints
  const { 
    data: analyticsData, 
    isLoading: loadingOld, 
    error: errorOld, 
    refetch: refetchOld 
  } = useAnalyticsData(dateRange.start, dateRange.end, {
    enabled: true,
  });

  const { 
    data: backendAnalytics, 
    isLoading: loadingBackend, 
    error: errorBackend, 
    refetch: refetchBackend 
  } = useBookingAnalytics(dateRange.start, dateRange.end, {
    enabled: true,
  });

  const loading = loadingOld || loadingBackend;
  const error = errorOld || errorBackend;

  // Process analytics data whenever it changes
  useEffect(() => {
    if (analyticsData) {
      const bookings = processBookingsForChart(analyticsData.bookings);
      const activity = processStudentActivityForChart(analyticsData.bookings);
      const stats = calculateStatistics(analyticsData.bookings, analyticsData.slots);

      setBookingsData(bookings);
      setStudentActivityData(activity);
      setStatistics(stats);
    }
  }, [analyticsData]);

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilter = () => {
    refetchOld();
    refetchBackend();
  };

  const handleClearFilter = () => {
    setDateRange({ start: '', end: '' });
    refetchOld();
    refetchBackend();
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

  // Process backend analytics data
  const allSlotsAnalytics = backendAnalytics?.allSlotsAnalytics ? processAllSlotsAnalytics(backendAnalytics.allSlotsAnalytics) : [];
  const allTimesAnalytics = backendAnalytics?.allTimesAnalytics ? processAllTimesAnalytics(backendAnalytics.allTimesAnalytics) : [];

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <TAnavbar onToggle={setIsNavbarOpen} />
      
      <div 
        className={`flex-1 transition-all duration-500 ease-in-out ${
          language === 'ar'
            ? (isNavbarOpen ? 'mr-0 sm:mr-64' : 'mr-0')
            : (isNavbarOpen ? 'ml-0 sm:ml-64' : 'ml-0')
        } pt-20`}
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

            {/* Error state */}
            {error && !loading && (
              <div className={`mb-6 p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-700/50 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium">Failed to load analytics data</p>
                    <p className="text-sm mt-1">{error?.message || 'Please try again or contact support if the problem persists.'}</p>
                  </div>
                </div>
              </div>
            )}

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

            {/* Loading State */}
            {loading && (
              <div>
                <SkeletonLoader isDark={isDark} count={5} height="h-20" className="mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <SkeletonLoader isDark={isDark} count={1} height="h-80" />
                  <SkeletonLoader isDark={isDark} count={1} height="h-80" />
                </div>
              </div>
            )}

            {/* No data state when loaded but statistics is null */}
            {!loading && !statistics && !error && (
              <div className={`p-8 text-center rounded-xl border-2 border-dashed ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
                <svg className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {strings.dashboard.noData}
                </p>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {strings.dashboard.noDataMessage}
                </p>
              </div>
            )}

            {/* Statistics Cards */}
            {!loading && statistics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <StatCard
                  label={strings.dashboard.stats.totalBookings}
                  value={statistics.totalBookings || 0}
                  icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM15 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM5 13a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM15 13a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" /></svg>}
                  color="bg-blue-500"
                />
                <StatCard
                  label={strings.dashboard.stats.activeBookings}
                  value={statistics.activeBookings || 0}
                  icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                  color="bg-green-500"
                />
                <StatCard
                  label={strings.dashboard.stats.cancelledBookings}
                  value={statistics.cancelledBookings || 0}
                  icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>}
                  color="bg-red-500"
                />
                <StatCard
                  label={strings.dashboard.stats.uniqueStudents}
                  value={statistics.uniqueStudents || 0}
                  icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 12a6 6 0 11-12 0 6 6 0 0112 0z" /><path d="M14.5 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /></svg>}
                  color="bg-purple-500"
                />
                <StatCard
                  label={strings.dashboard.stats.totalSlots}
                  value={statistics.totalSlots || 0}
                  icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" /></svg>}
                  color="bg-yellow-500"
                />
              </div>
            )}

            {/* Charts Grid */}
            {!loading && statistics && (
              <>
                {/* First Row: Bookings Chart and Student Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Bookings Chart */}
                  <div className={`p-4 sm:p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border border-opacity-10 shadow-sm`}>
                    <h2 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {strings.dashboard.charts.bookingsOverTime}
                    </h2>
                    <ErrorBoundary>
                      <BookingsChart data={bookingsData} isDark={isDark} />
                    </ErrorBoundary>
                  </div>

                  {/* Most Booked Time */}
                  <div>
                    <ErrorBoundary>
                      <MostBookedTimeCard 
                        timeData={backendAnalytics?.mostBookedTime}
                        isDark={isDark}
                      />
                    </ErrorBoundary>
                  </div>
                </div>

                {/* Second Row: Most Booked Slot and All Times Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Most Booked Slot */}
                  <div>
                    <ErrorBoundary>
                      <MostBookedSlotCard 
                        slotData={backendAnalytics?.mostBookedSlot}
                        isDark={isDark}
                      />
                    </ErrorBoundary>
                  </div>

                  {/* All Times Analytics */}
                  <div>
                    <ErrorBoundary>
                      <AllTimesAnalytics 
                        timesData={allTimesAnalytics}
                        isDark={isDark}
                        isLoading={loadingBackend}
                      />
                    </ErrorBoundary>
                  </div>
                </div>

                {/* Third Row: Summary Statistics and Student Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Summary Statistics */}
                  <div>
                    <ErrorBoundary>
                      <SummaryStatistics 
                        summary={backendAnalytics?.summary}
                        isDark={isDark}
                      />
                    </ErrorBoundary>
                  </div>

                  {/* Student Activity Chart */}
                  <div className={`p-4 sm:p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-white'} border border-opacity-10 shadow-sm`}>
                    <h2 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {strings.dashboard.charts.studentActivity}
                    </h2>
                    <ErrorBoundary>
                      <StudentActivityChart data={studentActivityData} isDark={isDark} />
                    </ErrorBoundary>
                  </div>
                </div>

                {/* Fourth Row: All Slots Analytics */}
                <div>
                  <ErrorBoundary>
                    <AllSlotsAnalytics 
                      slotsData={allSlotsAnalytics}
                      isDark={isDark}
                      isLoading={loadingBackend}
                    />
                  </ErrorBoundary>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
