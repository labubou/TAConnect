import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import TAnavbar from '../../components/ta/TAnavbar';
import strings from '../../strings/TaprofilePage';


export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await axios.put('/api/profile/update/', form);
      const updated = res.data;
      if (updated) {
        updateUser(updated);
        setMessage(strings.profilePage.success);
      } else {
        setError(strings.profilePage.unexpectedError);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || strings.profilePage.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <TAnavbar onToggle={setIsNavbarOpen} />
      
      <main 
        className={`transition-all duration-300 ${isNavbarOpen ? 'ml-64' : 'ml-0'} pt-20 p-6`}
        style={{ minHeight: '100vh' }}
      >
        <div className={`max-w-2xl mx-auto ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow`}> 
          <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {strings.profilePage.title}
          </h2>

          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm mb-6`}>
            {strings.profilePage.description}
          </p>

          {error && <div className="mb-2 text-red-600">{error}</div>}
          {message && <div className="mb-2 text-green-600">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {strings.profilePage.firstName}
              </label>
              <input 
                name="first_name" 
                value={form.first_name} 
                onChange={handleChange} 
                className={`w-full px-3 py-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`} 
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {strings.profilePage.lastName}
              </label>
              <input 
                name="last_name" 
                value={form.last_name} 
                onChange={handleChange} 
                className={`w-full px-3 py-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`} 
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {strings.profilePage.email}
              </label>
              <input 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                className={`w-full px-3 py-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`} 
              />
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={loading} 
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-60"
              >
                {loading ? strings.profilePage.saving : strings.profilePage.save}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}