import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import TAnavbar from '../../components/ta/TAnavbar';
import DashboardSlots from '../../components/ta/DashboardSlots';
import ErrorBoundary from '../../components/ErrorBoundary';
import Footer from '../../components/Footer';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import strings from '../../strings/TAPageStrings';
import { useInstructorSlots, useInstructorBookings } from '../../hooks/useApi';

export default function TAPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  // Use React Query hooks for data fetching with caching
  const { data: slots = [], isLoading: slotsLoading, error: slotsError, refetch: refetchSlots } = useInstructorSlots();
  const { data: bookings = [], isLoading: bookingsLoading, error: bookingsError } = useInstructorBookings();

  const loading = slotsLoading || bookingsLoading;
  const error = slotsError?.message || bookingsError?.message || '';

  const handleCreateSlot = () => {
    navigate('/ta/manage-courses');
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <TAnavbar onToggle={setIsNavbarOpen} />
      
      <div 
        className={`flex-1 transition-all duration-300 ${isNavbarOpen ? 'ml-0 sm:ml-64' : 'ml-0'} pt-20`}
        style={{ minHeight: 'calc(100vh - 4rem)' }}
      >
        <main className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 sm:p-8`}>
          <div className={`max-w-full mx-auto ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-8 rounded-xl shadow-lg`}> 
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex-1 min-w-0">
                <h1 className={`text-2xl sm:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {strings.taPage.weekSchedule.title}
                </h1>
                <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {strings.taPage.description}
                </p>
              </div>
              <button
                onClick={handleCreateSlot}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap text-sm sm:text-base"
              >
                {strings.taPage.createSlot}
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <SkeletonLoader isDark={isDark} count={3} height="h-24" className="mb-6" />
            )}

            {/* Error State */}
            {error && !loading && (
              <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'}`}>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Dashboard Slots Component */}
            {!loading && (
              <ErrorBoundary>
                <DashboardSlots 
                  isDark={isDark}
                  slots={slots}
                  bookings={bookings}
                  loading={loading}
                  error={error}
                  onCreateSlot={handleCreateSlot}
                />
              </ErrorBoundary>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}