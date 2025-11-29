import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import Footer from '../../components/Footer';
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
      <nav className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
        <img src={Logo2} alt="TA Connect Logo" className="logo" />        
          <div className="flex items-center space-x-4">
          <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            {t.navbar.login}
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {t.navbar.register}
          </button>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </nav>

      {/* main boddy */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold mb-6">
          <span className="text-blue-600">{t.heading.welcome}</span>
          <span className="text-gray-800 dark:text-gray-200"> {t.heading.connect}</span>
        </h1>
        <p className="text-lg mb-6">{t.heading.subtitle}</p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">{t.steps[0].title}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t.steps[0].description}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">{t.steps[1].title}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t.steps[1].description}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">{t.steps[2].title}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
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
 