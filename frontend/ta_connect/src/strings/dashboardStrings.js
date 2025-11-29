const dashboardStrings = {
  page: {
    title: "Dashboard",
    description: "View your availability and upcoming bookings",
  },
  calendar: {
    title: "Month Calendar",
    prevButton: "← Prev",
    nextButton: "Next →",
    todayButton: "Today",
    legend: {
      active: "Active",
      inactive: "Inactive",
      mixed: "Mixed",
      noSlots: "No slots",
    },
    info: "Green = All slots active | Red = All slots inactive | Yellow = Mix of active and inactive slots",
  },
  weeklySchedule: {
    title: "This Week's Bookings",
    noBookings: "No bookings this week",
    noBookingsDescription: "You have no confirmed bookings for the current week.",
    dateTime: "Date & Time",
    student: "Student",
    course: "Slot",
    room: "Room",
    status: "Status",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
  },
  errors: {
    loadingFailed: "Failed to load dashboard data",
    tryAgain: "Please try refreshing the page or contact support if the problem persists.",
  },
};

export default dashboardStrings;
