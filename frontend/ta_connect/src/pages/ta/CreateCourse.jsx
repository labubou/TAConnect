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

          {/* Form */}
          <CourseForm onCreated={handleCreated} />

          {/* Success Message */}
          {created && (
            <div className="mt-6 p-4 rounded-lg bg-green-100 text-green-800">
              {strings.success} {created.time_slot_id || created.id || '—'}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
