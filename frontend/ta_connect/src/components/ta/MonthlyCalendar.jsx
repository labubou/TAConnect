import { useState, useEffect } from 'react';

export default function MonthlyCalendar({ slots = [], isDark = false, isLoading = false }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slotsByDate, setSlotsByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateSlots, setSelectedDateSlots] = useState([]);

  // Build a map of dates with slot information
  // Handle both date-based slots and day_of_week-based slots
  useEffect(() => {
    try {
      const map = {};
      
      if (Array.isArray(slots) && slots.length > 0) {
        // Check first slot to determine format
        const firstSlot = slots[0];
        
        if (firstSlot.date) {
          // Date-based slots
          slots.forEach((slot, index) => {
            if (slot && slot.date) {
              const date = slot.date;
              if (!map[date]) {
                map[date] = [];
              }
              map[date].push(slot);
            }
          });
        } else if (firstSlot.day_of_week !== undefined || firstSlot.day_of_week !== null) {
          // Day of week based slots - we need to map them to calendar dates
          console.log('Using day_of_week-based slot format');
          const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const dayMap = {
            'Mon': 1, 'Monday': 1,
            'Tue': 2, 'Tuesday': 2,
            'Wed': 3, 'Wednesday': 3,
            'Thu': 4, 'Thursday': 4,
            'Fri': 5, 'Friday': 5,
            'Sat': 6, 'Saturday': 6,
            'Sun': 0, 'Sunday': 0,
          };
          
          // Get the month's dates that match each slot's day
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const firstDayOfMonth = new Date(year, month, 1);
          const lastDayOfMonth = new Date(year, month + 1, 0);
          
          for (let date = new Date(firstDayOfMonth); date <= lastDayOfMonth; date.setDate(date.getDate() + 1)) {
            const dayOfWeek = date.getDay(); // 0-6
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            // Find all slots that match this day of week AND are within the active date range
            const matchingSlots = slots.filter(slot => {
              const slotDay = dayMap[slot.day_of_week];
              const isCorrectDay = slotDay === dayOfWeek;
              
              // Check if date is within slot's start_date and end_date
              let isWithinRange = true;
              if (slot.start_date && slot.end_date) {
                isWithinRange = dateString >= slot.start_date && dateString <= slot.end_date;
              }
              
              // Don't filter by is_active here - show all slots in date range, let getDayStatus decide color
              return isCorrectDay && isWithinRange;
            });
            
            if (matchingSlots.length > 0) {
              map[dateString] = matchingSlots;
            }
          }
        }
      }
      
      setSlotsByDate(map);
    } catch (error) {
      console.error('Error processing slots:', error);
      setSlotsByDate({});
    }
  }, [slots, currentDate]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateKey = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getDayStatus = (day) => {
    const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
    const daySlots = slotsByDate[dateKey] || [];
    
    if (daySlots.length === 0) return 'none';
    
    // Check if all slots are active (status = true means slot is active/available)
    const hasActive = daySlots.some(slot => slot.status);
    const hasInactive = daySlots.some(slot => !slot.status);
    
    if (hasActive && !hasInactive) return 'active';
    if (hasInactive && !hasActive) return 'inactive';
    return 'mixed'; // Has both active and inactive slots
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (day) => {
    const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(dateKey);
    setSelectedDateSlots(slotsByDate[dateKey] || []);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getCellColor = (day) => {
    if (day === null) return '';
    
    const status = getDayStatus(day);
    const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
    const isSelected = selectedDate === dateKey;
    
    // Check if this is today
    const today = new Date();
    const isToday = day === today.getDate() && 
                   currentDate.getMonth() === today.getMonth() && 
                   currentDate.getFullYear() === today.getFullYear();
    
    let baseClass = 'border-2 ';
    
    if (status === 'none') {
      baseClass += isDark ? 'bg-gray-700 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-300';
    } else if (status === 'active') {
      baseClass += isDark ? 'bg-green-600 text-white border-green-500' : 'bg-green-500 text-white border-green-600';
    } else if (status === 'inactive') {
      baseClass += isDark ? 'bg-red-600 text-white border-red-500' : 'bg-red-500 text-white border-red-600';
    } else if (status === 'mixed') {
      baseClass += isDark ? 'bg-yellow-600 text-white border-yellow-500' : 'bg-yellow-500 text-white border-yellow-600';
    }
    
    // Highlight today with a distinct border and shadow
    if (isToday) {
      baseClass += isDark 
        ? ' ring-4 ring-cyan-400 ring-offset-2 ring-offset-gray-800 shadow-lg shadow-cyan-400/30' 
        : ' ring-4 ring-cyan-500 ring-offset-2 shadow-lg shadow-cyan-500/30';
    }
    
    if (isSelected) {
      baseClass += ' ring-4 ring-blue-400 ring-offset-2';
      if (isDark) baseClass += ' ring-offset-gray-800';
    }
    
    return baseClass;
  };

  const getDayStatusIcon = (day) => {
    if (day === null) return null;
    
    const status = getDayStatus(day);
    
    if (status === 'active') {
      return (
        <svg className="w-3 h-3 absolute top-1 right-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    } else if (status === 'inactive') {
      return (
        <svg className="w-3 h-3 absolute top-1 right-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
        <div className="space-y-4">
          <div className={`h-12 rounded animate-pulse ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <div key={i} className={`h-12 rounded animate-pulse ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {monthName}
        </h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handlePrevMonth}
            className={`px-3 py-1.5 rounded transition-colors text-sm sm:text-base ${
              isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
            aria-label="Previous month"
          >
            ← Prev
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded transition-colors text-sm sm:text-base bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white hover:shadow-lg"
            aria-label="Go to today"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className={`px-3 py-1.5 rounded transition-colors text-sm sm:text-base ${
              isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
            aria-label="Next month"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${isDark ? 'bg-green-600' : 'bg-green-500'}`}></div>
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${isDark ? 'bg-red-600' : 'bg-red-500'}`}></div>
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Inactive</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${isDark ? 'bg-yellow-600' : 'bg-yellow-500'}`}></div>
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Mixed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>No slots</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto px-2">
        <div className="grid grid-cols-7 gap-2 sm:gap-3 min-w-full">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className={`text-center font-semibold py-2 text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day, index) => (
            <div
              key={index}
              onClick={() => day !== null && handleDateClick(day)}
              className={`aspect-square rounded flex items-center justify-center cursor-pointer relative transition-all hover:shadow-lg transform hover:scale-105 ${
                day !== null ? getCellColor(day) : 'bg-transparent border-transparent'
              }`}
            >
              {day !== null && (
                <>
                  <span className="text-xs sm:text-sm font-semibold">{day}</span>
                  {getDayStatusIcon(day)}
                </>
              )}
            </div>
          ))}
        </div>
      </div>


      {/* Selected Date Slots Display */}
      {selectedDate && selectedDateSlots.length > 0 && (
        <div className={`mt-6 p-4 rounded-lg border ${isDark ? 'bg-gray-600/50 border-gray-500' : 'bg-blue-50 border-blue-300'}`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Slots for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
            <button
              onClick={() => {
                setSelectedDate(null);
                setSelectedDateSlots([]);
              }}
              className={`px-3 py-1 rounded text-sm transition-colors ${isDark ? 'hover:bg-gray-500 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            {selectedDateSlots.map((slot, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border-l-4 ${
                  slot.status
                    ? isDark ? 'bg-green-900/30 border-l-green-500 text-green-300' : 'bg-green-100 border-l-green-500 text-green-800'
                    : isDark ? 'bg-red-900/30 border-l-red-500 text-red-300' : 'bg-red-100 border-l-red-500 text-red-800'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      {slot.start_time && slot.end_time ? `${slot.start_time} - ${slot.end_time}` : 'Time TBD'}
                    </p>
                    {slot.course_name && (
                      <p className="text-xs opacity-80">{slot.course_name}</p>
                    )}
                    {slot.room && (
                      <p className="text-xs opacity-80">Room: {slot.room}</p>
                    )}
                    {slot.day_of_week && (
                      <p className="text-xs opacity-80">Day: {slot.day_of_week}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    slot.status
                      ? isDark ? 'bg-green-600/40 text-green-300' : 'bg-green-600/40 text-green-700'
                      : isDark ? 'bg-red-600/40 text-red-300' : 'bg-red-600/40 text-red-700'
                  }`}>
                    {slot.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedDateSlots.length === 0 && (
        <div className={`mt-6 p-4 rounded-lg border text-center ${isDark ? 'bg-gray-600/50 border-gray-500 text-gray-400' : 'bg-gray-50 border-gray-300 text-gray-600'}`}>
          <p>No slots available for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
          <button
            onClick={() => {
              setSelectedDate(null);
              setSelectedDateSlots([]);
            }}
            className={`mt-2 px-3 py-1 rounded text-sm transition-colors ${isDark ? 'hover:bg-gray-500 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Debug info - show if no slots at all */}
      {slots.length === 0 && (
        <div className={`mt-6 p-4 rounded-lg border text-center ${isDark ? 'bg-yellow-900/30 border-yellow-600 text-yellow-300' : 'bg-yellow-50 border-yellow-300 text-yellow-700'}`}>
          <p>No slots available yet. Create your first slot in Manage Courses to see them here.</p>
        </div>
      )}
    </div>
  );
}
