/* StarlinkReveal — page 3.
 *
 * One ScrollTrigger, one master timeline, five explicit phases:
 *   Phase 1: hold at center (page just appeared, text stays put)
 *   Phase 2: lines 1–4 reveal sequentially (still centered)
 *   Phase 3: hold at center after reveal (lets the eye catch up)
 *   Phase 4: migrate the whole textGroup to the top-right corner
 *   Phase 5: hold at top-right (release the next page)
 *
 * Coordination with siblings:
 *   - Trigger creation is gated by `ready` (driven from App by isLoading), so
 *     OrbitGallery's pin spacer is in the document BEFORE we cache start/end
 *     positions. Otherwise our cached positions would be ~3500px short and
 *     the section would appear to be already mid-migration on first reveal.
 *   - We use useEffect (not useLayoutEffect) so OrbitGallery's useEffect — also
 *     gated by !isLoading — runs first in JSX/mount order, guaranteeing its
 *     pin trigger exists by the time we read layout.
 *   - We await document.fonts.ready before building, since per-character widths
 *     change once webfonts swap in, which would otherwise invalidate offsets.
 *   - After we build, we call ScrollTrigger.refresh() once so every trigger
 *     in the page (ours + OrbitGallery's pin) recomputes against the final
 *     post-load layout.
 *
 * Initial state is set imperatively on every effect run, so hot reloads or
 * browser refreshes can never inherit a stale transform.
 */
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import ScrollFloat from './components/ScrollFloat'
import './StarlinkReveal.css'

gsap.registerPlugin(ScrollTrigger)

export default function StarlinkReveal({ ready = true }) {
  const sectionRef = useRef(null)
  const textGroupRef = useRef(null)
  const line1Ref = useRef(null)
  const line2Ref = useRef(null)
  const line3Ref = useRef(null)
  const line4Ref = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const textGroup = textGroupRef.current
    const lineEls = [
      line1Ref.current,
      line2Ref.current,
      line3Ref.current,
      line4Ref.current,
    ]

    if (!section || !textGroup || lineEls.some((line) => !line)) return undefined

    const lineChars = lineEls.map((line) =>
      Array.from(line.querySelectorAll('.scroll-float-char')),
    )
    const allChars = lineChars.flat()
    if (!allChars.length) return undefined

    // Deterministic initial state — overrides anything left over from a
    // previous render (hot reload, fast refresh, route change).
    const applyInitialState = () => {
      gsap.set(textGroup, {
        top: '43%',
        left: '50%',
        xPercent: -50,
        yPercent: -50,
        scale: 1,
        autoAlpha: 0,
        transformOrigin: 'top right',
        willChange: 'transform',
      })
      gsap.set(allChars, {
        opacity: 0,
        yPercent: 110,
        scaleY: 2.2,
        scaleX: 0.75,
        transformOrigin: '50% 0%',
        willChange: 'transform, opacity',
      })
    }

    applyInitialState()

    if (!ready) return undefined

    let cancelled = false
    let ctx = null

    const buildScrollAnimation = () => {
      if (cancelled) return

      ctx = gsap.context(() => {
        // Re-apply inside the context so ctx.revert() can restore it.
        applyInitialState()

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.15,
            invalidateOnRefresh: true,
            onEnter: () => gsap.set(textGroup, { autoAlpha: 1 }),
            onEnterBack: () => gsap.set(textGroup, { autoAlpha: 1 }),
            onLeaveBack: () => gsap.set(textGroup, { autoAlpha: 0 }),
          },
        })

        // A throwaway object that absorbs the "hold" durations, so the
        // hold phases occupy real space on the timeline without touching
        // any DOM property.
        const hold = {}

        // ─── Phase 1: center hold ──────────────────────────────────────
        tl.addLabel('p1-center-hold', 0)
        tl.to(hold, { duration: 0.30 })

        // ─── Phase 2: lines 1–4 reveal (still centered) ───────────────
        tl.addLabel('p2-reveal')
        tl.to(lineChars[0], {
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          ease: 'back.inOut(2)',
          duration: 0.35,
          stagger: { each: 0.008, from: 'start' },
        })
        tl.to(lineChars[1], {
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          ease: 'back.inOut(2)',
          duration: 0.26,
          stagger: { each: 0.004, from: 'start' },
        })
        tl.to(lineChars[2], {
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          ease: 'back.inOut(2)',
          duration: 0.26,
          stagger: { each: 0.0035, from: 'start' },
        })
        tl.to(lineChars[3], {
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          ease: 'back.inOut(2)',
          duration: 0.26,
          stagger: { each: 0.0035, from: 'start' },
        })

        // ─── Phase 3: post-reveal hold (text stays centered) ──────────
        tl.addLabel('p3-post-reveal-hold')
        tl.to(hold, { duration: 0.45 })

        // ─── Phase 4: migrate to top-right corner ─────────────────────
        tl.addLabel('p4-migrate')
        tl.to(textGroup, {
          top: '7vh',
          left: 'calc(100vw - clamp(2rem, 5vw, 5rem))',
          xPercent: -100,
          yPercent: 0,
          scale: 0.46,
          ease: 'power2.inOut',
          duration: 1.85,
        })

        // ─── Phase 5: top-right hold (release into next page) ─────────
        tl.addLabel('p5-top-right-hold')
        tl.to(hold, { duration: 0.50 })
      }, section)

      // Re-measure every trigger now that our timeline (and the OrbitGallery
      // pin spacer that ran before us) have all settled. Without this the
      // section's start/end can be stale for the very first scroll pass.
      ScrollTrigger.refresh()
    }

    // Wait for webfonts so per-char widths are final before we measure.
    // Promise resolves immediately if fonts are already loaded.
    if (
      typeof document !== 'undefined' &&
      document.fonts &&
      typeof document.fonts.ready?.then === 'function'
    ) {
      document.fonts.ready.then(buildScrollAnimation)
    } else {
      buildScrollAnimation()
    }

    return () => {
      cancelled = true
      if (ctx) {
        ctx.revert()
        ctx = null
      }
    }
  }, [ready])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[460vh] w-full bg-black"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Page-3 background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/gallery/Page3bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Top-left SpaceX wordmark — matches Page 1 */}
        <div className="absolute top-0 left-0 z-30 px-10 pt-8">
          <svg
            viewBox="0 0 400 50"
            fill="white"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            style={{ height: 'clamp(1.1rem, 1.9vw, 1.85rem)', width: 'auto' }}
          >
            <path d="M37.5 30.5H10.9v-6.6h34.3c-.9-2.8-3.8-5.4-8.9-5.4H11.4c-5.7 0-9 2.1-9 6.7v4.9c0 4 3.4 6.3 8.4 6.3h26.9v7H1.5c.9 3.8 3.8 5.8 9 5.8h27.1c5.7 0 8.5-2.2 8.5-6.9v-4.9c0-4.3-3.3-6.6-8.6-6.9z" />
            <path d="M91.8 18.6H59v30.7h9.3V37.5h24.2c6.7 0 10.4-2.3 10.4-7.7v-3.4c-.1-5-4.3-7.8-11.1-7.8zm3 9.8c0 2.2-.4 3.4-4 3.4H68.3l.1-8h22c4 0 4.5 1.2 4.5 3.3v1.3z" />
            <polygon points="129.9,17.3 124.3,24.2 133.8,37.3 114,37.3 109.1,42.5 137.7,42.5 142.6,49.3 153.6,49.3" />
            <path d="M171.4 23.9h34.8c-.9-3.6-4.4-5.4-9.4-5.4h-26c-4.5 0-8.8 1.8-8.8 6.7v17.2c0 4.9 4.3 6.7 8.8 6.7h26.3c6 0 8.1-1.7 9.1-5.8h-34.8V23.9z" />
            <polygon points="228.3,43.5 228.3,34.1 247,34.1 247,28.9 218.9,28.9 218.9,49.3 260.4,49.3 260.4,43.5" />
            <rect width="41.9" height="5.4" x="219.9" y="18.6" />
            <path d="M287.6 18.6H273l17.2 12.6c2.5-1.7 5.4-3.5 8-5l-10.6-7.6zm21.2 15.7c-2.5 1.7-5 3.6-7.4 5.4l13 9.5h14.7l-20.3-14.9z" />
            <path d="M399 .7c-80 4.6-117 38.8-125.3 46.9l-1.7 1.6h14.8C326.8 9.1 384.3 2 399 .7z" />
          </svg>
        </div>

        {/* Centre text group — single master timeline migrates this to top-right */}
        <div ref={textGroupRef} className="starship-copy-group">
          <ScrollFloat
            ref={line1Ref}
            as="div"
            containerClassName="starship-copy-row"
            textClassName="starship-copy-title"
          >
            STARSHIP IS NOT A ROCKET.
          </ScrollFloat>

          <ScrollFloat
            ref={line2Ref}
            as="div"
            containerClassName="starship-copy-row"
            textClassName="starship-copy-line"
          >
            It is an argument against staying still.
          </ScrollFloat>

          <ScrollFloat
            ref={line3Ref}
            as="div"
            containerClassName="starship-copy-row"
            textClassName="starship-copy-line"
          >
            Built to lift not only payloads, but possibility --
          </ScrollFloat>

          <ScrollFloat
            ref={line4Ref}
            as="div"
            containerClassName="starship-copy-row"
            textClassName="starship-copy-line"
          >
            from Earth’s surface to the architecture of another world
          </ScrollFloat>
        </div>
      </div>
    </section>
  )
}
