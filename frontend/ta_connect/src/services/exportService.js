import axios from 'axios';

/**
 * Export bookings as CSV file
 * @param {string} startDate - Start date in YYYY-MM-DD format (optional)
 * @param {string} endDate - End date in YYYY-MM-DD format (optional)
 * @param {string} username - Username for filename
 * @returns {Promise} Downloads CSV file
 */
export const exportBookingsAsCSV = async (startDate = null, endDate = null, username = 'bookings') => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await axios.get('/api/instructor/bookings/export/', {
      params,
      responseType: 'blob'
    });

    // Create blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bookings_${username}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Failed to export bookings:', error);
    throw new Error('Failed to export bookings. Please try again.');
  }
};

/**
 * Export time slots as CSV file
 * @param {string} username - Username for filename
 * @returns {Promise} Downloads CSV file
 */
export const exportTimeSlotsAsCSV = async (username = 'time_slots') => {
  try {
    const response = await axios.get('/api/instructor/time-slots/export/', {
      responseType: 'blob'
    });

    // Create blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `time_slots_${username}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Failed to export time slots:', error);
    throw new Error('Failed to export time slots. Please try again.');
  }
};
