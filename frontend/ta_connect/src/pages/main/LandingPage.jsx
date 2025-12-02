import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ThemeToggle from '../../components/General/ThemeToggle';
import LanguageToggle from '../../components/General/LanguageToggle';
import Footer from '../../components/General/Footer';
import Logo2 from '../../assets/Logo2.png';
import strings from '../../strings/landingPageStrings';


function LandingPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { language } = useLanguage();
  
  const t = strings[language];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* navbar */}
      <nav className="w-full flex items-center justify-between p-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800 shadow-md">
        <img src={Logo2} alt="TA Connect Logo" className="h-12 sm:h-14 md:h-16 w-auto object-contain cursor-pointer transition-transform duration-300 hover:scale-110" />        
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 hover:scale-105 text-sm sm:text-base font-medium"
          >
            {t.navbar.login}
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 hover:scale-105 text-sm sm:text-base font-medium"
          >
            {t.navbar.register}
          </button>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </nav>

      {/* main body */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-center px-4">
          <span className="text-blue-600">{t.heading.welcome}</span>
          <span className="text-gray-800 dark:text-gray-200"> {t.heading.connect}</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-center max-w-2xl px-4 text-gray-600 dark:text-gray-300">{t.heading.subtitle}</p>

        <div className="mt-6 sm:mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full max-w-6xl px-4">
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-100">{t.steps[0].title}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              {t.steps[0].description}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-100">{t.steps[1].title}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              {t.steps[1].description}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700 md:col-span-2 lg:col-span-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-100">{t.steps[2].title}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              {t.steps[2].description}
            </p>
          </div>
        </div>
      </div>

      <Footer />

    </div>
  );
}

export default LandingPage;
 