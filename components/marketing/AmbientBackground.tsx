'use client'

import { motion } from 'framer-motion'

export function AmbientBackground() {
  // Generate stable arrays for 15 embers
  const embers = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: (i % 3) * 2 + 2, // 2px, 4px, or 6px
    left: `${(i * 7.3) % 100}%`,
    delay: (i * 0.4) % 6,
    duration: 5 + (i % 4) * 1.5, // 5s to 9.5s
    xOffset1: ((i * 13) % 40) - 20,
    xOffset2: ((i * 29) % 80) - 40,
  }))

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-ink-950" />
      
      {/* Large animated blurred orbs using theme gradients */}
      <motion.div
        animate={{
          x: ["0%", "8%", "-4%", "0%"],
          y: ["0%", "4%", "-8%", "0%"],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-1/4 -right-1/4 w-[70vw] h-[70vw] rounded-full bg-grad opacity-25 dark:opacity-35 blur-[100px] md:blur-[140px]"
      />
      
      <motion.div
        animate={{
          x: ["0%", "-8%", "4%", "0%"],
          y: ["0%", "-4%", "8%", "0%"],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full bg-grad opacity-20 dark:opacity-25 blur-[100px] md:blur-[120px]"
      />

      {/* Floating Embers (Drifting Fire Sparks) */}
      <div className="absolute inset-0 overflow-hidden">
        {embers.map((ember) => (
          <motion.div
            key={ember.id}
            initial={{ y: "105vh", opacity: 0, scale: 0.5 }}
            animate={{
              y: "-10vh",
              opacity: [0, 0.8, 0.8, 0],
              x: [0, ember.xOffset1, ember.xOffset2],
              scale: [0.5, 1, 1, 0.2]
            }}
            transition={{
              duration: ember.duration,
              repeat: Infinity,
              delay: ember.delay,
              ease: "easeInOut"
            }}
            className="absolute rounded-full bg-accent/60 shadow-[0_0_10px_rgba(240,180,41,0.5)]"
            style={{
              width: ember.size,
              height: ember.size,
              left: ember.left,
            }}
          />
        ))}
      </div>
    </div>
  )
}
