import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('safefall-theme');
    if (stored) return stored === 'dark';
    return true;
  });

  useEffect(() => {
    localStorage.setItem('safefall-theme', dark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', dark);
    document.body.classList.toggle('light', !dark);
  }, [dark]);

  const toggleTheme = () => setDark((d) => !d);

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
