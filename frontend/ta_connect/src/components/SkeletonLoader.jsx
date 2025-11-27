/**
 * Loading Skeleton Component
 * Shows placeholder content while data is loading
 */
export const SkeletonLoader = ({ isDark, count = 1, height = 'h-12', className = '' }) => {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`${height} ${className} rounded-lg ${
            isDark
              ? 'bg-gradient-to-r from-gray-800 to-gray-700 animate-pulse'
              : 'bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse'
          }`}
        />
      ))}
    </div>
  );
};

/**
 * Card Skeleton for loading multiple items
 */
export const CardSkeleton = ({ isDark, count = 3, showImage = true }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`p-6 rounded-xl ${
            isDark
              ? 'bg-gray-800'
              : 'bg-white'
          }`}
        >
          {showImage && (
            <div
              className={`h-40 rounded-lg mb-4 ${
                isDark
                  ? 'bg-gradient-to-r from-gray-700 to-gray-600 animate-pulse'
                  : 'bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse'
              }`}
            />
          )}
          <div
            className={`h-4 rounded mb-3 ${
              isDark
                ? 'bg-gradient-to-r from-gray-700 to-gray-600 animate-pulse'
                : 'bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse'
            }`}
          />
          <div
            className={`h-4 rounded w-5/6 ${
              isDark
                ? 'bg-gradient-to-r from-gray-700 to-gray-600 animate-pulse'
                : 'bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse'
            }`}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Table Row Skeleton
 */
export const TableRowSkeleton = ({ isDark, rows = 5, columns = 4 }) => {
  return (
    <tbody>
      {[...Array(rows)].map((_, i) => (
        <tr key={i} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          {[...Array(columns)].map((_, j) => (
            <td key={j} className="px-6 py-4">
              <div
                className={`h-4 rounded ${
                  isDark
                    ? 'bg-gradient-to-r from-gray-700 to-gray-600 animate-pulse'
                    : 'bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse'
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};
