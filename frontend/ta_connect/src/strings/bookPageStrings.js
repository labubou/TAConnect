export const bookPageStrings = {
  header: {
    title: 'Book Office Hours',
    subtitle: 'Find and book available time slots with your TAs',
  },
  
  steps: {
    step1: {
      number: '1',
      title: 'Select Instructor',
      searchPlaceholder: 'Search by name...',
      searchButton: 'Search',
      noInstructors: 'No instructors found',
      minCharsHint: 'Type at least 2 characters to search',
      noResultsFor: 'No instructors found for',
      tryDifferent: 'Try a different search term',
      startTyping: 'Start typing to search for instructors',
    },
    
    step2: {
      number: '2',
      title: 'Select Time Slot',
      selectInstructorFirst: 'Please select an instructor first',
      noSlots: 'No available slots for this instructor',
      inactive: 'Inactive',
      officeHours: 'Office Hours',
      online: 'Online',
    },
    
    step3: {
      number: '3',
      title: 'Select Date',
      selectSlotFirst: 'Please select a time slot first',
      noDates: 'No available dates',
      summaryTitle: 'Booking Summary',
      confirmButton: 'Confirm Booking',
      bookingButton: 'Booking...',
    },
  },
  
  messages: {
    errorFetchInstructors: 'Failed to load instructors. Please try again.',
    errorFetchSlots: 'Failed to load instructor slots.',
    errorSelectSlotDate: 'Please select a slot and date',
    errorBooking: 'Failed to create booking',
    successBooking: 'Booking created successfully! Check your email for confirmation.',
    loading: 'Loading...',
  },
  
  successModal: {
    title: 'Booking Confirmed!',
    emailSent: 'A confirmation has been sent to your email.',
    emailDisabled: 'Your booking is confirmed. Email notifications are disabled in your preferences.',
    doneButton: 'Done',
  },
};
