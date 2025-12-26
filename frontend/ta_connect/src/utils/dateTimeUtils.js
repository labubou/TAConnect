/**
 * Utility functions for formatting datetimes with timezone conversion.
 * All datetimes from the backend are in UTC (ISO-8601 with Z).
 * These functions convert them to the user's local timezone for display.
 */

/**
 * Format a UTC datetime string to local timezone with date and time
 * @param {string} dateTimeString - ISO-8601 datetime string (e.g., "2025-11-27T14:30:00Z")
 * @param {string} language - Language code ('en' or 'ar')
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateTimeString, language = 'en') => {
  if (!dateTimeString) return '';
  
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;
    
    const dateStr = date.toLocaleDateString(
      language === 'ar' ? 'ar-EG' : 'en-US',
      {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    );
    
    const timeStr = formatTime(dateTimeString, language);
    
    return `${dateStr} at ${timeStr}`;
  } catch (e) {
    console.error('Error formatting datetime:', e);
    return dateTimeString;
  }
};

/**
 * Format a UTC datetime string to local timezone time only
 * @param {string} dateTimeString - ISO-8601 datetime string (e.g., "2025-11-27T14:30:00Z")
 * @param {string} language - Language code ('en' or 'ar')
 * @returns {string} Formatted time string (e.g., "2:30 PM")
 */
export const formatTime = (dateTimeString, language = 'en') => {
  if (!dateTimeString) return '';
  
  try {
    // Handle ISO datetime string (e.g., "2025-11-27T14:30:00Z")
    if (typeof dateTimeString === 'string' && dateTimeString.includes('T')) {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) {
        // Fallback: try to extract time portion
        const timePart = dateTimeString.split('T')[1]?.split('.')[0]?.split('Z')[0];
        if (timePart) {
          const [hours, minutes] = timePart.split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
          const displayHour = hour % 12 || 12;
          return `${displayHour}:${minutes} ${ampm}`;
        }
        return dateTimeString;
      }
      
      // Convert UTC to local timezone and format
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
      const displayHour = hours % 12 || 12;
      const minutesStr = String(minutes).padStart(2, '0');
      
      return `${displayHour}:${minutesStr} ${ampm}`;
    }
    
    // Handle time-only string (e.g., "14:30:00" or "14:30")
    const timeParts = dateTimeString.toString().split(':');
    if (timeParts.length >= 2) {
      const hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const ampm = hours >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
      const displayHour = hours % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    
    return dateTimeString;
  } catch (e) {
    console.error('Error formatting time:', e, dateTimeString);
    return dateTimeString;
  }
};

/**
 * Format a UTC datetime string to local timezone date only
 * @param {string} dateTimeString - ISO-8601 datetime string or date string
 * @param {string} language - Language code ('en' or 'ar')
 * @returns {string} Formatted date string
 */
export const formatDate = (dateTimeString, language = 'en') => {
  if (!dateTimeString) return '';
  
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return String(dateTimeString);
    
    return date.toLocaleDateString(
      language === 'ar' ? 'ar-EG' : 'en-US',
      {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    );
  } catch (e) {
    console.error('Error formatting date:', e);
    return String(dateTimeString);
  }
};

/**
 * Format a date string (YYYY-MM-DD) to localized format
 * @param {string} dateString - Date string (e.g., "2025-11-27")
 * @param {string} language - Language code ('en' or 'ar')
 * @returns {string} Formatted date string
 */
export const formatDateOnly = (dateString, language = 'en') => {
  if (!dateString) return '';
  
  try {
    // Parse date string as local date (not UTC)
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString(
      language === 'ar' ? 'ar-EG' : 'en-US',
      {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    );
  } catch (e) {
    console.error('Error formatting date only:', e);
    return String(dateString);
  }
};

