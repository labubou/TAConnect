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

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Note: This requires a backend endpoint that returns student bookings
      // The endpoint should filter bookings by the authenticated student user
      // Expected response format: { bookings: [...] }
      // Each booking should have: id, date, start_time, end_time, is_cancelled, 
      // and nested office_hour with: course_name, location, instructor details
      
      // Placeholder - replace with actual endpoint when available
      setBookings([]);
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
      return bookingDate === dateStr && !booking.is_cancel;
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (e) {
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
          className={`aspect-square p-1 border ${isDark ? 'border-gray-700' : 'border-gray-200'} rounded-lg relative cursor-pointer transition-all ${
            isTodayDate 
              ? isDark ? 'bg-blue-900/30 border-blue-500' : 'bg-blue-50 border-blue-400' 
              : hasBookings 
                ? isDark ? 'bg-teal-900/20 hover:bg-teal-900/30 border-teal-600/50' : 'bg-teal-50 hover:bg-teal-100 border-teal-400/50'
                : isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
          }`}
        >
          <div className={`text-sm font-medium ${isTodayDate ? isDark ? 'text-blue-300' : 'text-blue-700' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {day}
          </div>
          {hasBookings && (
            <div className="mt-0.5 space-y-0.5">
              {dayBookings.slice(0, 2).map((booking, idx) => (
                <div
                  key={idx}
                  className={`text-xs px-1 py-0.5 rounded truncate ${isDark ? 'bg-teal-700/50 text-teal-200' : 'bg-teal-600 text-white'}`}
                  title={`${formatTime(booking.start_time)} - ${booking.course_name || 'Office Hours'}`}
                >
                  {formatTime(booking.start_time)}
                </div>
              ))}
              {dayBookings.length > 2 && (
                <div className={`text-xs px-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  +{dayBookings.length - 2} more
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
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-xl ${isDark ? 'shadow-lg' : 'shadow-md'} p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          My Bookings Calendar
        </h3>
        <button
          onClick={goToToday}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isDark 
              ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          Today
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          <svg className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {monthNames[month]} {year}
        </h4>

        <button
          onClick={nextMonth}
          className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          <svg className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className={`text-center text-sm font-semibold py-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {[...Array(35)].map((_, i) => (
            <div key={i} className={`aspect-square ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg animate-pulse`} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      )}

      {/* Selected Date Details */}
      {selectedDate && (
        <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h4>
          <div className="space-y-2">
            {getBookingsForDate(selectedDate).map((booking, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${isDark ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {booking.course_name || 'Office Hours'}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      🕐 {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      👨‍🏫 {booking.instructor_name || 'Instructor'}
                    </p>
                    {booking.location && (
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        📍 {booking.location}
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
      <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-4 text-sm`}>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${isDark ? 'bg-blue-900/30 border border-blue-500' : 'bg-blue-50 border border-blue-400'}`}></div>
          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${isDark ? 'bg-teal-900/20 border border-teal-600/50' : 'bg-teal-50 border border-teal-400/50'}`}></div>
          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Has Bookings</span>
        </div>
      </div>
    </div>
  );
}
