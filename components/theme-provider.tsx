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

/**
 * The truth is what the pre-paint script in app/layout.tsx already stamped on
 * <html>, read from the same `pdx-*` keys ThemeMenu writes. This provider used
 * to keep its own `readrise-*` keys and hide the whole tree until mount, so a
 * choice made in the app didn't carry to the landing and every first paint
 * was blank until hydration.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [vibe, setVibeState] = useState<Vibe>('ember');

  useEffect(() => {
    const d = document.documentElement;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(d.dataset.theme === 'light' ? 'light' : 'dark');
    const v = d.dataset.vibe as Vibe;
    if (['ember', 'tide', 'bloom', 'meadow'].includes(v)) setVibeState(v);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('pdx-theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };

  const setVibe = (v: Vibe) => {
    setVibeState(v);
    localStorage.setItem('pdx-vibe', v);
    document.documentElement.setAttribute('data-vibe', v);
  };

  return (
    <ThemeContext.Provider value={{ theme, vibe, setTheme, setVibe }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
