/* SystemsTimeline — Page 3 (replaces StarlinkReveal at the App.tsx call site).
 *
 * Phase 1b: word-by-word reveal on the LEFT headline only.
 *   • headline text is split per-line into words; each word lives inside a
 *     <span class="word-clip"><span class="word">…</span></span> wrapper
 *   • clip has overflow:hidden; word starts at translateY(105%) so it sits
 *     just below the baseline; GSAP slides it up to translateY(0)
 *   • single ScrollTrigger fires once when the section enters viewport,
 *     plays the stagger; words remain in place after — no scrub, no reverse
 *   • gating respects DESIGN_SYSTEM.md §5.1 (ready prop) and §5.2 spirit
 *     (document.fonts.ready before measuring); cleanup via gsap.context()
 *   • right-side timeline track stays STATIC this phase
 *
 * src/StarlinkReveal.jsx and src/StarlinkReveal.css remain on disk as a
 * rollback artefact; they are simply no longer imported by App.tsx.
 *
 * NOTE: headline copy and timeline records are placeholders for layout review.
 */
import { Fragment, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import './SystemsTimeline.css'

gsap.registerPlugin(ScrollTrigger)

const HEADLINE = ['TWO', 'DECADES.', 'ONE', 'SYSTEM.']
const HEADLINE_LINES = HEADLINE.map((line) =>
  line.split(/\s+/).filter(Boolean),
)

const ITEMS = [
  {
    code: 'REC · 001',
    date: '2002.05',
    title: 'Company founded',
    summary:
      'SpaceX is incorporated in El Segundo, California — the system begins from a single intent.',
  },
  {
    code: 'REC · 002',
    date: '2008.09',
    title: 'Falcon 1 reaches orbit',
    summary:
      'First privately funded liquid-fuel rocket to achieve Earth orbit. Survival, not victory.',
  },
  {
    code: 'REC · 003',
    date: '2012.05',
    title: 'Dragon docks the ISS',
    summary:
      'A commercial spacecraft berths with the International Space Station for the first time.',
  },
  {
    code: 'REC · 004',
    date: '2020.05',
    title: 'Crewed Dragon flight',
    summary:
      'Demo-2 restores domestic crewed access to orbit after a nine-year gap.',
  },
  {
    code: 'REC · 005',
    date: '2024.06',
    title: 'Starship reusable test',
    summary:
      'Both Super Heavy and Starship achieve controlled splashdown in IFT-4.',
  },
]

export default function SystemsTimeline({ ready = true }) {
  const sectionRef = useRef(null)
  const headlineRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const headline = headlineRef.current
    if (!section || !headline) return undefined

    const words = headline.querySelectorAll('.systems-timeline-word')
    if (!words.length) return undefined

    // Deterministic initial state on every effect run — overrides any stale
    // inline transform from hot reload / previous renders.
    gsap.set(words, { yPercent: 105 })

    if (!ready) return undefined // §5.1 gating: wait for LoadingScreen.

    let cancelled = false
    let ctx = null

    const buildAnimation = () => {
      if (cancelled) return

      ctx = gsap.context(() => {
        // Re-set inside the context so ctx.revert() restores it cleanly.
        gsap.set(words, { yPercent: 105 })

        ScrollTrigger.create({
          trigger: section,
          start: 'top 80%',
          once: true, // play once and stay revealed (per Phase 1b spec)
          onEnter: () => {
            gsap.to(words, {
              yPercent: 0,
              duration: 0.85,
              ease: 'power3.out',
              stagger: { each: 0.085, from: 'start' },
            })
          },
        })
      }, section)
    }

    // Wait for webfonts so per-word widths are final before reveal kicks in.
    if (
      typeof document !== 'undefined' &&
      document.fonts &&
      typeof document.fonts.ready?.then === 'function'
    ) {
      document.fonts.ready.then(buildAnimation)
    } else {
      buildAnimation()
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
      className="systems-timeline-section relative w-full h-screen overflow-hidden"
    >
      <header className="systems-timeline-header">
        <div className="systems-timeline-header-group">
          <span className="systems-timeline-pulse" aria-hidden="true" />
          <span className="systems-timeline-header-title">Starship Manifest</span>
          <span className="systems-timeline-header-divider">/</span>
          <span className="systems-timeline-header-count">Systems Timeline</span>
        </div>
        <div className="systems-timeline-header-group">
          <span className="systems-timeline-header-hint">2002 → 2024</span>
        </div>
      </header>

      <div className="systems-timeline-stage">
        <div className="systems-timeline-headline" ref={headlineRef}>
          {HEADLINE_LINES.map((words, i) => (
            <span key={i} className="systems-timeline-line">
              {words.map((word, j) => (
                <Fragment key={j}>
                  <span className="systems-timeline-word-clip">
                    <span className="systems-timeline-word">{word}</span>
                  </span>
                  {j < words.length - 1 ? ' ' : null}
                </Fragment>
              ))}
            </span>
          ))}
        </div>

        <div className="systems-timeline-track">
          <ol className="systems-timeline-items">
            {ITEMS.map((item) => (
              <li key={item.code} className="systems-timeline-item">
                <span className="systems-timeline-item-dot" aria-hidden="true" />
                <div className="systems-timeline-item-meta">
                  <span className="systems-timeline-item-code">{item.code}</span>
                  <span className="systems-timeline-item-date">{item.date}</span>
                </div>
                <h4 className="systems-timeline-item-title">{item.title}</h4>
                <p className="systems-timeline-item-summary">{item.summary}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
