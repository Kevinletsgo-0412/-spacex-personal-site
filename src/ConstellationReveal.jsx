import { useEffect, useRef } from 'react'
import SatelliteGlobe from './components/SatelliteGlobe'

/* ━━━ Star-field ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function makeStars(count) {
  const out = []
  for (let i = 0; i < count; i++) {
    const x = (Math.random() * 100).toFixed(1)
    const y = (Math.random() * 100).toFixed(1)
    const o = (0.12 + Math.random() * 0.5).toFixed(2)
    const spread = Math.random() < 0.08 ? '1px' : '0'
    out.push(`${x}vw ${y}vh 0 ${spread} rgba(255,255,255,${o})`)
  }
  return out.join(', ')
}
const STARS_A = makeStars(160)
const STARS_B = makeStars(90)

/* ━━━ Component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function ConstellationReveal() {
  const wrapperRef = useRef(null)
  const maskRef = useRef(null)

  /* ── Scroll-driven mask sweep → vertical expansion ── */
  useEffect(() => {
    const mask = maskRef.current
    if (!mask) return

    function onScroll() {
      const wrapper = wrapperRef.current
      if (!wrapper) return

      const rect = wrapper.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > window.innerHeight) return

      const totalScroll = wrapper.offsetHeight - window.innerHeight
      const scrolled = Math.max(0, -rect.top)
      const progress =
        totalScroll > 0 ? Math.min(1, scrolled / totalScroll) : 0

      // Phase 1 — horizontal sweep: left → right (0.00 – 0.55)
      if (progress <= 0.55) {
        const p = progress / 0.55
        const rightInset = ((1 - p) * 100).toFixed(1)
        mask.style.clipPath =
          `inset(calc(50% - 8px) ${rightInset}% calc(50% - 8px) 0%)`
      }
      // Phase 2 — vertical expansion: up + down (0.55 – 1.00)
      else {
        const p = (progress - 0.55) / 0.45
        const eased = 1 - Math.pow(1 - p, 2)
        const vertInset = (50 * (1 - eased)).toFixed(1)
        mask.style.clipPath =
          `inset(${vertInset}% 0% ${vertInset}% 0%)`
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  /* ── Render ── */
  return (
    <div ref={wrapperRef} style={{ height: '850vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Mask → globe + star field + HUD */}
        <div
          ref={maskRef}
          className="absolute inset-0 z-10"
          style={{ clipPath: 'inset(50% 100% 50% 0)' }}
        >
          {/* Star-field gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] to-[#1a1a24]">
            <div className="cr-star-a absolute w-px h-px top-0 left-0" />
            <div className="cr-star-b absolute w-px h-px top-0 left-0" />
          </div>

          {/* 3D satellite + globe + orbit-ring scene */}
          <SatelliteGlobe theme="dark" />

          {/* HUD overlays */}
          <header className="cr-hud-top">
            <div>
              <span className="cr-hud-pulse" aria-hidden="true" />
              <span className="cr-hud-title">Global Constellation</span>
              <span className="cr-hud-divider">/</span>
              <span className="cr-hud-sub">Active Network</span>
            </div>
            <div>
              <span className="cr-hud-sub">LEO · 550 km</span>
            </div>
          </header>

          <footer className="cr-hud-bottom">
            <div className="cr-hud-tagline">
              From the Himalayas to the Pacific — one constellation, one signal.
            </div>
            <div className="cr-hud-sub cr-hud-stamp">SPX · ARCHIVE · 2025</div>
          </footer>
        </div>
      </div>

      <style>{`
        /* ━━━ Star twinkle ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        .cr-star-a {
          box-shadow: ${STARS_A};
          animation: cr-twinkle-a 4s ease-in-out infinite alternate;
        }
        .cr-star-b {
          box-shadow: ${STARS_B};
          animation: cr-twinkle-b 6s ease-in-out infinite alternate;
        }
        @keyframes cr-twinkle-a {
          from { opacity: 0.55; }
          to   { opacity: 1; }
        }
        @keyframes cr-twinkle-b {
          from { opacity: 1; }
          to   { opacity: 0.45; }
        }

        /* ━━━ HUD overlays ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        .cr-hud-top, .cr-hud-bottom {
          position: absolute;
          left: 0;
          right: 0;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: clamp(1.1rem, 2.2vw, 1.9rem) clamp(1.5rem, 3vw, 2.5rem);
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
          font-size: clamp(0.6rem, 0.78vw, 0.72rem);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          pointer-events: none;
          user-select: none;
        }
        .cr-hud-top    { top: 0; }
        .cr-hud-bottom { bottom: 0; }
        .cr-hud-title {
          color: rgba(255, 255, 255, 0.92);
          font-weight: 600;
        }
        .cr-hud-divider {
          margin: 0 0.7em;
          color: #6da3dd;
        }
        .cr-hud-sub {
          color: rgba(255, 255, 255, 0.55);
        }
        .cr-hud-pulse {
          display: inline-block;
          width: 6px;
          height: 6px;
          margin-right: 0.6em;
          background: #6da3dd;
          border-radius: 999px;
          vertical-align: middle;
          animation: cr-twinkle-a 2.6s ease-in-out infinite alternate;
        }
        .cr-hud-tagline {
          max-width: 60ch;
          color: rgba(255, 255, 255, 0.78);
          font-size: clamp(0.68rem, 0.85vw, 0.8rem);
          letter-spacing: 0.16em;
          line-height: 1.5;
        }
        .cr-hud-stamp {
          white-space: nowrap;
        }

        @media (max-width: 640px) {
          .cr-hud-top, .cr-hud-bottom {
            padding: 1rem 1.1rem;
            font-size: 0.58rem;
          }
          .cr-hud-tagline {
            font-size: 0.62rem;
            max-width: 26ch;
          }
        }
      `}</style>
    </div>
  )
}