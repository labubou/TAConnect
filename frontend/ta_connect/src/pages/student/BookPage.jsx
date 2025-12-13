import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useGlobalLoading } from '../../contexts/GlobalLoadingContext';
import StudentNavbar from '../../components/student/studentNavbar';
import Footer from '../../components/General/Footer';
import InstructorSearch from '../../components/student/booking/InstructorSearch';
import TimeSlotSelector from '../../components/student/booking/TimeSlotSelector';
import DateTimeBooking from '../../components/student/booking/DateTimeBooking';
import SuccessModal from '../../components/student/booking/SuccessModal';
import MessageBanner from '../../components/student/booking/MessageBanner';
import { bookPageStrings } from '../../strings/bookPageStrings';
import axios from 'axios';
import { useCreateBooking } from '../../hooks/useApi';

export default function BookPage() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const strings = bookPageStrings[language];
  const { user, accessToken } = useAuth();
  const { startLoading, stopLoading, isLoading } = useGlobalLoading();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [instructorSlots, setInstructorSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [description, setDescription] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [userEmailPreferences, setUserEmailPreferences] = useState({ email_on_booking: true });

  // Use mutation for creating booking
  const { mutate: createBooking, isPending: isCreatingBooking } = useCreateBooking();

  // Track which URL params have been loaded to prevent duplicate loading
  const loadedParamsRef = useRef(null);

  // Ebst ya Nadeem
  
  // Redirect to public booking page if user is not authenticated but URL parameters are present
  useEffect(() => {
    const instructorId = searchParams.get('ta_id') || searchParams.get('instructor');
    const slotId = searchParams.get('slot_id') || searchParams.get('slot');

    // If URL parameters exist but user is not authenticated, redirect to public booking page
    if (instructorId && slotId && !user) {
      navigate(`/book?ta_id=${instructorId}&slot_id=${slotId}`, { replace: true });
    }
  }, [searchParams, user, navigate]);
  
  // Handle URL parameters for pre-selection
  useEffect(() => {
    // Support both parameter naming conventions: ta_id/slot_id and instructor/slot
    const instructorId = searchParams.get('ta_id') || searchParams.get('instructor');
    const slotId = searchParams.get('slot_id') || searchParams.get('slot');

    // Get token from accessToken state or localStorage
    const token = accessToken || localStorage.getItem('access_token');

    console.log('[BookPage] URL params:', { instructorId, slotId, user: !!user, accessToken: !!token });

    // Only proceed if we have parameters and user is authenticated
    if (instructorId && slotId && user && token) {
      // Create a key to track if we've already loaded these params
      const paramsKey = `${instructorId}-${slotId}`;
      
      console.log('[BookPage] Checking params key:', paramsKey, 'vs loaded:', loadedParamsRef.current);
      
      // Skip if we've already loaded these exact parameters
      if (loadedParamsRef.current === paramsKey) {
        console.log('[BookPage] Already loaded these params, skipping');
        return;
      }

      console.log('[BookPage] Loading from params:', { instructorId, slotId });

      // Auto-load instructor and slot from URL parameters
      const loadFromParams = async () => {
        startLoading('load-params', 'Loading booking details...');
        try {
          // Fetch instructor's full data including slots directly
          const response = await axios.get(`/api/instructor/get-instructor-data/${instructorId}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const instructorData = response.data;
          console.log('[BookPage] Instructor data:', instructorData);
          
          // Transform instructor data
          const nameParts = (instructorData.full_name || '').split(' ');
          const instructor = {
            id: instructorData.id,
            full_name: instructorData.full_name,
            first_name: nameParts[0] || instructorData.first_name || '',
            last_name: nameParts.slice(1).join(' ') || instructorData.last_name || '',
            email: instructorData.email,
          };

          console.log('[BookPage] Found instructor:', instructor);

          // Set both selected instructor and add to instructors list for display
          setSelectedInstructor(instructor);
          setInstructors([instructor]);
          
          // Get slots from the instructor data
          const slots = instructorData.slots || instructorData.time_slots || [];
          setInstructorSlots(slots);
          
          console.log('[BookPage] Fetched slots:', slots.length, 'Looking for slot ID:', slotId);
          
          // Find and select the specific slot
          const targetSlot = slots.find(slot => slot.id === parseInt(slotId));
          if (targetSlot) {
            console.log('[BookPage] Found target slot:', targetSlot);
            setSelectedSlot(targetSlot);
            
            // Generate available dates for the selected slot
            const dates = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const [startYear, startMonth, startDay] = targetSlot.start_date.split('-').map(Number);
            const startDate = new Date(startYear, startMonth - 1, startDay);
            
            const [endYear, endMonth, endDay] = targetSlot.end_date.split('-').map(Number);
            const endDate = new Date(endYear, endMonth - 1, endDay);
            
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const targetDay = daysOfWeek.indexOf(targetSlot.day_of_week);

            let currentDate = new Date(Math.max(today.getTime(), startDate.getTime()));
            
            while (currentDate <= endDate) {
              if (currentDate.getDay() === targetDay && currentDate >= today) {
                dates.push(new Date(currentDate));
              }
              currentDate.setDate(currentDate.getDate() + 1);
            }

            setAvailableDates(dates);
            console.log('[BookPage] Generated available dates:', dates.length);
          } else {
            console.log('[BookPage] Slot not found in slots:', slots.map(s => s.id));
            setError(strings.errors.slotNotFound);
          }
          
          // Mark these params as loaded
          loadedParamsRef.current = paramsKey;
          
        } catch (err) {
          console.error('Error loading from URL parameters:', err);
          console.error('Error details:', err.response?.data);
          setError(strings.errors.failedLoadFromLink);
        } finally {
          stopLoading('load-params');
        }
      };

      loadFromParams();
    } else {
      console.log('[BookPage] Not loading params - missing requirements:', { 
        hasInstructorId: !!instructorId, 
        hasSlotId: !!slotId, 
        hasUser: !!user, 
        hasToken: !!token 
      });
      
      if (!instructorId || !slotId) {
        // Reset the ref if there are no URL params
        loadedParamsRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user, accessToken]);


  // Fetch user email preferences on mount
  useEffect(() => {
    const fetchEmailPreferences = async () => {
      try {
        const response = await axios.get('/api/profile/email-preferences/');
        if (response.data) {
          setUserEmailPreferences({
            email_on_booking: response.data.email_on_booking !== false
          });
          setSendEmailNotification(response.data.email_on_booking !== false);
        }
      } catch (err) {
        console.error('Failed to fetch email preferences:', err);
        // Keep default values if fetch fails
      }
    };
    fetchEmailPreferences();
  }, []);

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSelectedSlot(null);
    setSelectedDate('');
    setSelectedTime('');
    setAvailableDates([]);
    setTimeSlots([]);
    setSuccess('');
  };

  const handleSelectInstructor = async (instructor) => {
    console.log('Selected instructor:', instructor);
    setSelectedInstructor(instructor);
    setSelectedSlot(null);
    setSelectedDate('');
    setAvailableDates([]);
    setError('');
    setSuccess('');

    startLoading('fetch-slots', strings.messages.loadingSlots);
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
    } finally {
      stopLoading('fetch-slots');
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
    startLoading('fetch-times', strings.messages.loadingTimes);
    try {
      const response = await axios.get(`/api/student/booking/${slotId}/`, {
        params: { date }
      });
      
      if (response.data && response.data.available_times) {
        let times = response.data.available_times.map(time => ({
          start: time,
          value: time
        }));
        
        // Filter out times that have already passed if the date is today
        const selectedDateObj = new Date(date);
        const now = new Date();
        const isToday = selectedDateObj.getDate() === now.getDate() && 
                        selectedDateObj.getMonth() === now.getMonth() && 
                        selectedDateObj.getFullYear() === now.getFullYear();
        
        if (isToday) {
          times = times.filter(timeSlot => {
            try {
              const [hours, minutes] = timeSlot.start.split(':').map(Number);
              const slotDateTime = new Date();
              slotDateTime.setHours(hours, minutes, 0, 0);
              return slotDateTime > now;
            } catch (e) {
              console.error('Error parsing time:', e);
              return true; // Keep the slot if there's an error parsing
            }
          });
        }
        
        setTimeSlots(times);
      } else {
        setTimeSlots([]);
      }
    } catch (err) {
      console.error('Error fetching available times:', err);
      let errorMsg = strings.errors.failedLoadTimes;

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

      setError(typeof errorMsg === 'string' ? errorMsg : strings.errors.failedLoadTimes);
      setTimeSlots([]);
    } finally {
      stopLoading('fetch-times');
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
    // Use local date without timezone conversion
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse dates as local dates to avoid timezone shifts
    const [startYear, startMonth, startDay] = slot.start_date.split('-').map(Number);
    const startDate = new Date(startYear, startMonth - 1, startDay);
    
    const [endYear, endMonth, endDay] = slot.end_date.split('-').map(Number);
    const endDate = new Date(endYear, endMonth - 1, endDay);
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const targetDay = daysOfWeek.indexOf(slot.day_of_week);
    
    // Parse slot end time
    const [endHours, endMinutes] = slot.end_time.split(':').map(Number);

    let currentDate = new Date(Math.max(today.getTime(), startDate.getTime()));
    
    while (currentDate <= endDate) {
      if (currentDate.getDay() === targetDay && currentDate >= today) {
        // Check if this is today and if the time slot has already passed
        const isToday = currentDate.getDate() === now.getDate() && 
                        currentDate.getMonth() === now.getMonth() && 
                        currentDate.getFullYear() === now.getFullYear();
        
        if (isToday) {
          // For today, only add if the slot end time hasn't passed yet
          const slotEndDateTime = new Date(currentDate);
          slotEndDateTime.setHours(endHours, endMinutes, 0, 0);
          
          if (now < slotEndDateTime) {
            dates.push(new Date(currentDate));
          }
        } else {
          // For future dates, always add
          dates.push(new Date(currentDate));
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setAvailableDates(dates);
  };

  const handleBookSlot = async () => {
    if (!selectedSlot || !selectedDate || !selectedTime) {
      setError(strings.errors.selectAll);
      return;
    }

    setError('');
    setSuccess('');
    startLoading('create-booking', strings.messages.creatingBooking);

    createBooking(
      {
        slot_id: selectedSlot.id,
        date: selectedDate,
        start_time: selectedTime,
        send_email: sendEmailNotification,
        book_description: description
      },
      {
        onSuccess: (response) => {
          stopLoading('create-booking');
          setSuccess(strings.messages.successBooking);
          setShowSuccessModal(true);
        },
        onError: (err) => {
          stopLoading('create-booking');
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

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <StudentNavbar onToggle={setIsNavbarOpen} />
      
      <div 
        className="flex-1 pt-16 md:pt-20"
        style={{ minHeight: 'calc(100vh - 4rem)' }}
      >
        <main className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-3 sm:p-4 md:p-6`}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-4 sm:p-6 md:p-8 rounded-xl ${isDark ? 'shadow-lg' : 'shadow-md'} mb-4 md:mb-6`}>
              <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>
                {strings.header.title}
              </h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-500'} text-sm sm:text-base md:text-lg`}>
                {strings.header.subtitle}
              </p>
            </div>

            {/* URL Parameters Info Banner */}
            {(searchParams.get('ta_id') || searchParams.get('instructor')) && (searchParams.get('slot_id') || searchParams.get('slot')) && selectedInstructor && selectedSlot && (
              <MessageBanner
                type="info"
                message={
                  <div>
                    <span className={`${isDark ? 'text-blue-200' : 'text-blue-700'} font-semibold`}>
                      {strings.preselected.title}
                    </span>
                    <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'} mt-1`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {strings.preselected.description
                        .replace('{instructor}', selectedInstructor.full_name)
                        .replace('{course}', selectedSlot.course?.course_name || strings.preselected.officeHours)
                        .replace('{day}', selectedSlot.day_of_week)}
                    </p>
                  </div>
                }
              />
            )}

            {/* Error/Success Messages */}
            {error && (
              <MessageBanner
                type="error"
                message={error}
                onClose={() => setError('')}
              />
            )}

            {success && (
              <MessageBanner
                type="success"
                message={success}
                onClose={() => setSuccess('')}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {/* Step 1: Select Instructor */}
              <InstructorSearch
                onInstructorSelect={handleSelectInstructor}
                selectedInstructor={selectedInstructor}
                preloadedInstructors={instructors}
              />

              {/* Step 2: Select Time Slot */}
              <TimeSlotSelector
                selectedInstructor={selectedInstructor}
                instructorSlots={instructorSlots}
                onSlotSelect={handleSelectSlot}
                selectedSlot={selectedSlot}
              />

              {/* Step 3: Select Date & Book */}
              <DateTimeBooking
                selectedSlot={selectedSlot}
                selectedInstructor={selectedInstructor}
                availableDates={availableDates}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                timeSlots={timeSlots}
                description={description}
                onDescriptionChange={setDescription}
                onDateSelect={handleDateSelect}
                onTimeSelect={setSelectedTime}
                onBook={handleBookSlot}
                isCreatingBooking={isCreatingBooking}
                userEmailPreferences={userEmailPreferences}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Success Modal */}
      <SuccessModal
        show={showSuccessModal}
        onClose={handleCloseSuccessModal}
        userEmailPreferences={userEmailPreferences}
      />

      <Footer />
    </div>
  );
}
