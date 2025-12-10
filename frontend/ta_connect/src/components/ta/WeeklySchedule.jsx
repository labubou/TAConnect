import { useState, useEffect } from 'react';
import { useInstructorBookings } from '../../hooks/useApi';
import { useLanguage } from '../../contexts/LanguageContext';
import allStrings from '../../strings/WeeklyScheduleStrings';

export default function WeeklySchedule({ isDark = false }) {
  const { language } = useLanguage();
  const strings = allStrings[language] || allStrings.en;
  const [weekDates, setWeekDates] = useState([]);
  const [weekStartDate, setWeekStartDate] = useState('');
  const [weekEndDate, setWeekEndDate] = useState('');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Initialize week dates and handle navigation
  useEffect(() => {
    const today = new Date();
    // Add weeks offset
    today.setDate(today.getDate() + (currentWeekOffset * 7));
    
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay; // Sunday to Saturday
    
    const weekStart = new Date(today.setDate(diff));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const startStr = weekStart.toISOString().split('T')[0];
    const endStr = weekEnd.toISOString().split('T')[0];

    setWeekStartDate(startStr);
    setWeekEndDate(endStr);

    // Generate all dates for the week
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    setWeekDates(dates);
  }, [currentWeekOffset]);

  // Fetch bookings for the selected week with date range params
  const { data: bookings = [], isLoading, error } = useInstructorBookings(weekStartDate, weekEndDate);
  const [weekBookings, setWeekBookings] = useState([]);

  // Filter bookings for current week
  useEffect(() => {
    try {
      if (!bookings || bookings.length === 0 || !Array.isArray(bookings)) {
        setWeekBookings([]);
        return;
      }

      const filtered = bookings.filter(booking => {
        return booking && booking.date && weekDates.includes(booking.date);
      }).sort((a, b) => {
        try {
          const dateA = new Date(a.date + ' ' + (a.office_hour?.start_time || '00:00'));
          const dateB = new Date(b.date + ' ' + (b.office_hour?.start_time || '00:00'));
          return dateA - dateB;
        } catch (error) {
          console.warn('Error sorting bookings:', error);
          return 0;
        }
      });

      setWeekBookings(filtered);
    } catch (error) {
      console.error('Error filtering week bookings:', error);
      setWeekBookings([]);
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

  const getStatusColor = (booking) => {
    if (booking.is_cancelled) {
      return isDark ? 'bg-red-900/20 text-red-300 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200';
    }
    return isDark ? 'bg-blue-900/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200';
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
    <div className={`p-4 sm:p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
      {/* Header with Navigation */}
      <div className="mb-6">
        <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {strings.weekSchedule.title}
        </h2>
        
        {/* Date Range and Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
          <p className={`text-sm sm:text-base font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {getWeekDisplay()}
          </p>
          
          {/* Navigation Buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrevWeek}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                isDark
                  ? 'bg-gray-600 hover:bg-gray-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              {strings.weekSchedule.prevWeek}
            </button>
            
            <button
              onClick={handleToday}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {strings.weekSchedule.today}
            </button>
            
            <button
              onClick={handleNextWeek}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                isDark
                  ? 'bg-gray-600 hover:bg-gray-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              {strings.weekSchedule.nextWeek}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop View - Table */}
      {weekBookings.length > 0 ? (
        <>
          <div className="hidden md:block overflow-x-auto rounded-lg border" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            <table className="w-full">
              <thead>
                <tr className={isDark ? 'bg-gray-600' : 'bg-gray-100'}>
                  <th className={`px-4 sm:px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {strings.table.headers.dateTime}
                  </th>
                  <th className={`px-4 sm:px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {strings.table.headers.student}
                  </th>
                  <th className={`px-4 sm:px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {strings.table.headers.course}
                  </th>
                  <th className={`px-4 sm:px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {strings.table.headers.room}
                  </th>
                  <th className={`px-4 sm:px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {strings.table.headers.status}
                  </th>
                </tr>
              </thead>
              <tbody>
                {weekBookings.map((booking, index) => (
                  <tr key={booking.id} className={`border-t ${index % 2 === 0 ? (isDark ? 'bg-gray-700/50' : 'bg-gray-50/50') : ''}`} style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                    <td className={`px-4 sm:px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      <div>
                        <p className="font-medium">{formatDate(booking.date)}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatTime(booking.office_hour.start_time)} - {formatTime(booking.office_hour.end_time)}
                        </p>
                      </div>
                    </td>
                    <td className={`px-4 sm:px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      <div>
                        <p className="font-medium">
                          {booking.student.first_name} {booking.student.last_name}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {booking.student.email}
                        </p>
                        {booking.description && (
                          <p className={`text-xs mt-1 italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            💬 {booking.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 sm:px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      <div>
                        <p className="font-medium">{booking.office_hour.course_name}</p>
                        {booking.office_hour.section && (
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Sec: {booking.office_hour.section}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 sm:px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      {booking.office_hour.room || 'N/A'}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(booking)}`}>
                        {booking.is_cancelled ? strings.status.cancelled : strings.status.confirmed}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-4">
            {weekBookings.map((booking) => (
              <div
                key={booking.id}
                className={`p-4 rounded-lg border-2 transition-all ${getStatusColor(booking)}`}
              >
                {/* Date and Status */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>
                      {strings.table.headers.dateTime}
                    </p>
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(booking.date)}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatTime(booking.office_hour.start_time)} - {formatTime(booking.office_hour.end_time)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadgeColor(booking)}`}>
                    {booking.is_cancelled ? strings.status.cancelled : strings.status.confirmed}
                  </span>
                </div>

                {/* Student Info */}
                <div className="mb-3 pb-3 border-b" style={{ borderColor: isDark ? 'rgba(75, 85, 99, 0.3)' : '#e5e7eb' }}>
                  <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>
                    {strings.table.headers.student}
                  </p>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {booking.student.first_name} {booking.student.last_name}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {booking.student.email}
                  </p>
                  {booking.description && (
                    <p className={`text-xs mt-2 pt-2 italic border-t ${isDark ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-500'}`}>
                      💬 {booking.description}
                    </p>
                  )}
                </div>

                {/* Course and Room */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>
                      {strings.table.headers.course}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {booking.office_hour.course_name}
                      {booking.office_hour.section && ` - ${booking.office_hour.section}`}
                    </p>
                  </div>
                  {booking.office_hour.room && (
                    <div>
                      <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>
                        {strings.table.headers.room}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {booking.office_hour.room}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={`text-center py-12 ${isDark ? 'bg-gray-600/30' : 'bg-gray-50'} rounded-lg`}>
          <svg className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {strings.weekSchedule.noBookings}
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {strings.weekSchedule.noBookingsDescription}
          </p>
        </div>
      )}
    </div>
  );
}
