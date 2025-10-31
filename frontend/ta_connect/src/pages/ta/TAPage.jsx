import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import TAnavbar from '../../components/ta/TAnavbar';
import Footer from '../../components/Footer';
import strings from '../../strings/TAPageStrings';


export default function TAPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <TAnavbar onToggle={setIsNavbarOpen} />
      
      <div 
        className={`flex-1 transition-all duration-300 ${isNavbarOpen ? 'ml-64' : 'ml-0'} pt-20`}
        style={{ minHeight: 'calc(100vh - 4rem)' }}
      >
        <main className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
          <div className={`max-w-3xl mx-auto ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow`}> 
            <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {strings.taPage.title}
            </h2>

            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
              {strings.taPage.description}
            </p>

            <button
              onClick={() => navigate('/ta/create-course')}
              className="px-4 py-2 bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              {strings.taPage.createSlot}
            </button>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}