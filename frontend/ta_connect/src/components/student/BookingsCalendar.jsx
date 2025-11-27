import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';

export default function BookingsCalendar() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/student/booking/');
      if (response.data && response.data.bookings) {
        setBookings(response.data.bookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

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
      return bookingDate === dateStr && !booking.is_cancelled;
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    try {
      // Handle ISO datetime string (e.g., "2024-11-27T14:30:00Z")
      if (typeof time === 'string' && time.includes('T')) {
        // Extract just the time portion to avoid timezone conversion
        const timePart = time.split('T')[1].split('.')[0].split('Z')[0];
        const [hours, minutes] = timePart.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      }
      // Handle time-only string (e.g., "14:30:00" or "14:30")
      const timeParts = time.toString().split(':');
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
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
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
          className={`aspect-square p-1 sm:p-2 border rounded-lg relative cursor-pointer transition-all duration-300 ${
            isTodayDate 
              ? isDark 
                ? 'bg-gradient-to-br from-[#366c6b]/30 to-[#1a3535]/30 border-[#366c6b] hover:shadow-lg' 
                : 'bg-gradient-to-br from-[#366c6b]/10 to-[#1a3535]/10 border-[#366c6b] hover:shadow-lg' 
              : hasBookings 
                ? isDark 
                  ? 'bg-[#366c6b]/20 hover:bg-[#366c6b]/30 border-[#366c6b]/50 hover:border-[#366c6b] hover:shadow-md' 
                  : 'bg-[#366c6b]/10 hover:bg-[#366c6b]/20 border-[#366c6b]/30 hover:border-[#366c6b] hover:shadow-md'
                : isDark 
                  ? 'border-gray-600 hover:bg-gray-600 hover:border-gray-500' 
                  : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          <div className={`text-xs sm:text-sm font-medium ${
            isTodayDate 
              ? isDark ? 'text-[#366c6b]' : 'text-[#366c6b]' 
              : isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {day}
          </div>
          {hasBookings && (
            <div className="mt-0.5 space-y-0.5">
              {dayBookings.slice(0, 2).map((booking, idx) => (
                <div
                  key={idx}
                  className={`text-xs px-1 py-0.5 rounded truncate ${
                    isDark 
                      ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white' 
                      : 'bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white'
                  }`}
                >
                  {formatTime(booking.start_time)}
                </div>
              ))}
              {dayBookings.length > 2 && (
                <div className={`text-xs px-1 font-semibold ${isDark ? 'text-[#366c6b]' : 'text-[#366c6b]'}`}>
                  +{dayBookings.length - 2}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} rounded-xl shadow-md p-4 sm:p-6 border border-opacity-10 relative`}>
      {/* Tooltip */}
      {hoveredDay !== null && (
        <div 
          className={`fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 ${
            isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
          } border rounded-lg shadow-2xl p-3 min-w-[250px] max-w-[350px]`}
          style={{ 
            left: `${tooltipPosition.x}px`, 
            top: `${tooltipPosition.y - 10}px` 
          }}
        >
          <div className="space-y-2">
            {getBookingsForDate(new Date(year, month, hoveredDay)).map((booking, idx) => (
              <div 
                key={idx} 
                className={`pb-2 ${idx !== getBookingsForDate(new Date(year, month, hoveredDay)).length - 1 ? `border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}` : ''}`}
              >
                <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {booking.course_name || 'Office Hours'}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                  🕐 {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  👨‍🏫 {booking.instructor?.full_name || 'Instructor'}
                </p>
                {booking.room && (
                  <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    📍 {booking.room}
                  </p>
                )}
                {booking.section && (
                  <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    📚 Section {booking.section}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className={`text-lg sm:text-xl lg:text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          My Bookings Calendar
        </h3>
        <button
          onClick={goToToday}
          className="px-4 py-2 bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm font-medium"
        >
          Today
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={previousMonth}
          className={`p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105 ${
            isDark ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h4 className={`text-base sm:text-lg lg:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {monthNames[month]} {year}
        </h4>

        <button
          onClick={nextMonth}
          className={`p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-105 ${
            isDark ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {dayNames.map(day => (
          <div key={day} className={`text-center text-xs sm:text-sm font-semibold py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {[...Array(35)].map((_, i) => (
            <div key={i} className={`aspect-square ${isDark ? 'bg-gray-600' : 'bg-gray-100'} rounded-lg animate-pulse`} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {renderCalendarDays()}
        </div>
      )}

      {/* Selected Date Details */}
      {selectedDate && (
        <div className={`mt-4 sm:mt-6 p-4 sm:p-6 rounded-xl ${isDark ? 'bg-gray-600' : 'bg-gray-50'} shadow-md`}>
          <h4 className={`font-semibold mb-3 sm:mb-4 text-base sm:text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h4>
          <div className="space-y-3">
            {getBookingsForDate(selectedDate).map((booking, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg transition-all duration-300 hover:shadow-lg ${
                  isDark ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`font-semibold text-base sm:text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {booking.course_name || 'Office Hours'}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2 flex items-center gap-2`}>
                      <span>🕐</span>
                      <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-2`}>
                      <span>👨‍🏫</span>
                      <span>{booking.instructor?.full_name || 'Instructor'}</span>
                    </p>
                    {booking.room && (
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} flex items-center gap-2`}>
                        <span>📍</span>
                        <span>{booking.room}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className={`mt-4 sm:mt-6 pt-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'} flex flex-wrap items-center gap-4 text-xs sm:text-sm`}>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${isDark ? 'bg-gradient-to-br from-[#366c6b]/30 to-[#1a3535]/30 border border-[#366c6b]' : 'bg-gradient-to-br from-[#366c6b]/10 to-[#1a3535]/10 border border-[#366c6b]'}`}></div>
          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${isDark ? 'bg-[#366c6b]/20 border border-[#366c6b]/50' : 'bg-[#366c6b]/10 border border-[#366c6b]/30'}`}></div>
          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Has Bookings</span>
        </div>
      </div>
    </div>
  );
}
