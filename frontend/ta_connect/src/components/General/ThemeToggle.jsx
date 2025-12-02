import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
    >
      <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-[#366c6b]">
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
    </button>
  );
}
