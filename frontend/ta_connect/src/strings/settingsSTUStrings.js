export const settingsStrings = {
  en: {
    header: {
      title: 'Settings',
      subtitle: 'Manage your notifications and profile',
    },
    
    tabs: {
      emailPreferences: 'Notifications Preferences',
      profile: 'Profile',
    },
    
    buttons: {
      reset: 'Reset to Default',
      save: 'Save Preferences',
      saving: 'Saving...',
    },
    
    bookingSection: {
      title: 'Email on Booking Confirmation',
      subtitle: 'Get notified when you successfully book an office hour',
      optionTitle: 'Email on Booking Confirmation',
      optionDescription: 'Receive email confirmation when you book an office hour session',
    },
    
    cancellationSection: {
      title: 'Email on Cancellation',
      subtitle: 'Get notified when you cancel a booking',
      optionTitle: 'Email on Cancellation',
      optionDescription: 'Receive email confirmation when you cancel a booking',
    },
    
    updateSection: {
      title: 'Email on Booking Update',
      subtitle: 'Get notified when you update a booking',
      optionTitle: 'Email on Booking Update',
      optionDescription: 'Receive email confirmation when you update or reschedule a booking',
    },
    
    status: {
      enabled: 'Enabled',
    },

    pushNotifications: {
      deviceNote:
        'Push notifications work on only one device per account. To switch devices, simply disable notifications and then enable them again on the device you want to use (you can do this directly from the new device).',
    },
    
    messages: {
      loadError: 'Failed to load preferences. Please try again.',
      saveSuccess: 'Preferences saved successfully',
      saveError: 'Failed to save preferences. Please try again.',
      resetSuccess: 'Preferences reset to default',
      loading: 'Loading preferences...',
    },

    // Google Calendar Integration strings
    googleCalendar: {
      title: 'Google Calendar Integration',
      subtitle: 'Sync your bookings with Google Calendar',
      connectButton: 'Connect Google Calendar',
      connecting: 'Connecting...',
      connectDescription: 'Connect any Google account to sync your bookings with Google Calendar',
      enableSync: 'Enable Calendar Sync',
      syncDescription: 'Automatically add booking events to your Google Calendar',
      connectedTo: 'Connected to',
      connectionSuccess: 'Google Calendar connected successfully!',
      connectionError: 'Failed to connect Google Calendar. Please try again.',
      connectionCancelled: 'Google Calendar connection cancelled or failed.',
      urlError: 'Failed to get Google Calendar connection URL. Please try again.',
      toggleEnabled: 'Google Calendar enabled successfully.',
      toggleDisabled: 'Google Calendar disabled successfully.',
      toggleError: 'Failed to update Google Calendar settings. Please try again.',
      gettingUrl: 'Getting Google Calendar connection URL...',
      enabling: 'Enabling Google Calendar...',
      disabling: 'Disabling Google Calendar...',
      disconnectButton: 'Disconnect Google Calendar',
      disconnecting: 'Disconnecting...',
      disconnectSuccess: 'Google Calendar disconnected successfully.',
      disconnectError: 'Failed to disconnect Google Calendar. Please try again.',
      disconnectConfirm: 'Are you sure you want to disconnect Google Calendar? This will remove all calendar integration.',
    },

    // Profile tab strings
    profilePage: {
      title: "Profile",
      description: "Update your profile information below.",
      personalInformation: "Personal Information",
      username: "Username",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      save: "Save",
      saving: "Saving...",
      success: "Profile updated successfully",
      unexpectedError: "Unexpected response from server",
      failed: "Failed to update",
      verified: "Verified",
      student: "Student",
      change: "Change",
      changePassword: "Change Password",
      dangerZone: "Danger Zone",
      deleteAccountButton: "Delete Account",
    },

    emailModal: {
      title: "Change Email Address",
      newEmail: "New Email Address",
      confirmEmail: "Confirm Email Address",
      newEmailRequired: "New email is required",
      invalidEmail: "Invalid email format",
      emailMustDiffer: "New email must be different from current email",
      confirmEmailRequired: "Please confirm your email",
      emailsDoNotMatch: "Emails do not match",
      importantNotice: "Important:",
      verificationNotice: "A verification email will be sent to your new address. You must verify it to complete the change.",
      cancel: "Cancel",
      sending: "Sending...",
      sendVerification: "Send Verification",
      successMessage: "Verification email sent! Please check your inbox.",
      errorMessage: "Failed to request email change. Please try again.",
    },

    passwordModal: {
      title: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      currentPasswordRequired: "Current password is required",
      newPasswordRequired: "New password is required",
      passwordMinLength: "Password must be at least 8 characters",
      passwordUppercase: "Password must contain at least one uppercase letter",
      passwordLowercase: "Password must contain at least one lowercase letter",
      passwordNumber: "Password must contain at least one number",
      confirmPasswordRequired: "Please confirm your password",
      passwordsDoNotMatch: "Passwords do not match",
      cancel: "Cancel",
      changing: "Changing...",
      changePassword: "Change Password",
      successMessage: "Password changed successfully!",
      errorMessage: "Failed to change password. Please try again.",
      rateLimitError: "Too many password change attempts. Please wait a few minutes and try again.",
    },

    deleteModal: {
      title: "Delete Account",
      warning: "Warning: This action cannot be undone!",
      description: "Deleting your account will permanently remove all your data, including bookings and settings. Please enter your password to confirm.",
      password: "Current Password",
      passwordRequired: "Password is required to delete account",
      cancel: "Cancel",
      deleting: "Deleting...",
      deleteAccount: "Delete Account",
      successMessage: "Account deleted successfully. You will be logged out.",
      errorMessage: "Failed to delete account. Please check your password and try again.",
    },
  },
  ar: {
    header: {
      title: 'الإعدادات',
      subtitle: 'إدارة تفضيلاتك وإشعاراتك',
    },
    
    tabs: {
      emailPreferences: 'تفضيلات البريد الإلكتروني',
      profile: 'الملف الشخصي',
    },
    
    buttons: {
      reset: 'استعادة الافتراضي',
      save: 'حفظ التغييرات',
      saving: 'جاري الحفظ...',
    },
    
    bookingSection: {
      title: 'إشعارات تأكيد الحجز',
      subtitle: 'تلقي إشعار عند حجز ساعة مكتبية بنجاح',
      optionTitle: 'إرسال إشعار عند تأكيد الحجز',
      optionDescription: 'ستتلقى رسالة تأكيد عبر البريد الإلكتروني عند حجز موعد جديد',
    },
    
    cancellationSection: {
      title: 'إشعارات إلغاء الحجز',
      subtitle: 'تلقي إشعار عند إلغاء حجز قائم',
      optionTitle: 'إرسال إشعار عند الإلغاء',
      optionDescription: 'ستتلقى رسالة تأكيد عبر البريد الإلكتروني عند إلغاء موعد',
    },
    
    updateSection: {
      title: 'إشعارات تحديث الحجز',
      subtitle: 'تلقي إشعار عند تعديل تفاصيل الحجز',
      optionTitle: 'إرسال إشعار عند التحديث',
      optionDescription: 'ستتلقى رسالة تأكيد عبر البريد الإلكتروني عند تعديل أو إعادة جدولة موعد',
    },
    
    status: {
      enabled: 'مفعّل',
    },

    pushNotifications: {
      deviceNote:
        'تعمل إشعارات الدفع على جهاز واحد فقط لكل حساب. لنقل الإشعارات إلى جهاز آخر، قم بإيقاف تفعيل الإشعارات ثم إعادة تفعيلها على الجهاز الذي تريد استخدامه (يمكنك القيام بذلك مباشرة من الجهاز الجديد).',
    },
    
    messages: {
      loadError: 'تعذر تحميل التفضيلات. يرجى المحاولة مرة أخرى.',
      saveSuccess: 'تم حفظ التفضيلات بنجاح',
      saveError: 'تعذر حفظ التفضيلات. يرجى المحاولة مرة أخرى.',
      resetSuccess: 'تم استعادة التفضيلات الافتراضية',
      loading: 'جاري تحميل التفضيلات...',
    },

    // Google Calendar Integration strings
    googleCalendar: {
      title: 'تكامل تقويم جوجل',
      subtitle: 'قم بمزامنة حجوزاتك مع تقويم جوجل',
      connectButton: 'اتصل بـ Google Calendar',
      connecting: 'جاري الاتصال...',
      connectDescription: 'قم بتوصيل أي حساب Google لمزامنة حجوزاتك مع تقويم جوجل',
      enableSync: 'تمكين مزامنة التقويم',
      syncDescription: 'إضافة مواعيد الحجز تلقائياً إلى تقويم Google الخاص بك',
      connectedTo: 'متصل بـ',
      connectionSuccess: 'تم الاتصال بـ Google Calendar بنجاح!',
      connectionError: 'فشل الاتصال بـ Google Calendar. يرجى المحاولة مرة أخرى.',
      connectionCancelled: 'تم إلغاء أو فشل الاتصال بـ Google Calendar.',
      urlError: 'فشل الحصول على رابط الاتصال بـ Google Calendar. يرجى المحاولة مرة أخرى.',
      toggleEnabled: 'تم تفعيل Google Calendar بنجاح.',
      toggleDisabled: 'تم تعطيل Google Calendar بنجاح.',
      toggleError: 'فشل تحديث إعدادات Google Calendar. يرجى المحاولة مرة أخرى.',
      gettingUrl: 'جاري الحصول على رابط الاتصال بـ Google Calendar...',
      enabling: 'جاري تفعيل Google Calendar...',
      disabling: 'جاري تعطيل Google Calendar...',
      disconnectButton: 'قطع الاتصال بـ Google Calendar',
      disconnecting: 'جاري قطع الاتصال...',
      disconnectSuccess: 'تم قطع الاتصال بـ Google Calendar بنجاح.',
      disconnectError: 'فشل قطع الاتصال بـ Google Calendar. يرجى المحاولة مرة أخرى.',
      disconnectConfirm: 'هل أنت متأكد من أنك تريد قطع الاتصال بـ Google Calendar؟ سيؤدي هذا إلى إزالة جميع تكاملات التقويم.',
    },

    // Profile tab strings
    profilePage: {
      title: "الملف الشخصي",
      description: "حدّث معلومات ملفك الشخصي أدناه.",
      personalInformation: "المعلومات الشخصية",
      username: "اسم المستخدم",
      firstName: "الاسم الأول",
      lastName: "الاسم الأخير",
      email: "البريد الإلكتروني",
      save: "حفظ",
      saving: "جاري الحفظ...",
      success: "تم تحديث الملف الشخصي بنجاح",
      unexpectedError: "استجابة غير متوقعة من الخادم",
      failed: "فشل التحديث",
      verified: "مؤكد",
      student: "طالب",
      change: "تغيير",
      changePassword: "تغيير كلمة المرور",
      dangerZone: "منطقة الخطر",
      deleteAccountButton: "حذف الحساب",
    },

    emailModal: {
      title: "تغيير عنوان البريد الإلكتروني",
      newEmail: "عنوان البريد الإلكتروني الجديد",
      confirmEmail: "تأكيد عنوان البريد الإلكتروني",
      newEmailRequired: "البريد الإلكتروني الجديد مطلوب",
      invalidEmail: "صيغة بريد إلكتروني غير صالحة",
      emailMustDiffer: "يجب أن يكون البريد الإلكتروني الجديد مختلفًا عن البريد الحالي",
      confirmEmailRequired: "يرجى تأكيد بريدك الإلكتروني",
      emailsDoNotMatch: "عناوين البريد الإلكتروني غير متطابقة",
      importantNotice: "مهم:",
      verificationNotice: "سيتم إرسال بريد إلكتروني للتحقق إلى عنوانك الجديد. يجب عليك التحقق منه لإكمال التغيير.",
      cancel: "إلغاء",
      sending: "جاري الإرسال...",
      sendVerification: "إرسال التحقق",
      successMessage: "تم إرسال بريد التحقق! يرجى فحص بريدك الوارد.",
      errorMessage: "فشل طلب تغيير البريد الإلكتروني. يرجى المحاولة مرة أخرى.",
    },

    passwordModal: {
      title: "تغيير كلمة المرور",
      currentPassword: "كلمة المرور الحالية",
      newPassword: "كلمة المرور الجديدة",
      confirmPassword: "تأكيد كلمة المرور",
      currentPasswordRequired: "كلمة المرور الحالية مطلوبة",
      newPasswordRequired: "كلمة المرور الجديدة مطلوبة",
      passwordMinLength: "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل",
      passwordUppercase: "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل",
      passwordLowercase: "يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل",
      passwordNumber: "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل",
      confirmPasswordRequired: "يرجى تأكيد كلمة المرور",
      passwordsDoNotMatch: "كلمات المرور غير متطابقة",
      cancel: "إلغاء",
      changing: "جاري التغيير...",
      changePassword: "تغيير كلمة المرور",
      successMessage: "تم تغيير كلمة المرور بنجاح!",
      errorMessage: "فشل تغيير كلمة المرور. يرجى المحاولة مرة أخرى.",
      rateLimitError: "محاولات كثيرة جداً لتغيير كلمة المرور. يرجى الانتظار بضع دقائق والمحاولة مرة أخرى.",
    },

    deleteModal: {
      title: "حذف الحساب",
      warning: "تحذير: لا يمكن التراجع عن هذا الإجراء!",
      description: "سيؤدي حذف حسابك إلى إزالة جميع بياناتك بشكل دائم، بما في ذلك الحجوزات والإعدادات. يرجى إدخال كلمة المرور للتأكيد.",
      password: "كلمة المرور الحالية",
      passwordRequired: "كلمة المرور مطلوبة لحذف الحساب",
      cancel: "إلغاء",
      deleting: "جارٍ الحذف...",
      deleteAccount: "حذف الحساب",
      successMessage: "تم حذف الحساب بنجاح. سيتم تسجيل خروجك.",
      errorMessage: "فشل حذف الحساب. يرجى التحقق من كلمة المرور والمحاولة مرة أخرى.",
    },
  },
};
