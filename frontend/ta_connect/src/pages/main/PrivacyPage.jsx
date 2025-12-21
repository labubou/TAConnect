import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Footer from '../../components/General/Footer';
import privacyPageStrings from '../../strings/privacyPageStrings';
import Logo from '../../assets/Logo.png';

function PrivacyPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const t = privacyPageStrings[language];
  const isDark = theme === 'dark';

  const sections = [
    t.sections.introduction,
    t.sections.informationCollection,
    t.sections.informationUse,
    t.sections.informationSharing,
    t.sections.dataSecurity,
    t.sections.cookies,
    t.sections.userRights,
    t.sections.dataRetention,
    t.sections.childrenPrivacy,
    t.sections.changes,
    t.sections.contact,
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
              <span className="text-sm font-medium">{language === 'ar' ? 'رجوع' : 'Back'}</span>
            </button>
            <img src={Logo} alt="TA Connect Logo" className="h-12 w-auto object-contain" />
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t.title}
          </h1>
          <p className={`text-xl mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t.subtitle}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {t.lastUpdated}
          </p>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div 
              key={index}
              className={`p-8 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
            >
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {section.title}
              </h2>
              <p className={`leading-relaxed whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default PrivacyPage;

