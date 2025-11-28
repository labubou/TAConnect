const manageCoursesPageStrings = {
  pages: {
    create: "Create Course",
    view: "View Courses",
    edit: "Edit Courses",
    delete: "Delete Courses",
  },

  // Create Course Page Strings
  create: {
    title: "Create New Course",
    description: "Add a new office hour slot to your schedule.",
    fields: {
      courseName: "Course Name",
      section: "Section (Optional)",
      dayOfWeek: "Day of Week",
      room: "Room/Location",
      startTime: "Start Time",
      endTime: "End Time",
      duration: "Duration (minutes)",
      startDate: "Start Date",
      endDate: "End Date",
      studentLimit: "Student Limit per Slot (Optional)",
      csvFile: "Import Students (CSV)",
    },
    placeholders: {
      courseName: "e.g., Computer Science 101",
      section: "e.g., A1, B2",
      room: "e.g., Room 201",
      duration: "e.g., 60",
      studentLimit: "e.g., 1",
    },
    hints: {
      studentLimit: "Maximum number of students allowed per booking slot. Default is 1.",
    },
    csv: {
      label: "Import Students (CSV)",
      dragDrop: "Drag & drop a CSV file here, or click to browse",
      selectedFile: "Selected file:",
      removeFile: "Remove",
      hint: "CSV should contain columns: First name, Last name, ID number, Email address",
      optional: "Optional - You can add students later",
      uploading: "Uploading CSV...",
      uploadSuccess: "CSV uploaded successfully!",
      uploadError: "Failed to upload CSV.",
      studentsCreated: "students added",
      errors: "errors encountered",
    },
    dayOptions: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    buttons: {
      create: "Create Course",
      creating: "Creating...",
    },
    success: "Course created successfully!",
    errors: {
      courseNameRequired: "Course name is required.",
      dayRequired: "Please select a day of week.",
      startTimeRequired: "Start time is required.",
      endTimeRequired: "End time is required.",
      startDateRequired: "Start date is required.",
      endDateRequired: "End date is required.",
      roomRequired: "Room/Location is required.",
      failed: "Failed to create course. Please try again.",
    },
    recentSlots: "Recent Slots",
  },

  // View Courses Page Strings
  view: {
    title: "Your Courses",
    description: "View and manage all your office hour slots.",
    loading: "Loading your courses...",
    noSlots: "No Courses Yet",
    noSlotsDescription:
      "Use the Add Course button to start building your schedule.",
    slotsFound: "slots found",
    sortBy: "Sort By",
    search: "Search",
    searchPlaceholder: "Search by course, section, or room",
    statusFilter: "Status",
    statusOptions: {
      all: "All",
      active: "Active",
      inactive: "Inactive",
    },
    sortOptions: {
      courseName: "Course Name",
      dayOfWeek: "Day of Week",
      startTime: "Start Time",
    },
    section: "Section",
    day: "Day",
    time: "Time",
    room: "Room",
    studentLimit: "Student Limit",
    dates: "Dates",
    id: "ID",
    duration: "Duration (minutes)",
    createdAt: "Created At",
    actions: "Actions",
    listTitle: "Course List",
    manageStudentsComingSoon: "Student management is coming soon.",
  
    to: "to",
    backToList: "Back to list",
    active: "Active",
    inactive: "Inactive",
    refresh: "Refresh",
    buttons: {
      edit: "Edit",
      delete: "Delete",
      activate: "Activate",
      deactivate: "Deactivate",
      toggling: "Toggling...",
      manageStudents: "Manage Allowed Students",
      addCourse: "Add Course",
      saving: "Saving...",
    },
  },

  // Edit Courses Page Strings
  edit: {
    title: "Edit Course",
    description: "Modify the details of your office hour slot.",
    selectASlot: "Select a Course to Edit",
    selectDescription:
      "Choose a course from the View Courses tab or select one below.",
    availableSlots: "Available Courses:",
    editing: "Currently Editing",
    deselectSlot: "Deselect",
    fields: {
      courseName: "Course Name",
      section: "Section (Optional)",
      dayOfWeek: "Day of Week",
      room: "Room/Location",
      startTime: "Start Time",
      endTime: "End Time",
      duration: "Duration (minutes)",
      startDate: "Start Date",
      endDate: "End Date",
      studentLimit: "Student Limit per Slot (Optional)",
    },
    placeholders: {
      duration: "e.g., 60",
      studentLimit: "e.g., 1",
    },
    hints: {
      studentLimit: "Maximum number of students allowed per booking slot.",
    },
    dayOptions: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    buttons: {
      update: "Update Course",
      updating: "Updating...",
    },
    success: "Course updated successfully!",
    errors: {
      noSlotSelected: "Please select a course to edit.",
      courseNameRequired: "Course name is required.",
      dayRequired: "Please select a day of week.",
      startTimeRequired: "Start time is required.",
      endTimeRequired: "End time is required.",
      startDateRequired: "Start date is required.",
      endDateRequired: "End date is required.",
      roomRequired: "Room/Location is required.",
      failed: "Failed to update course. Please try again.",
    },
  },

  // Delete Courses Page Strings
  delete: {
    title: "Delete Course",
    description: "Permanently remove a course from your schedule.",
    selectASlot: "Select a Course to Delete",
    selectDescription:
      "Choose a course from the View Courses tab or select one below.",
    availableSlots: "Available Courses:",
    deselectSlot: "Deselect",
    confirmMessage: "Are you sure? This action cannot be undone.",
    warning: {
      title: "⚠️ Warning",
      message:
        "Deleting this course will remove all associated information. Students with bookings will be notified.",
    },
    details: {
      section: "Section",
      day: "Day",
      time: "Time",
      room: "Room",
      dates: "Dates",
      to: "to",
    },
    buttons: {
      delete: "Delete Course",
      confirmDelete: "Confirm Delete",
      deleting: "Deleting...",
      cancel: "Cancel",
    },
    success: "Course deleted successfully!",
    errors: {
      noSlotSelected: "Please select a course to delete.",
      failed: "Failed to delete course. Please try again.",
    },
  },
  modals: {
    createTitle: "Create New Course",
    editTitle: "Edit Course",
    deleteTitle: "Delete Course",
    manageStudentsTitle: "Manage Allowed Students",
    comingSoon: "This feature is coming soon.",
    close: "Close",
  },

  // Warning Modal Strings
  warningModal: {
    editTitle: "Confirm Course Edit",
    editMessage: "Editing this course may affect existing student bookings. Changes to date, time, or duration may cancel related bookings.",
    editWarning: "This action might cancel some student bookings and could take a moment to process.",
    editConfirm: "Continue Editing",
    editCancel: "Cancel",

    deactivateTitle: "Confirm Course Deactivation",
    deactivateMessage: "Deactivating this course will cancel all active student bookings.",
    deactivateWarning: "All students with bookings will be notified about the cancellation. This process might take a while.",
    deactivateConfirm: "Deactivate Course",
    deactivateCancel: "Cancel",

    activateMessage: "Activating this course will make it available for new bookings.",
    activateWarning: "Make sure the course details are correct before activating.",
    activateConfirm: "Activate Course",
  },
};

export default manageCoursesPageStrings;
