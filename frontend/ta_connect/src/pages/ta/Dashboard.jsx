import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import TAnavbar from '../../components/ta/TAnavbar';
import MonthlyCalendar from '../../components/ta/MonthlyCalendar';
import WeeklySchedule from '../../components/ta/WeeklySchedule';
import ErrorBoundary from '../../components/General/ErrorBoundary';
import Footer from '../../components/General/Footer';
import { SkeletonLoader } from '../../components/General/SkeletonLoader';
import { useInstructorSlots } from '../../hooks/useApi';
import allStrings from '../../strings/dashboardStrings';

export default function Dashboard() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const strings = allStrings[language];
  const isDark = theme === 'dark';
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  // Fetch slots data
  const { 
    data: slots = [], 
    isLoading: slotsLoading, 
    error: slotsError 
  } = useInstructorSlots();

  const isLoading = slotsLoading;
  const error = slotsError;

  // Ensure slots are arrays
  const safeSlots = Array.isArray(slots) ? slots : [];

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
          <div className={`max-w-7xl mx-auto`}>
            
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {strings.page.title}
              </h1>
              <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {strings.page.description}
              </p>
            </div>

            {/* Error State */}
            {error && !isLoading && (
              <div className={`mb-6 p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-700/50 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium">{strings.errors.loadingFailed}</p>
                    <p className="text-sm mt-1">
                      {error?.message || strings.errors.tryAgain}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-6">
                <div>
                  <h2 className={`text-lg sm:text-xl font-semibold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {strings.calendar.title}
                  </h2>
                  <SkeletonLoader isDark={isDark} count={1} height="h-80" />
                </div>
                <div>
                  <h2 className={`text-lg sm:text-xl font-semibold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {strings.weeklySchedule.title}
                  </h2>
                  <SkeletonLoader isDark={isDark} count={1} height="h-80" />
                </div>
              </div>
            )}

            {/* Content Grid */}
            {!isLoading && (
              <div className="grid grid-cols-1 gap-6 lg:gap-8">
                {/* Monthly Calendar */}
                <div>
                  <ErrorBoundary>
                    <MonthlyCalendar 
                      slots={safeSlots} 
                      isDark={isDark}
                      isLoading={slotsLoading}
                    />
                  </ErrorBoundary>
                </div>

                {/* Weekly Schedule */}
                <div>
                  <ErrorBoundary>
                    <WeeklySchedule 
                      isDark={isDark}
                    />
                  </ErrorBoundary>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
