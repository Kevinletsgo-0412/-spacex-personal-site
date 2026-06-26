import { useState } from 'react'
import LoadingScreen from './LoadingScreen'
import HeroVideo from './HeroVideo'
import SpaceXScrollRevealGallery from './SpaceXScrollRevealGallery'
import SystemsTimeline from './SystemsTimeline'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={`w-full ${isLoading ? 'h-screen overflow-hidden bg-black' : 'min-h-screen'}`}>
      {/* Screen 1 — Hero Video */}
      <section className="relative w-full h-screen flex-shrink-0">
        <HeroVideo />
      </section>

      {/* Screen 2 — Vertical scroll-reveal gallery (6 SpaceX milestones) */}
      <SpaceXScrollRevealGallery ready={!isLoading} />

      {/* Screen 3 — Systems Timeline (replaces StarlinkReveal; ready prop preserved per DESIGN_SYSTEM.md §5.1) */}
      <SystemsTimeline ready={!isLoading} />

      {/* Loading Overlay */}
      {isLoading && (
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      )}
    </div>
  )
}

export default App
