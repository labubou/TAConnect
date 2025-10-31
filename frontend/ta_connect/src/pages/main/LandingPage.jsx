import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import Logo2 from '../../assets/Logo2.png';
import strings from '../../strings/landingPageStrings';


function LandingPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();

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
            {strings.navbar.login}
          </button>
          <button
            onClick={() => window.location.href = 'https://youtu.be/1t7SYmGC_Lo?si=KjUCp7h_DTkM2lf2'}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {strings.navbar.register}
          </button>
          <ThemeToggle />
        </div>
      </nav>

      {/* main boddy */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold mb-6">
          {strings.heading.welcome} <span className="text-blue-600">{strings.heading.connect}</span>
        </h1>
        <p className="text-lg mb-6">{strings.heading.subtitle}</p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">{strings.steps[0].title}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {strings.steps[0].description}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">{strings.steps[1].title}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {strings.steps[1].description}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">{strings.steps[2].title}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {strings.steps[2].description}
            </p>
          </div>
        </div>
      </div>

      <footer className="w-full bg-white dark:bg-gray-800 py-6 mt-12 shadow-inner">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-gray-600 dark:text-gray-300 text-sm">
          <p>&copy; {new Date().getFullYear()} {strings.footer.copyright}</p>
            <div className="flex space-x-4 mt-2 sm:mt-0">
            <a href="https://github.com/Kbassem10/TAConnect" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">
              {strings.footer.github}
            </a>
            <a href="/about" className="hover:text-blue-600 transition">
              {strings.footer.about}
            </a>
            <a href="/contact" className="hover:text-blue-600 transition">
              {strings.footer.contact}
            </a>
            </div>
          </div>
      </footer>

    </div>
  );
}

export default LandingPage;
 