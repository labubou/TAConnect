import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGlobalLoading } from '../../contexts/GlobalLoadingContext';
import TAnavbar from '../../components/ta/TAnavbar';
import ErrorBoundary from '../../components/General/ErrorBoundary';
import Footer from '../../components/General/Footer';
import { SkeletonLoader } from '../../components/General/SkeletonLoader';
import allStrings from '../../strings/manageBookingsStrings';
import CancelBookingModal from '../../components/ta/CancelBookingModal';
import { exportBookingsAsCSV } from '../../services/exportService';
import axios from 'axios';

// Helper function to get current month's date range
const getCurrentMonthDateRange = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);
  
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return {
    start: formatDate(monthStart),
    end: formatDate(monthEnd)
  };
};

export default function ManageBookings() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const strings = allStrings[language];
  const { startLoading, stopLoading } = useGlobalLoading();
  const isDark = theme === 'dark';
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // Empty string means no filter (all bookings)
  const [dateRange, setDateRange] = useState(() => getCurrentMonthDateRange());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [backendError, setBackendError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Fetch bookings from backend
  const fetchBookings = async () => {
    setIsLoading(true);
    setBackendError(null);
    
    try {
      const params = {};
      if (dateRange.start) params.start_date = dateRange.start;
      if (dateRange.end) params.end_date = dateRange.end;
      if (statusFilter) params.status = statusFilter;
      
      const response = await axios.get('/api/instructor/get-user-bookings/', { params });
      setBookings(response.data.bookings || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      const errMsg = err?.response?.data?.error || err?.message || strings.messages.error;
      setBackendError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch bookings when filters change
  useEffect(() => {
    fetchBookings();
  }, [dateRange.start, dateRange.end, statusFilter]);

  // Filter bookings by search term (client-side)
  useEffect(() => {
    let filtered = bookings;

    // Search by student name or email
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.student.first_name?.toLowerCase().includes(search) ||
        b.student.last_name?.toLowerCase().includes(search) ||
        b.student.email?.toLowerCase().includes(search) ||
        b.student.username?.toLowerCase().includes(search)
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm]);

  // Auto-clear backend error after 5 seconds
  useEffect(() => {
    if (backendError) {
      const timer = setTimeout(() => setBackendError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [backendError]);

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
    startLoading('cancel-booking', 'Cancelling booking...');

    try {
      const response = await axios.delete(`/api/instructor/cancel-booking/${selectedBooking.id}/`);
      
      if (response.data.success) {
        stopLoading('cancel-booking');
        setSuccessMessage(strings.messages.success);
        setShowCancelModal(false);
        setSelectedBooking(null);
        // Refresh the bookings list
        await fetchBookings();
      } else {
        stopLoading('cancel-booking');
        throw new Error(response.data.error || strings.messages.error);
      }
    } catch (err) {
      stopLoading('cancel-booking');
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

  const handleConfirmBooking = async (booking) => {
    startLoading('confirm-booking', 'Confirming booking...');
    
    try {
      const response = await axios.post(`/api/instructor/confirm-booking/${booking.id}/`);
      
      if (response.data.success) {
        stopLoading('confirm-booking');
        setSuccessMessage('Booking confirmed successfully');
        await fetchBookings();
      } else {
        stopLoading('confirm-booking');
        throw new Error(response.data.error || 'Failed to confirm booking');
      }
    } catch (err) {
      stopLoading('confirm-booking');
      console.error('Failed to confirm booking:', err);
      
      let errorMsg = 'Failed to confirm booking';
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }
      setErrorMessage(errorMsg);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateRange(getCurrentMonthDateRange());
  };

  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const handleExportWithFilters = async () => {
    setIsExporting(true);
    setErrorMessage('');
    setShowExportModal(false);
    
    try {
      if (!dateRange.start || !dateRange.end) {
        throw new Error('Please select a date range before exporting');
      }

      await exportBookingsAsCSV(dateRange.start, dateRange.end);
      setSuccessMessage('Bookings exported successfully with filters');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setErrorMessage(error.message || 'Failed to export bookings');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAllBookings = async () => {
    setIsExporting(true);
    setErrorMessage('');
    setShowExportModal(false);
    
    try {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      const endOfYear = new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split('T')[0];
      
      await exportBookingsAsCSV(startOfYear, endOfYear);
      setSuccessMessage('All bookings exported successfully');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setErrorMessage(error.message || 'Failed to export bookings');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatBookingDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      const date = new Date(dateTimeString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (e) {
      return 'N/A';
    }
  };

  const getStatusColor = (booking) => {
    switch (booking.status) {
      case 'pending':
        return isDark ? 'bg-yellow-900/20 text-yellow-300' : 'bg-yellow-50 text-yellow-700';
      case 'confirmed':
        return isDark ? 'bg-green-900/20 text-green-300' : 'bg-green-50 text-green-700';
      case 'completed':
        return isDark ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700';
      case 'cancelled':
        return isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700';
      default:
        return isDark ? 'bg-gray-900/20 text-gray-300' : 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusIcon = (booking) => {
    switch (booking.status) {
      case 'pending':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'confirmed':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return strings.status?.pending || 'Pending';
      case 'confirmed': return strings.status?.confirmed || 'Confirmed';
      case 'completed': return strings.status?.completed || 'Completed';
      case 'cancelled': return strings.status?.cancelled || 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <TAnavbar onToggle={setIsNavbarOpen} />
      
      <div 
        className={`flex-1 transition-all duration-500 ease-in-out ${
          language === 'ar'
            ? (isNavbarOpen ? 'mr-64' : 'mr-0')
            : (isNavbarOpen ? 'ml-64' : 'ml-0')
        } pt-20`}
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
              
              <div className="mb-4">
                {/* Search */}
                <div className="mb-4">
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

                {/* Status Filter Buttons */}
                <div className="flex gap-2 flex-wrap mb-4">
                  <button
                    onClick={() => setStatusFilter('')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                      statusFilter === ''
                        ? isDark
                          ? 'border-[#366c6b] bg-[#366c6b]/20 text-[#4fd1c5]'
                          : 'border-[#366c6b] bg-[#366c6b]/10 text-[#366c6b]'
                        : isDark
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-800/50 text-gray-300'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-600'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                      statusFilter === 'pending'
                        ? isDark
                          ? 'border-yellow-600 bg-yellow-900/20 text-yellow-200'
                          : 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : isDark
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-800/50 text-gray-300'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-600'
                    }`}
                  >
                    {strings.status?.pending || 'Pending'}
                  </button>
                  <button
                    onClick={() => setStatusFilter('confirmed')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                      statusFilter === 'confirmed'
                        ? isDark
                          ? 'border-emerald-600 bg-emerald-900/20 text-emerald-200'
                          : 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : isDark
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-800/50 text-gray-300'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-600'
                    }`}
                  >
                    {strings.status?.confirmed || 'Confirmed'}
                  </button>
                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                      statusFilter === 'completed'
                        ? isDark
                          ? 'border-blue-600 bg-blue-900/20 text-blue-200'
                          : 'border-blue-500 bg-blue-50 text-blue-700'
                        : isDark
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-800/50 text-gray-300'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-600'
                    }`}
                  >
                    {strings.status?.completed || 'Completed'}
                  </button>
                  <button
                    onClick={() => setStatusFilter('cancelled')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                      statusFilter === 'cancelled'
                        ? isDark
                          ? 'border-red-600 bg-red-900/20 text-red-200'
                          : 'border-red-500 bg-red-50 text-red-700'
                        : isDark
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-800/50 text-gray-300'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-600'
                    }`}
                  >
                    {strings.status?.cancelled || 'Cancelled'}
                  </button>
                </div>
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
              <div className="flex flex-wrap gap-2">
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
                <button
                  onClick={handleExportClick}
                  disabled={isExporting}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50'
                      : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50'
                  }`}
                  title="Export bookings as CSV"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {isExporting ? 'Exporting...' : 'Export CSV'}
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

            {/* Error Message */}
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

            {/* Backend Error */}
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
                              {strings.table.headers.description}
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
                            <tr key={booking.id} className={isDark ? 'border-gray-700' : 'border-gray-200'} style={{borderTopWidth: '1px'}}>
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
                                {booking.description ? (
                                  <div className="max-w-xs">
                                    <p className="text-sm line-clamp-2" title={booking.description}>
                                      {booking.description}
                                    </p>
                                  </div>
                                ) : (
                                  <span className={`text-xs italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {strings.bookingCard.noDescription}
                                  </span>
                                )}
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
                                    {formatBookingDateTime(booking.start_time)}
                                  </p>
                                </div>
                              </td>
                              <td className={`px-6 py-4`}>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking)}`}>
                                  {getStatusIcon(booking)}
                                  {getStatusLabel(booking.status)}
                                </div>
                              </td>
                              <td className={`px-6 py-4 text-sm`}>
                                <div className="flex gap-2">
                                  {booking.status === 'pending' && (
                                    <button
                                      onClick={() => handleConfirmBooking(booking)}
                                      className="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 rounded-lg transition-all font-medium text-sm"
                                    >
                                      Confirm
                                    </button>
                                  )}
                                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                    <button
                                      onClick={() => handleCancelClick(booking)}
                                      disabled={isCancelling}
                                      className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-all font-medium text-sm disabled:opacity-50"
                                      aria-label={strings.aria.cancelBooking}
                                    >
                                      {strings.buttons.cancel}
                                    </button>
                                  )}
                                </div>
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
                          {/* Status Badge and Actions */}
                          <div className="flex justify-between items-start mb-3">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking)}`}>
                              {getStatusIcon(booking)}
                              {getStatusLabel(booking.status)}
                            </div>
                            <div className="flex gap-2">
                              {booking.status === 'pending' && (
                                <button
                                  onClick={() => handleConfirmBooking(booking)}
                                  className="px-2 py-1 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 rounded-lg transition-all font-medium text-xs"
                                >
                                  Confirm
                                </button>
                              )}
                              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                <button
                                  onClick={() => handleCancelClick(booking)}
                                  disabled={isCancelling}
                                  className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-all font-medium text-xs disabled:opacity-50"
                                >
                                  {strings.buttons.cancel}
                                </button>
                              )}
                            </div>
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

                          {/* Description */}
                          {booking.description && (
                            <div className="mb-3">
                              <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} uppercase mb-1`}>
                                {strings.bookingCard.description}
                              </p>
                              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} italic`}>
                                {booking.description}
                              </p>
                            </div>
                          )}

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
                                {formatBookingDateTime(booking.start_time)}
                              </p>
                            </div>
                          </div>
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

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowExportModal(false)}
          ></div>
          <div
            className={`relative w-full max-w-md rounded-2xl shadow-2xl ${
              isDark
                ? 'bg-gray-900 border border-gray-800'
                : 'bg-white border border-gray-100'
            }`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Export Bookings
                </h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className={`p-2 rounded-lg transition-all ${
                    isDark
                      ? 'bg-gray-800 hover:bg-gray-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                How would you like to export your bookings?
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleExportWithFilters}
                  disabled={isExporting}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50'
                      : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export with Filters
                </button>

                <button
                  onClick={handleExportAllBookings}
                  disabled={isExporting}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50'
                      : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export All Bookings
                </button>
              </div>

              <button
                onClick={() => setShowExportModal(false)}
                className={`w-full mt-4 px-4 py-2 rounded-lg border transition-all ${
                  isDark
                    ? 'border-gray-500 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
