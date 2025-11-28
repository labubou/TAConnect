import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import TAnavbar from '../../components/ta/TAnavbar';
import ErrorBoundary from '../../components/ErrorBoundary';
import Footer from '../../components/Footer';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import strings from '../../strings/manageBookingsStrings';
import { useInstructorBookings } from '../../hooks/useApi';
import CancelBookingModal from '../../components/ta/CancelBookingModal';
import axios from 'axios';

// Helper function to get current month's date range
const getCurrentMonthDateRange = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);
  
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  return {
    start: formatDate(monthStart),
    end: formatDate(monthEnd)
  };
};

export default function ManageBookings() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [dateRange, setDateRange] = useState(() => getCurrentMonthDateRange());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [backendError, setBackendError] = useState(null);

  // Fetch bookings data with current month date range
  const { data: bookings = [], isLoading, error, refetch } = useInstructorBookings(
    dateRange.start,
    dateRange.end
  );

  // Filter and search bookings
  useEffect(() => {
    let filtered = bookings;

    // Filter by status
    if (statusFilter === 'active') {
      filtered = filtered.filter(b => !b.is_cancelled);
    } else if (statusFilter === 'cancelled') {
      filtered = filtered.filter(b => b.is_cancelled);
    }

    // Filter by date range
    if (dateRange.start) {
      filtered = filtered.filter(b => new Date(b.date) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(b => new Date(b.date) <= new Date(dateRange.end));
    }

    // Search by student name or email
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.student.first_name.toLowerCase().includes(search) ||
        b.student.last_name.toLowerCase().includes(search) ||
        b.student.email.toLowerCase().includes(search) ||
        b.student.username.toLowerCase().includes(search)
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, dateRange, searchTerm]);

  // Surface backend errors to user-facing error message (only once when error changes)
  useEffect(() => {
    if (error) {
      const errMsg = error?.response?.data?.error || error?.message || strings.messages.error;
      setBackendError(errMsg);
      
      // Auto-clear backend error after 5 seconds
      const timer = setTimeout(() => setBackendError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-clear success messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Auto-clear error messages after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking || isCancelling) return;

    setIsCancelling(true);
    setErrorMessage('');

    try {
      const response = await axios.delete(`/api/instructor/cancel-booking/${selectedBooking.id}/`);
      
      if (response.data.success) {
        setSuccessMessage(strings.messages.success);
        setShowCancelModal(false);
        setSelectedBooking(null);
        // Refresh the bookings list
        await refetch();
      } else {
        throw new Error(response.data.error || strings.messages.error);
      }
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      
      let errorMsg = strings.messages.error;
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setErrorMessage(errorMsg);
      setShowCancelModal(false);
      setSelectedBooking(null);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('active');
    setDateRange(getCurrentMonthDateRange());
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const getStatusColor = (booking) => {
    if (booking.is_cancelled) {
      return isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700';
    }
    return isDark ? 'bg-green-900/20 text-green-300' : 'bg-green-50 text-green-700';
  };

  const getStatusIcon = (booking) => {
    if (booking.is_cancelled) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <TAnavbar onToggle={setIsNavbarOpen} />
      
      <div 
        className={`flex-1 transition-all duration-300 ${isNavbarOpen ? 'ml-0 sm:ml-64' : 'ml-0'} pt-20`}
        style={{ minHeight: 'calc(100vh - 4rem)' }}
      >
        <main className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4 sm:p-8`}>
          <div className={`max-w-7xl mx-auto ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-8 rounded-xl shadow-lg`}>
            
            {/* Header */}
            <div className="mb-8">
              <h1 className={`text-2xl sm:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {strings.page.title}
              </h1>
              <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {strings.page.description}
              </p>
            </div>

            {/* Filters Section */}
            <div className={`mb-8 p-4 sm:p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {strings.filters.filterByStatus}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Search */}
                <div className="sm:col-span-2 lg:col-span-2">
                  <input
                    type="text"
                    placeholder={strings.filters.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#366c6b]`}
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#366c6b]`}
                >
                  <option value="all">{strings.filters.all}</option>
                  <option value="active">{strings.filters.active}</option>
                  <option value="cancelled">{strings.filters.cancelled}</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input
                  type="date"
                  name="start"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#366c6b]`}
                />
                <input
                  type="date"
                  name="end"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#366c6b]`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleClearFilters}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    isDark
                      ? 'border-gray-500 text-gray-300 hover:bg-gray-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {strings.filters.clear}
                </button>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className={`mb-6 p-4 rounded-lg ${
                isDark ? 'bg-green-900/30 border-green-600' : 'bg-green-50 border-green-300'
              } border-2`}>
                <div className="flex items-start">
                  <svg className={`w-5 h-5 mr-3 mt-0.5 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className={`${isDark ? 'text-green-200' : 'text-green-700'} font-medium`}>{successMessage}</span>
                </div>
              </div>
            )}

            {/* Error Message from User Actions */}
            {errorMessage && (
              <div className={`mb-6 p-4 rounded-lg ${
                isDark ? 'bg-red-900/30 border-red-600' : 'bg-red-50 border-red-300'
              } border-2`}>
                <div className="flex items-start">
                  <svg className={`w-5 h-5 mr-3 mt-0.5 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className={`${isDark ? 'text-red-200' : 'text-red-700'} font-medium`}>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Backend Error Message */}
            {backendError && (
              <div className={`mb-6 p-4 rounded-lg ${
                isDark ? 'bg-yellow-900/30 border-yellow-600' : 'bg-yellow-50 border-yellow-300'
              } border-2`}>
                <div className="flex items-start">
                  <svg className={`w-5 h-5 mr-3 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className={`${isDark ? 'text-yellow-200' : 'text-yellow-700'} font-medium`}>{backendError}</span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <SkeletonLoader isDark={isDark} count={5} height="h-24" className="mb-6" />
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'}`}>
                <p className="text-sm font-medium">{strings.messages.error}</p>
              </div>
            )}

            {/* Bookings List */}
            {!isLoading && (
              <ErrorBoundary>
                {filteredBookings.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                    <svg className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {strings.page.noBookings}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {strings.page.noBookingsDescription}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Desktop View - Table */}
                    <div className="hidden md:block overflow-x-auto rounded-lg border" style={{borderColor: isDark ? '#374151' : '#e5e7eb'}}>
                      <table className="w-full">
                        <thead>
                          <tr className={isDark ? 'bg-gray-700' : 'bg-gray-100'}>
                            <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                              {strings.table.headers.studentName}
                            </th>
                            <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                              {strings.table.headers.course}
                            </th>
                            <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                              {strings.table.headers.date}
                            </th>
                            <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                              {strings.table.headers.status}
                            </th>
                            <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                              {strings.table.headers.actions}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBookings.map((booking) => (
                            <tr key={booking.id}>
                              <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                <div>
                                  <p className="font-medium">
                                    {booking.student.first_name} {booking.student.last_name}
                                  </p>
                                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {booking.student.email}
                                  </p>
                                </div>
                              </td>
                              <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                <div>
                                  <p className="font-medium">{booking.office_hour.course_name}</p>
                                  {booking.office_hour.section && (
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {strings.bookingCard.section}: {booking.office_hour.section}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                <div>
                                  <p className="font-medium">{formatDate(booking.date)}</p>
                                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {formatTime(booking.office_hour.start_time)} - {formatTime(booking.office_hour.end_time)}
                                  </p>
                                </div>
                              </td>
                              <td className={`px-6 py-4`}>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking)}`}>
                                  {getStatusIcon(booking)}
                                  {booking.is_cancelled ? strings.status.cancelled : strings.status.active}
                                </div>
                              </td>
                              <td className={`px-6 py-4 text-sm`}>
                                {!booking.is_cancelled && (
                                  <button
                                    onClick={() => handleCancelClick(booking)}
                                    disabled={isCancelling}
                                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-all font-medium text-sm disabled:opacity-50"
                                    aria-label={strings.aria.cancelBooking}
                                  >
                                    {isCancelling ? 'Cancelling...' : strings.buttons.cancel}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View - Cards */}
                    <div className="md:hidden space-y-4">
                      {filteredBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className={`p-4 rounded-lg border transition-all ${
                            isDark
                              ? 'bg-gray-700 border-gray-600'
                              : 'bg-white border-gray-200'
                          } hover:shadow-lg`}
                        >
                          {/* Status Badge */}
                          <div className="flex justify-between items-start mb-3">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking)}`}>
                              {getStatusIcon(booking)}
                              {booking.is_cancelled ? strings.status.cancelled : strings.status.active}
                            </div>
                            {!booking.is_cancelled && (
                              <button
                                onClick={() => handleCancelClick(booking)}
                                disabled={isCancelling}
                                className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-all font-medium text-xs disabled:opacity-50"
                                aria-label={strings.aria.cancelBooking}
                              >
                                {isCancelling ? 'Cancelling...' : strings.buttons.cancel}
                              </button>
                            )}
                          </div>

                          {/* Student Info */}
                          <div className="mb-3">
                            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {booking.student.first_name} {booking.student.last_name}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {booking.student.email}
                            </p>
                          </div>

                          {/* Course Info */}
                          <div className="mb-3">
                            <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>
                              {strings.bookingCard.course}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {booking.office_hour.course_name}
                              {booking.office_hour.section && ` - ${booking.office_hour.section}`}
                            </p>
                          </div>

                          {/* Date and Time */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>
                                {strings.bookingCard.date}
                              </p>
                              <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {formatDate(booking.date)}
                              </p>
                            </div>
                            <div>
                              <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>
                                {strings.bookingCard.time}
                              </p>
                              <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {formatTime(booking.office_hour.start_time)} - {formatTime(booking.office_hour.end_time)}
                              </p>
                            </div>
                          </div>

                          {/* Room Info */}
                          {booking.office_hour.room && (
                            <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                              <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase`}>
                                {strings.bookingCard.room}
                              </p>
                              <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {booking.office_hour.room}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </ErrorBoundary>
            )}
          </div>
        </main>
      </div>

      <Footer />

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <CancelBookingModal
          booking={selectedBooking}
          isDark={isDark}
          onConfirm={handleConfirmCancel}
          onCancel={() => {
            setShowCancelModal(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}
