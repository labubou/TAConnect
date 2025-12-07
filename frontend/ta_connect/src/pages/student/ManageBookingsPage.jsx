import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGlobalLoading } from '../../contexts/GlobalLoadingContext';
import { useLocation } from 'react-router-dom';
import StudentNavbar from '../../components/student/studentNavbar';
import Footer from '../../components/General/Footer';
import FilterControls from '../../components/student/manage-bookings/FilterControls';
import BookingsList from '../../components/student/manage-bookings/BookingsList';
import CancelModal from '../../components/student/manage-bookings/CancelModal';
import UpdateModal from '../../components/student/manage-bookings/UpdateModal';
import MessageBanner from '../../components/student/booking/MessageBanner';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useCancelInstructorBooking, useUpdateBooking } from '../../hooks/useApi';
import allStrings from '../../strings/manageBookingsStrings';

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

// Helper function to get date range for a specific date
const getDateRangeForDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return {
    start: dateStr,
    end: dateStr
  };
};

export default function ManageBookingsPage() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = allStrings[language];
  const { startLoading, stopLoading, isLoading } = useGlobalLoading();
  const location = useLocation();
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
  const [dateRange, setDateRange] = useState(() => {
    // Check if there's a filterDate in location state
    if (location.state?.filterDate) {
      return getDateRangeForDate(location.state.filterDate);
    }
    return getCurrentMonthDateRange();
  });
  const [clearedCancelledIds, setClearedCancelledIds] = useState(() => {
    const saved = localStorage.getItem('clearedCancelledIds');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [clearedCompletedIds, setClearedCompletedIds] = useState(() => {
    const saved = localStorage.getItem('clearedCompletedIds');
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

  useEffect(() => {
    localStorage.setItem('clearedCompletedIds', JSON.stringify([...clearedCompletedIds]));
  }, [clearedCompletedIds]);

  // Filter out cancelled and completed bookings that were cleared by user
  const bookings = allBookings.filter(
    booking => !(booking.is_cancelled && clearedCancelledIds.has(booking.id)) &&
                !(booking.is_completed && clearedCompletedIds.has(booking.id))
  );

  // Show error if API call fails
  useEffect(() => {
    if (apiError) {
      setError(t.messages.error);
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
      setError(t.modals.errors.noAvailableTimes);
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
    startLoading('cancel-booking', t.messages.canceling);
    cancelBookingMutation(
      { bookingId: selectedBooking.id, sendEmail: sendCancelEmail },
      {
        onSuccess: () => {
          stopLoading('cancel-booking');
          setSuccess(t.messages.cancelSuccess);
          setShowCancelModal(false);
          setSelectedBooking(null);
          refetch();
          setTimeout(() => setSuccess(''), 3000);
        },
        onError: (err) => {
          stopLoading('cancel-booking');
          console.error('Error cancelling booking:', err);
          setError(err.response?.data?.error || t.messages.cancelError);
        },
        onSettled: () => {
          setCancelLoading(false);
        }
      }
    );
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking || !newDate || !newTime) {
      setError(t.modals.errors.selectDateAndTime);
      return;
    }

    startLoading('update-booking', t.messages.updating);
    updateBookingMutation({
      bookingId: selectedBooking.id,
      data: {
        new_date: newDate,
        new_time: newTime,
        send_email: sendUpdateEmail
      }
    }, {
      onSuccess: () => {
        stopLoading('update-booking');
        setSuccess(t.messages.updateSuccess);
        setShowUpdateModal(false);
        refetch();
        setTimeout(() => setSuccess(''), 3000);
      },
      onError: (err) => {
        stopLoading('update-booking');
        console.error('Error updating booking:', err);
        setError(err.response?.data?.error || t.messages.updateError);
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

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
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
    setSuccess(t.messages.clearedCancelled);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleClearCompleted = () => {
    const completedIds = bookings.filter(b => b.is_completed).map(b => b.id);
    const newClearedIds = new Set([...clearedCompletedIds, ...completedIds]);
    setClearedCompletedIds(newClearedIds);
    setSuccess(t.messages.clearedCompleted || 'Completed bookings cleared from view');
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
                {t.page.title}
              </h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm sm:text-base md:text-lg`}>
                {t.page.description}
              </p>
            </div>

            {/* Filter and Sort Controls */}
            <FilterControls
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterCourse={filterCourse}
              setFilterCourse={setFilterCourse}
              sortBy={sortBy}
              setSortBy={setSortBy}
              dateRange={dateRange}
              setDateRange={setDateRange}
              uniqueCourses={uniqueCourses}
              hasCancelled={bookings.some(b => b.is_cancelled)}
              hasCompleted={bookings.some(b => b.is_completed)}
              onClearFilters={handleClearFilters}
              onClearCancelled={handleClearCancelled}
              onClearCompleted={handleClearCompleted}
            />

            {/* Success/Error Messages */}
            {success && (
              <MessageBanner
                type="success"
                message={success}
                onClose={() => setSuccess('')}
              />
            )}

            {error && (
              <MessageBanner
                type="error"
                message={error}
                onClose={() => setError('')}
              />
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
                  <BookingsList
                    title={t.sections.activeBookings}
                    bookings={activeBookings}
                    status="active"
                    emptyMessage={t.messages.noActiveBookings}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    onUpdate={handleUpdateClick}
                    onCancel={handleCancelClick}
                  />
                )}

                {/* Cancelled Bookings */}
                {filterStatus !== 'active' && filterStatus !== 'completed' && (
                  <BookingsList
                    title={t.sections.cancelledBookings}
                    bookings={cancelledBookings}
                    status="cancelled"
                    emptyMessage={t.messages.noCancelledBookings}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                )}

                {/* Completed Bookings */}
                {filterStatus !== 'active' && filterStatus !== 'cancelled' && (
                  <BookingsList
                    title={t.sections.completedBookings}
                    bookings={completedBookings}
                    status="completed"
                    emptyMessage={t.messages.noCompletedBookings}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <Footer />

      {/* Cancel Confirmation Modal */}
      <CancelModal
        show={showCancelModal}
        booking={selectedBooking}
        formatDate={formatDate}
        formatTime={formatTime}
        onConfirm={handleCancelBooking}
        onClose={() => setShowCancelModal(false)}
        isLoading={cancelLoading}
      />

      {/* Update Booking Modal */}
      <UpdateModal
        show={showUpdateModal}
        booking={selectedBooking}
        availableDates={availableDates}
        availableTimes={availableTimes}
        newDate={newDate}
        newTime={newTime}
        formatDate={formatDate}
        formatTime={formatTime}
        onDateSelect={handleDateSelect}
        onTimeSelect={setNewTime}
        onConfirm={handleUpdateBooking}
        onClose={() => setShowUpdateModal(false)}
        isLoading={isUpdating}
      />
    </div>
  );
}
