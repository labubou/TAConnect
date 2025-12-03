export const bookPageStrings = {
  en: {
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
        selectTime: 'Select Time',
        noAvailableTimes: 'No available times for this date',
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
      searchingInstructors: 'Searching for instructors...',
      loadingSlots: 'Loading time slots...',
      loadingTimes: 'Loading available times...',
      creatingBooking: 'Creating your booking...',
    },

    errors: {
      failedLoadTimes: 'Failed to load available times for this date',
      selectAll: 'Please select a slot, date, and time',
      slotNotFound: 'The requested time slot was not found. Please select a slot manually.',
      failedLoadFromLink: 'Failed to load booking details from link. Please search manually.',
    },
    
    successModal: {
      title: 'Booking Confirmed!',
      emailSent: 'A confirmation has been sent to your email.',
      emailDisabled: 'Your booking is confirmed. Email notifications are disabled in your preferences.',
      doneButton: 'Done',
    },

    preselected: {
      title: 'Instructor and slot pre-selected from link',
      description: 'Booking with {instructor} for {course} on {day}. Just select your preferred date and time below.',
      officeHours: 'office hours',
    },
  },
  ar: {
    header: {
      title: 'حجز الساعات المكتبية',
      subtitle: 'ابحث عن المواعيد المتاحة واحجز موعدك مع المعيدين',
    },
    
    steps: {
      step1: {
        number: '١',
        title: 'اختر المعيد',
        searchPlaceholder: 'ابحث بالاسم...',
        searchButton: 'بحث',
        noInstructors: 'لا يوجد معيدون',
        minCharsHint: 'اكتب حرفين على الأقل للبحث',
        noResultsFor: 'لم يُعثر على معيدين بـ',
        tryDifferent: 'جرب كلمة بحث مختلفة',
        startTyping: 'ابدأ الكتابة للبحث عن المعيدين',
      },
      
      step2: {
        number: '٢',
        title: 'اختر الموعد المناسب',
        selectInstructorFirst: 'يرجى اختيار المعيد أولاً',
        noSlots: 'لا توجد مواعيد متاحة لهذا المعيد',
        inactive: 'غير نشط',
        officeHours: 'ساعات مكتبية',
        online: 'عبر الإنترنت',
      },
      
      step3: {
        number: '٣',
        title: 'اختر التاريخ والوقت',
        selectSlotFirst: 'يرجى اختيار الموعد أولاً',
        noDates: 'لا توجد تواريخ متاحة',
        selectTime: 'اختر الوقت',
        noAvailableTimes: 'لا توجد أوقات متاحة لهذا التاريخ',
        summaryTitle: 'ملخص الحجز',
        confirmButton: 'تأكيد الحجز',
        bookingButton: 'جارٍ الحجز...',
      },
    },
    
    messages: {
      errorFetchInstructors: 'فشل تحميل قائمة المعيدين. يرجى المحاولة مرة أخرى.',
      errorFetchSlots: 'فشل تحميل مواعيد المعيد.',
      errorSelectSlotDate: 'يرجى اختيار الموعد والتاريخ',
      errorBooking: 'فشل إنشاء الحجز',
      successBooking: 'تم الحجز بنجاح! تحقق من بريدك الإلكتروني للحصول على التأكيد.',
      loading: 'جارٍ التحميل...',
      searchingInstructors: 'جارٍ البحث عن المعيدين...',
      loadingSlots: 'جارٍ تحميل المواعيد...',
      loadingTimes: 'جارٍ تحميل الأوقات المتاحة...',
      creatingBooking: 'جارٍ إنشاء الحجز...',
    },

    errors: {
      failedLoadTimes: 'فشل تحميل الأوقات المتاحة لهذا التاريخ',
      selectAll: 'يرجى اختيار الموعد والتاريخ والوقت',
      slotNotFound: 'لم يتم العثور على الموعد المطلوب. يرجى اختيار موعد يدويًا.',
      failedLoadFromLink: 'فشل تحميل تفاصيل الحجز من الرابط. يرجى البحث يدويًا.',
    },
    
    successModal: {
      title: 'تم تأكيد الحجز!',
      emailSent: 'تم إرسال رسالة التأكيد إلى بريدك الإلكتروني.',
      emailDisabled: 'تم تأكيد حجزك. إشعارات البريد الإلكتروني معطلة في إعداداتك.',
      doneButton: 'تم',
    },

    preselected: {
      title: 'تم تحديد المعيد والموعد مسبقًا من الرابط',
      description: 'الحجز مع {instructor} لـ {course} يوم {day}. فقط اختر التاريخ والوقت المفضل أدناه.',
      officeHours: 'الساعات المكتبية',
    },
  },
};
