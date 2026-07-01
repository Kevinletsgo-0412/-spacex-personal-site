import { useState } from 'react'
import LoadingScreen from './LoadingScreen'
import HeroVideo from './HeroVideo'
import SpaceXScrollRevealGallery from './SpaceXScrollRevealGallery'

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

      {/* Loading Overlay */}
      {isLoading && (
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      )}
    </div>
  )
}

export default App
