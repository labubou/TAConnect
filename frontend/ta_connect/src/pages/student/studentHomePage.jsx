import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGlobalLoading } from '../../contexts/GlobalLoadingContext';
import StudentNavbar from '../../components/student/studentNavbar';
import Footer from '../../components/General/Footer';
import BookingsCalendar from '../../components/student/BookingsCalendar';
import strings from '../../strings/studentPageStrings'; 


export default function StudentHomePage() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { startLoading, stopLoading, isLoading } = useGlobalLoading();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const { refreshUser, user } = useAuth();
  const t = strings[language];

  // Redirect TAs/Instructors to their home page
  useEffect(() => {
    if (user?.role === 'TA' || user?.role === 'Instructor') {
      navigate('/ta/home');
    }
  }, [user, navigate]);

  // Refresh user data on mount to get latest email verification status
  useEffect(() => {
    startLoading('refresh-user', 'Loading user data...');
    refreshUser()
      .catch(err => console.error('Failed to refresh user:', err))
      .finally(() => stopLoading('refresh-user'));
  }, []);

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <StudentNavbar onToggle={setIsNavbarOpen} />
      
      <div 
        className={`flex-1 transition-all duration-500 ease-in-out ${
          language === 'ar'
            ? (isNavbarOpen ? 'mr-64' : 'mr-0')
            : (isNavbarOpen ? 'ml-64' : 'ml-0')
        } pt-20`}
        style={{ minHeight: 'calc(100vh - 4rem)' }}
      >
        <main className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
          <div className={`max-w-7xl mx-auto`}>


            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg mb-6`}> 
              <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t.studentHomePage.title}
              </h2>

              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-lg mb-6`}>
                {t.studentHomePage.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                <div 
                  onClick={() => navigate('/student/book')}
                  className={`${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gradient-to-br from-[#eaf6f6] to-white hover:from-[#d5eded] hover:to-gray-50'} p-6 rounded-xl border-2 ${isDark ? 'border-gray-600' : 'border-[#366c6b]/20'} cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#366c6b] to-[#1a3535] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t.studentHomePage.bookSlot}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t.studentHomePage.bookSlotDescription}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Manage Bookings Card */}
                <div 
                  onClick={() => navigate('/student/manage-booked')}
                  className={`${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gradient-to-br from-[#eaf6f6] to-white hover:from-[#d5eded] hover:to-gray-50'} p-6 rounded-xl border-2 ${isDark ? 'border-gray-600' : 'border-[#366c6b]/20'} cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#366c6b] to-[#1a3535] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t.studentHomePage.viewBookings}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t.studentHomePage.viewBookingsDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings Calendar */}
            <div className="mb-6">
              <BookingsCalendar />
            </div>

            {/* Quick Tips Card */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'} flex items-center justify-center flex-shrink-0`}>
                  <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t.studentHomePage.quickTips.title}
                  </h3>
                  <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <li>{t.studentHomePage.quickTips.tip1}</li>
                    <li>{t.studentHomePage.quickTips.tip2}</li>
                    <li>{t.studentHomePage.quickTips.tip3}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}