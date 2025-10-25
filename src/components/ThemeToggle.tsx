"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className='relative inline-flex items-center justify-center p-1 rounded-xl bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700/90 transition-all duration-300 shadow-sm dark:shadow-md border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 dark:focus:ring-offset-gray-900'
    >
      <span className='sr-only'>
        {isDark ? "Enable light theme" : "Enable dark theme"}
      </span>
      <span
        className={`flex items-center justify-center w-9 h-9 rounded-lg transform transition-all duration-300 ${
          isDark
            ? "bg-gradient-to-br from-slate-700 to-slate-800"
            : "bg-gradient-to-br from-yellow-50 to-amber-100"
        }`}
      >
        <Sun
          className={`w-5 h-5 text-amber-500 transition-transform duration-300 ${
            isDark
              ? "-translate-y-2 scale-75 opacity-0"
              : "translate-y-0 scale-100 opacity-100"
          }`}
        />
        <Moon
          className={`absolute w-5 h-5 text-sky-300 transition-transform duration-300 ${
            isDark
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-2 scale-75 opacity-0"
          }`}
        />
      </span>
    </button>
  );
}
