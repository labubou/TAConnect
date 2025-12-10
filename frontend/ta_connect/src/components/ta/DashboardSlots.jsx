import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import strings from '../../strings/TAPageStrings';

export default function DashboardSlots({ isDark, slots, bookings, loading, error, onCreateSlot }) {
  const [hoveredSlotId, setHoveredSlotId] = useState(null);
  const [hoveredRect, setHoveredRect] = useState(null);
  const [stickySlotId, setStickySlotId] = useState(null);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleDocClick = (e) => {
      // If there's no sticky popup, nothing to do
      if (!stickySlotId) return;

      // If the click was inside the popup, keep it
      const popupEl = popupRef.current;
      if (popupEl && popupEl.contains && popupEl.contains(e.target)) return;

      // Otherwise clear sticky state
      setStickySlotId(null);
    };

    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [stickySlotId]);

  const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const DAY_NAMES = {
    Mon: strings.taPage.weekSchedule.monday,
    Tue: strings.taPage.weekSchedule.tuesday,
    Wed: strings.taPage.weekSchedule.wednesday,
    Thu: strings.taPage.weekSchedule.thursday,
    Fri: strings.taPage.weekSchedule.friday,
    Sat: strings.taPage.weekSchedule.saturday,
    Sun: strings.taPage.weekSchedule.sunday,
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const time = timeStr.split(':');
    const hours = parseInt(time[0], 10);
    const minutes = time[1] || '00';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getSlotsForDay = (day) => {
    return slots.filter(slot => slot.day_of_week === day && slot.status);
  };

  const getBookingsForSlot = (slotId) => {
    return bookings.filter(booking => booking.office_hour.id === slotId && !booking.is_cancelled);
  };

  if (loading) {
    return (
      <div className={`text-center py-16 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        {strings.taPage.weekSchedule.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`mb-6 p-4 rounded-lg ${
          isDark
            ? 'bg-red-900/30 border border-red-700 text-red-300'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}
      >
        {error}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className={`text-center py-16 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        <p className="mb-6">{strings.taPage.weekSchedule.noSlots}</p>
        <button
          onClick={onCreateSlot}
          className="px-6 py-3 bg-gradient-to-r from-[#366c6b] to-[#1a3535] text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          {strings.taPage.weekSchedule.createFirstSlot}
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const daySlots = getSlotsForDay(day);
          return (
            <div
              key={day}
              className={`rounded-lg border min-h-96 flex flex-col ${
                isDark
                  ? 'border-gray-700 bg-gray-800/50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {/* Day Header */}
              <div
                className={`p-4 border-b flex-shrink-0 ${
                  isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'
                } rounded-t-lg`}
              >
                <h3 className={`font-bold text-center text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {DAY_NAMES[day]}
                </h3>
              </div>

              {/* Slots Container */}
              <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                {daySlots.length === 0 ? (
                  <p className={`text-sm text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {strings.taPage.weekSchedule.noSlotsToday}
                  </p>
                ) : (
                  daySlots.map((slot) => {
                    const slotBookings = getBookingsForSlot(slot.id);
                    const isHovered = hoveredSlotId === slot.id;
                    const isVisible = (stickySlotId === slot.id) || (isHovered && hoveredRect);

                    return (
                      <div key={slot.id} className="relative">
                        {/* Slot Card */}
                        <div
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            isDark
                              ? 'border-blue-600 bg-blue-900/20 hover:bg-blue-900/40 hover:shadow-lg'
                              : 'border-blue-300 bg-blue-50 hover:bg-blue-100 hover:shadow-lg'
                          } ${isHovered ? 'ring-2 ring-emerald-500' : ''}`}
                          onMouseEnter={(e) => {
                            // only set hover state when not sticky for another slot
                            if (!stickySlotId) {
                              setHoveredSlotId(slot.id);
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredRect(rect);
                            }
                          }}
                          onMouseLeave={() => {
                            if (!stickySlotId) {
                              setHoveredSlotId(null);
                              setHoveredRect(null);
                            }
                          }}
                          onClick={(e) => {
                            // clicking the slot or popup will make it sticky
                            setStickySlotId(slot.id);
                            // prevent the document handler from immediately dismissing
                            e.stopPropagation();
                          }}
                        >
                          <div
                            className={`font-semibold text-sm mb-1 ${
                              isDark ? 'text-blue-300' : 'text-blue-700'
                            }`}
                          >
                            {slot.course_name}
                            {slot.section && slot.section.trim() && slot.section.trim() !== ' '
                              ? ` - ${slot.section}`
                              : ''}
                          </div>
                          <div
                            className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </div>
                          {slot.room && (
                            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              📍 {slot.room}
                            </div>
                          )}
                          {slotBookings.length > 0 && (
                            <div
                              className={`text-xs mt-2 pt-2 border-t ${
                                isDark ? 'border-blue-800 text-emerald-400' : 'border-blue-200 text-emerald-600'
                              }`}
                            >
                              👥 {slotBookings.length} {slotBookings.length === 1 ? strings.taPage.booking : strings.taPage.bookings}
                            </div>
                          )}
                        </div>

                        {/* Bookings Popup rendered via portal to avoid clipping by scrolling columns */}

                        {isVisible && slotBookings.length > 0 && hoveredRect && createPortal(
                          <div
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              // We'll position using transform to avoid layout shift
                              transform: `translate(${Math.min(window.innerWidth - 344, Math.max(8, hoveredRect.right + 8))}px, ${hoveredRect.top + window.scrollY}px)`,
                              zIndex: 9999,
                            }}
                            className={`w-80`}
                            ref={(el) => { popupRef.current = el; }}
                          >
                            <div className={`rounded-lg shadow-2xl border overflow-hidden ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}>
                              <div className={`p-3 border-b font-semibold ${isDark ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-gray-100 text-gray-900'}`}>
                                {strings.taPage.bookedSessions}
                              </div>
                              <div className="max-h-64 overflow-y-auto p-3 space-y-2">
                                {slotBookings.map((booking) => (
                                  <div key={booking.id} className={`p-3 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                                    <div className={`font-semibold text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                                      {booking.student?.first_name || ''} {booking.student?.last_name || ''}
                                    </div>
                                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                      📧 {booking.student?.email || '—'}
                                    </div>
                                    <div className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                      📅 {booking.date || '—'}
                                    </div>
                                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                      🕐 {booking.start_time ? formatTime((booking.start_time + '').split(' ')[1] || '') : ''}
                                    </div>
                                    {booking.description && (
                                      <div className={`text-xs mt-2 pt-2 border-t italic ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
                                        💬 {booking.description}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>,
                          document.body
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
