import strings from '../../strings/manageBookingsStrings';

export default function CancelBookingModal({ booking, isDark, onConfirm, onCancel, isLoading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      ></div>

      {/* Modal */}
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all hover:scale-110 ${
            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
          aria-label="Close"
        >
          <svg
            className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isDark ? 'bg-red-900/20' : 'bg-red-50'
          }`}>
            <svg
              className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-600'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-xl font-bold text-center mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {isLoading ? 'Cancelling Booking...' : 'Cancel Booking'}
        </h3>

        {/* Message */}
        <p className={`text-center mb-6 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {isLoading 
            ? 'Processing cancellation and notifying the student...'
            : 'Are you sure you want to cancel this booking? The student will be notified via email.'}
        </p>

        {/* Booking Details */}
        <div className={`mb-6 p-4 rounded-lg ${
          isDark ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Student:
              </span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {booking.student.first_name} {booking.student.last_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Course:
              </span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {booking.office_hour.course_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Date:
              </span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {new Date(booking.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Note - Only show after confirmation/during loading */}
        {isLoading && (
          <div className={`mb-6 flex gap-3 p-3 rounded-lg ${
            isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
          }`}>
            <svg className={`w-5 h-5 flex-shrink-0 animate-spin ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              The student will be notified of this cancellation
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              isDark
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Processing...' : 'No, Keep It'}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            } disabled:opacity-50 disabled:cursor-not-allowed border ${
              isDark ? 'border-red-800' : 'border-red-200'
            }`}
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Cancelling...' : 'Yes, Cancel Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
