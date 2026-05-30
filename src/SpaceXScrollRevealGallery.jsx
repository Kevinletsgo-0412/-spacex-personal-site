import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import './SpaceXScrollRevealGallery.css'

gsap.registerPlugin(ScrollTrigger)

/* ━━━ Intro text (hero headline, three lines) ━━━━━━━━━━━━━━━━━━━━━━━━━ */
const INTRO_LINES = [
  'ORBITAL ARCHIVE',
  'SIX ATTEMPTS TO LEAVE EARTH BEHIND',
  'A TIMELINE OF FAILURE, RECOVERY, AND ESCAPE',
]

/* Render a line as per-character <span>s for ink-fill animation.
   Each letter is a fixed inline-block; GSAP drives --letter-fill 0→1. */
function CharSplit({ text }) {
  if (!text) return null
  return (
    <>
      {Array.from(text).map((ch, i) =>
        ch === ' ' ? (
          <span key={i} className="srg-intro-space" aria-hidden="true">
            &nbsp;
          </span>
        ) : (
          <span key={i} className="srg-intro-letter">
            {ch}
          </span>
        ),
      )}
    </>
  )
}

/* ━━━ Six factual SpaceX milestones (data only; layout/animation below). ━━ */
const SLIDES = [
  {
    code: 'F1 · 003',
    program: 'FALCON 1',
    title: 'First Attempt',
    date: '2006.03.24',
    status: 'FAILURE',
    summary:
      'Debut orbital launch from Omelek Island. Lost thirty-three seconds after liftoff to a fuel-line corrosion failure. Telemetry was preserved for the next attempt.',
    src: '/gallery/p2OnPad.png',
    captionAlign: 'left',
    tone: 'dark',
  },
  {
    code: 'F1 · 005',
    program: 'FALCON 1',
    title: 'Orbit Achieved',
    date: '2008.09.28',
    status: 'SUCCESS',
    summary:
      'First privately funded liquid-fuel rocket to reach Earth orbit. Recovered the company from the brink of insolvency in a single flight.',
    src: '/gallery/p4.png',
    captionAlign: 'right',
    tone: 'dark',
  },
  {
    code: 'C2+ · 001',
    program: 'DRAGON',
    title: 'Station Rendezvous',
    date: '2012.05.25',
    status: 'SUCCESS',
    summary:
      'First commercial spacecraft to berth with the International Space Station. Delivered four hundred sixty kilograms of cargo and returned safely to the Pacific.',
    src: '/gallery/p3x.jpeg',
    captionAlign: 'left',
    tone: 'dark',
  },
  {
    code: 'FH · 001',
    program: 'FALCON HEAVY',
    title: 'Heavy Lift Demonstration',
    date: '2018.02.06',
    status: 'SUCCESS',
    summary:
      'Twin side boosters returned and landed in synchronised formation. A test payload was inserted into a heliocentric trajectory beyond the orbit of Mars.',
    src: '/gallery/p4x.jpg',
    captionAlign: 'right',
    tone: 'light',
  },
  {
    code: 'DM · 002',
    program: 'CREW DRAGON',
    title: 'Human Spaceflight',
    date: '2020.05.30',
    status: 'SUCCESS',
    summary:
      'First crewed orbital launch by a private operator. Restored U.S. crewed access to the International Space Station after a nine-year domestic gap.',
    src: '/gallery/p6x.jpeg',
    captionAlign: 'left',
    tone: 'dark',
  },
  {
    code: 'IFT · 004',
    program: 'STARSHIP',
    title: 'Fully Reusable System',
    date: '2024.06.06',
    status: 'OPERATIONAL',
    summary:
      'Both Super Heavy booster and Starship vehicle achieved controlled splashdown. First fully integrated reusability test of the next-generation system.',
    src: '/gallery/p5x.jpg',
    captionAlign: 'right',
    tone: 'dark',
  },
]

/* ━━━ Word splitter — each word is a single inline-block GSAP target.
       CSS parks it at translateY(0.5em)+opacity:0; the timeline scrubs
       it back to its natural position.                                 ━━ */
function WordSplit({ text }) {
  if (!text) return null
  const tokens = text.split(/(\s+)/)
  return (
    <>
      {tokens.map((tok, i) =>
        /^\s+$/.test(tok) ? (
          <span key={`s-${i}`} className="srg-word-space" aria-hidden="true">
            {' '}
          </span>
        ) : (
          <span key={`w-${i}`} className="srg-word">
            {tok}
          </span>
        ),
      )}
    </>
  )
}

/* ━━━ Image with safe placeholder fallback ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ArchiveImage({ src, alt, code }) {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return (
      <div className="srg-image-placeholder">
        <span>{code} · archive image pending</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  )
}

/* ━━━ Page 2 — stacked cinematic gallery, strict 4-phase per slide ━━━━
 *
 * One sticky stage, six slides stacked at ascending z-index. The user
 * spec requires a real hold at the centre during which the image is
 * fully locked and the caption word-rolls in. Only after the caption is
 * complete does the next slide begin peeking from the bottom; only
 * after a brief peek does the current slide begin its retreat.
 *
 * Per slide i, with stride = ENTRY + HOLD:
 *
 *   Phase A — Entry             [t,                       t + ENTRY]
 *     yPercent 100 → 0, scale 0.58 → 1, clip letterbox → 0
 *     image rises from off-screen to the viewport centre.
 *
 *   Phase B — HoldTextReveal    [t + ENTRY,               t + ENTRY + HOLD]
 *     image is LOCKED at centre (no tween touches it). Caption words
 *     scrub yPercent:50 → 0 with autoAlpha:0 → 1, left-to-right stagger.
 *
 *   Phase C — NextPeek          [t + ENTRY + HOLD,        t + ENTRY + HOLD + PEEK]
 *     slide i is still LOCKED. Slide i+1's Phase A starts at
 *     (i+1)·stride = t + ENTRY + HOLD, so during the first PEEK units of
 *     its entry it is only partly out from the viewport bottom — a
 *     letterbox climbing into view while slide i still holds.
 *
 *   Phase D — Exit              [t + ENTRY + HOLD + PEEK, t + ENTRY + HOLD + PEEK + EXIT]
 *     slide i now retreats: y 0 → EXIT_Y, scale 1 → EXIT_SCALE,
 *     opacity 1 → 0 — all on a single linear scrub so up + smaller +
 *     fading happen together. The exit ends precisely when slide i+1
 *     reaches centre (EXIT = ENTRY − PEEK by construction).
 *
 * Caption nodes live inside .srg-image-wrap, so they translate / scale /
 * fade with their image during Phase D — never stranded. */
export default function SpaceXScrollRevealGallery({ ready = true }) {
  const sectionRef = useRef(null)
  const spacerRef = useRef(null)
  const slideRefs = useRef([])
  const indexEl = useRef(null)
  const introRef = useRef(null)

  useLayoutEffect(() => {
    if (!ready) return undefined

    const ctx = gsap.context(() => {
      const slides = slideRefs.current.filter(Boolean)
      const spacer = spacerRef.current
      if (!slides.length || !spacer) return

      /* ── Timing knobs (timeline units) ─────────────────────────────
       * The intro occupies INTRO_DURATION units before the slides.
       * Stride between consecutive slides equals ENTRY + HOLD. EXIT is
       * derived (ENTRY − PEEK) so slide i+1 reaches centre exactly when
       * slide i finishes exiting. */
      const INTRO_DURATION = 0.80 // intro reveal + hold + exit
      const INTRO_VH = 140

      const ENTRY = 0.65        // Phase A — image rises to centre
      const HOLD = 0.26         // Phase B — image LOCKED, caption reveals
      const PEEK = 0.18         // Phase C — image LOCKED, next slide peeks
      const EXIT = ENTRY - PEEK // Phase D — image retreats while next rises
      const STRIDE = ENTRY + HOLD

      const FROM_Y = 100
      const EXIT_Y = -45
      const FROM_SCALE = 0.58
      const EXIT_SCALE = 0.9
      const CLIP_FROM = 'inset(30% 12% 30% 12%)'
      const CLIP_TO = 'inset(0% 0% 0% 0%)'

      /* Scroll budget — intro occupies INTRO_VH, then each slide cycle
       * consumes SLIDE_VH of fresh scroll. TAIL_VH covers the last
       * slide's hold + caption reveal before sticky releases. */
      const SLIDE_VH = 150
      const TAIL_VH = 60
      spacer.style.height = `${INTRO_VH + slides.length * SLIDE_VH + TAIL_VH}vh`

      /* Initial poses.
       *
       * Slide 0 is parked at FROM_Y, ready to start its entry immediately
       * (the very first scroll tick lifts it off the bottom). Slides 1..N
       * are parked at FROM_Y as well — they're already off-screen below,
       * invisible without needing an opacity hack. */
      slides.forEach((slide) => {
        const wrap = slide.querySelector('.srg-image-wrap')
        const words = slide.querySelectorAll('.srg-word')
        if (wrap) {
          gsap.set(wrap, {
            yPercent: FROM_Y,
            scale: FROM_SCALE,
            clipPath: CLIP_FROM,
            opacity: 1,
            force3D: true,
          })
        }
        if (words.length) gsap.set(words, { yPercent: 50, autoAlpha: 0 })
      })

      /* Intro initial state — letters start unfilled, container at origin. */
      const introContainer = introRef.current
      const introLetterEls =
        introContainer ? introContainer.querySelectorAll('.srg-intro-letter') : []
      const line1Letters =
        introContainer ? introContainer.querySelectorAll('[data-intro-line="0"] .srg-intro-letter') : []
      const line2Letters =
        introContainer ? introContainer.querySelectorAll('[data-intro-line="1"] .srg-intro-letter') : []
      const line3Letters =
        introContainer ? introContainer.querySelectorAll('[data-intro-line="2"] .srg-intro-letter') : []

      if (introLetterEls.length) gsap.set(introLetterEls, { '--letter-fill': 0 })
      if (introContainer) gsap.set(introContainer, { yPercent: 0, opacity: 1 })

      /* Master timeline. Intro occupies 0→INTRO_DURATION, then slides
       * occupy INTRO_DURATION→end. The timeline is scrubbed by the
       * section spacer. */
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: spacer,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })

      /* ── Intro: three lines reveal sequentially, then exit ──────
       * Line 1 — "ORBITAL ARCHIVE" (0.00 → 0.20)
       * Line 2 — "SIX ATTEMPTS..."     (0.16 → 0.36)
       * Line 3 — "A TIMELINE..."       (0.32 → 0.52)
       * Hold + exit                    (0.52 → 0.78)
       *
       * Each line uses the per-letter ink-fill technique from Page 3:
       * --letter-fill goes 0→1, staggered left-to-right within the line.
       * After all three are done, the container translates up + fades. */
      const INTRO_LETTER_DUR = 0.03

      if (line1Letters.length) {
        const each = line1Letters.length > 1
          ? (0.20 - INTRO_LETTER_DUR) / (line1Letters.length - 1)
          : 0
        tl.to(line1Letters, {
          '--letter-fill': 1,
          duration: INTRO_LETTER_DUR,
          ease: 'power2.out',
          stagger: { each, from: 'start' },
        }, 0)
      }

      if (line2Letters.length) {
        const each = line2Letters.length > 1
          ? (0.20 - INTRO_LETTER_DUR) / (line2Letters.length - 1)
          : 0
        tl.to(line2Letters, {
          '--letter-fill': 1,
          duration: INTRO_LETTER_DUR,
          ease: 'power2.out',
          stagger: { each, from: 'start' },
        }, 0.16)
      }

      if (line3Letters.length) {
        const each = line3Letters.length > 1
          ? (0.20 - INTRO_LETTER_DUR) / (line3Letters.length - 1)
          : 0
        tl.to(line3Letters, {
          '--letter-fill': 1,
          duration: INTRO_LETTER_DUR,
          ease: 'power2.out',
          stagger: { each, from: 'start' },
        }, 0.32)
      }

      /* Intro exit — translate up + fade out (0.52 → 0.78) */
      if (introContainer) {
        tl.to(introContainer, {
          yPercent: -28,
          opacity: 0,
          duration: 0.26,
          ease: 'power2.in',
        }, 0.52)
      }

      /* ── Slides — each shifted by INTRO_DURATION ──────────────── */
      slides.forEach((slide, i) => {
        const wrap = slide.querySelector('.srg-image-wrap')
        const words = slide.querySelectorAll('.srg-word')
        /* Slide i+1's Phase A is scheduled at (i+1)·STRIDE, i.e. right
         * after slide i finishes its hold. The next-peek and exit are
         * scheduled on top of that, ENTRY-aligned, so the math closes:
         *   slide i exit ends at  t + ENTRY + HOLD + PEEK + EXIT
         *                       = t + STRIDE + ENTRY                (substitute EXIT)
         *                       = slide i+1's Phase A end ✓
         */
        const t = INTRO_DURATION + i * STRIDE

        /* ── Phase A — Entry (image rises from below to centre) ── */
        if (wrap) {
          tl.fromTo(
            wrap,
            {
              yPercent: FROM_Y,
              scale: FROM_SCALE,
              clipPath: CLIP_FROM,
              opacity: 1,
            },
            {
              yPercent: 0,
              scale: 1,
              clipPath: CLIP_TO,
              opacity: 1,
              duration: ENTRY,
            },
            t,
          )
        }

        /* ── Phase B — HoldTextReveal.
         *
         * Image is intentionally NOT tweened in this window — it stays
         * at the Phase A end pose. Only the caption words animate,
         * yPercent:50 → 0 and autoAlpha:0 → 1, left-to-right stagger.
         * Stagger fills HOLD so the very last word lands exactly as the
         * hold ends and Phase C (next-peek) begins. */
        if (words.length) {
          const wordDur = Math.min(0.06, HOLD * 0.28)
          const each =
            words.length > 1 ? (HOLD - wordDur) / (words.length - 1) : 0
          tl.fromTo(
            words,
            { yPercent: 50, autoAlpha: 0 },
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: wordDur,
              ease: 'power2.out',
              stagger: { each, from: 'start' },
            },
            t + ENTRY,
          )
        }

        /* ── Phase C — NextPeek (no tween for slide i; slide i+1's
         * Phase A is already scheduled at t + STRIDE = t + ENTRY + HOLD,
         * so the bottom of the viewport now shows the next letterbox
         * climbing while this slide remains locked at centre). ── */

        /* ── Phase D — Exit. Skipped for the last slide so it stays on
         * screen as Page 2 hands off to Page 3. All three changes (up,
         * smaller, fade) run on a single linear scrub so they're truly
         * synchronous. */
        if (wrap && i < slides.length - 1) {
          tl.to(
            wrap,
            {
              yPercent: EXIT_Y,
              scale: EXIT_SCALE,
              opacity: 0,
              duration: EXIT,
              ease: 'none',
            },
            t + ENTRY + HOLD + PEEK,
          )
        }
      })

      /* Index readout — flips at the midpoint of each slide's hold window.
       * Positions are offset by INTRO_VH to skip the intro scroll range. */
      slides.forEach((_, i) => {
        const total = INTRO_VH + slides.length * SLIDE_VH + TAIL_VH
        const startVh = INTRO_VH + i * SLIDE_VH + SLIDE_VH * 0.45
        const endVh = INTRO_VH + (i + 1) * SLIDE_VH + SLIDE_VH * 0.05
        ScrollTrigger.create({
          trigger: spacer,
          start: () => `top+=${(startVh / total) * spacer.offsetHeight} top`,
          end: () => `top+=${(endVh / total) * spacer.offsetHeight} top`,
          onToggle: (self) => {
            if (self.isActive && indexEl.current) {
              const n = String(i + 1).padStart(2, '0')
              const tot = String(slides.length).padStart(2, '0')
              indexEl.current.textContent = `${n} / ${tot}`
            }
          },
        })
      })

      ScrollTrigger.refresh()
    }, sectionRef)

    return () => ctx.revert()
  }, [ready])

  return (
    <section ref={sectionRef} className="srg-section">
      <div ref={spacerRef} className="srg-scroll-spacer">
        <div className="srg-stage">
          <header className="srg-header">
            <div>
              <span className="srg-header-pulse" aria-hidden="true" />
              <span className="srg-header-title">Orbital Archive</span>
              <span className="srg-header-divider">/</span>
              <span className="srg-header-count">06 records</span>
            </div>
            <div>
              <span ref={indexEl} className="srg-header-index">
                01 / 06
              </span>
            </div>
          </header>

          {/* ── Intro hero text (before slides) ─────────────────── */}
          <div ref={introRef} className="srg-intro-container" aria-label="Orbital Archive introduction">
            {INTRO_LINES.map((line, lineIdx) => (
              <span
                key={lineIdx}
                className={`srg-intro-line srg-intro-line-${lineIdx + 1}`}
                data-intro-line={lineIdx}
              >
                <CharSplit text={line} />
              </span>
            ))}
          </div>

          {SLIDES.map((item, i) => (
            <article
              key={item.code}
              ref={(el) => {
                slideRefs.current[i] = el
              }}
              className="srg-slide"
              data-tone={item.tone || 'dark'}
              style={{ zIndex: 10 + i }}
              aria-label={`${item.program} — ${item.title}`}
            >
              <div className="srg-image-wrap">
                <div className="srg-image">
                  <ArchiveImage
                    src={item.src}
                    alt={`${item.program} — ${item.title}`}
                    code={item.code}
                  />
                  <div className="srg-image-scrim" aria-hidden="true" />

                  <div
                    className="srg-caption"
                    data-align={item.captionAlign || 'left'}
                  >
                    <div className="srg-eyebrow">
                      <span className="srg-eyebrow-program">
                        <WordSplit text={item.program} />
                      </span>
                      <span className="srg-eyebrow-divider">·</span>
                      <span className="srg-eyebrow-code">
                        <WordSplit text={item.code} />
                      </span>
                    </div>
                    <h2 className="srg-title">
                      <WordSplit text={item.title} />
                    </h2>
                    <div className="srg-date">
                      <WordSplit text={item.date} />
                    </div>
                    <p className="srg-desc">
                      <WordSplit text={item.summary} />
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
