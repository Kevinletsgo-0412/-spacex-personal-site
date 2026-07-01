import React from 'react'
import ReactDOM from 'react-dom/client'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App from './App'
import 'lenis/dist/lenis.css'
import './index.css'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({
  lerp: 0.08,
  smoothWheel: true,
})

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

requestAnimationFrame(() => {
  window.scrollTo(0, 0)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
