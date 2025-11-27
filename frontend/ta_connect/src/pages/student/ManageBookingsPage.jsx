import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import StudentNavbar from '../../components/student/studentNavbar';
import Footer from '../../components/Footer';
import axios from 'axios';

export default function ManageBookingsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/student/booking/');
      if (response.data && response.data.bookings) {
        setBookings(response.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
    setError('');
    setSuccess('');
  };

  const handleUpdateClick = (booking) => {
    setSelectedBooking(booking);
    setShowUpdateModal(true);
    setNewDate('');
    setNewTime('');
    setAvailableTimes([]);
    setError('');
    setSuccess('');
    generateAvailableDates(booking);
  };

  const generateAvailableDates = (booking) => {
    const dates = [];
    const today = new Date();
    const startDate = new Date(booking.office_hour?.start_date || today);
    const endDate = new Date(booking.office_hour?.end_date || today);
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const targetDay = daysOfWeek.indexOf(booking.office_hour?.day_of_week);

    let currentDate = new Date(Math.max(today, startDate));
    
    while (currentDate <= endDate) {
      if (currentDate.getDay() === targetDay && currentDate >= today) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setAvailableDates(dates);
  };

  const fetchAvailableTimes = async (slotId, date) => {
    try {
      const response = await axios.get(`/api/student/booking/${slotId}/`, {
        params: { date }
      });
      
      if (response.data && response.data.available_times) {
        setAvailableTimes(response.data.available_times);
      } else {
        setAvailableTimes([]);
      }
    } catch (err) {
      console.error('Error fetching available times:', err);
      setError('Failed to load available times');
      setAvailableTimes([]);
    }
  };

  const handleDateSelect = (dateStr) => {
    setNewDate(dateStr);
    setNewTime('');
    if (selectedBooking) {
      fetchAvailableTimes(selectedBooking.office_hour?.id, dateStr);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setCancelLoading(true);
    try {
      await axios.delete(`/api/student/booking/${selectedBooking.id}/`);
      setSuccess('Booking cancelled successfully');
      setShowCancelModal(false);
      fetchBookings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking || !newDate || !newTime) {
      setError('Please select both date and time');
      return;
    }

    setUpdateLoading(true);
    try {
      await axios.patch(`/api/student/booking/${selectedBooking.id}/`, {
        new_date: newDate,
        new_start_time: newTime
      });
      setSuccess('Booking updated successfully');
      setShowUpdateModal(false);
      fetchBookings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating booking:', err);
      setError(err.response?.data?.error || 'Failed to update booking');
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    try {
      let dateObj;
      if (time.includes('T')) {
        dateObj = new Date(time);
      } else {
        const [hours, minutes] = time.split(':');
        dateObj = new Date();
        dateObj.setHours(parseInt(hours), parseInt(minutes));
      }
      return dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch (e) {
      return time;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return String(date);
    }
  };

  const activeBookings = bookings.filter(b => !b.is_cancelled);
  const cancelledBookings = bookings.filter(b => b.is_cancelled);

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
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg mb-6`}>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Manage Bookings
              </h1>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-lg`}>
                View, update, or cancel your scheduled appointments
              </p>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className={`mb-6 p-4 ${isDark ? 'bg-green-900/30 border-green-600' : 'bg-green-50 border-green-300'} border-2 rounded-xl`}>
                <div className="flex items-start">
                  <svg className={`w-5 h-5 mr-3 mt-0.5 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className={`${isDark ? 'text-green-200' : 'text-green-700'} font-medium`}>{success}</span>
                </div>
              </div>
            )}

            {error && (
              <div className={`mb-6 p-4 ${isDark ? 'bg-red-900/30 border-red-600' : 'bg-red-50 border-red-300'} border-2 rounded-xl`}>
                <div className="flex items-start">
                  <svg className={`w-5 h-5 mr-3 mt-0.5 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className={`${isDark ? 'text-red-200' : 'text-red-700'} font-medium`}>{error}</span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#366c6b]"></div>
              </div>
            ) : (
              <>
                {/* Active Bookings */}
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg mb-6 p-6`}>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
                    Active Bookings ({activeBookings.length})
                  </h2>
                  
                  {activeBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className={`mx-auto h-12 w-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className={`mt-4 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        No active bookings
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {activeBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-br from-[#eaf6f6] to-white border-[#366c6b]/20'} border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {booking.course_name}
                              </h3>
                              {booking.section && (
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Section {booking.section}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className={`space-y-2 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <p className="flex items-center gap-2">
                              <span>👨‍🏫</span>
                              <span>{booking.instructor?.full_name || 'Instructor'}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span>📅</span>
                              <span>{formatDate(booking.date)}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span>🕐</span>
                              <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                            </p>
                            {booking.room && (
                              <p className="flex items-center gap-2">
                                <span>📍</span>
                                <span>{booking.room}</span>
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateClick(booking)}
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm font-medium"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => handleCancelClick(booking)}
                              className={`flex-1 px-4 py-2 ${isDark ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50' : 'bg-red-100 text-red-700 hover:bg-red-200'} rounded-lg transition-all duration-300 text-sm font-medium`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cancelled Bookings */}
                {cancelledBookings.length > 0 && (
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
                      Cancelled Bookings ({cancelledBookings.length})
                    </h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {cancelledBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className={`${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-300'} border-2 rounded-xl p-6 opacity-75`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {booking.course_name}
                              </h3>
                              <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
                                Cancelled
                              </span>
                            </div>
                          </div>
                          
                          <div className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <p className="flex items-center gap-2">
                              <span>👨‍🏫</span>
                              <span>{booking.instructor?.full_name || 'Instructor'}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span>📅</span>
                              <span>{formatDate(booking.date)}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span>🕐</span>
                              <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <Footer />

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full p-6`}>
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Cancel Booking
            </h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg mb-6`}>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedBooking.course_name}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
                📅 {formatDate(selectedBooking.date)}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                🕐 {formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelLoading}
                className={`flex-1 px-4 py-2 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'} rounded-lg transition-all duration-300 font-medium`}
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-center"
              >
                {cancelLoading ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Booking Modal */}
      {showUpdateModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8`}>
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Update Booking
            </h3>
            
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg mb-6`}>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Current Booking
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
                📅 {formatDate(selectedBooking.date)}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                🕐 {formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}
              </p>
            </div>

            <div className="mb-6">
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                Select New Date
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {availableDates.map((date, index) => {
                  const dateStr = date.toISOString().split('T')[0];
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(dateStr)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        newDate === dateStr
                          ? isDark ? 'border-[#366c6b] bg-[#366c6b]/20' : 'border-[#366c6b] bg-[#366c6b]/10'
                          : isDark ? 'border-gray-600 hover:border-gray-500 bg-gray-700' : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatDate(date)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {newDate && (
              <div className="mb-6">
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                  Select New Time
                </h4>
                {availableTimes.length === 0 ? (
                  <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No available times for this date
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {availableTimes.map((time, index) => (
                      <button
                        key={index}
                        onClick={() => setNewTime(time)}
                        className={`p-2.5 rounded-lg border-2 text-center transition-all font-medium text-sm ${
                          newTime === time
                            ? isDark ? 'border-[#366c6b] bg-[#366c6b]/20 text-white' : 'border-[#366c6b] bg-[#366c6b]/10 text-[#366c6b]'
                            : isDark ? 'border-gray-600 hover:border-gray-500 bg-gray-700 text-gray-300' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        {formatTime(time)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpdateModal(false)}
                disabled={updateLoading}
                className={`flex-1 px-4 py-2 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'} rounded-lg transition-all duration-300 font-medium`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBooking}
                disabled={updateLoading || !newDate || !newTime}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-center"
              >
                {updateLoading ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Update Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
