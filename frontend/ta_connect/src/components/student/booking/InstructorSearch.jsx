import { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useGlobalLoading } from '../../../contexts/GlobalLoadingContext';
import { bookPageStrings } from '../../../strings/bookPageStrings';
import axios from 'axios';

export default function InstructorSearch({ 
  onInstructorSelect, 
  selectedInstructor,
  preloadedInstructors = []
}) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const strings = bookPageStrings[language];
  const { startLoading, stopLoading, isLoading } = useGlobalLoading();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [instructors, setInstructors] = useState(preloadedInstructors);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update instructors when preloaded instructors change
  useEffect(() => {
    if (preloadedInstructors.length > 0) {
      setInstructors(preloadedInstructors);
    }
  }, [preloadedInstructors]);

  const fetchInstructors = async () => {
    if (!searchQuery.trim()) {
      setInstructors([]);
      return;
    }

    setIsSearching(true);
    setLoading(true);
    setError('');
    startLoading('fetch-instructors', strings.messages.searchingInstructors);
    
    try {
      console.log('Fetching instructors with query:', searchQuery);
      const response = await axios.get('/api/instructor/search-instructors/', {
        params: searchQuery ? { query: searchQuery } : {}
      });
      console.log('Instructors response:', response.data);
      
      // Transform backend data to match frontend expectations
      const transformedInstructors = (response.data.instructors || []).map(instructor => {
        const nameParts = (instructor.full_name || '').split(' ');
        return {
          ...instructor,
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
        };
      });
      
      setInstructors(transformedInstructors);
    } catch (err) {
      console.error('Error fetching instructors:', err);
      console.error('Error response:', err.response?.data);
      setError(strings.messages.errorFetchInstructors);
      setInstructors([]);
    } finally {
      stopLoading('fetch-instructors');
      setLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setInstructors([]); 
      setIsSearching(false);
      return;
    }

    if (searchQuery.trim().length < 2) {
      return;
    }

    setIsSearching(true);
    const delaySearch = setTimeout(() => {
      fetchInstructors();
    }, 400); // Wait 400ms after user stops typing

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleSearchInstructors = () => {
    fetchInstructors();
  };

  const handleSelectInstructor = (instructor) => {
    console.log('Selected instructor:', instructor);
    onInstructorSelect(instructor);
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-white-200'} p-4 sm:p-5 md:p-6 rounded-xl ${isDark ? 'shadow-lg' : 'shadow-md hover:shadow-lg transition-shadow'}`}>
      <div className="flex items-center mb-3 sm:mb-4">
        <div className={`w-7 h-7 sm:w-8 sm:h-8 ${isDark ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535]' : 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b]'} text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${language === 'ar' ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'} shadow-sm`}>
          {strings.steps.step1.number}
        </div>
        <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {strings.steps.step1.title}
        </h2>
      </div>

      {/* Search Bar */}
      <div className="mb-3 sm:mb-4">
        <div className="relative flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchInstructors()}
              placeholder={strings.steps.step1.searchPlaceholder}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 border text-sm sm:text-base ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-400'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all`}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            {searchQuery && !isSearching && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={handleSearchInstructors}
            disabled={!searchQuery.trim() || isSearching || isLoading}
            className={`w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm sm:text-base ${isDark ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535] hover:from-[#2d5857] hover:to-[#152a2a]' : 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b] hover:from-[#3d8584] hover:to-[#2d5857]'} text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium`}
          >
            {strings.steps.step1.searchButton}
          </button>
        </div>
        {searchQuery.trim() && searchQuery.trim().length < 2 && (
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {strings.steps.step1.minCharsHint}
          </p>
        )}
      </div>

      {/* Instructors List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-4">
            <svg className="animate-spin h-8 w-8 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : instructors.length === 0 ? (
          <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
            {searchQuery.trim() ? (
              <>
                <svg className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'opacity-50' : 'opacity-40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {strings.steps.step1.noResultsFor} "{searchQuery}"
                <br />
                <span className="text-sm">{strings.steps.step1.tryDifferent}</span>
              </>
            ) : (
              <>
                <svg className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'opacity-50' : 'opacity-40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {strings.steps.step1.startTyping}
              </>
            )}
          </p>
        ) : (
          instructors.map((instructor) => (
            <button
              key={instructor.id}
              onClick={() => handleSelectInstructor(instructor)}
              className={`w-full p-3 sm:p-4 rounded-lg border-2 bg-white dark:bg-gray-900 transition-all ${
                selectedInstructor?.id === instructor.id
                  ? isDark ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50 shadow-sm'
                  : `${isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3" dir="ltr">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 text-sm sm:text-base ${isDark ? 'bg-gradient-to-br from-[#366c6b] to-[#1a3535]' : 'bg-gradient-to-br from-[#4a9d9c] to-[#366c6b]'} rounded-full flex items-center justify-center text-white font-bold shadow-sm`}>
                  {instructor.first_name?.[0]}{instructor.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className={`text-sm sm:text-base font-semibold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {instructor.first_name} {instructor.last_name}
                  </p>
                  <p className={`text-xs sm:text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {instructor.email}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
