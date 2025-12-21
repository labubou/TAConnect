import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import footerStrings from '../../strings/footerStrings';

const TallyFeedbackLink = ({ className = '' }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const ft = footerStrings[language];
  const formId = import.meta.env.VITE_TALLY_FORM_ID || 'nPKe1P';

  const handleClick = (e) => {
    e.preventDefault();
    
    // Wait for Tally to be available, with a small delay to ensure script is loaded
    const openTallyPopup = () => {
      if (typeof window !== 'undefined' && window.Tally) {
        const options = {
          width: 400,
          overlay: true,
          autoClose: 5000,
          emoji: {
            text: '👋',
            animation: 'wave'
          },
          hiddenFields: {
            app_name: 'TA Connect'
          }
        };

        // Add user data if available
        if (user) {
          const email = user.email || '';
          const username = user.username || 
                           (user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '') || 
                           '';
          
          if (email) options.hiddenFields.email = email;
          if (username) options.hiddenFields.username = username;
        }

        window.Tally.openPopup(formId, options);
      } else {
        // Retry after a short delay if Tally isn't loaded yet
        setTimeout(openTallyPopup, 100);
      }
    };

    openTallyPopup();
  };

  return (
    <a 
      href="#" 
      onClick={handleClick}
      className={className || "hover:underline"}
    >
      {ft.feedback}
    </a>
  );
};

export default TallyFeedbackLink;
