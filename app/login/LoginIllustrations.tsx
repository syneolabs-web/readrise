'use client'

import { motion } from 'framer-motion'
import { useAppTheme } from '@/hooks/useAppTheme'
import Image from 'next/image'
import { useMemo } from 'react'

export function LoginIllustrations() {
  const { theme, vibe } = useAppTheme()
  const isLight = theme === 'light'
  
  const accentColor = useMemo(() => {
    switch (vibe) {
      case 'tide': return isLight ? '#0ea5e9' : '#38bdf8'
      case 'bloom': return isLight ? '#ec4899' : '#f472b6'
      case 'meadow': return isLight ? '#22c55e' : '#4ade80'
      default: return isLight ? '#f97316' : '#fb923c' // ember
    }
  }, [vibe, isLight])

  const strokeColor = isLight ? '#1b1712' : '#fcfaf6'
  const secondaryColor = isLight ? '#a39b8b' : '#5f5546'

  return (
    <div className="hidden lg:flex w-full h-full flex-col justify-center items-center relative gap-16 px-12">
      {/* 1. Scrolling Alone (Top Left) */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="w-full max-w-sm flex items-center justify-start self-start"
      >
        <div className="relative w-48 h-48 rounded-3xl overflow-hidden shadow-2xl border border-ink-100/10 mix-blend-screen dark:mix-blend-normal">
          <Image src="/avatar_scrolling.webp" alt="Scrolling alone" fill className="object-cover" />
        </div>
        <div className="ml-6">
          <h3 className="text-xl font-light text-ink-100">Endless Scroll</h3>
          <p className="text-sm text-ink-100/50 mt-2 font-prose">Isolated and passive.</p>
        </div>
      </motion.div>

      {/* 2. Reading & Connecting (Bottom Right) */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="w-full max-w-sm flex items-center justify-end self-end"
      >
        <div className="mr-6 text-right">
          <h3 className="text-xl font-light text-ink-100">Absolute Reader</h3>
          <p className="text-sm text-ink-100/50 mt-2 font-prose">Growing together.</p>
        </div>
        <div className="relative w-48 h-48 rounded-3xl overflow-hidden shadow-2xl border border-ink-100/10 mix-blend-screen dark:mix-blend-normal">
          <Image src="/avatar_reading.webp" alt="Reading and connecting" fill className="object-cover" />
        </div>
      </motion.div>
    </div>
  )
}
