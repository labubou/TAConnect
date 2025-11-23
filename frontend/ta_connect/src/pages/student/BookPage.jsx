import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import StudentNavbar from '../../components/student/studentNavbar';
import Footer from '../../components/Footer';
import { bookPageStrings as strings } from '../../strings/bookPageStrings';
import axios from 'axios';

export default function BookPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [instructorSlots, setInstructorSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchInstructors = async () => {
    if (!searchQuery.trim()) {
      setInstructors([]);
      return;
    }

    setIsSearching(true);
    setLoading(true);
    setError('');
    try {
      console.log('Fetching instructors...');
      const response = await axios.get('/api/instructor/search-instructors/', {
        params: searchQuery ? { search: searchQuery } : {}
      });
      console.log('Instructors response:', response.data);
      setInstructors(response.data.instructors || []);
    } catch (err) {
      console.error('Error fetching instructors:', err);
      console.error('Error response:', err.response?.data);
      setError(strings.messages.errorFetchInstructors);

      setInstructors([]);
    } finally {
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

  const handleSelectInstructor = async (instructor) => {
    setSelectedInstructor(instructor);
    setSelectedSlot(null);
    setSelectedDate('');
    setAvailableDates([]);
    setError('');
    setSuccess('');

    try {
      const response = await axios.get(`/api/instructor/get-instructor-data/${instructor.id}/`);
      setInstructorSlots(response.data.time_slots || []);
    } catch (err) {
      setError(strings.messages.errorFetchSlots);
      console.error('Error fetching slots:', err);
    }
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setSelectedDate('');
    setError('');
    setSuccess('');
    generateAvailableDates(slot);
  };

  const generateAvailableDates = (slot) => {
    const dates = [];
    const today = new Date();
    const startDate = new Date(slot.start_date);
    const endDate = new Date(slot.end_date);
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const targetDay = daysOfWeek.indexOf(slot.day_of_week);

    let currentDate = new Date(Math.max(today, startDate));
    
    while (currentDate <= endDate) {
      if (currentDate.getDay() === targetDay && currentDate >= today) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setAvailableDates(dates);
  };

  const handleBookSlot = async () => {
    if (!selectedSlot || !selectedDate) {
      setError(strings.messages.errorSelectSlotDate);
      return;
    }

    setBookingLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/student/booking/', {
        slot_id: selectedSlot.id,
        date: selectedDate
      });

      setSuccess(strings.messages.successBooking);
      
      // Reset selections
      setTimeout(() => {
        setSelectedSlot(null);
        setSelectedDate('');
        setAvailableDates([]);
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || strings.messages.errorBooking;
      setError(errorMsg);
      console.error('Error creating booking:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <StudentNavbar onToggle={setIsNavbarOpen} />
      
      <div 
        className={`flex-1 transition-all duration-300 ${isNavbarOpen ? 'ml-64' : 'ml-0'} pt-20`}
        style={{ minHeight: 'calc(100vh - 4rem)' }}
      >
        <main className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-6`}>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                {strings.header.title}
              </h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {strings.header.subtitle}
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className={`mb-6 p-4 ${isDark ? 'bg-red-900/30 border-red-600' : 'bg-red-100 border-red-400'} border rounded-xl`}>
                <div className="flex items-start">
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className={`${isDark ? 'text-red-200' : 'text-red-700'}`}>{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className={`mb-6 p-4 ${isDark ? 'bg-green-900/30 border-green-600' : 'bg-green-100 border-green-400'} border rounded-xl`}>
                <div className="flex items-start">
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className={`${isDark ? 'text-green-200' : 'text-green-700'}`}>{success}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Step 1: Select Instructor */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white rounded-full flex items-center justify-center font-bold mr-3">
                    {strings.steps.step1.number}
                  </div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {strings.steps.step1.title}
                  </h2>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                  <div className="relative flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchInstructors()}
                        placeholder={strings.steps.step1.searchPlaceholder}
                        className={`w-full px-3 py-2 pr-10 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-black placeholder-gray-500'} rounded-lg focus:ring-2 focus:ring-blue-500`}
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
                      disabled={!searchQuery.trim() || isSearching}
                      className="px-4 py-2 bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {strings.steps.step1.searchButton}
                    </button>
                  </div>
                  {searchQuery.trim() && searchQuery.trim().length < 2 && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Type at least 2 characters to search
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
                    <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {searchQuery.trim() ? (
                        <>
                          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          No instructors found for "{searchQuery}"
                          <br />
                          <span className="text-sm">Try a different search term</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Start typing to search for instructors
                        </>
                      )}
                    </p>
                  ) : (
                    instructors.map((instructor) => (
                      <button
                        key={instructor.id}
                        onClick={() => handleSelectInstructor(instructor)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          selectedInstructor?.id === instructor.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : `${isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#366c6b] to-[#1a3535] rounded-full flex items-center justify-center text-white font-bold">
                            {instructor.first_name?.[0]}{instructor.last_name?.[0]}
                          </div>
                          <div>
                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {instructor.first_name} {instructor.last_name}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {instructor.email}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Step 2: Select Time Slot */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white rounded-full flex items-center justify-center font-bold mr-3">
                    {strings.steps.step2.number}
                  </div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {strings.steps.step2.title}
                  </h2>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {!selectedInstructor ? (
                    <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {strings.steps.step2.selectInstructorFirst}
                    </p>
                  ) : instructorSlots.length === 0 ? (
                    <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {strings.steps.step2.noSlots}
                    </p>
                  ) : (
                    instructorSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSelectSlot(slot)}
                        disabled={!slot.status}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          selectedSlot?.id === slot.id
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : slot.status
                              ? `${isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`
                              : 'border-gray-300 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                              {slot.course_name || strings.steps.step2.officeHours}
                            </p>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                              <p>📅 {slot.day_of_week}</p>
                              <p>🕐 {formatTime(slot.start_time)} - {formatTime(slot.end_time)}</p>
                              <p>📍 {slot.location || strings.steps.step2.online}</p>
                              <p>📆 {formatDate(slot.start_date)} to {formatDate(slot.end_date)}</p>
                            </div>
                          </div>
                          {!slot.status && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              {strings.steps.step2.inactive}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Step 3: Select Date & Book */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white rounded-full flex items-center justify-center font-bold mr-3">
                    {strings.steps.step3.number}
                  </div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {strings.steps.step3.title}
                  </h2>
                </div>

                {!selectedSlot ? (
                  <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {strings.steps.step3.selectSlotFirst}
                  </p>
                ) : (
                  <>
                    <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                      {availableDates.length === 0 ? (
                        <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {strings.steps.step3.noDates}
                        </p>
                      ) : (
                        availableDates.map((date, index) => {
                          const dateStr = date.toISOString().split('T')[0];
                          return (
                            <button
                              key={index}
                              onClick={() => setSelectedDate(dateStr)}
                              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                                selectedDate === dateStr
                                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                  : `${isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`
                              }`}
                            >
                              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {formatDate(date)}
                              </p>
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Booking Summary */}
                    {selectedDate && (
                      <div className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg mb-4`}>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                          {strings.steps.step3.summaryTitle}
                        </h3>
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                          <p>👨‍🏫 {selectedInstructor.first_name} {selectedInstructor.last_name}</p>
                          <p>📚 {selectedSlot.course_name || strings.steps.step2.officeHours}</p>
                          <p>📅 {formatDate(selectedDate)}</p>
                          <p>🕐 {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}</p>
                          <p>📍 {selectedSlot.location || strings.steps.step2.online}</p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleBookSlot}
                      disabled={!selectedDate || bookingLoading}
                      className="w-full bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white py-3 px-6 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold flex items-center justify-center"
                    >
                      {bookingLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {strings.steps.step3.bookingButton}
                        </>
                      ) : (
                        strings.steps.step3.confirmButton
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
