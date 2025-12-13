// src/strings/contactPageStrings.js
const contactPageStrings = {
  en: {
    title: "Contact Us",
    subtitle: "Get in touch with our team",
    contactInfo: {
      email: "Email",
      location: "Location",
      github: "GitHub Repository",
    },
    form: {
      name: "Full Name",
      email: "Email Address",
      subject: "Subject",
      message: "Message",
      send: "Send Message",
      sending: "Sending...",
      successMessage: "Message sent successfully! We'll get back to you soon.",
      errorMessage: "Failed to send message. Please try again.",
      requiredField: "This field is required",
      invalidEmail: "Please enter a valid email address",
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          question: "How do I book an office hour session?",
          answer: "Log in to your account, navigate to the booking page, select a TA and available time slot, then confirm your booking.",
        },
        {
          question: "Can I reschedule my booking?",
          answer: "Yes, you can modify your bookings from your manage bookings page until 24 hours before the session.",
        },
        {
          question: "How do I get notifications?",
          answer: "Enable notifications in your settings to receive alerts about booking confirmations and reminders.",
        },
        {
          question: "Is the service free?",
          answer: "Yes, TAConnect is a free service provided to help students connect with teaching assistants.",
        },
      ],
    },
    team: {
      title: "Connect with Our Team",
      description: "Have questions? Reach out to our team members directly on GitHub.",
    },
  },
  ar: {
    title: "تواصل معنا",
    subtitle: "التواصل مع فريقنا",
    contactInfo: {
      email: "البريد الإلكتروني",
      location: "الموقع",
      github: "مستودع GitHub",
    },
    form: {
      name: "الاسم الكامل",
      email: "عنوان البريد الإلكتروني",
      subject: "الموضوع",
      message: "الرسالة",
      send: "إرسال الرسالة",
      sending: "جاري الإرسال...",
      successMessage: "تم إرسال الرسالة بنجاح! سنرد عليك قريباً.",
      errorMessage: "فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.",
      requiredField: "هذا الحقل مطلوب",
      invalidEmail: "يرجى إدخال عنوان بريد إلكتروني صحيح",
    },
    faq: {
      title: "الأسئلة الشائعة",
      items: [
        {
          question: "كيف أحجز جلسة ساعة مكتب؟",
          answer: "قم بتسجيل الدخول إلى حسابك، انتقل إلى صفحة الحجز، اختر معيداً وفترة زمنية متاحة، ثم أكد حجزك.",
        },
        {
          question: "هل يمكنني إعادة جدولة حجزي؟",
          answer: "نعم، يمكنك تعديل حجوزاتك من صفحة إدارة الحجوزات حتى 24 ساعة قبل الجلسة.",
        },
        {
          question: "كيف أتلقى الإشعارات؟",
          answer: "فعّل الإشعارات في الإعدادات لتلقي تنبيهات بشأن تأكيد الحجوزات والتذكيرات.",
        },
        {
          question: "هل الخدمة مجانية؟",
          answer: "نعم، TAConnect خدمة مجانية توفرها لمساعدة الطلاب على التواصل مع المعيدين.",
        },
      ],
    },
    team: {
      title: "التواصل مع فريقنا",
      description: "هل لديك أسئلة؟ تواصل مع أعضاء فريقنا مباشرة على GitHub.",
    },
  },
};

export default contactPageStrings;
