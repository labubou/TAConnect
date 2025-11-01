import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import StudentNavbar from '../../components/student/studentNavbar';
import Footer from '../../components/Footer';
import strings from '../../strings/studentPageStrings'; 


export default function StudentHomePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <StudentNavbar onToggle={setIsNavbarOpen} />
      
      <div 
        className={`flex-1 transition-all duration-300 ${isNavbarOpen ? 'ml-64' : 'ml-0'} pt-20`}
        style={{ minHeight: 'calc(100vh - 4rem)' }}
      >
        <main className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
          <div className={`max-w-4xl mx-auto`}>


            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg mb-6`}> 
              <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {strings.studentHomePage.title}
              </h2>

              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-lg mb-6`}>
                {strings.studentHomePage.description}
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
                        {strings.studentHomePage.bookSlot}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Browse available office hours and schedule time with your TAs
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
                        {strings.studentHomePage.viewBookings}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        View, update, or cancel your scheduled appointments
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
                    Quick Tips
                  </h3>
                  <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <li>• Book office hours at least 24 hours in advance when possible</li>
                    <li>• Check your email for booking confirmations</li>
                    <li>• Cancel appointments you can't make to free up slots for others</li>
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