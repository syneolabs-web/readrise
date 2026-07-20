'use client'

import { useState, useEffect } from 'react'

export function useAppTheme() {
  const [theme, setTheme] = useState('dark')
  const [vibe, setVibe] = useState('ember')

  useEffect(() => {
    const root = document.documentElement
    
    const update = () => {
      setTheme(root.getAttribute('data-theme') || 'dark')
      setVibe(root.getAttribute('data-vibe') || 'ember')
    }
    
    // Initial fetch
    update()
    
    // Setup observer
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false
      for (const mutation of mutations) {
        if (mutation.attributeName === 'data-theme' || mutation.attributeName === 'data-vibe') {
          shouldUpdate = true
          break
        }
      }
      if (shouldUpdate) update()
    })
    
    observer.observe(root, { attributes: true })
    return () => observer.disconnect()
  }, [])
  
  return { theme, vibe }
}
