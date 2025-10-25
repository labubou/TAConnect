import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Logo2 from '../../assets/Logo2.png';


function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* navbar */}
      <nav className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
        <img src={Logo2} alt="TA Connect Logo" className="logo" />        
          <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Register
          </button>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </nav>

      {/* main boddy */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold mb-6 italic">
             TA <span className="text-blue-600">Connect</span>
        </h1>
        <p className="text-lg mb-6">Maximize Your Learning. Minimize the Wait.</p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">1. Browse TAs</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              See the list of available teaching assistants and their office hours.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">2. Schedule a Session</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Book a time slot with your chosen teaching assistant.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">3. Manage Appointments</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              View and modify your scheduled sessions with teaching assistants.
            </p>
          </div>
        </div>
      </div>

      <footer className="w-full bg-white dark:bg-gray-800 py-6 mt-12 shadow-inner">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-gray-600 dark:text-gray-300 text-sm">
          <p>&copy; {new Date().getFullYear()} TA Connect. All rights reserved.</p>
            <div className="flex space-x-4 mt-2 sm:mt-0">
            <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">
              GitHub
            </a>
            <a href="/about" className="hover:text-blue-600 transition">
              About
            </a>
            <a href="/contact" className="hover:text-blue-600 transition">
              Contact
            </a>
            </div>
          </div>
      </footer>

    </div>
  );
}

export default LandingPage;
 