const manageBookingsStrings = {
  page: {
    title: "Manage Bookings",
    description: "View and manage all your office hour bookings. Cancel bookings in case of emergencies.",
    noBookings: "No bookings found",
    noBookingsDescription: "You don't have any bookings yet.",
  },
  filters: {
    filterByStatus: "Filter by Status",
    all: "All Bookings",
    active: "Active",
    cancelled: "Cancelled",
    dateRange: "Date Range",
    from: "From",
    to: "To",
    apply: "Apply Filters",
    clear: "Clear Filters",
    search: "Search by student name or email",
  },
  bookingCard: {
    student: "Student",
    course: "Course",
    section: "Section",
    date: "Date",
    time: "Time",
    duration: "Duration",
    room: "Room",
    status: "Status",
    bookedOn: "Booked on",
    actions: "Actions",
  },
  status: {
    active: "Active",
    cancelled: "Cancelled",
    completed: "Completed",
  },
  buttons: {
    cancel: "Cancel Booking",
    view: "View Details",
    confirmCancel: "Confirm Cancel",
  },
  modals: {
    cancelConfirmTitle: "Cancel Booking",
    cancelConfirmMessage:
      "Are you sure you want to cancel this booking? The student will be notified via email.",
    studentNotified: "The student has been notified",
    yes: "Yes, Cancel",
    no: "No, Go Back",
  },
  messages: {
    success: "Booking cancelled successfully",
    error: "Failed to cancel booking",
    loading: "Loading bookings...",
    noData: "No data available",
  },
  table: {
    headers: {
      studentName: "Student Name",
      course: "Course",
      date: "Date & Time",
      status: "Status",
      actions: "Actions",
    },
  },
  aria: {
    cancelBooking: "Cancel this booking",
    viewDetails: "View booking details",
    filterBookings: "Filter bookings",
  },
};

export default manageBookingsStrings;
