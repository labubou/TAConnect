import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { Github, Mail, MapPin } from 'lucide-react';
import landingPageStrings from '../../strings/landingPageStrings';
import footerStrings from '../../strings/footerStrings';

function Footer() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const t = landingPageStrings[language];
  const ft = footerStrings[language];
  
  const currentYear = new Date().getFullYear();
  const isDark = theme === 'dark';

  const teamMembers = [
    {
      name: "Ahmed Fahmy",
      github: "https://github.com/Ahmeed-Fahmy",
    },
    {
      name: "Karim Bassem",
      github: "https://github.com/Kbassem10",
    },
    {
      name: "Nadeem Diaa",
      github: "https://github.com/NadeemDiaa",
    },
    {
      name: "Omar Isleem",
      github: "https://github.com/omarisleem",
    },
  ];

  return (
    <footer className={`w-full mt-12 transition-colors duration-300 ${isDark ? 'bg-gray-900 border-t border-gray-800' : 'bg-gradient-to-b from-white to-gray-50 border-t border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Brand section */}
          <div className="flex flex-col">
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              TA<span className="text-blue-600">Connect</span>
            </h3>
            <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {ft.teamDescription}
            </p>
            <div className={`flex items-center space-x-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <MapPin size={16} />
              <span>{ft.address}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`text-sm font-semibold mb-4 uppercase tracking-wide ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {ft.quickLinks}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/about" 
                  className={`text-sm transition-colors hover:text-blue-600 ${isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600'}`}
                >
                  {t.footer.about}
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className={`text-sm transition-colors hover:text-blue-600 ${isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600'}`}
                >
                  {t.footer.contact}
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/Kbassem10/TAConnect" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`text-sm transition-colors hover:text-blue-600 flex items-center space-x-1 ${isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600'}`}
                >
                  <Github size={14} />
                  <span>{t.footer.github}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Team */}
          <div>
            <h4 className={`text-sm font-semibold mb-4 uppercase tracking-wide ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {ft.team}
            </h4>
            <ul className="space-y-2">
              {teamMembers.map((member) => (
                <li key={member.name}>
                  <a 
                    href={member.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`text-sm transition-colors hover:text-blue-600 ${isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600'}`}
                  >
                    {member.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>


        </div>

        {/* Divider */}
        <div className={`my-8 ${isDark ? 'border-gray-800' : 'border-gray-200'} border-t`}></div>

        {/* Bottom section */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            &copy; {currentYear} {ft.copyright}
          </p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <a 
              href="https://github.com/labubou/TAConnect" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`transition-colors hover:text-blue-600 ${isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600'}`}
              title="Visit our GitHub repository"
            >
              <Github size={20} />
            </a>
            <a 
              href="mailto:taconnect.team@gmail.com" 
              className={`transition-colors hover:text-blue-600 ${isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600'}`}
              title="Send us an email"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
