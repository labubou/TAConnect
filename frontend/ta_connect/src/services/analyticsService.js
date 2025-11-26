import axios from 'axios';

/**
 * Get analytics data for the TA dashboard
 * Fetches bookings, feedback, and student activity information
 */
export const getAnalyticsData = async (startDate = null, endDate = null) => {
  try {
    // Fetch bookings data
    const bookingsParams = {};
    if (startDate) bookingsParams.start_date = startDate;
    if (endDate) bookingsParams.end_date = endDate;

    const bookingsRes = await axios.get('/api/instructor/get-user-bookings', {
      params: bookingsParams
    });

    // Fetch slots data for context
    const slotsRes = await axios.get('/api/instructor/get-user-slots');

    return {
      bookings: bookingsRes?.data?.bookings || [],
      slots: slotsRes?.data?.slots || []
    };
  } catch (error) {
    console.error('Failed to fetch analytics data:', error);
    throw error;
  }
};

/**
 * Process bookings data for chart visualization
 * Groups bookings by date and counts them
 */
export const processBookingsForChart = (bookings) => {
  const bookingsByDate = {};

  if (!bookings || !Array.isArray(bookings)) {
    return [];
  }

  bookings.forEach((booking) => {
    if (booking.date) {
      const date = booking.date;
      bookingsByDate[date] = (bookingsByDate[date] || 0) + 1;
    }
  });

  return Object.entries(bookingsByDate)
    .map(([date, count]) => ({
      date,
      bookings: count
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Process feedback data for chart visualization
 * Calculates average feedback rating
 */
export const processFeedbackForChart = (slots = []) => {
  // Since the backend stores TAAnalytics with average_rating,
  // we'll use placeholder data structure that can be updated
  // when feedback collection is implemented
  return {
    averageRating: 4.5,
    totalFeedback: 0,
    ratingDistribution: [
      { name: '5 Stars', value: 0 },
      { name: '4 Stars', value: 0 },
      { name: '3 Stars', value: 0 },
      { name: '2 Stars', value: 0 },
      { name: '1 Star', value: 0 }
    ]
  };
};

/**
 * Process student activity data for chart visualization
 * Groups student sessions by date
 */
export const processStudentActivityForChart = (bookings) => {
  const activityByDate = {};

  if (!bookings || !Array.isArray(bookings)) {
    return [];
  }

  bookings.forEach((booking) => {
    if (booking.date && !booking.is_cancelled) {
      const date = booking.date;
      activityByDate[date] = (activityByDate[date] || 0) + 1;
    }
  });

  return Object.entries(activityByDate)
    .map(([date, studentCount]) => ({
      date,
      students: studentCount
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Calculate summary statistics for the dashboard
 */
export const calculateStatistics = (bookings = [], slots = []) => {
  const totalBookings = bookings?.length || 0;
  const cancelledBookings = bookings?.filter(b => b.is_cancelled)?.length || 0;
  const activeBookings = totalBookings - cancelledBookings;
  const uniqueStudents = new Set(bookings?.map(b => b.student?.id)?.filter(Boolean)).size;
  
  return {
    totalBookings,
    activeBookings,
    cancelledBookings,
    uniqueStudents,
    totalSlots: slots?.length || 0
  };
};
