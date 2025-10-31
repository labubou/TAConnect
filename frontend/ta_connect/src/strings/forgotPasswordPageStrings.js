const FORGOT_PASSWORD_PAGE = {
  navbar: {
    appName: "TA Connect",
    login: "Login",
    register: "Register",
  },
  heading: {
    title: "Forgot Password?",
    subtitle: "No worries! Enter your email and we'll send you reset instructions.",
  },
  form: {
    emailLabel: "Email Address *",
    emailPlaceholder: "Enter your email address",
    emailHelper: "Enter the email associated with your account",
    sendButton: "Send Reset Link",
    sendingButton: "Sending...",
  },
  validation: {
    emptyEmail: "Please enter your email address",
    invalidEmail: "Please enter a valid email address",
  },
  messages: {
    success: "If an account with this email exists, a reset link has been sent.",
    successHelper: "Please check your email inbox and spam folder.",
    error: "An error occurred. Please try again.",
  },
  backToLogin: "Back to Login",
  help: {
    title: "Need help?",
    tips: [
      "• Make sure you enter the correct email address",
      "• Check your spam folder if you don't receive the email",
      "• Contact support if you continue to have issues",
    ],
  },
};

export default FORGOT_PASSWORD_PAGE;
