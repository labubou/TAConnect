import { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useGlobalLoading } from '../../../contexts/GlobalLoadingContext';
import { bookPageStrings } from '../../../strings/bookPageStrings';
import axios from 'axios';

export default function DateTimeBooking({
  selectedSlot,
  selectedInstructor,
  availableDates,
  selectedDate,
  selectedTime,
  timeSlots,
  description,
  onDescriptionChange,
  onDateSelect,
  onTimeSelect,
  onBook,
  isCreatingBooking,
  userEmailPreferences
}) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const strings = bookPageStrings[language];
  const { isLoading } = useGlobalLoading();
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

  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes) return '';
    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + durationMinutes;
      const endHours = Math.floor(totalMinutes / 60);
      const endMinutes = totalMinutes % 60;
      return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    } catch (e) {
      return '';
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

  const handleDateClick = (dateStr) => {
    onDateSelect(dateStr);
  };

  const handleTimeClick = (time) => {
    onTimeSelect(time);
  };

  const handleBookClick = () => {
    onBook();
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-6 rounded-xl ${isDark ? 'shadow-lg' : 'shadow-md hover:shadow-lg transition-shadow'}`}>
      <div className="flex items-center mb-4">
        <div className={`w-8 h-8 ${isDark ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535]' : 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b]'} text-white rounded-full flex items-center justify-center font-bold mr-3 shadow-sm`}>
          {strings.steps.step3.number}
        </div>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {strings.steps.step3.title}
        </h2>
      </div>

      {!selectedSlot ? (
        <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
          {strings.steps.step3.selectSlotFirst}
        </p>
      ) : (
        <>
          <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
            {availableDates.length === 0 ? (
              <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                {strings.steps.step3.noDates}
              </p>
            ) : (
              availableDates.map((date, index) => {
                // Format date as YYYY-MM-DD using local timezone to avoid UTC conversion issues
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(dateStr)}
                    className={`w-full p-3 rounded-lg border-2 bg-white dark:bg-gray-900 text-left transition-all ${
                      selectedDate === dateStr
                        ? isDark ? 'border-purple-500 bg-purple-900/20' : 'border-purple-500 bg-purple-50 shadow-sm'
                        : `${isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`
                    }`}
                  >
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`} dir="ltr">
                      {formatDate(date)}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="mb-6">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3`}>
                {strings.steps.step3.selectTime}
              </h3>
              {timeSlots.length === 0 ? (
                <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                  {strings.steps.step3.noAvailableTimes}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {timeSlots.map((timeSlot, index) => (
                    <button
                      key={index}
                      onClick={() => handleTimeClick(timeSlot.value)}
                      className={`p-2.5 rounded-lg border-2 bg-white dark:bg-gray-900 text-center transition-all font-medium text-sm ${
                        selectedTime === timeSlot.value
                          ? isDark ? 'border-blue-500 bg-blue-900/20 text-blue-300' : 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                          : `${isDark ? 'border-gray-700 hover:border-gray-600 text-gray-300' : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:shadow-sm'}`
                      }`}
                      dir="ltr"
                    >
                      {formatTime(timeSlot.start)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description Field */}
          {selectedDate && selectedTime && (
            <div className="mb-4">
              <label className={`block font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>
                {strings.steps.step3.descriptionLabel}
              </label>
              <textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder={strings.steps.step3.descriptionPlaceholder}
                rows={3}
                maxLength={500}
                className={`w-full p-3 rounded-lg border-2 transition-all resize-none ${
                  isDark 
                    ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'} text-right`}>
                {description.length}/500
              </p>
            </div>
          )}

          {/* Booking Summary */}
          {selectedDate && selectedTime && selectedSlot && selectedInstructor && (
            <div className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'} rounded-lg mb-4 ${isDark ? '' : 'shadow-sm'}`}>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3`}>
                {strings.steps.step3.summaryTitle}
              </h3>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-800'} space-y-1.5 font-medium`}>
                <p dir="ltr">👨‍🏫 {selectedInstructor.first_name || ''} {selectedInstructor.last_name || ''}</p>
                <p>📚 {selectedSlot.course_name || strings.steps.step2.officeHours}</p>
                <p dir="ltr">📅 {formatDate(selectedDate)}</p>
                <p dir="ltr">🕐 {formatTime(selectedTime)} - {formatTime(calculateEndTime(selectedTime, selectedSlot.duration_minutes))}</p>
                <p dir="ltr">📍 {selectedSlot.room || strings.steps.step2.online}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleBookClick}
            disabled={!selectedDate || !selectedTime || isCreatingBooking || isLoading}
            className={`w-full ${isDark ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535]' : 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b]'} text-white py-3 px-6 rounded-lg ${isDark ? 'hover:from-[#2d5857] hover:to-[#152a2a]' : 'hover:from-[#3d8584] hover:to-[#2d5857]'} hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold flex items-center justify-center transform hover:scale-[1.02]`}
          >
            {isCreatingBooking || isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {strings.steps.step3.bookingButton}
              </>
            ) : (
              strings.steps.step3.confirmButton
            )}
          </button>
        </>
      )}
    </div>
  );
}
