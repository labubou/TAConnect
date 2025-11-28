import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import StudentNavbar from '../../components/student/studentNavbar';
import Footer from '../../components/Footer';
import axios from 'axios';
import { useStudentBookings, useCancelInstructorBooking, useUpdateBooking } from '../../hooks/useApi';

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
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [filterCourse, setFilterCourse] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'course'
  const [clearedCancelledIds, setClearedCancelledIds] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem('clearedCancelledIds');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Use React Query to fetch bookings with auto-refresh
  const { data: allBookings = [], isLoading: loading, error: apiError, refetch } = useStudentBookings();
  
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
      setError('Failed to load bookings');
    }
  }, [apiError]);

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
      setError('Failed to load available times');
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
          setSuccess('Booking cancelled successfully');
          setShowCancelModal(false);
          setSelectedBooking(null);
          refetch();
          setTimeout(() => setSuccess(''), 3000);
        },
        onError: (err) => {
          console.error('Error cancelling booking:', err);
          setError(err.response?.data?.error || 'Failed to cancel booking');
        },
        onSettled: () => {
          setCancelLoading(false);
        }
      }
    );
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking || !newDate || !newTime) {
      setError('Please select both date and time');
      return;
    }

    updateBookingMutation({
      bookingId: selectedBooking.id,
      data: {
        new_date: newDate,
        new_time: newTime
      }
    }, {
      onSuccess: () => {
        setSuccess('Booking updated successfully');
        setShowUpdateModal(false);
        refetch();
        setTimeout(() => setSuccess(''), 3000);
      },
      onError: (err) => {
        console.error('Error updating booking:', err);
        setError(err.response?.data?.error || 'Failed to update booking');
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
    setSuccess('All cancelled bookings have been cleared from view');
    setTimeout(() => setSuccess(''), 3000);
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
  const activeBookings = filteredBookings.filter(b => !b.is_cancelled);
  const cancelledBookings = filteredBookings.filter(b => b.is_cancelled);

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
            {/* Header */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 md:p-8 rounded-xl shadow-lg mb-4 sm:mb-6`}>
              <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Manage Bookings
              </h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm sm:text-base md:text-lg`}>
                View, update, or cancel your scheduled appointments
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
                      Status
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
                      <option value="all">All Bookings</option>
                      <option value="active">Active Only</option>
                      <option value="cancelled">Cancelled Only</option>
                      <option value="completed">Completed Only</option>
                    </select>
                  </div>

                  {/* Course Filter */}
                  <div className="flex-1 min-w-full sm:min-w-[150px]">
                    <label className={`block text-xs sm:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1.5 sm:mb-2`}>
                      Course
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
                      <option value="all">All Courses</option>
                      {uniqueCourses.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="flex-1 min-w-full sm:min-w-[150px]">
                    <label className={`block text-xs sm:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1.5 sm:mb-2`}>
                      Sort By
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
                      <option value="date">Date</option>
                      <option value="course">Course Name</option>
                    </select>
                  </div>
                </div>

                {/* Bottom Row: Clear Cancelled Button */}
                {bookings.some(b => b.is_cancelled) && (
                  <div className="flex justify-center sm:justify-end pt-2 sm:pt-3 border-t border-gray-600/30">
                    <button
                      onClick={handleClearCancelled}
                      className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                        isDark 
                          ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50 border-2 border-red-700 hover:scale-105' 
                          : 'bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-300 hover:scale-105'
                      } shadow-md hover:shadow-lg`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete All Cancelled
                    </button>
                  </div>
                )}
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
                {filterStatus !== 'cancelled' && (
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg mb-4 sm:mb-6 p-4 sm:p-6`}>
                    <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 sm:mb-6`}>
                      Active Bookings ({activeBookings.length})
                    </h2>
                  
                  {activeBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className={`mx-auto h-12 w-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className={`mt-4 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        No active bookings
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
                                  Section {booking.section}
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
                              Update
                            </button>
                            <button
                              onClick={() => handleCancelClick(booking)}
                              className={`flex-1 px-4 py-2 sm:py-2.5 ${isDark ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50' : 'bg-red-100 text-red-700 hover:bg-red-200'} rounded-lg transition-all duration-300 text-xs sm:text-sm font-medium`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                )}

                {/* Cancelled Bookings */}
                {filterStatus !== 'active' && cancelledBookings.length > 0 && (
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 sm:p-6`}>
                    <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 sm:mb-6`}>
                      Cancelled Bookings ({cancelledBookings.length})
                    </h2>
                    
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
                                Cancelled
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
              Cancel Booking
            </h3>
            <p className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 sm:mb-6`}>
              Are you sure you want to cancel this booking? This action cannot be undone.
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

            {/* Email Notification Toggle */}
            <div className={`relative p-5 ${isDark ? 'bg-gradient-to-br from-gray-750 to-gray-700 border-2 border-gray-600' : 'bg-gradient-to-br from-red-50 via-white to-orange-50 border-2 border-red-100'} rounded-xl mb-4 shadow-lg overflow-hidden group`}>
              {/* Decorative background */}
              <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${sendCancelEmail ? 'bg-red-400/10' : 'bg-gray-400/5'} blur-xl transition-all duration-500`}></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Icon container */}
                  <div className={`relative p-2.5 rounded-xl ${sendCancelEmail ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30' : isDark ? 'bg-gray-700 shadow-md' : 'bg-gray-100 shadow-md'} transition-all duration-300`}>
                    {sendCancelEmail && (
                      <div className="absolute inset-0 rounded-xl bg-red-400 animate-ping opacity-20"></div>
                    )}
                    <svg className={`w-5 h-5 relative z-10 ${sendCancelEmail ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'} transition-all duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      {sendCancelEmail && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      )}
                    </svg>
                  </div>
                  
                  {/* Text */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Cancellation Email
                      </p>
                      {sendCancelEmail && (
                        <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 animate-pulse">
                          Active
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} font-medium`}>
                      {sendCancelEmail ? '✓ You will receive a cancellation email' : '✗ No cancellation email'}
                    </p>
                    <p className={`text-[9px] ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-0.5 italic`}>
                      Instructor always gets notified
                    </p>
                  </div>
                </div>
                
                {/* Toggle switch */}
                <button
                  onClick={() => setSendCancelEmail(!sendCancelEmail)}
                  className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-lg ${sendCancelEmail ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 focus:ring-red-400/50 shadow-red-500/40' : isDark ? 'bg-gradient-to-r from-gray-600 to-gray-700 focus:ring-gray-500/50 shadow-gray-800/40' : 'bg-gradient-to-r from-gray-300 to-gray-400 focus:ring-gray-400/50 shadow-gray-400/40'} transform hover:scale-105 active:scale-95`}
                  aria-label="Toggle cancellation email"
                >
                  <span className={`pointer-events-none inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-xl transition-all duration-300 ease-out ${sendCancelEmail ? 'translate-x-[24px]' : 'translate-x-[2px]'}`}>
                    {sendCancelEmail ? (
                      <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelLoading}
                className={`flex-1 px-4 py-2 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'} rounded-lg transition-all duration-300 font-medium`}
              >
                Keep Booking
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
                  'Yes, Cancel'
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
              Update Booking
            </h3>
            
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg mb-6`}>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Current Booking
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
                Select New Date
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
                  Select New Time
                </h4>
                {availableTimes.length === 0 ? (
                  <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No available times for this date
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
                Cancel
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
                  'Update Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
