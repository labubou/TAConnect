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

    const [bookingsRes, slotsRes] = await Promise.all([
      axios.get('/api/instructor/get-user-bookings', {
        params: bookingsParams
      }).catch(err => {
        console.error('Error fetching bookings:', err);
        return { data: { bookings: [] } };
      }),
      axios.get('/api/instructor/get-user-slots').catch(err => {
        console.error('Error fetching slots:', err);
        return { data: { slots: [] } };
      })
    ]);

    return {
      bookings: bookingsRes?.data?.bookings || [],
      slots: slotsRes?.data?.slots || []
    };
  } catch (error) {
    console.error('Failed to fetch analytics data:', error);
    throw new Error('Unable to load analytics data. Please try again later.');
  }
};

/**
 * Get backend booking analytics data
 * Fetches most booked slots, times, and comprehensive statistics
 */
export const getBackendBookingAnalytics = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const res = await axios.get('/api/instructor/booking-analytics/', { params });
    
    return {
      period: res?.data?.period || { start_date: null, end_date: null },
      totalBookings: res?.data?.total_bookings || 0,
      mostBookedSlot: res?.data?.most_booked_slot || null,
      mostBookedTime: res?.data?.most_booked_time || null,
      allSlotsAnalytics: res?.data?.all_slots_analytics || [],
      allTimesAnalytics: res?.data?.all_times_analytics || [],
      summary: res?.data?.summary || {
        average_bookings_per_slot: 0,
        total_unique_slots: 0,
        total_unique_times: 0,
      },
    };
  } catch (error) {
    console.error('Failed to fetch booking analytics:', error);
    throw new Error('Unable to load booking analytics. Please try again later.');
  }
};

/**
 * Process bookings data for chart visualization
 * Groups bookings by date and counts them
 */
export const processBookingsForChart = (bookings) => {
  try {
    const bookingsByDate = {};

    if (!bookings || !Array.isArray(bookings) || bookings.length === 0) {
      return [];
    }

    bookings.forEach((booking) => {
      try {
        if (booking.date) {
          const date = booking.date;
          bookingsByDate[date] = (bookingsByDate[date] || 0) + 1;
        }
      } catch (err) {
        console.warn('Error processing booking:', booking, err);
      }
    });

    return Object.entries(bookingsByDate)
      .map(([date, count]) => ({
        date,
        bookings: count
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (err) {
    console.error('Error processing bookings for chart:', err);
    return [];
  }
};

/**
 * Process all slots analytics for table display
 * Converts backend array to formatted table data
 */
export const processAllSlotsAnalytics = (slotsAnalytics = []) => {
  try {
    if (!Array.isArray(slotsAnalytics) || slotsAnalytics.length === 0) {
      return [];
    }

    return slotsAnalytics.map(slot => ({
      slotId: slot?.slot_id,
      startTime: slot?.start_time ? new Date(slot.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
      endTime: slot?.end_time ? new Date(slot.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
      room: slot?.room || 'N/A',
      bookingCount: slot?.booking_count || 0,
    }));
  } catch (err) {
    console.error('Error processing slots analytics:', err);
    return [];
  }
};

/**
 * Process all times analytics for chart display
 * Converts backend array to formatted chart data
 */
export const processAllTimesAnalytics = (timesAnalytics = []) => {
  try {
    if (!Array.isArray(timesAnalytics) || timesAnalytics.length === 0) {
      return [];
    }

    return timesAnalytics.map(time => ({
      hour: time?.hour || 0,
      time: time?.time || `${String(time?.hour || 0).padStart(2, '0')}:00`,
      bookingCount: time?.booking_count || 0,
    }))
    .sort((a, b) => a.hour - b.hour);
  } catch (err) {
    console.error('Error processing times analytics:', err);
    return [];
  }
};

/**
 * Process feedback data for chart visualization
 * Calculates average feedback rating
 * 
 * TODO: Backend needs to provide feedback/rating data in the analytics endpoint.
 * Currently using placeholder data structure. Update this function when feedback
 * collection is implemented in the backend at /api/instructor/get-user-feedback/
 * or similar endpoint. Expected response format:
 * {
 *   ratings: [{ rating: 5, count: 10 }, { rating: 4, count: 5 }, ...],
 *   averageRating: 4.5
 * }
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
  try {
    const activityByDate = {};

    if (!bookings || !Array.isArray(bookings) || bookings.length === 0) {
      return [];
    }

    bookings.forEach((booking) => {
      try {
        if (booking.date && !booking.is_cancelled) {
          const date = booking.date;
          activityByDate[date] = (activityByDate[date] || 0) + 1;
        }
      } catch (err) {
        console.warn('Error processing student activity:', booking, err);
      }
    });

    return Object.entries(activityByDate)
      .map(([date, studentCount]) => ({
        date,
        students: studentCount
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (err) {
    console.error('Error processing student activity for chart:', err);
    return [];
  }
};

/**
 * Calculate summary statistics for the dashboard
 */
export const calculateStatistics = (bookings = [], slots = []) => {
  try {
    if (!bookings || !Array.isArray(bookings)) {
      return {
        totalBookings: 0,
        activeBookings: 0,
        cancelledBookings: 0,
        uniqueStudents: 0,
        totalSlots: slots?.length || 0
      };
    }

    const totalBookings = bookings.length;
    const cancelledBookings = bookings.filter(b => b && b.is_cancelled).length;
    const activeBookings = totalBookings - cancelledBookings;
    const uniqueStudents = new Set(
      bookings
        .map(b => b?.student?.id)
        .filter(Boolean)
    ).size;
    
    return {
      totalBookings,
      activeBookings,
      cancelledBookings,
      uniqueStudents,
      totalSlots: slots?.length || 0
    };
  } catch (err) {
    console.error('Error calculating statistics:', err);
    return {
      totalBookings: 0,
      activeBookings: 0,
      cancelledBookings: 0,
      uniqueStudents: 0,
      totalSlots: slots?.length || 0
    };
  }
};
