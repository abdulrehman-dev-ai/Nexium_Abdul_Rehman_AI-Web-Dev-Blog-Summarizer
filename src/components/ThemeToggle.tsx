"use client";

import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    console.log('Theme toggle clicked, current theme:', theme);
    toggleTheme();
    // Force a small delay to see the change
    setTimeout(() => {
      console.log('Theme after toggle:', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    }, 100);
  };

  return (
    <motion.button
      onClick={handleToggle}
      className="fixed top-6 right-6 z-50 p-3 rounded-2xl bg-white/30 dark:bg-gray-800/50 backdrop-blur-xl border border-white/40 dark:border-gray-600/50 shadow-2xl hover:bg-white/40 dark:hover:bg-gray-700/60 transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {theme === 'light' ? (
          <Moon className="w-6 h-6 text-gray-700 dark:text-gray-300 drop-shadow-lg" />
        ) : (
          <Sun className="w-6 h-6 text-yellow-500 dark:text-yellow-400 drop-shadow-lg" />
        )}
      </motion.div>
    </motion.button>
  );
}
