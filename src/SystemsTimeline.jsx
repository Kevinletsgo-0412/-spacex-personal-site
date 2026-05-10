/* SystemsTimeline — Page 3.
 *
 * 900vh sticky-pinned section. One ScrollTrigger drives one master timeline
 * with three phases:
 *
 *   Phase A (0.05 → 0.32)  Per-letter "ink fills the glyph from below".
 *                          The letter itself does NOT move — each <span> is
 *                          fixed in layout, color: transparent (so it holds
 *                          inline space), with a vertical linear-gradient
 *                          background that's clipped to the glyph shape via
 *                          background-clip: text. A CSS custom property
 *                          --letter-fill drives the gradient stop from 0
 *                          (no ink) to 1 (full ink). DOM order is line-by-
 *                          line, char-by-char, so GSAP's stagger from:'start'
 *                          gives left→right, top→bottom for free.
 *
 *   Phase B (0.44 → 0.52)  Vertical axis grows from bottom to top
 *                          (scaleY 0 → 1, origin: bottom). Headline dims to
 *                          0.55 to hand focus over to the timeline scenes.
 *
 *   Phase C (0.52 → 0.98)  7 milestone scenes, queued sequentially. Each
 *                          scene is a full-viewport group containing one
 *                          marker (on axis) AND one panel (on the right);
 *                          the whole group is animated together via the
 *                          scene container's transform.
 *
 *                          Each scene travels yPercent: 120 → 40 → 0 →
 *                          -120 (off-screen below → centred → off-screen
 *                          above). SCENE_SPACING > SCENE_DURATION, so the
 *                          previous scene has already exited before the
 *                          next one enters — placeholders never overlap.
 *                          opacity is 0 only at the very entry/exit edges;
 *                          the visible change comes from y motion, not
 *                          crossfade.
 *
 *                          No static dots on the axis — the marker only
 *                          exists as part of the active scene.
 *
 * Coordination notes:
 *   • document.fonts.ready is awaited so per-letter widths are final before
 *     the timeline's stagger window is computed.
 *   • ScrollTrigger.refresh() is called once after build, so this trigger
 *     and OrbitGallery's pin-spacer trigger settle against the final layout.
 *   • gsap.context() scopes everything; ctx.revert() handles cleanup on
 *     unmount / hot reload.
 *   • Initial states are mirrored in CSS too — first paint matches the
 *     animation's starting state, so there is no flash.
 *
 * MILESTONES is a plain array; to plug a real cutout image in, set the
 * `image` field to a path under /public (e.g. '/gallery/falcon1.webp').
 * The panel renderer auto-swaps the placeholder frame for an <img>.
 */
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import './SystemsTimeline.css'

gsap.registerPlugin(ScrollTrigger)

const HEADLINE_LINES = [
  'BUILD',
  'THE FUTURE.',
  'ONE MILESTONE',
  'AT A TIME.',
]

const MILESTONES = [
  {
    code: 'REC · 001',
    year: '2002',
    title: 'Company founded',
    summary:
      'SpaceX begins as a single intent: reduce the cost of reaching orbit.',
    image: null,
    imageAlt: '',
    marker: 'square',
  },
  {
    code: 'REC · 002',
    year: '2006',
    title: 'Falcon 1 first attempt',
    summary:
      'The first launch attempt begins the rapid iteration era.',
    image: null,
    imageAlt: '',
    marker: 'circle',
  },
  {
    code: 'REC · 003',
    year: '2008',
    title: 'Falcon 1 reaches orbit',
    summary:
      'The first privately developed liquid-fuel rocket reaches Earth orbit.',
    image: null,
    imageAlt: '',
    marker: 'diamond',
  },
  {
    code: 'REC · 004',
    year: '2012',
    title: 'Dragon docks with the ISS',
    summary:
      'Dragon becomes the first commercial spacecraft to berth with the station.',
    image: null,
    imageAlt: '',
    marker: 'ring',
  },
  {
    code: 'REC · 005',
    year: '2018',
    title: 'Falcon Heavy demonstration',
    summary:
      'A new heavy-lift vehicle proves reusable launch at dramatic scale.',
    image: null,
    imageAlt: '',
    marker: 'square',
  },
  {
    code: 'REC · 006',
    year: '2020',
    title: 'Crew Dragon human spaceflight',
    summary:
      'Demo-2 restores domestic crewed access to orbit.',
    image: null,
    imageAlt: '',
    marker: 'circle',
  },
  {
    code: 'REC · 007',
    year: '2024',
    title: 'Starship reusable test',
    summary:
      'Starship and Super Heavy demonstrate controlled splashdown and reuse logic.',
    image: null,
    imageAlt: '',
    marker: 'diamond',
  },
]

function PlaceholderFrame() {
  return (
    <div className="systems-timeline-frame-placeholder" aria-hidden="true">
      <span className="systems-timeline-frame-cropmark systems-timeline-frame-cropmark-tl" />
      <span className="systems-timeline-frame-cropmark systems-timeline-frame-cropmark-tr" />
      <span className="systems-timeline-frame-cropmark systems-timeline-frame-cropmark-bl" />
      <span className="systems-timeline-frame-cropmark systems-timeline-frame-cropmark-br" />
      <span className="systems-timeline-frame-tag">▢ EMPTY</span>
      <span className="systems-timeline-frame-label">OBJECT PLACEHOLDER</span>
    </div>
  )
}

export default function SystemsTimeline({ ready = true }) {
  const sectionRef = useRef(null)
  const headlineRef = useRef(null)
  const axisLineRef = useRef(null)
  const sceneRefs = useRef([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const headline = headlineRef.current
    const axisLine = axisLineRef.current
    const scenes = sceneRefs.current.filter(Boolean)
    if (!headline || !axisLine || scenes.length !== MILESTONES.length) {
      return undefined
    }

    const letters = section.querySelectorAll('.systems-timeline-letter')
    if (!letters.length) return undefined

    // Deterministic initial state — overrides any inline transform left over
    // from a previous render (hot reload, fast refresh).
    const applyInitialState = () => {
      gsap.set(letters, { '--letter-fill': 0 })
      gsap.set(headline, { opacity: 1 })
      gsap.set(axisLine, { scaleY: 0, transformOrigin: 'bottom center' })
      gsap.set(scenes, { yPercent: 120, autoAlpha: 0 })
    }

    applyInitialState()

    if (!ready) return undefined // §5.1 gating: wait for LoadingScreen.

    let cancelled = false
    let ctx = null

    const buildAnimation = () => {
      if (cancelled) return

      ctx = gsap.context(() => {
        // Re-apply inside the context so ctx.revert() can restore it.
        applyInitialState()

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            // heavier smoothing makes milestone movement feel weighty + slow
            scrub: 1.5,
            invalidateOnRefresh: true,
          },
        })

        // ─── Phase A: 0.05 → 0.32 — per-letter ink fill (no movement) ──
        const phaseAStart = 0.05
        const phaseAEnd = 0.32
        const letterDur = 0.06
        const staggerEach =
          letters.length > 1
            ? (phaseAEnd - phaseAStart - letterDur) / (letters.length - 1)
            : 0

        tl.to(
          letters,
          {
            '--letter-fill': 1,
            ease: 'power2.out',
            duration: letterDur,
            stagger: { each: staggerEach, from: 'start' },
          },
          phaseAStart,
        )

        // ─── Phase B: 0.44 → 0.52 — axis grows + headline dims ─────────
        const phaseBStart = 0.44
        const phaseBDur = 0.08

        tl.to(
          axisLine,
          { scaleY: 1, duration: phaseBDur, ease: 'power2.inOut' },
          phaseBStart,
        )
        tl.to(
          headline,
          { opacity: 0.55, duration: phaseBDur, ease: 'power2.out' },
          phaseBStart,
        )

        // ─── Phase C: 0.52 → 0.98 — 7 milestone scenes, queued ────────
        // Each scene is treated as an independent object that scrolls
        // through the viewport. SCENE_SPACING > SCENE_DURATION leaves a
        // small gap between scenes so the previous one has fully exited
        // before the next one enters — no overlapping placeholders.
        const phaseCStart = 0.52
        const phaseCEnd = 0.98
        const phaseCDur = phaseCEnd - phaseCStart

        const SCENE_DURATION = 1.0
        const SCENE_SPACING = 1.35

        // Map scene-units onto the available master-timeline window so the
        // last scene's tail lands exactly at phaseCEnd.
        const totalUnits =
          (MILESTONES.length - 1) * SCENE_SPACING + SCENE_DURATION
        const unit = phaseCDur / totalUnits

        scenes.forEach((scene, i) => {
          const sceneStart = phaseCStart + i * SCENE_SPACING * unit
          const sceneDur = SCENE_DURATION * unit

          // y motion: 120 → 40 → 0 → -120 in three legs.
          //   leg 1 (25%): off-screen → entering, decelerates as it lands
          //   leg 2 (25%): drifts past 40 to the centre at constant rate
          //   leg 3 (50%): accelerates upward and off-screen
          // Marker + panel travel together because both are children.
          tl.fromTo(
            scene,
            { yPercent: 120 },
            {
              yPercent: 40,
              ease: 'power2.out',
              duration: sceneDur * 0.25,
            },
            sceneStart,
          )
          tl.to(
            scene,
            {
              yPercent: 0,
              ease: 'none',
              duration: sceneDur * 0.25,
            },
            sceneStart + sceneDur * 0.25,
          )
          tl.to(
            scene,
            {
              yPercent: -120,
              ease: 'power2.in',
              duration: sceneDur * 0.50,
            },
            sceneStart + sceneDur * 0.50,
          )

          // opacity: only at the entry / exit edges. The middle 50% of the
          // lifetime is fully opaque, so the visible change is real y
          // movement, not a crossfade.
          tl.fromTo(
            scene,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              ease: 'power2.out',
              duration: sceneDur * 0.25,
            },
            sceneStart,
          )
          tl.to(
            scene,
            {
              autoAlpha: 0,
              ease: 'power2.in',
              duration: sceneDur * 0.25,
            },
            sceneStart + sceneDur * 0.75,
          )
        })
      }, section)

      // Re-measure every trigger now that fonts have loaded and any earlier
      // pin spacer (OrbitGallery) is in the document. Without this our pin
      // window can be measured against a stale layout on the first scroll.
      ScrollTrigger.refresh()
    }

    // Wait for webfonts so per-letter widths are final before measuring.
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
    <section ref={sectionRef} className="systems-timeline-section">
      <div className="systems-timeline-sticky">
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

        {/* ─── Headline (left) ──────────────────────────────────────── */}
        <div className="systems-timeline-headline" ref={headlineRef}>
          <span className="systems-timeline-sr-only">
            {HEADLINE_LINES.join(' ')}
          </span>
          {HEADLINE_LINES.map((line, lineIdx) => (
            <span key={lineIdx} className="systems-timeline-line">
              {Array.from(line).map((ch, charIdx) =>
                ch === ' ' ? (
                  <span
                    key={charIdx}
                    className="systems-timeline-space"
                    aria-hidden="true"
                  >
                    &nbsp;
                  </span>
                ) : (
                  // Each letter is a single fixed-position inline-block.
                  // It never translates; CSS gradient + background-clip:text
                  // paint the glyph from below as --letter-fill rises 0 → 1.
                  <span
                    key={charIdx}
                    className="systems-timeline-letter"
                    aria-hidden="true"
                  >
                    {ch}
                  </span>
                ),
              )}
            </span>
          ))}
        </div>

        {/* ─── Vertical axis (centre-right) — no static dots ────────── */}
        <div className="systems-timeline-axis-wrap" aria-hidden="true">
          <span className="systems-timeline-axis-line" ref={axisLineRef} />
        </div>

        {/* ─── Milestone scenes (marker + panel ride up as one unit) ── */}
        <div className="systems-timeline-scenes-layer">
          {MILESTONES.map((m, i) => (
            <div
              key={m.code}
              className="systems-timeline-scene"
              ref={(el) => {
                sceneRefs.current[i] = el
              }}
            >
              <span
                className={`systems-timeline-scene-marker systems-timeline-scene-marker-${m.marker}`}
                aria-hidden="true"
              />
              <article className="systems-timeline-scene-panel">
                <div className="systems-timeline-panel-meta">
                  <span className="systems-timeline-panel-code">{m.code}</span>
                  <span className="systems-timeline-panel-year">{m.year}</span>
                </div>

                <div className="systems-timeline-panel-frame">
                  {m.image ? (
                    <img
                      className="systems-timeline-panel-img"
                      src={m.image}
                      alt={m.imageAlt}
                      loading="lazy"
                    />
                  ) : (
                    <PlaceholderFrame />
                  )}
                </div>

                <h3 className="systems-timeline-panel-title">{m.title}</h3>
                <p className="systems-timeline-panel-summary">{m.summary}</p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
