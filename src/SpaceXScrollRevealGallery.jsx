import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import SystemsTimeline, {
  SYSTEMS_SCROLL_RANGE_VH,
  SYSTEMS_TIMELINE_DURATION,
} from './SystemsTimeline'
import './SpaceXScrollRevealGallery.css'

gsap.registerPlugin(ScrollTrigger)

const FINAL_SLIDE_EXIT_VH = 210
const FINAL_SLIDE_EXIT_SCALE = 0.45
const FINAL_SLIDE_EXIT_Y = -62
const FINAL_TITLE_FADE_START_RATIO = 0
const FINAL_TITLE_FADE_END_RATIO = 1
const SLIDE_ENTRY_DURATION = 0.65
const SLIDE_HOLD_DURATION = 0.26
const SLIDE_PEEK_DURATION = 0.18
const ARCHIVE_SCRUB = true
const SYSTEMS_VISIBLE_FROM_PROGRESS = 0

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
          <span
            key={i}
            className="srg-intro-letter"
            data-archive-dir={i % 2 === 0 ? -18 : 18}
          >
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

const ARCHIVE_INTRO_VH = 240
const ARCHIVE_SLIDE_VH = 150
const ARCHIVE_SPACER_VH =
  ARCHIVE_INTRO_VH + SLIDES.length * ARCHIVE_SLIDE_VH + FINAL_SLIDE_EXIT_VH
const ARCHIVE_SCROLL_RANGE_VH = ARCHIVE_SPACER_VH - 100
const SLIDE_STRIDE = SLIDE_ENTRY_DURATION + SLIDE_HOLD_DURATION
const ARCHIVE_INTRO_DURATION =
  (ARCHIVE_INTRO_VH / ARCHIVE_SLIDE_VH) * SLIDE_STRIDE
const FINAL_SLIDE_EXIT_DURATION =
  (FINAL_SLIDE_EXIT_VH / ARCHIVE_SLIDE_VH) * SLIDE_STRIDE
const FINAL_SLIDE_EXIT_START_TIME =
  ARCHIVE_INTRO_DURATION +
  (SLIDES.length - 1) * SLIDE_STRIDE +
  SLIDE_ENTRY_DURATION +
  SLIDE_HOLD_DURATION
const ARCHIVE_TIMELINE_DURATION =
  FINAL_SLIDE_EXIT_START_TIME + FINAL_SLIDE_EXIT_DURATION
const FINAL_SLIDE_EXIT_START_VH =
  (FINAL_SLIDE_EXIT_START_TIME / ARCHIVE_TIMELINE_DURATION) *
  ARCHIVE_SCROLL_RANGE_VH
const FINAL_SLIDE_EXIT_SCROLL_VH =
  ARCHIVE_SCROLL_RANGE_VH - FINAL_SLIDE_EXIT_START_VH
const SYSTEMS_ENTRY_OFFSET_TIME =
  (FINAL_SLIDE_EXIT_SCROLL_VH / SYSTEMS_SCROLL_RANGE_VH) *
  SYSTEMS_TIMELINE_DURATION
const SYSTEMS_EMBED_START_OFFSET_VH = FINAL_SLIDE_EXIT_START_VH
const SYSTEMS_EMBED_SCROLL_RANGE_VH =
  SYSTEMS_SCROLL_RANGE_VH + FINAL_SLIDE_EXIT_SCROLL_VH
const COMBINED_SPACER_VH = ARCHIVE_SPACER_VH + SYSTEMS_SCROLL_RANGE_VH

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
      const archiveHeader = sectionRef.current?.querySelector('.srg-header')
      if (!slides.length || !spacer) return

      /* ── Timing knobs (timeline units) ─────────────────────────────
       * The intro occupies INTRO_DURATION units before the slides.
       * Stride between consecutive slides equals ENTRY + HOLD. EXIT is
       * derived (ENTRY − PEEK) so slide i+1 reaches centre exactly when
       * slide i finishes exiting. */
      const ENTRY = SLIDE_ENTRY_DURATION // Phase A — image rises to centre
      const HOLD = SLIDE_HOLD_DURATION   // Phase B — image LOCKED, caption reveals
      const PEEK = SLIDE_PEEK_DURATION   // Phase C — image LOCKED, next slide peeks
      const EXIT = ENTRY - PEEK // Phase D — image retreats while next rises
      const STRIDE = SLIDE_STRIDE
      const FINAL_EXIT = FINAL_SLIDE_EXIT_DURATION

      /* Match the localhost:5199 archive intro budget: 240vh. Its GSAP
       * duration is derived from the slide stride ratio so extending the
       * intro does not materially change the six image phase speed. */
      const INTRO_VH = ARCHIVE_INTRO_VH
      const INTRO_DURATION = ARCHIVE_INTRO_DURATION

      const FROM_Y = 100
      const EXIT_Y = -45
      const FROM_SCALE = 0.58
      const EXIT_SCALE = 0.9
      const CLIP_FROM = 'inset(30% 12% 30% 12%)'
      const CLIP_TO = 'inset(0% 0% 0% 0%)'

      /* Scroll budget — intro + slides occupy the archive range; the same
       * sticky stage then continues into the embedded systems timeline. */
      spacer.style.height = `${COMBINED_SPACER_VH}vh`

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
      if (archiveHeader) gsap.set(archiveHeader, { autoAlpha: 1 })

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
      if (introLetterEls.length) {
        gsap.set(introLetterEls, {
          '--letter-fill': 0,
          autoAlpha: 0,
          transformOrigin: '50% 75%',
        })
      }
      if (line1Letters.length) {
        gsap.set(line1Letters, {
          y: 38,
          rotateX: 72,
        })
      }
      if (line2Letters.length) {
        gsap.set(line2Letters, {
          y: 28,
          skewX: -12,
          scaleX: 0.78,
        })
      }
      if (line3Letters.length) {
        gsap.set(line3Letters, {
          x: (_index, target) => Number(target.dataset.archiveDir) || 0,
          y: 22,
          scale: 0.96,
        })
      }
      if (introContainer) gsap.set(introContainer, { yPercent: 0, opacity: 1 })
      /* Master timeline. Intro occupies 0→INTRO_DURATION, then slides
       * occupy INTRO_DURATION→end. The timeline is scrubbed by the
       * section spacer. */
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: spacer,
          start: 'top top',
          end: () => `+=${(ARCHIVE_SCROLL_RANGE_VH / 100) * window.innerHeight}`,
          scrub: ARCHIVE_SCRUB,
          invalidateOnRefresh: true,
        },
      })

      /* ── Intro: mirror the localhost:5199 archive typography.
       *
       * The first line reveals from the centre outward. The second line
       * reveals left-to-right. The third line reveals left-to-right while
       * letters alternate in from ±18px. Timing follows the 5199 demo:
       * line delay .18, character spread .26, character duration .32,
       * then the text only fades out from .82 → 1.00.
       */
      const ARCHIVE_LINE_DELAY = 0.18
      const ARCHIVE_CHAR_SPREAD = 0.26
      const ARCHIVE_CHAR_DURATION = 0.32
      const ARCHIVE_FADE_START = 0.82

      const scheduleArchiveLine = (letters, lineIndex) => {
        const list = Array.from(letters)
        list.forEach((letter, index) => {
          const order =
            lineIndex === 0
              ? Math.abs(index - (list.length - 1) / 2) / list.length
              : index / list.length
          const start =
            (lineIndex * ARCHIVE_LINE_DELAY + order * ARCHIVE_CHAR_SPREAD) *
            INTRO_DURATION
          const duration = ARCHIVE_CHAR_DURATION * INTRO_DURATION

          if (lineIndex === 0) {
            tl.to(
              letter,
              {
                '--letter-fill': 1,
                autoAlpha: 1,
                y: 0,
                rotateX: 0,
                duration,
                ease: 'power1.inOut',
              },
              start,
            )
          } else if (lineIndex === 1) {
            tl.to(
              letter,
              {
                '--letter-fill': 1,
                autoAlpha: 1,
                y: 0,
                skewX: 0,
                scaleX: 1,
                duration,
                ease: 'power1.inOut',
              },
              start,
            )
          } else {
            tl.to(
              letter,
              {
                '--letter-fill': 1,
                autoAlpha: 1,
                x: 0,
                y: 0,
                scale: 1,
                duration,
                ease: 'power1.inOut',
              },
              start,
            )
          }
        })
      }

      scheduleArchiveLine(line1Letters, 0)
      scheduleArchiveLine(line2Letters, 1)
      scheduleArchiveLine(line3Letters, 2)

      /* Intro exit — 5199 fades the archive typography out in place. */
      if (introContainer) {
        tl.to(introContainer, {
          yPercent: 0,
          opacity: 0,
          duration: (1 - ARCHIVE_FADE_START) * INTRO_DURATION,
          ease: 'none',
        }, ARCHIVE_FADE_START * INTRO_DURATION)
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

        /* ── Phase D — Exit. For slides 1→5 this crossfades into the next
         * archive image. The final slide uses the same scrubbed up + shrink
         * + fade motion before the embedded systems timeline begins. */
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
        } else if (wrap) {
          const finalExitStart = t + ENTRY + HOLD
          tl.to(
            wrap,
            {
              yPercent: FINAL_SLIDE_EXIT_Y,
              scale: FINAL_SLIDE_EXIT_SCALE,
              opacity: 0,
              duration: FINAL_EXIT,
              ease: 'none',
            },
            finalExitStart,
          )
          if (archiveHeader) {
            const fadeStart =
              finalExitStart + FINAL_EXIT * FINAL_TITLE_FADE_START_RATIO
            const fadeDuration =
              FINAL_EXIT *
              (FINAL_TITLE_FADE_END_RATIO - FINAL_TITLE_FADE_START_RATIO)
            tl.to(
              archiveHeader,
              {
                autoAlpha: 0,
                duration: fadeDuration,
                ease: 'none',
              },
              fadeStart,
            )
          }
        }
      })

      /* Index readout — flips at the midpoint of each slide's hold window.
       * Positions are offset by INTRO_VH to skip the intro scroll range. */
      slides.forEach((_, i) => {
        const startVh =
          INTRO_VH + i * ARCHIVE_SLIDE_VH + ARCHIVE_SLIDE_VH * 0.45
        const endVh =
          INTRO_VH + (i + 1) * ARCHIVE_SLIDE_VH + ARCHIVE_SLIDE_VH * 0.05
        ScrollTrigger.create({
          trigger: spacer,
          start: () => `top+=${(startVh / 100) * window.innerHeight} top`,
          end: () => `top+=${(endVh / 100) * window.innerHeight} top`,
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
          <SystemsTimeline
            ready={ready}
            embedded
            scrollTriggerRef={spacerRef}
            startOffsetVh={SYSTEMS_EMBED_START_OFFSET_VH}
            scrollRangeVh={SYSTEMS_EMBED_SCROLL_RANGE_VH}
            visibleFromProgress={SYSTEMS_VISIBLE_FROM_PROGRESS}
            entryOffsetTime={SYSTEMS_ENTRY_OFFSET_TIME}
          />
        </div>
      </div>
    </section>
  )
}
