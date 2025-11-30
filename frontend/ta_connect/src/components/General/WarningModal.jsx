import { useState } from 'react';

export default function WarningModal({
  isDark,
  title,
  message,
  warningText,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
}) {
  const [isOpen, setIsOpen] = useState(true);

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-md rounded-lg shadow-xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-6 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className={`p-4 sm:p-6 space-y-4 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {message}
          </p>

          {warningText && (
            <div
              className={`p-3 sm:p-4 rounded-lg ${
                isDark
                  ? 'bg-yellow-900/30 border border-yellow-700'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}
            >
              <p
                className={`text-xs sm:text-sm font-medium flex items-start gap-2 ${
                  isDark ? 'text-yellow-300' : 'text-yellow-800'
                }`}
              >
                <span className="flex-shrink-0 mt-0.5">⚠️</span>
                <span>{warningText}</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-4 sm:p-6 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          } flex flex-col-reverse sm:flex-row gap-3`}
        >
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all text-sm ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900 disabled:opacity-50'
            } disabled:cursor-not-allowed`}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-yellow-600 hover:bg-yellow-500 text-white disabled:opacity-50'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50'
            } disabled:cursor-not-allowed`}
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
