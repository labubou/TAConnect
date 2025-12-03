import { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useGlobalLoading } from '../../../contexts/GlobalLoadingContext';
import { bookPageStrings } from '../../../strings/bookPageStrings';
import axios from 'axios';

export default function TimeSlotSelector({
  selectedInstructor,
  instructorSlots,
  onSlotSelect,
  selectedSlot
}) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const strings = bookPageStrings[language];
  const isDark = theme === 'dark';

  const formatTime = (time) => {
    if (!time) return '';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      if (isNaN(hour)) return time;
      const ampm = hour >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (e) {
      return time;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return String(date);
      return d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return String(date);
    }
  };

  // Helper function to check if a slot has completely passed
  const isSlotPassed = (slot) => {
    try {
      const now = new Date();
      
      // Parse the end date
      const [endYear, endMonth, endDay] = slot.end_date.split('-').map(Number);
      const slotEndDate = new Date(endYear, endMonth - 1, endDay);
      
      // Parse the end time
      const [endHours, endMinutes] = slot.end_time.split(':').map(Number);
      slotEndDate.setHours(endHours, endMinutes, 0, 0);
      
      // Check if the slot's end date/time has passed
      return now > slotEndDate;
    } catch (e) {
      console.error('Error checking if slot has passed:', e);
      return false; // If there's an error, show the slot to be safe
    }
  };

  const handleSelectSlot = (slot) => {
    onSlotSelect(slot);
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-6 rounded-xl ${isDark ? 'shadow-lg' : 'shadow-md hover:shadow-lg transition-shadow'}`}>
      <div className="flex items-center mb-4">
        <div className={`w-8 h-8 ${isDark ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535]' : 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b]'} text-white rounded-full flex items-center justify-center font-bold mr-3 shadow-sm`}>
          {strings.steps.step2.number}
        </div>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {strings.steps.step2.title}
        </h2>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {!selectedInstructor ? (
          <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
            {strings.steps.step2.selectInstructorFirst}
          </p>
        ) : instructorSlots.filter(slot => !isSlotPassed(slot)).length === 0 ? (
          <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
            {strings.steps.step2.noSlots}
          </p>
        ) : (
          instructorSlots
            .filter(slot => !isSlotPassed(slot)) // Filter out past slots
            .map((slot) => (
            <button
              key={slot.id}
              onClick={() => handleSelectSlot(slot)}
              disabled={!slot.status}
              className={`w-full p-4 rounded-lg border-2 bg-white dark:bg-gray-900 text-left transition-all ${
                selectedSlot?.id === slot.id
                  ? isDark ? 'border-green-500 bg-green-900/20' : 'border-green-500 bg-green-50 shadow-sm'
                  : slot.status
                    ? `${isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`
                    : isDark ? 'border-gray-300 opacity-50 cursor-not-allowed' : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between ">
                <div className="flex-1">
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-1`}>
                    {slot.course_name || strings.steps.step2.officeHours}
                  </p>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-700'} space-y-0.5 font-medium`}>
                    <p dir="ltr">📅 {slot.day_of_week}</p>
                    <p dir="ltr">🕐 {formatTime(slot.start_time)} - {formatTime(slot.end_time)}</p>
                    <p dir="ltr">📍 {slot.location || strings.steps.step2.online}</p>
                    <p dir="ltr">📆 {formatDate(slot.start_date)} to {formatDate(slot.end_date)}</p>
                  </div>
                </div>
                {!slot.status && (
                  <span className={`text-xs ${isDark ? 'bg-red-100 text-red-700' : 'bg-red-100 text-red-600'} px-2 py-1 rounded font-medium`}>
                    {strings.steps.step2.inactive}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
