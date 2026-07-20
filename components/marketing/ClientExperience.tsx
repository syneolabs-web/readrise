'use client'

import { Overlay } from './Overlay'
import dynamic from 'next/dynamic'

const StoryScene = dynamic(
  () => import('./StoryScene').then(m => m.StoryScene),
  { ssr: false }
)

export function ClientExperience() {
  return (
    <div className="relative w-full">
      <StoryScene />
      <div className="relative z-10 w-full">
        <Overlay />
      </div>
    </div>
  )
}
