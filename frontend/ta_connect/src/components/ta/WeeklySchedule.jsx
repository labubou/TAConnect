import { useState, useMemo } from 'react';
import { useInstructorBookings } from '../../hooks/useApi';
import { useLanguage } from '../../contexts/LanguageContext';
import allStrings from '../../strings/WeeklyScheduleStrings';

// Helper function to calculate week data without side effects
const calculateWeekData = (weekOffset) => {
  const today = new Date();
  // Create a new date with the offset applied
  const targetDate = new Date(today.getTime() + (weekOffset * 7 * 24 * 60 * 60 * 1000));
  
  const currentDay = targetDate.getDay();
  // Get Sunday of the current week
  const weekStart = new Date(targetDate);
  weekStart.setDate(targetDate.getDate() - currentDay);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const startStr = weekStart.toISOString().split('T')[0];
  const endStr = weekEnd.toISOString().split('T')[0];

  // Generate all dates for the week
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return { startStr, endStr, dates };
};

export default function WeeklySchedule({ isDark = false }) {
  const { language } = useLanguage();
  const strings = allStrings[language] || allStrings.en;
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Calculate week data based on offset using useMemo
  const { startStr: weekStartDate, endStr: weekEndDate, dates: weekDates } = useMemo(
    () => calculateWeekData(currentWeekOffset),
    [currentWeekOffset]
  );

  // Fetch bookings for the selected week with date range params
  const { data: bookings = [], isLoading, error } = useInstructorBookings(weekStartDate, weekEndDate);

  // Filter and sort bookings for current week using useMemo
  const weekBookings = useMemo(() => {
    try {
      if (!bookings || bookings.length === 0 || !Array.isArray(bookings)) {
        return [];
      }

      return bookings.filter(booking => {
        return booking && booking.date && weekDates.includes(booking.date);
      }).sort((a, b) => {
        try {
          const dateA = new Date(a.date + ' ' + (a.office_hour?.start_time || '00:00'));
          const dateB = new Date(b.date + ' ' + (b.office_hour?.start_time || '00:00'));
          return dateA - dateB;
        } catch (sortError) {
          console.warn('Error sorting bookings:', sortError);
          return 0;
        }
      });
    } catch (filterError) {
      console.error('Error filtering week bookings:', filterError);
      return [];
    }
  }, [bookings, weekDates]);

  const getWeekDisplay = () => {
    if (!weekStartDate || !weekEndDate) return '';
    const start = new Date(weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const end = new Date(weekEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  const handlePrevWeek = () => {
    setCurrentWeekOffset(prev => prev - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeekOffset(prev => prev + 1);
  };

  const handleToday = () => {
    setCurrentWeekOffset(0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusBadgeColor = (booking) => {
    if (booking.is_cancelled) {
      return isDark ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700';
    }
    return isDark ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700';
  };

  if (isLoading) {
    return (
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
        <div className="space-y-4">
          <div className={`h-12 rounded animate-pulse ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-24 rounded animate-pulse ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-lg border-2 ${isDark ? 'bg-red-900/20 border-red-600 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
        <p className="font-semibold">Error loading bookings</p>
        <p className="text-sm mt-1">{error.message || 'Failed to fetch bookings'}</p>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'} h-full flex flex-col`}>
      {/* Header with Navigation */}
      <div className="mb-4">
        <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {strings.weekSchedule.title}
        </h2>
        
        {/* Date Range */}
        <p className={`text-sm font-medium mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {getWeekDisplay()}
        </p>
        
        {/* Navigation Buttons - Always stacked for better fit */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handlePrevWeek}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
              isDark
                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
            title={strings.weekSchedule.prevWeek}
          >
            <span className="hidden sm:inline">{strings.weekSchedule.prevWeek}</span>
            <span className="sm:hidden">← Prev</span>
          </button>
          
          <button
            onClick={handleToday}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {strings.weekSchedule.today}
          </button>
          
          <button
            onClick={handleNextWeek}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
              isDark
                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
            title={strings.weekSchedule.nextWeek}
          >
            <span className="hidden sm:inline">{strings.weekSchedule.nextWeek}</span>
            <span className="sm:hidden">Next →</span>
          </button>
        </div>
      </div>

      {/* Bookings List - Card-based layout for all screen sizes */}
      <div className="flex-1 overflow-y-auto">
        {weekBookings.length > 0 ? (
          <div className="space-y-3">
            {weekBookings.map((booking) => (
              <div
                key={booking.id}
                className={`p-3 sm:p-4 rounded-lg border transition-all ${
                  booking.is_cancelled
                    ? (isDark ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200')
                    : (isDark ? 'bg-gray-600/50 border-gray-500/30' : 'bg-gray-50 border-gray-200')
                }`}
              >
                {/* Date, Time, and Status Row */}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(booking.date)}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatTime(booking.office_hour.start_time)} - {formatTime(booking.office_hour.end_time)}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(booking)}`}>
                    {booking.is_cancelled ? strings.status.cancelled : strings.status.confirmed}
                  </span>
                </div>

                {/* Student Info */}
                <div className={`py-2 border-t ${isDark ? 'border-gray-500/30' : 'border-gray-200'}`}>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {booking.student.first_name} {booking.student.last_name}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                    {booking.student.email}
                  </p>
                  {booking.description && (
                    <p className={`text-xs mt-1 italic ${isDark ? 'text-gray-500' : 'text-gray-500'} line-clamp-2`}>
                      💬 {booking.description}
                    </p>
                  )}
                </div>

                {/* Course and Room */}
                <div className={`pt-2 border-t ${isDark ? 'border-gray-500/30' : 'border-gray-200'} flex flex-wrap gap-x-4 gap-y-1 text-xs`}>
                  <div className="flex items-center gap-1">
                    <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>📚</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {booking.office_hour.course_name}
                      {booking.office_hour.section && ` (${booking.office_hour.section})`}
                    </span>
                  </div>
                  {booking.office_hour.room && (
                    <div className="flex items-center gap-1">
                      <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>📍</span>
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        {booking.office_hour.room}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${isDark ? 'bg-gray-600/30' : 'bg-gray-50'} rounded-lg`}>
            <svg className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-gray-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {strings.weekSchedule.noBookings}
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {strings.weekSchedule.noBookingsDescription}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
