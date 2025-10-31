import strings from '../strings/landingPageStrings';

function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-gray-800 py-6 mt-12 shadow-inner">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-gray-600 dark:text-gray-300 text-sm">
        <p>&copy; {new Date().getFullYear()} {strings.footer.copyright}</p>
        <div className="flex space-x-4 mt-2 sm:mt-0">
          <a href="https://github.com/Kbassem10/TAConnect" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">
            {strings.footer.github}
          </a>
          <a href="/about" className="hover:text-blue-600 transition">
            {strings.footer.about}
          </a>
          <a href="/contact" className="hover:text-blue-600 transition">
            {strings.footer.contact}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
