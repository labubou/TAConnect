import axios from 'axios';

/**
 * Fetch pending bookings for instructor
 * @param {number} bookingId - Optional specific booking ID to fetch
 * @returns {Promise} Array of pending bookings
 */
export const fetchPendingBookings = async (bookingId = null) => {
  try {
    const params = { status: 'pending' };
    
    const response = await axios.get('/api/instructor/get-user-bookings/', { params });
    
    let bookings = response.data.bookings || [];
    
    // Filter for only pending bookings if not already filtered by backend
    bookings = bookings.filter(b => b.status === 'pending');
    
    // If specific booking ID is requested, return only that booking
    if (bookingId) {
      bookings = bookings.filter(b => b.id === parseInt(bookingId));
    }
    
    return bookings;
  } catch (error) {
    console.error('Failed to fetch pending bookings:', error);
    const errMsg = error?.response?.data?.error || error?.message || 'Failed to fetch pending bookings';
    throw new Error(errMsg);
  }
};

/**
 * Confirm a pending booking
 * @param {number} bookingId - Booking ID to confirm
 * @returns {Promise} Success response from backend
 */
export const confirmBooking = async (bookingId) => {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    const response = await axios.post(`/api/instructor/confirm-booking/${bookingId}/`, {});
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to confirm booking');
    }
    
    return response.data;
  } catch (error) {
    console.error('Failed to confirm booking:', error);
    const errMsg = error?.response?.data?.error || error?.message || 'Failed to confirm booking';
    throw new Error(errMsg);
  }
};

/**
 * Cancel a booking
 * @param {number} bookingId - Booking ID to cancel
 * @returns {Promise} Success response from backend
 */
export const cancelBooking = async (bookingId) => {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    const response = await axios.delete(`/api/instructor/cancel-booking/${bookingId}/`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to cancel booking');
    }
    
    return response.data;
  } catch (error) {
    console.error('Failed to cancel booking:', error);
    const errMsg = error?.response?.data?.error || error?.message || 'Failed to cancel booking';
    throw new Error(errMsg);
  }
};
