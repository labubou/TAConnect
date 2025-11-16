import axios from 'axios';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function CourseList({ slots = [], onEdit, onDeleted, onToggled }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState('');

  const handleDelete = async (id) => {
    if (!id) return;
    if (!confirm('Delete this slot? This action cannot be undone.')) return;
    setLoadingId(id);
    setError('');
    try {
      console.debug('Deleting slot id:', id);
      const res = await axios.delete(`/api/instructor/time-slots/${id}/`);
      console.debug('Delete response:', res?.data);
      if (res?.data?.success) {
        onDeleted && onDeleted(id);
        setError(''); // Clear any previous errors
      } else {
        setError(res?.data?.error || 'Delete failed. Please try again.');
      }
    } catch (err) {
      console.error('Delete slot error', err);
      const errorMessage = err.response?.data?.error || 
                           err.response?.data?.message || 
                           err.message || 
                           'Failed to delete slot. Please try again.';
      setError(errorMessage);
      // Clear error after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggle = async (id) => {
    if (!id) return;
    setLoadingId(id);
    setError('');
    try {
      console.debug('Toggling status for id:', id);
      const res = await axios.post(`/api/instructor/time-slots/toggle-slot-status/${id}/`);
      console.debug('Toggle response:', res?.data);
      if (res?.data?.success) {
        const slot = slots.find((s) => s.id === id);
        const newStatus = !slot?.status;
        onToggled && onToggled(id, newStatus);
        setError(''); // Clear any previous errors
      } else {
        setError(res?.data?.error || 'Toggle failed. Please try again.');
      }
    } catch (err) {
      console.error('Toggle slot error', err);
      const errorMessage = err.response?.data?.error || 
                           err.response?.data?.message || 
                           err.message || 
                           'Failed to toggle status. Please try again.';
      setError(errorMessage);
      // Clear error after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Your Time Slots</h3>
      
      {error && (
        <div className={`mb-4 p-3 rounded-lg ${
          isDark 
            ? 'bg-red-900/30 border border-red-700 text-red-300' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {slots.length === 0 ? (
        <div className={`p-6 text-center rounded-lg ${isDark ? 'bg-gray-600/50' : 'bg-gray-100'}`}>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
            No time slots found. Create your first slot on the Create Course page.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map((s) => (
            <div 
              key={s.id || Math.random()} 
              className={`p-4 rounded-lg border transition-all ${
                isDark 
                  ? 'border-gray-600 bg-gray-800/50 hover:bg-gray-800' 
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-base mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {s.course_name} {s.section && s.section.trim() && s.section.trim() !== ' ' ? `- ${s.section}` : ''}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                    <div>ID: {s.id || '—'}</div>
                    <div>{s.day_of_week} • {s.start_time} - {s.end_time}</div>
                    <div>Room: {s.room || 'TBA'}</div>
                    <div>Duration: {s.duration_minutes || 10} minutes</div>
                    {s.start_date && s.end_date && (
                      <div>Dates: {s.start_date} to {s.end_date}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button 
                    onClick={() => onEdit && onEdit(s)} 
                    disabled={loadingId === s.id}
                    className={`px-3 py-1.5 rounded text-sm transition ${
                      isDark 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleToggle(s.id)} 
                    disabled={!s.id || loadingId === s.id} 
                    className={`px-3 py-1.5 rounded text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      s.status 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-gray-400 hover:bg-gray-500 text-white'
                    }`}
                  >
                    {loadingId === s.id ? '...' : s.status ? 'Active' : 'Inactive'}
                  </button>
                  <button 
                    onClick={() => handleDelete(s.id)} 
                    disabled={!s.id || loadingId === s.id} 
                    className="px-3 py-1.5 rounded bg-red-500 hover:bg-red-600 text-white text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingId === s.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
