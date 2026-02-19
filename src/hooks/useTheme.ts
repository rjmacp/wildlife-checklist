import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '../types/state';
import { loadTheme, saveTheme } from '../utils/storage';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(loadTheme);

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
    try {
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', theme === 'light' ? '#F5F0E8' : '#141208');
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      saveTheme(next);
      return next;
    });
  }, []);

  const setThemeDirectly = useCallback((t: Theme) => {
    setTheme(t);
    saveTheme(t);
  }, []);

  return { theme, toggleTheme, setTheme: setThemeDirectly };
}
