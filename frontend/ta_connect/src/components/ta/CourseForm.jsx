import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTheme } from '../../contexts/ThemeContext';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CourseForm({ onCreated, editing, onUpdated, onCancelEdit }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const initial = {
    course_name: '',
    section: '',
    day_of_week: 'Mon',
    start_time: '09:00',
    end_time: '10:00',
    duration_minutes: 10,
    start_date: '',
    end_date: '',
    room: '',
  };

  const [form, setForm] = useState(initial);
  const [timeParts, setTimeParts] = useState({
    start_hour: '9',
    start_min: '00',
    start_ampm: 'AM',
    end_hour: '10',
    end_min: '00',
    end_ampm: 'AM',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (editing) {
      setForm({
        course_name: editing.course_name || '',
        section: editing.section || '',
        day_of_week: editing.day_of_week || 'Mon',
        start_time: editing.start_time || '09:00',
        end_time: editing.end_time || '10:00',
        duration_minutes: editing.duration_minutes || 10,
        start_date: editing.start_date || '',
        end_date: editing.end_date || '',
        room: editing.room || '',
      });
      setError('');
      setMessage('');
      
      if (editing.start_time) {
        const p = parse24To12(editing.start_time);
        const q = parse24To12(editing.end_time || '10:00');
        setTimeParts({
          start_hour: String(p.hour),
          start_min: p.min,
          start_ampm: p.ampm,
          end_hour: String(q.hour),
          end_min: q.min,
          end_ampm: q.ampm,
        });
      }
    } else {
      setForm(initial);
      setTimeParts({
        start_hour: '9',
        start_min: '00',
        start_ampm: 'AM',
        end_hour: '10',
        end_min: '00',
        end_ampm: 'AM',
      });
    }
  }, [editing]);

  const parse24To12 = (time24) => {
    try {
      const [hh, mm] = (time24 || '09:00').split(':');
      let h = parseInt(hh, 10);
      const min = mm || '00';
      const ampm = h >= 12 ? 'PM' : 'AM';
      let hour12 = h % 12;
      if (hour12 === 0) hour12 = 12;
      return { hour: hour12, min: min.padStart(2, '0'), ampm };
    } catch (e) {
      return { hour: 9, min: '00', ampm: 'AM' };
    }
  };


  const convert12To24 = (hourStr, minStr, ampm) => {
    let h = parseInt(hourStr, 10);
    const m = String(minStr).padStart(2, '0');
    if (ampm === 'AM') {
      if (h === 12) h = 0;
    } else {
      if (h !== 12) h = h + 12;
    }
    return `${String(h).padStart(2, '0')}:${m}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError('');
  };

  const handleTimePartChange = (e) => {
    const { name, value } = e.target;
    setTimeParts((tp) => ({ ...tp, [name]: value }));
  };

  // Validate YA KARIM YA BASSEM YA JOSEPH
  const validateForm = () => {
    
    if (!form.course_name || !form.course_name.trim()) {
      return { valid: false, message: 'Course name is required.' };
    }

    
    if (!days.includes(form.day_of_week)) {
      return { valid: false, message: 'Please select a valid day of week.' };
    }

    
    if (!form.start_date || !form.end_date) {
      return { valid: false, message: 'Start and end dates are required.' };
    }
    const sd = new Date(form.start_date);
    const ed = new Date(form.end_date);
    if (isNaN(sd.getTime()) || isNaN(ed.getTime())) {
      return { valid: false, message: 'Invalid start or end date.' };
    }
    if (sd > ed) {
      return { valid: false, message: 'Start date must be before or equal to end date.' };
    }

    
    if (!form.room || !form.room.trim()) {
      return { valid: false, message: 'Room is required.' };
    }

    
    const dur = parseInt(form.duration_minutes, 10);
    if (isNaN(dur) || dur <= 0) {
      return { valid: false, message: 'Duration must be a positive number of minutes.' };
    }

 
    const start24 = convert12To24(timeParts.start_hour, timeParts.start_min, timeParts.start_ampm);
    const end24 = convert12To24(timeParts.end_hour, timeParts.end_min, timeParts.end_ampm);
    const timeToMinutes = (t) => {
      const [hh, mm] = t.split(':').map((x) => parseInt(x, 10));
      if (isNaN(hh) || isNaN(mm)) return NaN;
      return hh * 60 + mm;
    };
    const sMin = timeToMinutes(start24);
    const eMin = timeToMinutes(end24);
    if (isNaN(sMin) || isNaN(eMin)) {
      return { valid: false, message: 'Invalid start or end time.' };
    }
    if (sMin >= eMin) {
      return { valid: false, message: 'Start time must be before end time.' };
    }

    return { valid: true };
  };

  const doCreate = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const payload = { ...form };
      payload.start_time = convert12To24(timeParts.start_hour, timeParts.start_min, timeParts.start_ampm);
      payload.end_time = convert12To24(timeParts.end_hour, timeParts.end_min, timeParts.end_ampm);
      
      // Ensure section is at least a space if empty (backend expects it)
      if (!payload.section || !payload.section.trim()) {
        payload.section = ' ';
      }
      
      console.debug('Creating time slot payload:', payload);
      const res = await axios.post('/api/instructor/time-slots/', payload);
      console.debug('Create response:', res?.data);
      
      if (res?.data?.success && res?.data?.time_slot_id) {
        const serverId = res.data.time_slot_id;
        setMessage('Slot created successfully!');
        setForm(initial);
        setTimeParts({
          start_hour: '9',
          start_min: '00',
          start_ampm: 'AM',
          end_hour: '10',
          end_min: '00',
          end_ampm: 'AM',
        });
        onCreated && onCreated({ ...payload, time_slot_id: serverId, id: serverId });
      } else {
        setError(res?.data?.error || 'Failed to create slot');
      }
    } catch (err) {
      console.error('Create slot error', err);
      const errorMessage = err.response?.data?.error || 
                           err.response?.data?.message || 
                           err.message || 
                           'Failed to create slot. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const doUpdate = async () => {
    if (!editing || !editing.id) {
      setError('Missing slot ID to update.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const payload = { ...form };
      payload.start_time = convert12To24(timeParts.start_hour, timeParts.start_min, timeParts.start_ampm);
      payload.end_time = convert12To24(timeParts.end_hour, timeParts.end_min, timeParts.end_ampm);
      
      // Ensure section is at least a space if empty (backend expects it)
      if (!payload.section || !payload.section.trim()) {
        payload.section = ' ';
      }
      
      console.debug('Updating slot', editing.id, 'payload:', payload);
      const res = await axios.patch(`/api/instructor/time-slots/${editing.id}`, payload);
      console.debug('Update response:', res?.data);
      
      if (res?.data?.success) {
        const updatedId = res?.data?.time_slot_id || editing.id;
        setMessage('Slot updated successfully!');
        onUpdated && onUpdated(editing.id, { ...payload, id: updatedId });
      } else {
        setError(res?.data?.error || 'Failed to update slot');
      }
    } catch (err) {
      console.error('Update slot error', err);
      const errorMessage = err.response?.data?.error || 
                           err.response?.data?.message || 
                           err.message || 
                           'Failed to update slot. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    // full validation
    const v = validateForm();
    if (!v.valid) {
      setError(v.message || 'Please correct the form fields.');
      return;
    }

    if (editing) await doUpdate();
    else await doCreate();
  };

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
          {editing ? 'Edit Slot' : 'Create Slot'}
        </h3>

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
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            isDark 
              ? 'bg-green-900/30 border border-green-700 text-green-300' 
              : 'bg-green-100 border border-green-400 text-green-700'
          }`}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{message}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Course name</label>
            <input name="course_name" value={form.course_name} onChange={handleChange} className={`w-full px-3 py-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-black placeholder-gray-500'}`} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Section</label>
            <input name="section" value={form.section} onChange={handleChange} placeholder="Optional" className={`w-full px-3 py-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-black placeholder-gray-500'}`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Day</label>
              <select name="day_of_week" value={form.day_of_week} onChange={handleChange} className={`w-full px-3 py-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}>
                {days.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Room</label>
              <input name="room" value={form.room} onChange={handleChange} className={`w-full px-3 py-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-black placeholder-gray-500'}`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start time</label>
              <div className="flex space-x-2">
                <select name="start_hour" value={timeParts.start_hour} onChange={handleTimePartChange} className={`px-3 py-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={String(h)}>{h}</option>
                  ))}
                </select>
                <select name="start_min" value={timeParts.start_min} onChange={handleTimePartChange} className={`px-3 py-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}>
                  {['00','15','30','45'].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select name="start_ampm" value={timeParts.start_ampm} onChange={handleTimePartChange} className={`px-3 py-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End time</label>
              <div className="flex space-x-2">
                <select name="end_hour" value={timeParts.end_hour} onChange={handleTimePartChange} className={`px-3 py-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={String(h)}>{h}</option>
                  ))}
                </select>
                <select name="end_min" value={timeParts.end_min} onChange={handleTimePartChange} className={`px-3 py-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}>
                  {['00','15','30','45'].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select name="end_ampm" value={timeParts.end_ampm} onChange={handleTimePartChange} className={`px-3 py-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`}>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start date</label>
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className={`w-full px-3 py-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End date</label>
              <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className={`w-full px-3 py-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Duration (min)</label>
              <input type="number" name="duration_minutes" value={form.duration_minutes} onChange={handleChange} className={`w-full px-3 py-2 rounded border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-black'}`} min={1} />
            </div>
            <div className="flex items-center justify-end space-x-2">
              {editing && (
                <button type="button" onClick={onCancelEdit} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
                  Cancel
                </button>
              )}
              <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
                {loading ? 'Saving...' : editing ? 'Update Slot' : 'Create Slot'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
