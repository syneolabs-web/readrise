'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type Vibe = 'ember' | 'tide' | 'bloom' | 'meadow';

interface ThemeContextType {
  theme: Theme;
  vibe: Vibe;
  setTheme: (t: Theme) => void;
  setVibe: (v: Vibe) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [vibe, setVibeState] = useState<Vibe>('ember');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('readrise-theme') as Theme) || 'light';
    const savedVibe = (localStorage.getItem('readrise-vibe') as Vibe) || 'ember';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(savedTheme);
    setVibeState(savedVibe);
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-vibe', savedVibe);
    setMounted(true);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('readrise-theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };

  const setVibe = (v: Vibe) => {
    setVibeState(v);
    localStorage.setItem('readrise-vibe', v);
    document.documentElement.setAttribute('data-vibe', v);
  };

  return (
    <ThemeContext.Provider value={{ theme, vibe, setTheme, setVibe }}>
      <div className={!mounted ? "invisible" : ""}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
