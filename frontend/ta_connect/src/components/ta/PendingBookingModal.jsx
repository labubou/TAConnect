import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import pendingBookingsStrings from '../../strings/pendingBookingsPageStrings';

export default function PendingBookingModal({
  isOpen,
  booking,
  action, // 'confirm' or 'cancel'
  onClose,
  onConfirm,
  isLoading = false,
}) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const strings = pendingBookingsStrings[language];
  const isDark = theme === 'dark';

  if (!isOpen || !booking) return null;

  const isConfirmAction = action === 'confirm';
  const modalTitle = isConfirmAction ? strings.modals.confirmTitle : strings.modals.cancelTitle;
  const modalMessage = isConfirmAction ? strings.modals.confirmMessage : strings.modals.cancelMessage;
  const confirmButtonText = isConfirmAction ? strings.buttons.confirmBooking : strings.buttons.cancelBooking;

  const handleConfirm = () => {
    onConfirm(booking.id, action);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none ${
          isOpen ? 'pointer-events-auto' : ''
        }`}
      >
        <div
          className={`relative w-full max-w-md mx-auto rounded-lg shadow-xl transform transition-all ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`px-6 py-4 border-b ${
              isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <h2
              className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {modalTitle}
            </h2>
          </div>

          {/* Content */}
          <div className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {/* Booking Info */}
            <div
              className={`mb-4 p-3 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            >
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{strings.bookingCard.student}:</span>
                  <span>
                    {booking.student?.first_name} {booking.student?.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{strings.bookingCard.email}:</span>
                  <span className="text-xs">{booking.student?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{strings.bookingCard.course}:</span>
                  <span>{booking.office_hour?.course_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{strings.bookingCard.date}:</span>
                  <span>
                    {booking.date && new Date(booking.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Message */}
            <p className="mb-6">{modalMessage}</p>
          </div>

          {/* Footer */}
          <div
            className={`px-6 py-4 border-t flex gap-3 justify-end ${
              isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <button
              onClick={onClose}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {strings.modals.no}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                isConfirmAction
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                  : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
              } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {isLoading && (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
