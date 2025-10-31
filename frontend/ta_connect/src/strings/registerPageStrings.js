const REGISTER_PAGE = {
  navbar: {
    appName: "TA Connect",
    login: "Login",
  },
  heading: {
    title: "Create Account",
    subtitle: "Join TA Connect and start scheduling office hours",
  },
  form: {
    firstName: "First Name",
    firstNamePlaceholder: "Enter your first name",
    lastName: "Last Name",
    lastNamePlaceholder: "Enter your last name",
    username: "Username",
    usernamePlaceholder: "Choose a username",
    email: "Email Address",
    emailPlaceholder: "Enter your email",
    password: "Password",
    passwordPlaceholder: "Create a password",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter your password",
    userType: "I am a",
    userTypeStudent: "Student",
    userTypeInstructor: "Teaching Assistant",
    registerButton: "Create Account",
    registeringButton: "Creating Account...",
  },
  validation: {
    firstNameRequired: "First name is required",
    lastNameRequired: "Last name is required",
    usernameRequired: "Username is required",
    emailRequired: "Email is required",
    invalidEmail: "Please enter a valid email address",
    passwordRequired: "Password is required",
    passwordMinLength: "Password must be at least 8 characters",
    confirmPasswordRequired: "Please confirm your password",
    passwordsDoNotMatch: "Passwords do not match",
    userTypeRequired: "Please select your user type",
  },
  messages: {
    success: "Account created successfully! Redirecting to login...",
    error: "Failed to create account. Please try again.",
  },
  footer: {
    haveAccount: "Already have an account?",
    loginLink: "Login here",
  },
};

export default REGISTER_PAGE;
