import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import StudentNavbar from '../../components/student/studentNavbar';
import Footer from '../../components/Footer';
import axios from 'axios';
import { useStudentBookings, useCancelInstructorBooking, useUpdateBooking } from '../../hooks/useApi';
import strings from '../../strings/manageBookingsStrings';
import { useQuery } from '@tanstack/react-query';
import { useCancelInstructorBooking, useUpdateBooking } from '../../hooks/useApi';

// Helper function to get current month's date range
const getCurrentMonthDateRange = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);
  
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

export default function ManageBookingsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isNavbarOpen, setIsNavbarOpen] = useState(window.innerWidth >= 1024);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [sendCancelEmail, setSendCancelEmail] = useState(true);
  const [sendUpdateEmail, setSendUpdateEmail] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [filterCourse, setFilterCourse] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [dateRange, setDateRange] = useState(() => getCurrentMonthDateRange());
  const [clearedCancelledIds, setClearedCancelledIds] = useState(() => {
    const saved = localStorage.getItem('clearedCancelledIds');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Fetch bookings with date range
  const { data: allBookings = [], isLoading: loading, error: apiError, refetch } = useQuery({
    queryKey: ['student', 'bookings', 'manage', dateRange.start, dateRange.end],
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
  });
  
  // Use mutation for cancelling bookings
  const { mutate: cancelBookingMutation, isPending: isCancelling } = useCancelInstructorBooking();

  // Use mutation for updating bookings
  const { mutate: updateBookingMutation, isPending: isUpdating } = useUpdateBooking();

  // Save cleared IDs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('clearedCancelledIds', JSON.stringify([...clearedCancelledIds]));
  }, [clearedCancelledIds]);

  // Filter out cancelled bookings that were cleared by user
  const bookings = allBookings.filter(
    booking => !(booking.is_cancelled && clearedCancelledIds.has(booking.id))
  );

  // Show error if API call fails
  useEffect(() => {
    if (apiError) {
      setError(strings.messages.error);
    }
  }, [apiError]);

  // Fetch user email preferences on mount
  useEffect(() => {
    const fetchEmailPreferences = async () => {
      try {
        const response = await axios.get('/api/profile/email-preferences/');
        if (response.data) {
          setSendCancelEmail(response.data.email_on_cancellation !== false);
          setSendUpdateEmail(response.data.email_on_update !== false);
        }
      } catch (err) {
        console.error('Failed to fetch email preferences:', err);
        // Keep default values if fetch fails
      }
    };
    fetchEmailPreferences();
  }, []);

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
    setError('');
    setSuccess('');
  };

  const handleUpdateClick = (booking) => {
    setSelectedBooking(booking);
    setShowUpdateModal(true);
    setNewDate('');
    setNewTime('');
    setAvailableTimes([]);
    setError('');
    setSuccess('');
    generateAvailableDates(booking);
  };

  const generateAvailableDates = (booking) => {
    const dates = [];
    const today = new Date();
    const startDate = new Date(booking.office_hour?.start_date || today);
    const endDate = new Date(booking.office_hour?.end_date || today);
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const targetDay = daysOfWeek.indexOf(booking.office_hour?.day_of_week);

    let currentDate = new Date(Math.max(today, startDate));
    
    while (currentDate <= endDate) {
      if (currentDate.getDay() === targetDay && currentDate >= today) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setAvailableDates(dates);
  };

  const fetchAvailableTimes = async (slotId, date) => {
    try {
      const response = await axios.get(`/api/student/booking/${slotId}/`, {
        params: { date }
      });
      
      if (response.data && response.data.available_times) {
        setAvailableTimes(response.data.available_times);
      } else {
        setAvailableTimes([]);
      }
    } catch (err) {
      console.error('Error fetching available times:', err);
      setError(strings.modals.errors.noAvailableTimes);
      setAvailableTimes([]);
    }
  };

  const handleDateSelect = (dateStr) => {
    setNewDate(dateStr);
    setNewTime('');
    if (selectedBooking) {
      fetchAvailableTimes(selectedBooking.office_hour?.id, dateStr);
    }
  };

  const handleCancelBooking = () => {
    if (!selectedBooking) return;

    setCancelLoading(true);
    cancelBookingMutation(
      { bookingId: selectedBooking.id, sendEmail: sendCancelEmail },
      {
        onSuccess: () => {
          setSuccess(strings.messages.cancelSuccess);
          setShowCancelModal(false);
          setSelectedBooking(null);
          refetch();
          setTimeout(() => setSuccess(''), 3000);
        },
        onError: (err) => {
          console.error('Error cancelling booking:', err);
          setError(err.response?.data?.error || strings.messages.cancelError);
        },
        onSettled: () => {
          setCancelLoading(false);
        }
      }
    );
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking || !newDate || !newTime) {
      setError(strings.modals.errors.selectDateAndTime);
      return;
    }

    updateBookingMutation({
      bookingId: selectedBooking.id,
      data: {
        new_date: newDate,
        new_time: newTime,
        send_email: sendUpdateEmail
      }
    }, {
      onSuccess: () => {
        setSuccess(strings.messages.updateSuccess);
        setShowUpdateModal(false);
        refetch();
        setTimeout(() => setSuccess(''), 3000);
      },
      onError: (err) => {
        console.error('Error updating booking:', err);
        setError(err.response?.data?.error || strings.messages.updateError);
      }
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

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return String(date);
    }
  };

  const handleClearCancelled = () => {
    const cancelledIds = bookings.filter(b => b.is_cancelled).map(b => b.id);
    const newClearedIds = new Set([...clearedCancelledIds, ...cancelledIds]);
    setClearedCancelledIds(newClearedIds);
    setSuccess(strings.messages.clearedCancelled);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleClearFilters = () => {
    setFilterStatus('all');
    setFilterCourse('all');
    setSortBy('date');
    setDateRange(getCurrentMonthDateRange());
  };

  // Get unique courses for filter
  const uniqueCourses = [...new Set(bookings.map(b => b.course_name))].sort();

  // Filter and sort bookings
  const getFilteredBookings = () => {
    let filtered = [...bookings];

    // Status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(b => !b.is_cancelled && !b.is_completed);
    } else if (filterStatus === 'cancelled') {
      filtered = filtered.filter(b => b.is_cancelled);
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter(b => b.is_completed);
    }

    // Course filter
    if (filterCourse !== 'all') {
      filtered = filtered.filter(b => b.course_name === filterCourse);
    }

    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => {
        const dateComparison = new Date(a.date) - new Date(b.date);
        if (dateComparison !== 0) return dateComparison;
        // If same date, sort by start time
        const timeA = a.start_time.includes('T') ? a.start_time : `1970-01-01T${a.start_time}`;
        const timeB = b.start_time.includes('T') ? b.start_time : `1970-01-01T${b.start_time}`;
        return new Date(timeA) - new Date(timeB);
      });
    } else if (sortBy === 'course') {
      filtered.sort((a, b) => a.course_name.localeCompare(b.course_name));
    }

    return filtered;
  };

  const filteredBookings = getFilteredBookings();
  const activeBookings = filteredBookings.filter(b => !b.is_cancelled && !b.is_completed);
  const cancelledBookings = filteredBookings.filter(b => b.is_cancelled);
  const completedBookings = filteredBookings.filter(b => b.is_completed);

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <StudentNavbar onToggle={setIsNavbarOpen} />
      
      <div 
        className={`flex-1 transition-all duration-300 ${isNavbarOpen ? 'lg:ml-64' : 'ml-0'} pt-16 sm:pt-20`}
        style={{ minHeight: 'calc(100vh - 4rem)' }}
      >
        <main className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-3 sm:p-6`}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 md:p-8 rounded-xl shadow-lg mb-4 sm:mb-6`}>
              <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                {strings.page.title}
              </h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm sm:text-base md:text-lg`}>
                {strings.page.description}
              </p>
            </div>

            {/* Filter and Sort Controls */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 rounded-xl shadow-lg mb-4 sm:mb-6`}>
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Top Row: Filters */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Status Filter */}
                  <div className="flex-1 min-w-full sm:min-w-[150px]">
                    <label className={`block text-xs sm:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1.5 sm:mb-2`}>
                      {strings.filters.status}
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border-2 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-[#366c6b]' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-[#366c6b]'
                      } focus:outline-none transition-colors`}
                    >
                      <option value="all">{strings.filters.allBookings}</option>
                      <option value="active">{strings.filters.activeOnly}</option>
                      <option value="cancelled">{strings.filters.cancelledOnly}</option>
                      <option value="completed">{strings.filters.completedOnly}</option>
                    </select>
                  </div>

                  {/* Course Filter */}
                  <div className="flex-1 min-w-full sm:min-w-[150px]">
                    <label className={`block text-xs sm:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1.5 sm:mb-2`}>
                      {strings.filters.course}
                    </label>
                    <select
                      value={filterCourse}
                      onChange={(e) => setFilterCourse(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border-2 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-[#366c6b]' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-[#366c6b]'
                      } focus:outline-none transition-colors`}
                    >
                      <option value="all">{strings.filters.allCourses}</option>
                      {uniqueCourses.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="flex-1 min-w-full sm:min-w-[150px]">
                    <label className={`block text-xs sm:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1.5 sm:mb-2`}>
                      {strings.filters.sortBy}
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border-2 ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-[#366c6b]' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-[#366c6b]'
                      } focus:outline-none transition-colors`}
                    >
                      <option value="date">{strings.filters.byDate}</option>
                      <option value="course">{strings.filters.byCourse}</option>
                    </select>
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1.5 sm:mb-2`}>
                      From Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border-2 ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-[#366c6b]'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-[#366c6b]'
                      } focus:outline-none transition-colors`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1.5 sm:mb-2`}>
                      To Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className={`w-full px-4 py-2 rounded-lg border-2 ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-[#366c6b]'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-[#366c6b]'
                      } focus:outline-none transition-colors`}
                    />
                  </div>
                </div>

                {/* Bottom Row: Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-3 border-t border-gray-600/30">
                  <button
                    onClick={handleClearFilters}
                    className={`w-full sm:w-auto px-4 py-2 rounded-lg border transition-all ${
                      isDark
                        ? 'border-gray-500 text-gray-300 hover:bg-gray-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Clear Filters
                  </button>
                  {bookings.some(b => b.is_cancelled) && (
                    <button
                      onClick={handleClearCancelled}
                      className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                        isDark 
                          ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50 border-2 border-red-700 hover:scale-105' 
                          : 'bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-300 hover:scale-105'
                      } shadow-md hover:shadow-lg`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {strings.buttons.deleteAllCancelled}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className={`mb-6 p-4 ${isDark ? 'bg-green-900/30 border-green-600' : 'bg-green-50 border-green-300'} border-2 rounded-xl`}>
                <div className="flex items-start">
                  <svg className={`w-5 h-5 mr-3 mt-0.5 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className={`${isDark ? 'text-green-200' : 'text-green-700'} font-medium`}>{success}</span>
                </div>
              </div>
            )}

            {error && (
              <div className={`mb-6 p-4 ${isDark ? 'bg-red-900/30 border-red-600' : 'bg-red-50 border-red-300'} border-2 rounded-xl`}>
                <div className="flex items-start">
                  <svg className={`w-5 h-5 mr-3 mt-0.5 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className={`${isDark ? 'text-red-200' : 'text-red-700'} font-medium`}>{error}</span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#366c6b]"></div>
              </div>
            ) : (
              <>
                {/* Active Bookings */}
                {filterStatus !== 'cancelled' && filterStatus !== 'completed' && (
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg mb-4 sm:mb-6 p-4 sm:p-6`}>
                    <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 sm:mb-6`}>
                      {strings.sections.activeBookings} ({activeBookings.length})
                    </h2>
                  
                  {activeBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className={`mx-auto h-12 w-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className={`mt-4 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {strings.messages.noActiveBookings}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      {activeBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-br from-[#eaf6f6] to-white border-[#366c6b]/20'} border-2 rounded-xl p-4 sm:p-6 transition-all duration-300 hover:shadow-lg`}
                        >
                          <div className="flex justify-between items-start mb-3 sm:mb-4">
                            <div>
                              <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {booking.course_name}
                              </h3>
                              {booking.section && (
                                <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {strings.bookingCard.section} {booking.section}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className={`space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <p className="flex items-center gap-2">
                              <span>👨‍🏫</span>
                              <span>{booking.instructor?.full_name || 'Instructor'}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span>📅</span>
                              <span>{formatDate(booking.date)}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span>🕐</span>
                              <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                            </p>
                            {booking.room && (
                              <p className="flex items-center gap-2">
                                <span>📍</span>
                                <span>{booking.room}</span>
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col xs:flex-row gap-2">
                            <button
                              onClick={() => handleUpdateClick(booking)}
                              className="flex-1 px-4 py-2 sm:py-2.5 bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm font-medium"
                            >
                              {strings.buttons.update}
                            </button>
                            <button
                              onClick={() => handleCancelClick(booking)}
                              className={`flex-1 px-4 py-2 sm:py-2.5 ${isDark ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50' : 'bg-red-100 text-red-700 hover:bg-red-200'} rounded-lg transition-all duration-300 text-xs sm:text-sm font-medium`}
                            >
                              {strings.buttons.cancel}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                )}

                {/* Cancelled Bookings */}
                {filterStatus !== 'active' && filterStatus !== 'completed' && (
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg mb-4 sm:mb-6 p-4 sm:p-6`}>
                    <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 sm:mb-6`}>
                      {strings.sections.cancelledBookings} ({cancelledBookings.length})
                    </h2>
                    
                  {cancelledBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className={`mx-auto h-12 w-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <p className={`mt-4 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {strings.messages.noCancelledBookings}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      {cancelledBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className={`${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'} border-2 rounded-xl p-4 sm:p-6 opacity-75`}
                        >
                          <div className="flex justify-between items-start mb-3 sm:mb-4">
                            <div>
                              <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {booking.course_name}
                              </h3>
                              <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
                                {strings.status.cancelled}
                              </span>
                            </div>
                          </div>
                          
                          <div className={`space-y-1.5 sm:space-y-2 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <p className="flex items-center gap-2">
                              <span>👨‍🏫</span>
                              <span>{booking.instructor?.full_name || 'Instructor'}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span>📅</span>
                              <span>{formatDate(booking.date)}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span>🕐</span>
                              <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                )}

                {/* Completed Bookings */}
                {filterStatus !== 'active' && filterStatus !== 'cancelled' && (
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 sm:p-6`}>
                    <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 sm:mb-6`}>
                      {strings.sections.completedBookings} ({completedBookings.length})
                    </h2>
                    
                  {completedBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className={`mx-auto h-12 w-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className={`mt-4 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {strings.messages.noCompletedBookings}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {completedBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className={`${isDark ? 'bg-gradient-to-br from-gray-700 to-gray-750 border-green-600/30' : 'bg-gradient-to-br from-green-50 to-white border-green-300'} border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-lg`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {booking.course_name}
                              </h3>
                              <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}`}>
                                {strings.status.completed}
                              </span>
                            </div>
                          </div>
                          
                          <div className={`space-y-1.5 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <p className="flex items-center gap-2">
                              <span>👨‍🏫</span>
                              <span className="truncate">{booking.instructor?.full_name || 'Instructor'}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span>📅</span>
                              <span>{formatDate(booking.date)}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span>🕐</span>
                              <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                            </p>
                            {booking.room && (
                              <p className="flex items-center gap-2">
                                <span>📍</span>
                                <span className="truncate">{booking.room}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <Footer />

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6`}>
            <h3 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3 sm:mb-4`}>
              {strings.modals.cancelTitle}
            </h3>
            <p className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 sm:mb-6`}>
              {strings.modals.cancelMessage}
            </p>
            
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-3 sm:p-4 rounded-lg mb-4`}>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedBooking.course_name}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
                📅 {formatDate(selectedBooking.date)}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                🕐 {formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelLoading}
                className={`flex-1 px-4 py-2 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'} rounded-lg transition-all duration-300 font-medium`}
              >
                {strings.modals.keepBooking}
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-center"
              >
                {cancelLoading ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  strings.modals.confirmCancel
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Booking Modal */}
      {showUpdateModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 my-4 sm:my-8`}>
            <h3 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3 sm:mb-4`}>
              {strings.modals.updateTitle}
            </h3>
            
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg mb-6`}>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {strings.modals.currentBooking}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
                📅 {formatDate(selectedBooking.date)}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                🕐 {formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}
              </p>
            </div>

            <div className="mb-6">
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                {strings.modals.selectNewDate}
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {availableDates.map((date, index) => {
                  const dateStr = date.toISOString().split('T')[0];
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(dateStr)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        newDate === dateStr
                          ? isDark ? 'border-[#366c6b] bg-[#366c6b]/20' : 'border-[#366c6b] bg-[#366c6b]/10'
                          : isDark ? 'border-gray-600 hover:border-gray-500 bg-gray-700' : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatDate(date)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {newDate && (
              <div className="mb-6">
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                  {strings.modals.selectNewTime}
                </h4>
                {availableTimes.length === 0 ? (
                  <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {strings.modals.noAvailableTimes}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {availableTimes.map((time, index) => (
                      <button
                        key={index}
                        onClick={() => setNewTime(time)}
                        className={`p-2 sm:p-2.5 rounded-lg border-2 text-center transition-all font-medium text-xs sm:text-sm ${
                          newTime === time
                            ? isDark ? 'border-[#366c6b] bg-[#366c6b]/20 text-white' : 'border-[#366c6b] bg-[#366c6b]/10 text-[#366c6b]'
                            : isDark ? 'border-gray-600 hover:border-gray-500 bg-gray-700 text-gray-300' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        {formatTime(time)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpdateModal(false)}
                disabled={isUpdating}
                className={`flex-1 px-4 py-2 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'} rounded-lg transition-all duration-300 font-medium`}
              >
                {strings.modals.cancelButton}
              </button>
              <button
                onClick={handleUpdateBooking}
                disabled={isUpdating || !newDate || !newTime}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-center"
              >
                {isUpdating ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  strings.modals.confirmUpdate
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
