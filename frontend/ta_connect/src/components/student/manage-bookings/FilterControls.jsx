import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import allStrings from '../../../strings/manageBookingsStrings';

export default function FilterControls({
  filterStatus,
  setFilterStatus,
  filterCourse,
  setFilterCourse,
  sortBy,
  setSortBy,
  dateRange,
  setDateRange,
  uniqueCourses,
  hasCancelled,
  hasCompleted,
  onClearFilters,
  onClearCancelled,
  onClearCompleted
}) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = allStrings[language];
  const isDark = theme === 'dark';

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 rounded-xl shadow-lg mb-4 sm:mb-6`}>
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Top Row: Filters */}
        <div className="flex flex-row gap-3 sm:gap-4">
          {/* Status Filter */}
          <div className="flex-1 min-w-[150px]">
            <label className={`block text-xs sm:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1.5 sm:mb-2`}>
              {t.filters.status}
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
              <option value="all">{t.filters.allBookings}</option>
              <option value="active">{t.filters.activeOnly}</option>
              <option value="cancelled">{t.filters.cancelledOnly}</option>
              <option value="completed">{t.filters.completedOnly}</option>
            </select>
          </div>

          {/* Course Filter */}
          <div className="flex-1 min-w-[150px]">
            <label className={`block text-xs sm:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1.5 sm:mb-2`}>
              {t.filters.course}
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
              <option value="all">{t.filters.allCourses}</option>
              {uniqueCourses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex-1 min-w-[150px]">
            <label className={`block text-xs sm:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1.5 sm:mb-2`}>
              {t.filters.sortBy}
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
              <option value="date">{t.filters.byDate}</option>
              <option value="course">{t.filters.byCourse}</option>
            </select>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className={`block text-xs sm:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1.5 sm:mb-2`}>
              {t.filters.from}
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border-2 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-[#366c6b]'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-[#366c6b]'
              } focus:outline-none transition-colors`}
            />
          </div>
          <div>
            <label className={`block text-xs sm:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1.5 sm:mb-2`}>
              {t.filters.to}
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border-2 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-[#366c6b]'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-[#366c6b]'
              } focus:outline-none transition-colors`}
            />
          </div>
        </div>

        {/* Bottom Row: Action Buttons */}
        <div className="flex flex-row gap-2 pt-2 sm:pt-3 border-t border-gray-600/30">
          <button
            onClick={onClearFilters}
            className={`w-auto px-4 py-2 rounded-lg border transition-all ${
              isDark
                ? 'border-gray-500 text-gray-300 hover:bg-gray-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t.filters.clear}
          </button>
          {hasCancelled && (
            <button
              onClick={onClearCancelled}
              className={`w-auto px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                isDark 
                  ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50 border-2 border-red-700 hover:scale-105' 
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-300 hover:scale-105'
              } shadow-md hover:shadow-lg`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {t.buttons.deleteAllCancelled}
            </button>
          )}
          {hasCompleted && (
            <button
              onClick={onClearCompleted}
              className={`w-auto px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                isDark 
                  ? 'bg-green-900/30 text-green-300 hover:bg-green-900/50 border-2 border-green-700 hover:scale-105' 
                  : 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-300 hover:scale-105'
              } shadow-md hover:shadow-lg`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {t.buttons.deleteAllCompleted || 'Clear Completed'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
