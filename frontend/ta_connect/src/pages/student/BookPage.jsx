import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import StudentNavbar from '../../components/student/studentNavbar';
import Footer from '../../components/Footer';
import { bookPageStrings as strings } from '../../strings/bookPageStrings';
import axios from 'axios';
import { useCreateBooking } from '../../hooks/useApi';

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
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sendEmailNotification, setSendEmailNotification] = useState(true);

  // Use mutation for creating booking
  const { mutate: createBooking, isPending: isCreatingBooking } = useCreateBooking();

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSelectedSlot(null);
    setSelectedDate('');
    setSelectedTime('');
    setAvailableDates([]);
    setTimeSlots([]);
    setSuccess('');
  };

  const fetchInstructors = async () => {
    if (!searchQuery.trim()) {
      setInstructors([]);
      return;
    }

    setIsSearching(true);
    setLoading(true);
    setError('');
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
    console.log('Selected instructor:', instructor);
    setSelectedInstructor(instructor);
    setSelectedSlot(null);
    setSelectedDate('');
    setAvailableDates([]);
    setError('');
    setSuccess('');

    try {
      console.log('Fetching slots for instructor ID:', instructor.id);
      const response = await axios.get(`/api/instructor/get-instructor-data/${instructor.id}/`);
      console.log('Instructor data response:', response.data);
      console.log('Time slots:', response.data.slots || response.data.time_slots);
      setInstructorSlots(response.data.slots || response.data.time_slots || []);
    } catch (err) {
      setError(strings.messages.errorFetchSlots);
      console.error('Error fetching slots:', err);
      console.error('Error response:', err.response?.data);
    }
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setSelectedDate('');
    setSelectedTime('');
    setTimeSlots([]);
    setError('');
    setSuccess('');
    generateAvailableDates(slot);
  };

  const fetchAvailableTimes = async (slotId, date) => {
    try {
      const response = await axios.get(`/api/student/booking/${slotId}/`, {
        params: { date }
      });
      
      if (response.data && response.data.available_times) {
        const times = response.data.available_times.map(time => ({
          start: time,
          value: time
        }));
        setTimeSlots(times);
      } else {
        setTimeSlots([]);
      }
    } catch (err) {
      console.error('Error fetching available times:', err);
      setError('Failed to load available times for this date');
      setTimeSlots([]);
    }
  };

  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedTime('');
    if (selectedSlot) {
      fetchAvailableTimes(selectedSlot.id, dateStr);
    }
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
    if (!selectedSlot || !selectedDate || !selectedTime) {
      setError('Please select a slot, date, and time');
      return;
    }

    setError('');
    setSuccess('');

    createBooking(
      {
        slot_id: selectedSlot.id,
        date: selectedDate,
        start_time: selectedTime,
        send_email: sendEmailNotification
      },
      {
        onSuccess: (response) => {
          setSuccess(strings.messages.successBooking);
          setShowSuccessModal(true);
        },
        onError: (err) => {
          console.error('Error creating booking:', err);
          let errorMsg = strings.messages.errorBooking;

          if (err.response?.data) {
            const data = err.response.data;
            if (typeof data.error === 'string') {
              errorMsg = data.error;
            } else if (data.error && typeof data.error === 'object') {
              const values = Object.values(data.error);
              if (values.length > 0) {
                const firstVal = values[0];
                errorMsg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
              }
            } else if (data.message) {
              errorMsg = data.message;
            } else if (data.non_field_errors) {
              errorMsg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : String(data.non_field_errors);
            } else if (data.detail) {
              errorMsg = data.detail;
            }
          }
          
          setError(typeof errorMsg === 'string' ? errorMsg : strings.messages.errorBooking);
        }
      }
    );
  };

  const formatTime = (time) => {
    if (!time) return '';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      if (isNaN(hour)) return time;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (e) {
      return time;
    }
  };

  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes) return '';
    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + durationMinutes;
      const endHours = Math.floor(totalMinutes / 60);
      const endMinutes = totalMinutes % 60;
      return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    } catch (e) {
      return '';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return String(date);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return String(date);
    }
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
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-8 rounded-xl ${isDark ? 'shadow-lg' : 'shadow-md'} mb-6`}>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>
                {strings.header.title}
              </h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-500'} text-lg`}>
                {strings.header.subtitle}
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className={`mb-6 p-4 ${isDark ? 'bg-red-900/30 border-red-600' : 'bg-red-50 border-red-300'} border-2 rounded-xl ${isDark ? '' : 'shadow-sm'}`}>
                <div className="flex items-start">
                  <svg className={`w-5 h-5 mr-3 mt-0.5 ${isDark ? 'text-red-600' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className={`${isDark ? 'text-red-200' : 'text-red-700'} font-medium`}>{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className={`mb-6 p-4 ${isDark ? 'bg-green-900/30 border-green-600' : 'bg-green-50 border-green-300'} border-2 rounded-xl ${isDark ? '' : 'shadow-sm'}`}>
                <div className="flex items-start">
                  <svg className={`w-5 h-5 mr-3 mt-0.5 ${isDark ? 'text-green-600' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className={`${isDark ? 'text-green-200' : 'text-green-700'} font-medium`}>{success}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Step 1: Select Instructor */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-white-200'} p-6 rounded-xl ${isDark ? 'shadow-lg' : 'shadow-md hover:shadow-lg transition-shadow'}`}>
                <div className="flex items-center mb-4">
                  <div className={`w-8 h-8 ${isDark ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535]' : 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b]'} text-white rounded-full flex items-center justify-center font-bold mr-3 shadow-sm`}>
                    {strings.steps.step1.number}
                  </div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
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
                        className={`w-full px-4 py-2.5 pr-10 border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-400'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all`}
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
                      className={`px-4 py-2 ${isDark ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535] hover:from-[#2d5857] hover:to-[#152a2a]' : 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b] hover:from-[#3d8584] hover:to-[#2d5857]'} text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium`}
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
                        className={`w-full p-4 rounded-lg border-2 bg-white dark:bg-gray-900 text-left transition-all ${
                          selectedInstructor?.id === instructor.id
                            ? isDark ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50 shadow-sm'
                            : `${isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${isDark ? 'bg-gradient-to-br from-[#366c6b] to-[#1a3535]' : 'bg-gradient-to-br from-[#4a9d9c] to-[#366c6b]'} rounded-full flex items-center justify-center text-white font-bold shadow-sm`}>
                            {instructor.first_name?.[0]}{instructor.last_name?.[0]}
                          </div>
                          <div>
                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
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
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-6 rounded-xl ${isDark ? 'shadow-lg' : 'shadow-md hover:shadow-lg transition-shadow'}`}>
                <div className="flex items-center mb-4">
                  <div className={`w-8 h-8 ${isDark ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535]' : 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b]'} text-white rounded-full flex items-center justify-center font-bold mr-3 shadow-sm`}>
                    {strings.steps.step2.number}
                  </div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {strings.steps.step2.title}
                  </h2>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {!selectedInstructor ? (
                    <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                      {strings.steps.step2.selectInstructorFirst}
                    </p>
                  ) : instructorSlots.length === 0 ? (
                    <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                      {strings.steps.step2.noSlots}
                    </p>
                  ) : (
                    instructorSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSelectSlot(slot)}
                        disabled={!slot.status}
                        className={`w-full p-4 rounded-lg border-2 bg-white dark:bg-gray-900 text-left transition-all ${
                          selectedSlot?.id === slot.id
                            ? isDark ? 'border-green-500 bg-green-900/20' : 'border-green-500 bg-green-50 shadow-sm'
                            : slot.status
                              ? `${isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`
                              : isDark ? 'border-gray-300 opacity-50 cursor-not-allowed' : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start justify-between ">
                          <div className="flex-1">
                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-1`}>
                              {slot.course_name || strings.steps.step2.officeHours}
                            </p>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-700'} space-y-0.5 font-medium`}>
                              <p>📅 {slot.day_of_week}</p>
                              <p>🕐 {formatTime(slot.start_time)} - {formatTime(slot.end_time)}</p>
                              <p>📍 {slot.location || strings.steps.step2.online}</p>
                              <p>📆 {formatDate(slot.start_date)} to {formatDate(slot.end_date)}</p>
                            </div>
                          </div>
                          {!slot.status && (
                            <span className={`text-xs ${isDark ? 'bg-red-100 text-red-700' : 'bg-red-100 text-red-600'} px-2 py-1 rounded font-medium`}>
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
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-6 rounded-xl ${isDark ? 'shadow-lg' : 'shadow-md hover:shadow-lg transition-shadow'}`}>
                <div className="flex items-center mb-4">
                  <div className={`w-8 h-8 ${isDark ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535]' : 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b]'} text-white rounded-full flex items-center justify-center font-bold mr-3 shadow-sm`}>
                    {strings.steps.step3.number}
                  </div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {strings.steps.step3.title}
                  </h2>
                </div>

                {!selectedSlot ? (
                  <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                    {strings.steps.step3.selectSlotFirst}
                  </p>
                ) : (
                  <>
                    <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                      {availableDates.length === 0 ? (
                        <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                          {strings.steps.step3.noDates}
                        </p>
                      ) : (
                        availableDates.map((date, index) => {
                          const dateStr = date.toISOString().split('T')[0];
                          return (
                            <button
                              key={index}
                              onClick={() => handleDateSelect(dateStr)}
                              className={`w-full p-3 rounded-lg border-2 bg-white dark:bg-gray-900 text-left transition-all ${
                                selectedDate === dateStr
                                  ? isDark ? 'border-purple-500 bg-purple-900/20' : 'border-purple-500 bg-purple-50 shadow-sm'
                                  : `${isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`
                              }`}
                            >
                              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {formatDate(date)}
                              </p>
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Time Selection */}
                    {selectedDate && (
                      <div className="mb-6">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3`}>
                          Select Time
                        </h3>
                        {timeSlots.length === 0 ? (
                          <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                            No available times for this date
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                            {timeSlots.map((timeSlot, index) => (
                              <button
                                key={index}
                                onClick={() => setSelectedTime(timeSlot.value)}
                                className={`p-2.5 rounded-lg border-2 bg-white dark:bg-gray-900 text-center transition-all font-medium text-sm ${
                                  selectedTime === timeSlot.value
                                    ? isDark ? 'border-blue-500 bg-blue-900/20 text-blue-300' : 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                    : `${isDark ? 'border-gray-700 hover:border-gray-600 text-gray-300' : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:shadow-sm'}`
                                }`}
                              >
                                {formatTime(timeSlot.start)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Booking Summary */}
                    {selectedDate && selectedTime && selectedSlot && selectedInstructor && (
                      <div className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'} rounded-lg mb-4 ${isDark ? '' : 'shadow-sm'}`}>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3`}>
                          {strings.steps.step3.summaryTitle}
                        </h3>
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-800'} space-y-1.5 font-medium`}>
                          <p>👨‍🏫 {selectedInstructor.first_name || ''} {selectedInstructor.last_name || ''}</p>
                          <p>📚 {selectedSlot.course_name || strings.steps.step2.officeHours}</p>
                          <p>📅 {formatDate(selectedDate)}</p>
                          <p>🕐 {formatTime(selectedTime)} - {formatTime(calculateEndTime(selectedTime, selectedSlot.duration_minutes))}</p>
                          <p>📍 {selectedSlot.room || strings.steps.step2.online}</p>
                        </div>
                      </div>
                    )}

                    {/* Email Notification Toggle */}
                    {selectedDate && selectedTime && (
                      <div className={`relative p-6 ${isDark ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border-2 border-gray-600' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 border-2 border-blue-100'} rounded-2xl mb-4 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group`}>
                        {/* Decorative background elements */}
                        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${sendEmailNotification ? 'bg-blue-400/10' : 'bg-gray-400/5'} blur-2xl transition-all duration-500`}></div>
                        <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full ${sendEmailNotification ? 'bg-purple-400/10' : 'bg-gray-400/5'} blur-2xl transition-all duration-500`}></div>
                        
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Animated icon container */}
                            <div className={`relative p-3 rounded-xl ${
                              sendEmailNotification 
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30' 
                                : isDark ? 'bg-gray-700 shadow-md' : 'bg-gray-100 shadow-md'
                            } transition-all duration-300 transform group-hover:scale-105`}>
                              {sendEmailNotification && (
                                <div className="absolute inset-0 rounded-xl bg-blue-400 animate-ping opacity-20"></div>
                              )}
                              <svg 
                                className={`w-6 h-6 relative z-10 ${
                                  sendEmailNotification 
                                    ? 'text-white' 
                                    : isDark ? 'text-gray-400' : 'text-gray-500'
                                } transition-all duration-300`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                {sendEmailNotification && (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                                )}
                              </svg>
                            </div>
                            
                            {/* Text content */}
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 mb-1">
                                <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  Email Confirmation
                                </p>
                                {sendEmailNotification && (
                                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 animate-pulse">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} font-medium`}>
                                {sendEmailNotification 
                                  ? '✓ You will receive a booking confirmation email' 
                                  : '✗ No confirmation email will be sent to you'}
                              </p>
                              <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-0.5 italic`}>
                                Instructor always gets notified
                              </p>
                            </div>
                          </div>
                          
                          {/* Enhanced toggle switch */}
                          <button
                            onClick={() => setSendEmailNotification(!sendEmailNotification)}
                            className={`relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-lg ${
                              sendEmailNotification
                                ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 focus:ring-blue-400/50 shadow-blue-500/40'
                                : isDark 
                                  ? 'bg-gradient-to-r from-gray-600 to-gray-700 focus:ring-gray-500/50 shadow-gray-800/40' 
                                  : 'bg-gradient-to-r from-gray-300 to-gray-400 focus:ring-gray-400/50 shadow-gray-400/40'
                            } transform hover:scale-105 active:scale-95`}
                            aria-label="Toggle email confirmation"
                          >
                            {/* Toggle indicator with icon */}
                            <span
                              className={`pointer-events-none inline-flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow-xl transition-all duration-300 ease-out ${
                                sendEmailNotification ? 'translate-x-[28px]' : 'translate-x-[2px]'
                              }`}
                            >
                              {sendEmailNotification ? (
                                <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleBookSlot}
                      disabled={!selectedDate || !selectedTime || isCreatingBooking}
                      className={`w-full ${isDark ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535]' : 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b]'} text-white py-3 px-6 rounded-lg ${isDark ? 'hover:from-[#2d5857] hover:to-[#152a2a]' : 'hover:from-[#3d8584] hover:to-[#2d5857]'} hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold flex items-center justify-center transform hover:scale-[1.02]`}
                    >
                      {isCreatingBooking ? (
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200'} rounded-xl shadow-2xl max-w-md w-full p-8 transform transition-all scale-100`}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Booking Confirmed!</h3>
              <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
                {sendEmailNotification 
                  ? 'A confirmation has been sent to your email.' 
                  : 'Your booking is confirmed. No email notification was sent.'}
              </p>
              <button
                onClick={handleCloseSuccessModal}
                className={`w-full ${isDark ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535] hover:from-[#2d5857] hover:to-[#152a2a]' : 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b] hover:from-[#3d8584] hover:to-[#2d5857]'} text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all font-semibold transform hover:scale-[1.02]`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
