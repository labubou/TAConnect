import { useGlobalLoading } from '../../contexts/GlobalLoadingContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function GlobalLoadingOverlay() {
  const { isLoading, loadingMessage } = useGlobalLoading();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      style={{
        pointerEvents: 'auto',
      }}
    >
      {/* Prevent any clicks from reaching elements below */}
      <div
        className="absolute inset-0"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Loading content - on top of the overlay */}
      <div
        className={`relative z-[10000] ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          {/* Animated Spinner */}
          <div className="flex justify-center mb-6">
            <svg
              className="animate-spin h-12 w-12 text-blue-500"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>

          {/* Loading Text */}
          <p
            className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}
          >
            {loadingMessage || 'Loading...'}
          </p>

          {/* Subtitle */}
          <p
            className={`text-sm mt-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Please wait while we process your request
          </p>
        </div>
      </div>
    </div>
  );
}
