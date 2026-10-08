'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const themeStorageKey = 'ijentour-theme';

type Theme = 'light' | 'dark';

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(themeStorageKey) as Theme | null;
    const nextTheme: Theme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light';

    setTheme(nextTheme);
    applyTheme(nextTheme);
    setMounted(true);

    const handleThemeEvent = (e: CustomEvent<Theme>) => {
      setTheme(e.detail);
    };

    window.addEventListener('ijentour-theme-change' as any, handleThemeEvent);
    return () => window.removeEventListener('ijentour-theme-change' as any, handleThemeEvent);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    window.localStorage.setItem(themeStorageKey, nextTheme);
    applyTheme(nextTheme);
    window.dispatchEvent(new CustomEvent('ijentour-theme-change', { detail: nextTheme }));
  };

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className="h-9 w-16 shrink-0 rounded-full border border-secondary-200 bg-secondary-200/60 p-0.5"
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      suppressHydrationWarning
      aria-label={isDark ? 'Aktifkan light theme' : 'Aktifkan dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
      aria-pressed={isDark}
      className={`relative h-9 w-16 shrink-0 rounded-full border p-0.5 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 cursor-pointer ${
        isDark
          ? 'border-secondary-700 bg-secondary-800'
          : 'border-secondary-200 bg-secondary-200'
      }`}
    >
      <Sun className={`absolute left-2 h-3.5 w-3.5 transition-colors ${isDark ? 'text-secondary-400' : 'text-primary-600'}`} aria-hidden="true" />
      <Moon className={`absolute right-2 h-3.5 w-3.5 transition-colors ${isDark ? 'text-secondary-100' : 'text-secondary-500'}`} aria-hidden="true" />
      <span
        aria-hidden="true"
        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {isDark ? <Moon className="h-3.5 w-3.5 text-secondary-800" /> : <Sun className="h-3.5 w-3.5 text-primary-500" />}
      </span>
    </button>
  );
}
