'use client';

import { useTheme } from './theme-provider';
import { Palette, Moon, Sun, BookOpen } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Link from 'next/link';
import { ReadriseLogo } from '@/components/marketing/ReadriseLogo';
export function Header() {
  const { theme, vibe, setTheme, setVibe } = useTheme();
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-paper/80 backdrop-blur-md border-b border-rule/50">
      <Link href="/" className="flex shrink-0 items-center gap-2 hover:opacity-80 transition-opacity">
        <ReadriseLogo />
      </Link>

      <div className="flex items-center gap-4 relative">
        <button 
          onClick={() => setShowPopover(!showPopover)}
          className="p-2 rounded-full hover:bg-sunk transition-colors text-ink-soft"
          aria-label="Theme settings"
        >
          <Palette className="w-5 h-5" />
        </button>
        
        <AnimatePresence>
          {showPopover && (
            <motion.div 
              ref={popoverRef}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-12 right-12 w-64 p-5 rounded-2xl bg-paper border border-rule shadow-xl flex flex-col gap-5 origin-top-right"
            >
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3">Theme</div>
                <div className="flex gap-2 bg-sunk p-1 rounded-lg">
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm transition-colors ${theme === 'dark' ? 'bg-raised shadow-sm text-ink' : 'text-ink-soft hover:text-ink'}`}
                  >
                    <Moon className="w-4 h-4" /> Dark
                  </button>
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm transition-colors ${theme === 'light' ? 'bg-raised shadow-sm text-ink' : 'text-ink-soft hover:text-ink'}`}
                  >
                    <Sun className="w-4 h-4" /> Light
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-ink-faint mb-3">Vibe</div>
                <div className="flex justify-between">
                  {(['ember', 'tide', 'bloom', 'meadow'] as const).map((v) => {
                    const colors = {
                      ember: 'bg-orange-500',
                      tide: 'bg-blue-500',
                      bloom: 'bg-fuchsia-500',
                      meadow: 'bg-green-500'
                    };
                    return (
                      <button
                        key={v}
                        onClick={() => setVibe(v)}
                        className={`w-10 h-10 rounded-full ${colors[v]} ${vibe === v ? 'ring-2 ring-offset-2 ring-ink ring-offset-paper' : ''} transition-all`}
                        aria-label={`Set vibe to ${v}`}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-ink-faint mt-4 leading-relaxed">
                  Your room, your colours. The book stays the book.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Link href="/login" className="px-5 py-2 border border-rule hover:border-ink transition-colors rounded-lg text-sm font-medium text-ink bg-raised shadow-sm">
          Sign in
        </Link>
      </div>
    </header>
  );
}
