import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import Footer from '../../components/Footer';
import CourseForm from '../../components/ta/CourseForm';
import { useTheme } from '../../contexts/ThemeContext';
import strings from '../../strings/forgotPasswordPageStrings';

function CreateCourse() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [created, setCreated] = useState(null);
  const navigate = useNavigate();

  const handleCreated = (slot) => {
    setCreated(slot);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <nav className={`w-full flex items-center justify-between p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div
          className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} cursor-pointer`}
          onClick={() => navigate('/')}
        >
          {strings.navbar.appName}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            {strings.navbar.login}
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {strings.navbar.register}
          </button>
          <ThemeToggle />
        </div>
      </nav>

      <main className="flex-1 flex items-start justify-center p-6">
        <div className={`w-full max-w-4xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}> 
          <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Create Course / Section
          </h2>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm mb-6`}>
            Use the form below to create an office-hour slot for your course. Fields are validated before submission.
          </p>

          <CourseForm onCreated={handleCreated} />

          {created && (
            <div className="mt-6 p-4 rounded-lg bg-green-100 text-green-800">
              Created successfully. ID: {created.time_slot_id || created.id || '—'}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CreateCourse;
