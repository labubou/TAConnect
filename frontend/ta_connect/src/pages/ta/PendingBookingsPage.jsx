/**
 * PendingBookingsPage Component
 * 
 * Display and manage pending booking confirmations for instructors.
 * 
 * TODO: Backend email template update required
 * The approval URL in /backend/ta_connect/utils/email_sending/booking/send_booking_pending_email.py
 * needs to be updated from: /ta/manage-bookings/?booking_id={booking_id}
 * to: /ta/pending-bookings?id={booking_id}
 * 
 * This will allow TAs to click the email link and jump directly to the specific pending booking
 * instead of going to the manage bookings page.
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGlobalLoading } from '../../contexts/GlobalLoadingContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TAnavbar from '../../components/ta/TAnavbar';
import ErrorBoundary from '../../components/General/ErrorBoundary';
import Footer from '../../components/General/Footer';
import { SkeletonLoader } from '../../components/General/SkeletonLoader';
import PendingBookingModal from '../../components/ta/PendingBookingModal';
import pendingBookingsStrings from '../../strings/pendingBookingsPageStrings';
import {
  fetchPendingBookings,
  confirmBooking,
  cancelBooking,
} from '../../services/pendingBookingService';

export default function PendingBookingsPage() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const strings = pendingBookingsStrings[language];
  const { startLoading, stopLoading } = useGlobalLoading();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDark = theme === 'dark';

  // State
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  // Get booking ID from URL params if present
  useEffect(() => {
    const bookingId = searchParams.get('id');
    if (bookingId) {
      setSelectedBookingId(parseInt(bookingId));
    }
  }, [searchParams]);

  // Fetch pending bookings
  const fetchBookings = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await fetchPendingBookings(selectedBookingId);
      setBookings(data);

      if (data.length === 0 && selectedBookingId) {
        setErrorMessage(strings.page.noBookings);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setErrorMessage(err.message || strings.messages.error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBookings();
  }, [selectedBookingId]);

  // Auto-clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Handle confirm action
  const handleConfirmClick = (booking) => {
    setSelectedBooking(booking);
    setModalAction('confirm');
    setShowModal(true);
  };

  // Handle cancel action
  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setModalAction('cancel');
    setShowModal(true);
  };

  // Handle modal confirm
  const handleModalConfirm = async (bookingId, action) => {
    setIsProcessing(true);
    const loadingKey = `booking-${action}`;
    const loadingMessage =
      action === 'confirm'
        ? strings.messages.confirming
        : strings.messages.canceling;

    startLoading(loadingKey, loadingMessage);

    try {
      if (action === 'confirm') {
        await confirmBooking(bookingId);
        setSuccessMessage(strings.messages.success);
      } else {
        await cancelBooking(bookingId);
        setSuccessMessage(strings.messages.cancelSuccess);
      }

      setShowModal(false);
      setSelectedBooking(null);
      setModalAction(null);

      // Refresh bookings
      await fetchBookings();
    } catch (err) {
      console.error('Error:', err);
      const errorMsg =
        action === 'confirm'
          ? strings.messages.confirmError
          : strings.messages.cancelError;
      setErrorMessage(err.message || errorMsg);
    } finally {
      stopLoading(loadingKey);
      setIsProcessing(false);
    }
  };

  // Filter bookings by search term
  const filteredBookings = bookings.filter((booking) => {
    const search = searchTerm.toLowerCase();
    return (
      booking.student?.first_name?.toLowerCase().includes(search) ||
      booking.student?.last_name?.toLowerCase().includes(search) ||
      booking.student?.email?.toLowerCase().includes(search) ||
      booking.student?.username?.toLowerCase().includes(search)
    );
  });

  const handleBackToManage = () => {
    navigate('/ta/manage-bookings');
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <TAnavbar onToggle={setIsNavbarOpen} />

      <div
        className={`flex-1 transition-all duration-500 ease-in-out ${
          language === 'ar'
            ? (isNavbarOpen ? 'mr-0 sm:mr-64' : 'mr-0')
            : (isNavbarOpen ? 'ml-0 sm:ml-64' : 'ml-0')
        } pt-20`}
        style={{ minHeight: 'calc(100vh - 4rem)' }}
      >
        <main
          className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-3 sm:p-6 lg:p-8`}
        >
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1
                    className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {selectedBookingId
                      ? strings.page.selectiveView
                      : strings.page.title}
                  </h1>
                  <p
                    className={`text-sm sm:text-base ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {strings.page.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-3">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-3">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Search Bar */}
            {!selectedBookingId && (
              <div className="mb-6 flex gap-3">
                <input
                  type="text"
                  placeholder={strings.filters.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-label={strings.filters.search}
                />
                <button
                  onClick={fetchBookings}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  aria-label={strings.filters.refresh}
                >
                  {strings.filters.refresh}
                </button>
              </div>
            )}

            {/* Back Button for selective view */}
            {selectedBookingId && (
              <button
                onClick={handleBackToManage}
                className={`mb-6 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                {strings.filters.backToManage}
              </button>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="space-y-4">
                <SkeletonLoader
                  isDark={isDark}
                  count={3}
                  height="h-32"
                  className="mb-4"
                />
              </div>
            ) : filteredBookings.length === 0 ? (
              /* Empty State */
              <div
                className={`text-center py-12 rounded-lg border-2 border-dashed ${
                  isDark
                    ? 'border-gray-700 bg-gray-800'
                    : 'border-gray-300 bg-gray-100'
                }`}
              >
                <svg
                  className={`w-12 h-12 mx-auto mb-4 ${
                    isDark ? 'text-gray-600' : 'text-gray-400'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {strings.page.noBookings}
                </h3>
                <p
                  className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {strings.page.noBookingsDescription}
                </p>
              </div>
            ) : (
              /* Bookings Grid */
              <div className="grid gap-4 sm:gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={`rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                      isDark
                        ? 'border-gray-700 bg-gray-800'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Header */}
                    <div
                      className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${
                        isDark
                          ? 'border-gray-700 bg-gray-900'
                          : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <h3
                        className={`text-base sm:text-lg font-semibold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {booking.student?.first_name}{' '}
                        {booking.student?.last_name}
                      </h3>
                      <p
                        className={`text-xs sm:text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {booking.student?.email}
                      </p>
                    </div>

                    {/* Content */}
                    <div
                      className={`px-4 sm:px-6 py-4 space-y-3 text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium">
                          {strings.bookingCard.course}:
                        </span>
                        <span className="text-right">
                          {booking.office_hour?.course_name}
                        </span>
                      </div>

                      <div className="flex justify-between items-start">
                        <span className="font-medium">
                          {strings.bookingCard.section}:
                        </span>
                        <span>{booking.office_hour?.section}</span>
                      </div>

                      <div className="flex justify-between items-start">
                        <span className="font-medium">
                          {strings.bookingCard.date}:
                        </span>
                        <span>
                          {booking.date &&
                            new Date(booking.date).toLocaleDateString(
                              language === 'ar' ? 'ar-EG' : 'en-US'
                            )}
                        </span>
                      </div>

                      <div className="flex justify-between items-start">
                        <span className="font-medium">
                          {strings.bookingCard.time}:
                        </span>
                        <span>
                          {booking.office_hour?.start_time &&
                            booking.office_hour?.start_time.substring(0, 5)}{' '}
                          -{' '}
                          {booking.office_hour?.end_time &&
                            booking.office_hour?.end_time.substring(0, 5)}
                        </span>
                      </div>

                      <div className="flex justify-between items-start">
                        <span className="font-medium">
                          {strings.bookingCard.room}:
                        </span>
                        <span>{booking.office_hour?.room}</span>
                      </div>

                      {booking.description && (
                        <div className="flex justify-between items-start">
                          <span className="font-medium">
                            {strings.bookingCard.reason}:
                          </span>
                          <span className="text-right max-w-xs">
                            {booking.description}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div
                      className={`px-4 sm:px-6 py-4 border-t flex gap-3 ${
                        isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-100'
                      }`}
                    >
                      <button
                        onClick={() => handleConfirmClick(booking)}
                        disabled={isProcessing}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                          isDark
                            ? 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                        aria-label={strings.aria.confirmBooking}
                      >
                        {strings.buttons.confirm}
                      </button>
                      <button
                        onClick={() => handleCancelClick(booking)}
                        disabled={isProcessing}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                          isDark
                            ? 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                        aria-label={strings.aria.cancelBooking}
                      >
                        {strings.buttons.cancel}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      <PendingBookingModal
        isOpen={showModal}
        booking={selectedBooking}
        action={modalAction}
        onClose={() => {
          setShowModal(false);
          setSelectedBooking(null);
          setModalAction(null);
        }}
        onConfirm={handleModalConfirm}
        isLoading={isProcessing}
      />

      <Footer />
    </div>
  );
}
