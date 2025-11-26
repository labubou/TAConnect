import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import TAnavbar from '../../components/ta/TAnavbar';
import DashboardSlots from '../../components/ta/DashboardSlots';
import ErrorBoundary from '../../components/ErrorBoundary';
import Footer from '../../components/Footer';
import strings from '../../strings/TAPageStrings';

export default function TAPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/api/instructor/get-user-slots');
      const bookingsRes = await axios.get('/api/instructor/get-user-bookings');
      setSlots(res?.data?.slots || []);
      setBookings(bookingsRes?.data?.bookings || []);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      setError(err.response?.data?.error || strings.taPage.weekSchedule.errorLoading);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlot = () => {
    navigate('/ta/manage-courses');
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <TAnavbar onToggle={setIsNavbarOpen} />
      
      <div 
        className={`flex-1 transition-all duration-300 ${isNavbarOpen ? 'ml-64' : 'ml-0'} pt-20`}
        style={{ minHeight: 'calc(100vh - 4rem)' }}
      >
        <main className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-8`}>
          <div className={`max-w-full mx-auto ${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg`}> 
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {strings.taPage.weekSchedule.title}
                </h1>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {strings.taPage.description}
                </p>
              </div>
              <button
                onClick={handleCreateSlot}
                className="px-6 py-3 bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap ml-4"
              >
                {strings.taPage.createSlot}
              </button>
            </div>

            {/* Dashboard Slots Component */}
            <ErrorBoundary>
              <DashboardSlots 
                isDark={isDark}
                slots={slots}
                bookings={bookings}
                loading={loading}
                error={error}
                onCreateSlot={handleCreateSlot}
              />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}