import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 shadow hover:shadow-lg transition"
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
