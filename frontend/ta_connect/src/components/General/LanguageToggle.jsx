import { useLanguage } from '../../contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 rounded-lg bg-gray-400 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2"
      aria-label="Toggle Language"
    >
      <span className="text-sm font-medium">
        {language === 'en' ? ' AR' : ' EN'}
      </span>
    </button>
  );
}
