import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../assets/Logo.png';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ThemeToggle from '../General/ThemeToggle';
import LanguageToggle from '../General/LanguageToggle';
import strings from '../../strings/TANavbarStrings';

const TAnavbar = ({ onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = strings[language];
  const isRTL = language === 'ar';

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      const shouldBeOpen = !mobile;
      setIsOpen(shouldBeOpen);
      if (onToggle) onToggle(shouldBeOpen);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [onToggle]);

  // Close navbar when navigating to a different page
  useEffect(() => {
    setIsOpen(false);
    if (onToggle) onToggle(false);
  }, [location.pathname, onToggle]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    if (isMobile) {
      setIsOpen(false);
    }
    navigate('/login');
  };

  const toggleNavbar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) onToggle(newState);
  };

  const closeNavbar = () => {
    setIsOpen(false);
    if (onToggle) onToggle(false);
  };

  return (
    <>
      {/* Floating decorative elements - visible when navbar is open */}
      {isOpen && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 animate-fadeIn">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full filter blur-xl opacity-20 animate-float bg-[#366c6b] mix-blend-multiply dark:bg-emerald-600/40 dark:mix-blend-screen"></div>
          <div className="absolute top-40 right-20 w-24 h-24 rounded-full filter blur-xl opacity-20 animate-float bg-[#1a3535]" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-40 w-40 h-40 rounded-full filter blur-xl opacity-20 animate-float bg-blue-200 dark:bg-cyan-700/30 dark:mix-blend-screen" style={{animationDelay: '4s'}}></div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        className={`fixed top-4 z-50 w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 ease-in-out hover:scale-110 flex items-center justify-center group ${
          isRTL ? 'right-4' : 'left-4'
        } ${isOpen ? 'hover:rotate-12' : 'hover:-rotate-12'}`}
        onClick={toggleNavbar}
        aria-label={t.aria.toggleNav}
        title={isOpen ? t.aria.collapseSidebar : t.aria.expandSidebar}
      >
        <svg 
          className={`w-6 h-6 text-gray-700 dark:text-gray-200 transition-all duration-500 ease-in-out ${isOpen ? (isRTL ? '-rotate-180' : 'rotate-180') : 'rotate-0'} group-hover:text-[#366c6b] group-hover:scale-110`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Theme and Language toggles - top corner opposite to navbar */}
      <div className={`fixed top-4 z-50 flex gap-2 ${
        isRTL ? 'left-4' : 'right-4'
      }`}>
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* Dimming Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-500 ease-in-out"
          onClick={closeNavbar}
          aria-hidden="true"
        />
      )}

      {/* Navbar Container */}
      <nav className={`fixed top-0 h-full z-40 transition-all duration-500 ease-in-out ${
        isRTL ? 'right-0' : 'left-0'
      } ${
        isMobile 
          ? (isOpen ? 'translate-x-0 opacity-100' : (isRTL ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0')) 
          : (isOpen ? 'translate-x-0 opacity-100' : (isRTL ? 'translate-x-64 opacity-0' : '-translate-x-64 opacity-0'))
      }`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className={`h-full w-64 bg-gradient-to-b from-white/95 via-white/90 to-white/95 dark:from-gray-950/90 dark:via-gray-900/90 dark:to-gray-950/90 backdrop-blur-2xl border-white/30 dark:border-gray-800 shadow-2xl transition-all duration-500 ${
          isRTL ? 'border-l' : 'border-r'
        } ${isOpen ? 'scale-100' : 'scale-95'}`}>
          <div className="flex flex-col h-full">
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 p-6">
              
              <div className="mb-8 pt-12">
                <div className="flex items-center justify-center mb-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#366c6b] to-[#1a3535] rounded-full shadow-lg border-4 border-white dark:border-gray-800">
                    <img 
                      src={Logo} 
                      alt="Logo" 
                      className="w-14 h-14 object-contain"
                      onError={(e) => { e.currentTarget.src = '/vite.svg'; }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-[#366c6b] to-[#1a3535] bg-clip-text text-transparent mb-1">
                    {t.appName || 'TA Connect'}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                    {t.user?.taPortal || 'TA Portal'}
                  </p>
                </div>
              </div>

              
              <div className="mb-8">
                <div className="chef-card rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#366c6b] to-[#1a3535] rounded-xl shadow-md flex items-center justify-center text-white font-bold text-lg">
                      {user?.first_name ? user.first_name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 dark:text-gray-100 font-semibold text-sm truncate" dir="ltr">
                        {user?.first_name && user?.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user?.username || t.user.defaultName
                        }
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 text-xs truncate" dir="ltr">{user?.email}</p>
                    </div>
                  </div>
                  {!user?.email_verify && (
                    <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/40 dark:border-amber-900">
                      <span className="text-amber-700 dark:text-amber-300 text-xs font-medium flex items-center">
                        <svg className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {t.user.emailNotVerified}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-2 mb-8">
                <Link 
                  to="/ta" 
                  className={`navbar-link group flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${
                    isActive('/ta') 
                      ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white shadow-lg transform scale-105' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-800/60 hover:shadow-md hover:scale-105'
                  }`}
                  onClick={closeNavbar}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                    isActive('/ta') 
                      ? 'bg-white/20' 
                      : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-[#eaf6f6] group-hover:dark:bg-gray-700'
                  }`}>
                    <svg className={`w-5 h-5 ${isActive('/ta') ? 'text-white' : 'text-[#366c6b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span className="font-semibold">{t.navigation.dashboard}</span>
                </Link>

                <Link 
                  to="/ta/manage-courses"
                  className={`navbar-link group flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${
                    isActive('/ta/manage-courses') 
                      ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white shadow-lg transform scale-105' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-800/60 hover:shadow-md hover:scale-105'
                  }`}
                  onClick={closeNavbar}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                    isActive('/ta/manage-courses') 
                      ? 'bg-white/20' 
                      : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-[#eaf6f6] group-hover:dark:bg-gray-700'
                  }`}>
                    <svg className={`w-5 h-5 ${isActive('/ta/manage-courses') ? 'text-white' : 'text-[#366c6b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <span className="font-semibold">{t.navigation.manageCourses}</span>
                </Link>

                <Link 
                  to="/ta/manage-bookings"
                  className={`navbar-link group flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${
                    isActive('/ta/manage-bookings') 
                      ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white shadow-lg transform scale-105' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-800/60 hover:shadow-md hover:scale-105'
                  }`}
                  onClick={closeNavbar}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                    isActive('/ta/manage-bookings') 
                      ? 'bg-white/20' 
                      : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-[#eaf6f6] group-hover:dark:bg-gray-700'
                  }`}>
                    <svg className={`w-5 h-5 ${isActive('/ta/manage-bookings') ? 'text-white' : 'text-[#366c6b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="font-semibold">{t.navigation.manageBookings}</span>
                </Link>

                <Link 
                  to="/ta/pending-bookings"
                  className={`navbar-link group flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${
                    isActive('/ta/pending-bookings') 
                      ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white shadow-lg transform scale-105' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-800/60 hover:shadow-md hover:scale-105'
                  }`}
                  onClick={closeNavbar}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                    isActive('/ta/pending-bookings') 
                      ? 'bg-white/20' 
                      : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-[#eaf6f6] group-hover:dark:bg-gray-700'
                  }`}>
                    <svg className={`w-5 h-5 ${isActive('/ta/pending-bookings') ? 'text-white' : 'text-[#366c6b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold">{t.navigation.pendingBookings}</span>
                </Link>

                <Link 
                  to="/ta/settings"
                  className={`navbar-link group flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${
                    isActive('/ta/settings') 
                      ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white shadow-lg transform scale-105' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-white/70 dark:hover:bg-gray-800/60 hover:shadow-md hover:scale-105'
                  }`}
                  onClick={closeNavbar}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                    isActive('/ta/settings') 
                      ? 'bg-white/20' 
                      : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-[#eaf6f6] group-hover:dark:bg-gray-700'
                  }`}>
                    <svg className={`w-5 h-5 ${isActive('/ta/settings') ? 'text-white' : 'text-[#366c6b]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold">{t.navigation.settings || 'Settings'}</span>
                </Link>
              </div>
            </div>

            
            <div className="flex-shrink-0 border-t border-gray-200/50 dark:border-gray-800 p-6 bg-gradient-to-t from-white/95 to-transparent dark:from-gray-950/90 dark:to-transparent">
              <button
                onClick={handleLogout}
                className="w-full group flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 hover:shadow-md transition-all duration-300 hover:scale-105 mb-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 flex items-center justify-center transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="font-semibold">{t.navigation.logout}</span>
              </button>
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-xs font-large">
                  {t.appName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile only */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity duration-300" 
          onClick={closeNavbar}
        ></div>
      )}
    </>
  );
};

export default TAnavbar;