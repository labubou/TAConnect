import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Github, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import Footer from '../../components/General/Footer';
import contactPageStrings from '../../strings/contactPageStrings';
import Logo from '../../assets/Logo.png';

function ContactPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const t = contactPageStrings[language];
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t.form.requiredField;
    }

    if (!formData.email.trim()) {
      newErrors.email = t.form.requiredField;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.form.invalidEmail;
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t.form.requiredField;
    }

    if (!formData.message.trim()) {
      newErrors.message = t.form.requiredField;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      // TODO: Connect to backend contact endpoint
      // Expected backend endpoint: POST /api/contact/ or similar
      // Expected data: { name, email, subject, message }
      // For now, showing success message but backend integration needed

      // Example of what the API call would look like:
      // const response = await fetch('http://localhost:8000/api/contact/', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to send message');
      // }

      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStatus({
        type: 'success',
        message: t.form.successMessage,
      });

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatus({ type: null, message: '' });
      }, 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus({
        type: 'error',
        message: t.form.errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const teamMembers = [
    { name: "Ahmed Fahmy", github: "https://github.com/Ahmeed-Fahmy" },
    { name: "Karim Bassem", github: "https://github.com/Kbassem10" },
    { name: "Nadeem Diaa", github: "https://github.com/NadeemDiaa" },
    { name: "Omar Isleem", github: "https://github.com/omarisleem" },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navigation */}
      <nav className={`${isDark ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <ChevronLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>
            <img src={Logo} alt="TA Connect Logo" className="h-12 w-auto object-contain" />
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t.title}
          </h1>
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Form */}
          <div className={`lg:col-span-2 p-8 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            {/* Status Messages */}
            {status.type && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                status.type === 'success'
                  ? isDark ? 'bg-green-900 border border-green-700' : 'bg-green-50 border border-green-200'
                  : isDark ? 'bg-red-900 border border-red-700' : 'bg-red-50 border border-red-200'
              }`}>
                {status.type === 'success' ? (
                  <CheckCircle size={20} className={isDark ? 'text-green-400' : 'text-green-600'} />
                ) : (
                  <AlertCircle size={20} className={isDark ? 'text-red-400' : 'text-red-600'} />
                )}
                <p className={status.type === 'success' ? isDark ? 'text-green-300' : 'text-green-800' : isDark ? 'text-red-300' : 'text-red-800'}>
                  {status.message}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t.form.name}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    errors.name
                      ? isDark ? 'border-red-500 bg-gray-700 text-white' : 'border-red-500 bg-white text-gray-900'
                      : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-600`}
                  disabled={loading}
                />
                {errors.name && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t.form.email}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    errors.email
                      ? isDark ? 'border-red-500 bg-gray-700 text-white' : 'border-red-500 bg-white text-gray-900'
                      : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-600`}
                  disabled={loading}
                />
                {errors.email && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Subject Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t.form.subject}
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    errors.subject
                      ? isDark ? 'border-red-500 bg-gray-700 text-white' : 'border-red-500 bg-white text-gray-900'
                      : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-600`}
                  disabled={loading}
                />
                {errors.subject && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t.form.message}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  className={`w-full px-4 py-2 rounded-lg border transition-colors resize-none ${
                    errors.message
                      ? isDark ? 'border-red-500 bg-gray-700 text-white' : 'border-red-500 bg-white text-gray-900'
                      : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-600`}
                  disabled={loading}
                />
                {errors.message && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                  loading
                    ? isDark ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {loading ? t.form.sending : t.form.send}
              </button>
            </form>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            {/* Direct Contact */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t.team.title}
              </h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t.team.description}
              </p>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <a
                    key={member.name}
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}
                  >
                    <Github size={16} />
                    {member.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Email Contact */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Mail size={20} />
                {t.contactInfo.email}
              </h3>
              <a
                href="mailto:contact@taconnect.com"
                className={`text-sm break-all ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                contact@taconnect.com
              </a>
            </div>

            {/* GitHub */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Github size={20} />
                {t.contactInfo.github}
              </h3>
              <a
                href="https://github.com/Kbassem10/TAConnect"
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm transition-colors ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                github.com/Kbassem10/TAConnect
              </a>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className={`text-3xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t.faq.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {t.faq.items.map((item, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
              >
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.question}
                </h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default ContactPage;
