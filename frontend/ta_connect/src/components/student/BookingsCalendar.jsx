import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import strings from '../../strings/MonthlyCalendarStrings';

export default function BookingsCalendar() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === 'dark';
  const t = strings[language];
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Helper function to get month date range
  const getMonthDateRange = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Create dates in local time
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    
    // Format without timezone conversion
    const formatDate = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };
    
    return {
      start: formatDate(monthStart),
      end: formatDate(monthEnd)
    };
  };

  // Get date range for current month
  const dateRange = getMonthDateRange(currentDate);

  // Fetch bookings for current month only
  const { data: bookings = [], isLoading: loading, error } = useQuery({
    queryKey: ['student', 'bookings', 'calendar', dateRange.start, dateRange.end],
    queryFn: async () => {
      const response = await axios.get('/api/student/booking/', {
        params: {
          date_from: dateRange.start,
          date_to: dateRange.end
        }
      });
      return response?.data?.bookings || [];
    },
    staleTime: 0,
    refetchOnMount: true,
    retry: false, // Don't retry if forbidden (403)
    onError: (err) => {
      if (err?.response?.status === 403) {
        console.warn('User does not have permission to view student bookings');
      }
    }
  });

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getBookingsForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return bookings.filter(booking => {
      // Handle both formats: YYYY-MM-DD from backend or Date object
      const bookingDate = typeof booking.date === 'string' ? booking.date : booking.date.toISOString().split('T')[0];
      return bookingDate === dateStr;
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    try {
      // Handle ISO datetime string (e.g., "2025-11-27T14:30:00Z")
      if (typeof time === 'string' && time.includes('T')) {
        // Extract just the time portion to avoid timezone conversion
        const timePart = time.split('T')[1].split('.')[0].split('Z')[0];
        const [hours, minutes] = timePart.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      }
      // Handle time-only string (e.g., "14:30:00" or "14:30")
      const timeParts = time.toString().split(':');
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        const ampm = hours >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
        const displayHour = hours % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      }
      return time;
    } catch (e) {
      console.error('Error formatting time:', e, time);
      return time;
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthNames = t.monthNames;
  const dayNames = t.dayNames;

  const today = new Date();
  const isToday = (day) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayBookings = getBookingsForDate(date);
      const hasBookings = dayBookings.length > 0;
      const isTodayDate = isToday(day);

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(hasBookings ? date : null)}
          onMouseEnter={(e) => {
            if (hasBookings) {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltipPosition({ 
                x: rect.left + rect.width / 2, 
                y: rect.top 
              });
              setHoveredDay(day);
            }
          }}
          onMouseLeave={() => setHoveredDay(null)}
          className={`aspect-square p-0.5 sm:p-1 md:p-2 border sm:border-2 rounded-lg sm:rounded-xl relative cursor-pointer transition-all duration-300 transform ${
            isTodayDate 
              ? isDark 
                ? 'bg-gradient-to-br from-[#366c6b]/40 to-[#1a3535]/40 border-[#366c6b] shadow-lg hover:shadow-xl hover:scale-105' 
                : 'bg-gradient-to-br from-[#366c6b]/15 to-[#1a3535]/15 border-[#366c6b] shadow-md hover:shadow-lg hover:scale-105' 
              : hasBookings 
                ? isDark 
                  ? 'bg-[#366c6b]/25 hover:bg-[#366c6b]/35 border-[#366c6b]/60 hover:border-[#366c6b] shadow-md hover:shadow-lg hover:scale-105' 
                  : 'bg-[#366c6b]/12 hover:bg-[#366c6b]/20 border-[#366c6b]/40 hover:border-[#366c6b] shadow-sm hover:shadow-md hover:scale-105'
                : isDark 
                  ? 'border-gray-700 hover:bg-gray-700/50 hover:border-gray-600 hover:scale-105' 
                  : 'border-gray-300 hover:bg-gray-100 hover:border-gray-400 hover:scale-105'
          }`}
        >
          <div className={`text-[10px] sm:text-xs md:text-sm font-bold ${
            isTodayDate 
              ? isDark ? 'text-[#4a9d9c]' : 'text-[#366c6b]' 
              : isDark ? 'text-gray-200' : 'text-gray-800'
          }`}>
            {day}
          </div>
          {hasBookings && (
            <div className="mt-0.5 space-y-0.5">
              {/* Show dots on mobile, booking details on larger screens */}
              <div className="sm:hidden flex flex-wrap gap-0.5 mt-1">
                {dayBookings.slice(0, 3).map((booking, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full ${
                      booking.is_completed
                        ? 'bg-green-500'
                        : booking.is_cancelled
                        ? 'bg-gray-400 opacity-60'
                        : 'bg-[#366c6b]'
                    }`}
                  />
                ))}
                {dayBookings.length > 3 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                )}
              </div>
              {/* Show booking details on tablet and up */}
              <div className="hidden sm:block space-y-0.5">
                {dayBookings.slice(0, 2).map((booking, idx) => (
                  <div
                    key={idx}
                    className={`text-[9px] sm:text-[10px] md:text-xs px-1 sm:px-1.5 py-0.5 rounded-md truncate font-medium shadow-sm flex items-center gap-0.5 sm:gap-1 ${
                    booking.is_completed
                      ? isDark
                        ? 'bg-gradient-to-r from-green-700 to-green-800 text-white'
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : booking.is_cancelled
                      ? isDark
                        ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 line-through opacity-60'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-100 line-through opacity-70'
                      : isDark 
                        ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white' 
                        : 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b] text-white'
                    }`}
                  >
                    {booking.is_completed && <span className="text-[8px] sm:text-[10px]">✓</span>}
                    {booking.is_cancelled && <span className="text-[8px] sm:text-[10px]">✕</span>}
                    <span className={booking.is_cancelled ? 'line-through' : ''}>{formatTime(booking.start_time)}</span>
                  </div>
                ))}
                {dayBookings.length > 2 && (
                  <div className={`text-[10px] sm:text-xs px-1 sm:px-1.5 font-bold ${isDark ? 'text-[#4a9d9c]' : 'text-[#366c6b]'}`}>
                    +{dayBookings.length - 2}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={`${isDark ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-white via-white to-gray-50'} rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border ${isDark ? 'border-gray-700' : 'border-gray-200'} relative overflow-hidden`}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#366c6b]/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#1a3535]/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Enhanced Tooltip */}
        {hoveredDay !== null && (
          <div 
            className={`fixed z-[100] pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 ${
              isDark ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'
            } border-2 rounded-xl shadow-2xl p-4 min-w-[280px] max-w-[380px] backdrop-blur-md`}
            style={{ 
              left: `${tooltipPosition.x}px`, 
              top: `${tooltipPosition.y - 10}px` 
            }}
          >
            <div className="space-y-2.5">
              {getBookingsForDate(new Date(year, month, hoveredDay)).map((booking, idx) => (
                <div 
                  key={idx} 
                  className={`pb-2.5 ${idx !== getBookingsForDate(new Date(year, month, hoveredDay)).length - 1 ? `border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}` : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'} ${booking.is_cancelled ? 'line-through opacity-60' : ''}`}>
                      {booking.course_name || t.officeHours}
                    </p>
                    {booking.is_completed && (
                      <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-semibold flex items-center gap-1">
                        <span>✓</span> {t.bookingStatus.completed}
                      </span>
                    )}
                    {booking.is_cancelled && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-semibold flex items-center gap-1">
                        <span>✕</span> {t.bookingStatus.cancelled}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-1.5 ${booking.is_cancelled ? 'line-through opacity-60' : ''}`}>
                    <span className="text-sm">🕐</span>
                    <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-1.5 ${booking.is_cancelled ? 'opacity-60' : ''}`}>
                    <span className="text-sm">👨‍🏫</span>
                    <span>{booking.instructor?.full_name || t.details.instructor}</span>
                  </p>
                  {booking.room && (
                    <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-1.5 ${booking.is_cancelled ? 'opacity-60' : ''}`}>
                      <span className="text-sm">📍</span>
                      <span>{booking.room}</span>
                    </p>
                  )}
                  {booking.section && (
                    <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-1.5 ${booking.is_cancelled ? 'opacity-60' : ''}`}>
                      <span className="text-sm">📚</span>
                      <span>{t.details.section} {booking.section}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Modern Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-gradient-to-br from-[#366c6b] to-[#1a3535]' : 'bg-gradient-to-br from-[#4a9d9c] to-[#366c6b]'} shadow-lg`}>
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t.calendar.myBookings}
            </h3>
          </div>
          <button
            onClick={goToToday}
            className="px-5 py-2.5 bg-gradient-to-r from-[#366c6b] to-[#1a3535] hover:from-[#2d5857] hover:to-[#152a2a] text-white rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm font-bold flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">{t.calendar.today}</span>
          </button>
        </div>

        {/* Sleek Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
              isDark ? 'hover:bg-gray-700 bg-gray-800/60 text-gray-300' : 'hover:bg-gray-100 bg-gray-50 text-gray-700'
            } shadow-md hover:shadow-xl`}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h4 className={`text-lg sm:text-xl lg:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {monthNames[month]} {year}
          </h4>

          <button
            onClick={nextMonth}
            className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
              isDark ? 'hover:bg-gray-700 bg-gray-800/60 text-gray-300' : 'hover:bg-gray-100 bg-gray-50 text-gray-700'
            } shadow-md hover:shadow-xl`}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day Names with Modern Styling */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2 mb-2 sm:mb-3">
          {dayNames.map(day => (
            <div key={day} className={`text-center text-[10px] sm:text-xs md:text-sm font-bold py-1.5 sm:py-2 md:py-3 rounded-md sm:rounded-lg ${isDark ? 'text-gray-400 bg-gray-800/40' : 'text-gray-600 bg-gray-100/50'}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid with Enhanced Loading */}
        {loading ? (
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2">
            {[...Array(35)].map((_, i) => (
              <div key={i} className={`aspect-square ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg sm:rounded-xl animate-pulse shadow-sm`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2">
            {renderCalendarDays()}
          </div>
        )}

        {/* Enhanced Selected Date Details */}
        {selectedDate && (
          <div className={`mt-6 sm:mt-8 p-5 sm:p-7 rounded-2xl ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'} shadow-xl backdrop-blur-sm`}>
            <h4 className={`font-bold mb-4 text-lg sm:text-xl ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2.5`}>
              <svg className="w-6 h-6 text-[#366c6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {selectedDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h4>
            <div className="space-y-3.5">
              {getBookingsForDate(selectedDate).map((booking, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
                    navigate('/student/manage-booked', { state: { filterDate: dateStr } });
                  }}
                  className={`p-5 rounded-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer relative ${
                    booking.is_completed
                      ? isDark
                        ? 'bg-gradient-to-br from-green-900/40 to-green-800/40 border-2 border-green-600 hover:border-green-500'
                        : 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400 shadow-lg hover:border-green-500'
                      : booking.is_cancelled
                      ? isDark
                        ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-2 border-gray-600 opacity-70'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-400 shadow-lg opacity-75'
                      : isDark 
                        ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 hover:border-[#366c6b]' 
                        : 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 shadow-lg hover:border-[#366c6b]'
                  }`}
                >
                  {booking.is_completed && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white text-xs rounded-full font-bold flex items-center gap-1.5 shadow-lg">
                      <span className="text-sm">✓</span> {t.bookingStatus.completed}
                    </div>
                  )}
                  {booking.is_cancelled && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs rounded-full font-bold flex items-center gap-1.5 shadow-lg">
                      <span className="text-sm">✕</span> {t.bookingStatus.cancelled}
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-24">
                      <p className={`font-bold text-lg sm:text-xl ${isDark ? 'text-white' : 'text-gray-900'} mb-3 ${booking.is_cancelled ? 'line-through opacity-60' : ''}`}>
                        {booking.course_name || t.officeHours}
                      </p>
                      <div className="space-y-2">
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-2.5 font-medium ${booking.is_cancelled ? 'line-through opacity-60' : ''}`}>
                          <span className="text-lg">🕐</span>
                          <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-2.5 font-medium ${booking.is_cancelled ? 'opacity-60' : ''}`}>
                          <span className="text-lg">👨‍🏫</span>
                          <span>{booking.instructor?.full_name || t.details.instructor}</span>
                        </p>
                        {booking.room && (
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-2.5 font-medium ${booking.is_cancelled ? 'opacity-60' : ''}`}>
                            <span className="text-lg">📍</span>
                            <span>{booking.room}</span>
                          </p>
                        )}
                        {booking.section && (
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-2.5 font-medium ${booking.is_cancelled ? 'opacity-60' : ''}`}>
                            <span className="text-lg">📚</span>
                            <span>{t.details.section} {booking.section}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`ml-3 ${isDark ? 'text-[#4a9d9c]' : 'text-[#366c6b]'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modern Legend */}
        <div className={`mt-4 sm:mt-6 md:mt-8 pt-3 sm:pt-4 md:pt-5 border-t sm:border-t-2 ${isDark ? 'border-gray-700' : 'border-gray-200'} flex flex-wrap items-center gap-2 sm:gap-3 md:gap-5 text-xs sm:text-sm`}>
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md sm:rounded-lg ${isDark ? 'bg-gradient-to-br from-[#366c6b]/30 to-[#1a3535]/30 border sm:border-2 border-[#366c6b]' : 'bg-gradient-to-br from-[#366c6b]/10 to-[#1a3535]/10 border sm:border-2 border-[#366c6b]'} shadow-md`}></div>
            <span className={`font-semibold text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t.legend.today}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md sm:rounded-lg ${isDark ? 'bg-[#366c6b]/20 border sm:border-2 border-[#366c6b]/50' : 'bg-[#366c6b]/10 border sm:border-2 border-[#366c6b]/30'} shadow-md`}></div>
            <span className={`font-semibold text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t.legend.active}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md sm:rounded-lg ${isDark ? 'bg-gradient-to-r from-green-700 to-green-800' : 'bg-gradient-to-r from-green-500 to-green-600'} shadow-md flex items-center justify-center text-white text-[10px] sm:text-xs font-bold`}>✓</div>
            <span className={`font-semibold text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t.legend.completed}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md sm:rounded-lg ${isDark ? 'bg-gradient-to-r from-gray-600 to-gray-700' : 'bg-gradient-to-r from-gray-400 to-gray-500'} shadow-md opacity-60 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold`}>✕</div>
            <span className={`font-semibold text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t.legend.cancelled}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
