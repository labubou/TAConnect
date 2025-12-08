import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useGlobalLoading } from '../../contexts/GlobalLoadingContext';
import Footer from '../../components/General/Footer';
import ThemeToggle from '../../components/General/ThemeToggle';
import Logo from '../../assets/Logo.png';
import axios from 'axios';
import strings from '../../strings/PublicBookingPageStrings';

export default function PublicBookingPage() {
  const { theme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { user, accessToken } = useAuth();
  const { startLoading, stopLoading } = useGlobalLoading();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const t = strings[language];

  const [instructorInfo, setInstructorInfo] = useState(null);
  const [slotInfo, setSlotInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get parameters from URL
  const instructorId = searchParams.get('ta_id') || searchParams.get('instructor');
  const slotId = searchParams.get('slot_id') || searchParams.get('slot');

  // Auto-redirect authenticated users to student booking page
  useEffect(() => {
    const token = accessToken || localStorage.getItem('access_token');
    if (user && token && instructorId && slotId) {
      navigate(`/student/book?ta_id=${instructorId}&slot_id=${slotId}`, { replace: true });
    }
  }, [user, accessToken, instructorId, slotId, navigate]);

  // Load instructor and slot information
  useEffect(() => {
    const loadBookingInfo = async () => {
      if (!instructorId || !slotId) {
        setError(t.invalidLink);
        setLoading(false);
        return;
      }

      startLoading('load-booking-info', t.loading);
      try {
        // Fetch instructor information
        const instructorResponse = await axios.get(`/api/instructor/get-instructor-data/${instructorId}/`);
        const instructorData = instructorResponse.data;
        
        setInstructorInfo({
          id: instructorData.id,
          name: instructorData.full_name || `${instructorData.first_name} ${instructorData.last_name}`,
          email: instructorData.email,
        });

        // Find the specific slot
        const slots = instructorData.slots || instructorData.time_slots || [];
        const targetSlot = slots.find(slot => slot.id === parseInt(slotId));
        
        if (targetSlot) {
          setSlotInfo({
            id: targetSlot.id,
            day: targetSlot.day_of_week,
            startTime: targetSlot.start_time,
            endTime: targetSlot.end_time,
            location: targetSlot.location || 'Not specified',
            capacity: targetSlot.capacity,
          });
        } else {
          setError(t.slotUnavailable);
        }
      } catch (err) {
        console.error('Error loading booking info:', err);
        setError(t.loadError);
      } finally {
        setLoading(false);
        stopLoading('load-booking-info');
      }
    };

    loadBookingInfo();
  }, [instructorId, slotId]);

  const handleLogin = () => {
    // Redirect to student booking page after login to preserve selection
    const returnUrl = `/student/book${window.location.search}`;
    navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  const handleRegister = () => {
    // Redirect to student booking page after registration/login to preserve selection
    const returnUrl = `/student/book${window.location.search}`;
    navigate(`/register?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  const handleProceedToBooking = () => {
    // Navigate to student booking page with pre-selected instructor and slot
    navigate(`/student/book?ta_id=${instructorId}&slot_id=${slotId}`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <nav className={`w-full flex items-center justify-between p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} cursor-pointer`} 
            onClick={() => navigate('/')}>
          <img src={Logo} alt="TA Connect Logo" className="h-14 sm:h-16 md:h-20 w-auto object-contain transition-transform duration-300 hover:scale-110" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
            aria-label="Toggle Language"
            title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
          >
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-[#366c6b]">
              {language === 'en' ? 'AR' : 'EN'}
            </span>
          </button>
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg w-full max-w-2xl`}>
          {error ? (
            <div>
              <div className={`mb-6 p-4 ${isDark ? 'bg-red-900 border-red-600 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} border rounded-lg`}>
                <p className="font-semibold">{t.error}</p>
                <p>{error}</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                {t.goHome}
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t.pageTitle}
                </h1>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t.subtitle}
                </p>
              </div>

              {instructorInfo && slotInfo && (
                <div className={`mb-8 p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t.bookingDetails}
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">👨‍🏫</span>
                      <div>
                        <p className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          {t.teachingAssistant}
                        </p>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                          {instructorInfo.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <span className="text-2xl mr-3">📆</span>
                      <div>
                        <p className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          {t.dayTime}
                        </p>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                          {slotInfo.day} • {slotInfo.startTime} - {slotInfo.endTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <span className="text-2xl mr-3">📍</span>
                      <div>
                        <p className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          {t.location}
                        </p>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                          {slotInfo.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <span className="text-2xl mr-3">👥</span>
                      <div>
                        <p className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          {t.capacity}
                        </p>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                          {slotInfo.capacity} {slotInfo.capacity !== 1 ? t.students : t.student} {t.perSession}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {user ? (
                <div>
                  <p className={`text-center mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t.welcomeBack}, <span className="font-semibold">{user.first_name || user.username}</span>!
                  </p>
                  <button
                    onClick={handleProceedToBooking}
                    className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-lg"
                  >
                    {t.proceedToBook}
                  </button>
                </div>
              ) : (
                <div>
                  <div className={`mb-6 p-4 ${isDark ? 'bg-blue-900/30 border-blue-600 text-blue-200' : 'bg-blue-100 border-blue-400 text-blue-800'} border rounded-lg`}>
                    <p className="text-center">
                      {t.loginPrompt}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleLogin}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-lg"
                    >
                      {t.loginButton}
                    </button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className={`w-full border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className={`px-2 ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                          {t.or}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleRegister}
                      className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-lg"
                    >
                      {t.registerButton}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
