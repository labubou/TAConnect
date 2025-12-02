import { useLanguage } from '../../contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
      aria-label="Toggle Language"
      title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
    >
      <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-[#366c6b]">
        {language === 'en' ? 'AR' : 'EN'}
      </span>
    </button>
  );
}
