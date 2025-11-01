import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import CourseForm from '../../components/ta/CourseForm';
import TAnavbar from '../../components/ta/TAnavbar';
import Footer from '../../components/Footer';
import strings from '../../strings/createCoursePageStrings';

export default function CreateCourse() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [created, setCreated] = useState(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  const handleCreated = (slot) => {
    setCreated(slot);
    // Clear success message after 5 seconds
    setTimeout(() => {
      setCreated(null);
    }, 5000);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar Navbar */}
      <TAnavbar onToggle={setIsNavbarOpen} />

      {/* Page Content */}
      <main
        className={`transition-all duration-300 ${
          isNavbarOpen ? 'ml-64' : 'ml-0'
        } pt-20 p-6`}
        style={{ minHeight: '100vh' }}
      >
        {/* Form Container */}
        <div
          className={`w-full max-w-4xl mx-auto ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } p-6 rounded-xl shadow-lg`}
        >
          <h2
            className={`text-2xl font-bold mb-3 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {strings.title}
          </h2>

          <p
            className={`${
              isDark ? 'text-gray-300' : 'text-gray-600'
            } text-sm mb-6`}
          >
            {strings.description}
          </p>

          {/* Success Message */}
          {created && (
            <div className={`mb-6 p-4 rounded-lg ${
              isDark 
                ? 'bg-green-900/30 border border-green-700 text-green-300' 
                : 'bg-green-100 border border-green-400 text-green-800'
            }`}>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{strings.success} (ID: {created.time_slot_id || created.id || '—'})</span>
              </div>
            </div>
          )}

          {/* Form */}
          <CourseForm onCreated={handleCreated} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
