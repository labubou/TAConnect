import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import Logo2 from '../../assets/Logo2.png';

function SelectUserType() {
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const handleSubmit = async () => {
    if (!selectedType) {
      setError('Please select a user type');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/google/set-user-type/', {
        user_type: selectedType
      });

      if (response.data) {
        // Update user context with new user_type, preserving existing user data
        const updatedUser = {
          ...user,
          ...response.data.user,
          user_type: selectedType, // Ensure user_type is set
        };
        updateUser(updatedUser);
        
        // Redirect based on selected user type
        if (selectedType === 'instructor') {
          navigate('/ta');
        } else if (selectedType === 'student') {
          navigate('/student');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to set user type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <nav className={`w-full flex items-center justify-center p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <img src={Logo2} alt="TA Connect Logo" className="logo" />
      </nav>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg w-full max-w-2xl`}>
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${isDark ? 'bg-blue-900' : 'bg-blue-100'} mb-4`}>
              <svg 
                className={`w-10 h-10 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            </div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              Welcome to TA Connect!
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              To complete your registration, please select your user type
            </p>
          </div>

          {error && (
            <div className={`mb-6 p-4 ${isDark ? 'bg-red-900 border-red-600 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} border rounded-xl`}>
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Student Option */}
            <button
              onClick={() => setSelectedType('student')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                selectedType === 'student'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : `${isDark ? 'border-gray-700 bg-gray-700/50 hover:border-gray-600' : 'border-gray-300 bg-white hover:border-gray-400'}`
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full ${selectedType === 'student' ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center mb-4`}>
                  <svg className={`w-8 h-8 ${selectedType === 'student' ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Student</h3>
                <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  I'm looking for TA support and want to connect with teaching assistants
                </p>
              </div>
            </button>

            {/* Instructor/TA Option */}
            <button
              onClick={() => setSelectedType('instructor')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                selectedType === 'instructor'
                  ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                  : `${isDark ? 'border-gray-700 bg-gray-700/50 hover:border-gray-600' : 'border-gray-300 bg-white hover:border-gray-400'}`
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full ${selectedType === 'instructor' ? 'bg-green-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center mb-4`}>
                  <svg className={`w-8 h-8 ${selectedType === 'instructor' ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Teaching Assistant</h3>
                <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  I'm a TA and want to help students and manage my sessions
                </p>
              </div>
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !selectedType}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition flex items-center justify-center font-semibold"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Completing Registration...
              </>
            ) : (
              'Continue to Dashboard'
            )}
          </button>

          <div className={`mt-6 p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium mb-2`}>
              ℹ️ About User Types:
            </p>
            <ul className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
              <li>• <strong>Student:</strong> Access TA schedules, book sessions, and get academic support</li>
              <li>• <strong>Teaching Assistant:</strong> Manage your availability, view appointments, and help students</li>
              <li>• You can update this later in your profile settings if needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectUserType;
