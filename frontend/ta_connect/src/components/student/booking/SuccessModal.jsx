import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { bookPageStrings } from '../../../strings/bookPageStrings';

export default function SuccessModal({
  show,
  onClose,
  userEmailPreferences
}) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const strings = bookPageStrings[language];
  const isDark = theme === 'dark';

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200'} rounded-xl shadow-2xl max-w-md w-full p-8 transform transition-all scale-100`}>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2">{strings.successModal.title}</h3>
          <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
            {userEmailPreferences?.email_on_booking 
              ? strings.successModal.emailSent 
              : strings.successModal.emailDisabled}
          </p>
          <button
            onClick={onClose}
            className={`w-full ${isDark ? 'bg-gradient-to-r from-[#366c6b] to-[#1a3535] hover:from-[#2d5857] hover:to-[#152a2a]' : 'bg-gradient-to-r from-[#4a9d9c] to-[#366c6b] hover:from-[#3d8584] hover:to-[#2d5857]'} text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all font-semibold transform hover:scale-[1.02]`}
          >
            {strings.successModal.doneButton}
          </button>
        </div>
      </div>
    </div>
  );
}
