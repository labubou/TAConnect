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
      const res = await axios.delete(`/api/instructor/time-slots/delete-slot/${id}/`);
      console.debug('Delete response:', res?.data);
      if (res?.data?.success) {
        onDeleted && onDeleted(id);
      } else {
        setError(res?.data?.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete slot error', err);
      setError(err.response?.data?.error || err.message || 'Failed to delete');
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
      } else {
        setError(res?.data?.error || 'Toggle failed');
      }
    } catch (err) {
      console.error('Toggle slot error', err);
      setError(err.response?.data?.error || err.message || 'Failed to toggle status');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Local Slot List</h3>
      {error && <div className="text-red-500 mb-2">{error}</div>}

      {slots.length === 0 ? (
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>No slots created in this session yet.</p>
      ) : (
        <div className="space-y-3">
          {slots.map((s) => (
            <div key={s.id || Math.random()} className={`p-3 rounded-lg border ${isDark ? 'border-gray-600' : 'border-gray-200'} flex items-start justify-between`}>
              <div className="min-w-0">
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.course_name} {s.section ? `- ${s.section}` : ''}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>ID: {s.id || '—'} • {s.day_of_week} {s.start_time}-{s.end_time} • {s.room}</div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => onEdit && onEdit(s)} className="px-3 py-1 rounded bg-white/50 hover:bg-white/70 text-sm">
                  Edit
                </button>
                <button onClick={() => handleToggle(s.id)} disabled={!s.id || loadingId === s.id} className={`px-3 py-1 rounded text-sm ${s.status ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                  {loadingId === s.id ? '...' : s.status ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => handleDelete(s.id)} disabled={!s.id || loadingId === s.id} className="px-3 py-1 rounded bg-red-500 text-white text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
