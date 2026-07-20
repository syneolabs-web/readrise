'use client'

import { motion } from 'framer-motion'

export function ReadriseLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Sunbeams */}
        <motion.path
          d="M12 2V5M6 6L8 8M18 6L16 8"
          stroke="url(#sunGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        {/* Book / Horizon */}
        <motion.path
          d="M2 13C2 13 7 10 12 13C17 10 22 13 22 13V21C22 21 17 18 12 21C7 18 2 21 2 21V13Z"
          stroke="url(#bookGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        {/* Center line of book */}
        <motion.path
          d="M12 13V21"
          stroke="url(#bookGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        />
        {/* Rising Sun Arc */}
        <motion.path
          d="M7 13A5 5 0 0 1 17 13"
          stroke="url(#sunGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        />
        <defs>
          <linearGradient id="sunGradient" x1="12" y1="2" x2="12" y2="13" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F97316" />
            <stop offset="1" stopColor="#EAB308" />
          </linearGradient>
          <linearGradient id="bookGradient" x1="2" y1="13" x2="22" y2="21" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#D1D5DB" />
          </linearGradient>
        </defs>
      </motion.svg>
      <span className="text-lg font-bold tracking-tight text-ink-100 flex items-center">
        Read
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500">
          rise
        </span>
      </span>
    </div>
  )
}
