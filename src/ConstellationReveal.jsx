import { useEffect, useRef } from 'react'
import { animate, splitText, stagger } from 'animejs'
import SatelliteGlobe from './components/SatelliteGlobe'

/* ━━━ Text for Page 4 ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const REVEAL_TEXT =
  'We are building the world\'s most advanced satellite constellation — ' +
  'connecting the unconnected, from the peaks of the Himalayas ' +
  'to the most remote islands of the Pacific.'

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

/* ━━━ Scroll-region split ━━━━━━━━━━━━━━━━━━━━━━━
   Legacy = word reveal + glow hold + mask sweep + vertical expansion
   Coda   = Page 5 globe visible, sticky hold for users to absorb        */
const LEGACY_SCROLL_RATIO = 0.85

/*  Legacy progress map (within 0–1 of legacy range):
    0.00 – 0.22  word animation
    0.22 – 0.30  glow fade-in
    0.30 – 0.60  hold  (glow visible, page pinned)
    0.60 – 0.68  glow fade-out
    0.68 – 0.93  horizontal mask sweep
    0.93 – 1.00  vertical mask expansion                                  */

/* ━━━ Component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function ConstellationReveal() {
  const wrapperRef = useRef(null)
  const textRef = useRef(null)
  const maskRef = useRef(null)
  const glowRef = useRef(null)

  /* ── Anime.js word reveal + scroll driver ── */
  useEffect(() => {
    const textEl = textRef.current
    const mask = maskRef.current
    if (!textEl || !mask) return

    const split = splitText(textEl, { words: { wrap: 'clip' } })

    const wordAnim = animate(split.words, {
      y: ['100%', '0%'],
      opacity: [0, 1],
      duration: 750,
      ease: 'out(3)',
      delay: stagger(100),
      autoplay: false,
    })

    function onScroll() {
      const wrapper = wrapperRef.current
      if (!wrapper) return

      const rect = wrapper.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        if (glowRef.current) glowRef.current.style.opacity = '0'
        return
      }

      const totalScroll = wrapper.offsetHeight - window.innerHeight
      const scrolled = Math.max(0, -rect.top)
      const legacyEnd = totalScroll * LEGACY_SCROLL_RATIO
      const glow = glowRef.current

      if (scrolled <= legacyEnd) {
        const progress = legacyEnd > 0 ? Math.min(1, scrolled / legacyEnd) : 0

        /* Phase 1 — word animation (0.00 – 0.22) */
        if (progress <= 0.22) {
          const p = progress / 0.22
          wordAnim.seek(p * wordAnim.duration)
          if (glow) glow.style.opacity = '0'
          mask.style.clipPath = 'inset(50% 100% 50% 0)'

        /* Phase 2 — glow fade-in (0.22 – 0.30) */
        } else if (progress <= 0.30) {
          wordAnim.seek(wordAnim.duration)
          const rawP = (progress - 0.22) / 0.08
          const easedP = rawP * rawP * (3 - 2 * rawP)
          if (glow) glow.style.opacity = String(easedP)
          mask.style.clipPath = 'inset(50% 100% 50% 0)'

        /* Phase 3 — hold / glow visible (0.30 – 0.60) */
        } else if (progress <= 0.60) {
          wordAnim.seek(wordAnim.duration)
          if (glow) glow.style.opacity = '1'
          mask.style.clipPath = 'inset(50% 100% 50% 0)'

        /* Phase 4 — glow fade-out (0.60 – 0.68) */
        } else if (progress <= 0.68) {
          wordAnim.seek(wordAnim.duration)
          const rawP = 1 - (progress - 0.60) / 0.08
          const easedP = rawP * rawP * (3 - 2 * rawP)
          if (glow) glow.style.opacity = String(easedP)
          mask.style.clipPath = 'inset(50% 100% 50% 0)'

        /* Phase 5 — horizontal mask sweep (0.68 – 0.93) */
        } else if (progress <= 0.93) {
          wordAnim.seek(wordAnim.duration)
          if (glow) glow.style.opacity = '0'
          const p = (progress - 0.68) / 0.25
          const rightInset = ((1 - p) * 100).toFixed(1)
          mask.style.clipPath = `inset(calc(50% - 8px) ${rightInset}% calc(50% - 8px) 0%)`

        /* Phase 6 — vertical mask expansion (0.93 – 1.00) */
        } else {
          wordAnim.seek(wordAnim.duration)
          if (glow) glow.style.opacity = '0'
          const p = (progress - 0.93) / 0.07
          const eased = 1 - Math.pow(1 - p, 2)
          const vertInset = (50 * (1 - eased)).toFixed(1)
          mask.style.clipPath = `inset(${vertInset}% 0% ${vertInset}% 0%)`
        }
      } else {
        /* Coda — Page 5 globe stays fully visible while wrapper finishes */
        wordAnim.seek(wordAnim.duration)
        if (glow) glow.style.opacity = '0'
        mask.style.clipPath = 'inset(0% 0% 0% 0%)'
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      split.revert()
    }
  }, [])

  /* ── Render ── */
  return (
    <div ref={wrapperRef} style={{ height: '850vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Page 4 — pure white, word reveal */}
        <div className="absolute inset-0 bg-white flex items-center justify-center px-8 md:px-16 lg:px-24">
          <p
            ref={textRef}
            className="max-w-3xl text-2xl md:text-3xl lg:text-4xl leading-relaxed text-center font-light text-gray-900 tracking-wide"
          >
            {REVEAL_TEXT}
          </p>
        </div>

        {/* Mask → Page 5 (satellite + globe + orbit rings) */}
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

          {/* Minimal HUD overlay — keeps the brand archive language alive */}
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

        /* ━━━ Page 5 HUD overlays ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
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
