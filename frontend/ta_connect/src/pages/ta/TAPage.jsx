import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import TAnavbar from '../../components/ta/TAnavbar';
import Footer from '../../components/Footer';
import strings from '../../strings/TAPageStrings';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function TAPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const DAY_NAMES = {
    Mon: strings.taPage.weekSchedule.monday,
    Tue: strings.taPage.weekSchedule.tuesday,
    Wed: strings.taPage.weekSchedule.wednesday,
    Thu: strings.taPage.weekSchedule.thursday,
    Fri: strings.taPage.weekSchedule.friday,
    Sat: strings.taPage.weekSchedule.saturday,
    Sun: strings.taPage.weekSchedule.sunday,
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/api/instructor/get-user-slots');
      setSlots(res?.data?.slots || []);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      setError(err.response?.data?.error || strings.taPage.weekSchedule.errorLoading);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    // Handle both "HH:MM:SS" and "HH:MM" formats
    const time = timeStr.split(':');
    const hours = parseInt(time[0], 10);
    const minutes = time[1] || '00';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getSlotsForDay = (day) => {
    return slots.filter(slot => slot.day_of_week === day && slot.status);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <TAnavbar onToggle={setIsNavbarOpen} />
      
      <div 
        className={`flex-1 transition-all duration-300 ${isNavbarOpen ? 'ml-64' : 'ml-0'} pt-20`}
        style={{ minHeight: 'calc(100vh - 4rem)' }}
      >
        <main className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
          <div className={`max-w-7xl mx-auto ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow`}> 
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {strings.taPage.weekSchedule.title}
              </h2>
              <button
                onClick={() => navigate('/ta/create-course')}
                className="px-4 py-2 bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                {strings.taPage.createSlot}
              </button>
            </div>

            {error && (
              <div className={`mb-4 p-3 rounded-lg ${
                isDark 
                  ? 'bg-red-900/30 border border-red-700 text-red-300' 
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}>
                {error}
              </div>
            )}

            {loading ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {strings.taPage.weekSchedule.loading}
              </div>
            ) : slots.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <p className="mb-4">{strings.taPage.weekSchedule.noSlots}</p>
                <button
                  onClick={() => navigate('/ta/create-course')}
                  className="px-4 py-2 bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  {strings.taPage.weekSchedule.createFirstSlot}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-full grid grid-cols-7 gap-3">
                  {DAYS_OF_WEEK.map((day) => {
                    const daySlots = getSlotsForDay(day);
                    return (
                      <div
                        key={day}
                        className={`rounded-lg border ${
                          isDark
                            ? 'border-gray-700 bg-gray-800/50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div
                          className={`p-3 border-b ${
                            isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'
                          } rounded-t-lg`}
                        >
                          <h3 className={`font-semibold text-center ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {DAY_NAMES[day]}
                          </h3>
                        </div>
                        <div className="p-3 space-y-2 min-h-[200px]">
                          {daySlots.length === 0 ? (
                            <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {strings.taPage.weekSchedule.noSlotsToday}
                            </p>
                          ) : (
                            daySlots.map((slot) => (
                              <div
                                key={slot.id}
                                className={`p-2 rounded border ${
                                  isDark
                                    ? 'border-blue-600 bg-blue-900/20 hover:bg-blue-900/30'
                                    : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                                } transition cursor-pointer`}
                                onClick={() => navigate('/ta/manage-courses')}
                              >
                                <div className={`font-medium text-xs mb-1 ${
                                  isDark ? 'text-blue-300' : 'text-blue-700'
                                }`}>
                                  {slot.course_name}
                                  {slot.section && slot.section.trim() && slot.section.trim() !== ' ' 
                                    ? ` - ${slot.section}` 
                                    : ''}
                                </div>
                                <div className={`text-xs ${
                                  isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                </div>
                                {slot.room && (
                                  <div className={`text-xs mt-1 ${
                                    isDark ? 'text-gray-500' : 'text-gray-500'
                                  }`}>
                                    📍 {slot.room}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}