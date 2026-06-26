/* SystemsTimeline — Page 3 / Starship Manifest.
 *
 * One sticky stage and one master ScrollTrigger control the complete story:
 *   1. Headline letters fill from below.
 *   2. The vertical timeline grows from the bottom of the viewport.
 *   3. One continuous timeline accelerates from 60vw to 8vw. Its width
 *      swells into a single stretched band, then contracts to a hairline.
 *   4. Three anchors travel strictly ON the final timeline, bottom → hold
 *      point → top. Each anchor pulls a horizontal connector to the right.
 *   5. The connector becomes the video's baseline; the video is revealed
 *      upward from that line, holds, then is cropped from bottom to top.
 *
 * Coordination contracts preserved from DESIGN_SYSTEM.md:
 *   • `ready` gates construction until the loading overlay has completed.
 *   • useEffect (not useLayoutEffect) keeps sibling trigger order stable.
 *   • document.fonts.ready is awaited before measuring.
 *   • one master ScrollTrigger writes every animated property.
 *   • ScrollTrigger.refresh() runs once after construction.
 *   • cleanup cancels the pending font promise, reverts the GSAP context,
 *     and pauses any active video.
 */
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import buildStarshipVideo from '../个人站/Snippets/BuildStarship.mp4?url'
import launchAndFallVideo from '../个人站/Snippets/V3Launch&Fall.mp4?url'
import rocketCollectionVideo from '../个人站/Snippets/rocketCollection.mp4?url'
import SatelliteGlobe from './components/SatelliteGlobe'
import './SystemsTimeline.css'

gsap.registerPlugin(ScrollTrigger)

/* ━━━ Star-field for mask layer ━━━━━━━━━━━━━━━━━━━ */
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

const HEADLINE_LINES = [
  'BUILD',
  'THE FUTURE.',
  'ONE TEST',
  'AT A TIME.',
]

const RECORDS = [
  {
    code: 'REC · 001',
    index: '001',
    phase: 'ASSEMBLY · V3',
    title: 'Building Ship 39',
    titleLines: ['BUILDING', 'SHIP 39'],
    summary:
      'Inside Starfactory, Ship 39 takes shape as a Starship V3 vehicle: stainless-steel tank sections are joined, propulsion and avionics are integrated, and the tiled heat shield is fitted around the airframe. V3 also introduces a redesigned propulsion architecture, greater propellant volume, and Raptor 3 — changes intended to increase performance while simplifying how the vehicle is built, inspected, and flown again.',
    src: buildStarshipVideo,
  },
  {
    code: 'REC · 002',
    index: '002',
    phase: 'FLIGHT 01',
    title: 'The first full stack',
    titleLines: ['THE FIRST', 'FULL STACK'],
    summary:
      'On April 20, 2023, Starship and Super Heavy flew together for the first time. The integrated vehicle cleared Starbase and climbed to roughly 39 kilometers before losing control; the flight termination system ended the test. It did not complete the mission profile, but it proved the full stack could launch and produced the evidence behind 63 FAA-tracked corrective actions before the next flight.',
    src: launchAndFallVideo,
  },
  {
    code: 'REC · 003',
    index: '003',
    phase: 'ITERATE',
    title: 'Hardware becomes data',
    titleLines: ['HARDWARE', 'BECOMES DATA'],
    summary:
      'Starship is developed as a continuous campaign, not a single launch. Engines fire, vehicles roll, ground teams rehearse, and every flight sends evidence back into the next build. Since Flight 1, the active test program has moved toward a fully reusable system: Super Heavy returning to the launch site, Starship surviving reentry, and both stages flying again with less work between missions.',
    src: rocketCollectionVideo,
  },
]

const CLOSING_TEXT =
  "We are building the world's most advanced satellite constellation — " +
  'connecting the unconnected, from the peaks of the Himalayas ' +
  'to the most remote islands of the Pacific.'

const SCENES_START = 0.4
const SCENES_END = 0.84
const SCENE_DURATION = (SCENES_END - SCENES_START) / RECORDS.length

const TRANSITION_TEXT_START = 0.91
const TRANSITION_TEXT_DURATION = 0.17
const TRANSITION_LINE_START = 1.12
const TRANSITION_LINE_DURATION = 0.16
const TRANSITION_EXPAND_START = 1.36
const TRANSITION_EXPAND_DURATION = 0.16
const TRANSITION_END = TRANSITION_EXPAND_START + TRANSITION_EXPAND_DURATION

const SYSTEMS_SCROLL_DISTANCE_VH = 1350
const SYSTEMS_SECTION_MIN_HEIGHT = `${
  100 + SYSTEMS_SCROLL_DISTANCE_VH * TRANSITION_END
}vh`

function TitleReveal({ lines }) {
  return (
    <>
      {lines.map((line, lineIndex) => (
        <span
          key={`${line}-${lineIndex}`}
          className="systems-timeline-title-line"
          aria-hidden="true"
        >
          {Array.from(line).map((character, characterIndex) =>
            character === ' ' ? (
              <span
                key={characterIndex}
                className="systems-timeline-title-space"
                aria-hidden="true"
              >
                &nbsp;
              </span>
            ) : (
              <span
                key={characterIndex}
                className="systems-timeline-title-char"
              >
                {character}
              </span>
            ),
          )}
        </span>
      ))}
    </>
  )
}

function SummaryReveal({ text }) {
  if (!text) return null

  const tokens = text.split(/(\s+)/)

  return (
    <>
      {tokens.map((token, index) =>
        /^\s+$/.test(token) ? (
          <span
            key={`summary-space-${index}`}
            className="systems-timeline-summary-space"
            aria-hidden="true"
          >
            {' '}
          </span>
        ) : (
          <span
            key={`summary-word-${index}`}
            className="systems-timeline-summary-word"
            data-direction={index % 2 === 0 ? -8 : 8}
          >
            {token}
          </span>
        ),
      )}
    </>
  )
}

export default function SystemsTimeline({ ready = true }) {
  const sectionRef = useRef(null)
  const headlineRef = useRef(null)
  const axisLineRef = useRef(null)
  const sceneRefs = useRef([])
  const videoRefs = useRef([])
  const closingTextRef = useRef(null)
  const maskRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const headline = headlineRef.current
    const axisLine = axisLineRef.current
    const scenes = sceneRefs.current.filter(Boolean)
    const videos = videoRefs.current.filter(Boolean)

    if (
      !section ||
      !headline ||
      !axisLine ||
      scenes.length !== RECORDS.length ||
      videos.length !== RECORDS.length
    ) {
      return undefined
    }

    const letters = Array.from(
      section.querySelectorAll('.systems-timeline-letter'),
    )
    const markers = scenes.map((scene) =>
      scene.querySelector('.systems-timeline-scene-marker'),
    )
    const connectors = scenes.map((scene) =>
      scene.querySelector('.systems-timeline-connector'),
    )
    const copies = scenes.map((scene) =>
      scene.querySelector('.systems-timeline-scene-copy'),
    )
    const media = scenes.map((scene) =>
      scene.querySelector('.systems-timeline-media'),
    )
    const textLayers = scenes.map((scene) => ({
      meta: scene.querySelector('.systems-timeline-panel-meta'),
      titleChars: Array.from(
        scene.querySelectorAll('.systems-timeline-title-char'),
      ),
      summaryWords: Array.from(
        scene.querySelectorAll('.systems-timeline-summary-word'),
      ),
    }))

    if (
      !letters.length ||
      markers.some((marker) => !marker) ||
      connectors.some((connector) => !connector) ||
      copies.some((copy) => !copy) ||
      media.some((item) => !item) ||
      textLayers.some(
        (layer) =>
          !layer.meta ||
          !layer.titleChars.length ||
          !layer.summaryWords.length,
      )
    ) {
      return undefined
    }

    const applyInitialState = () => {
      gsap.set(letters, { '--letter-fill': 0 })
      gsap.set(headline, { autoAlpha: 1, y: 0 })
      gsap.set(axisLine, {
        left: '60%',
        width: 1,
        xPercent: -50,
        scaleY: 0,
        transformOrigin: 'bottom center',
        clipPath: 'inset(0 0 0 0)',
      })
      gsap.set(scenes, { autoAlpha: 1 })
      gsap.set(markers, { top: '112%', autoAlpha: 0 })
      gsap.set(connectors, {
        scaleX: 0,
        autoAlpha: 0,
        transformOrigin: 'left center',
      })
      gsap.set(copies, { '--copy-y': '18px', autoAlpha: 0 })
      gsap.set(media, {
        clipPath: 'inset(100% 0% 0% 0%)',
      })
      textLayers.forEach((layer) => {
        gsap.set(layer.meta, { y: 18, autoAlpha: 0 })
        gsap.set(layer.titleChars, {
          x: '0.55em',
          skewX: -12,
          scaleX: 0.94,
          autoAlpha: 0.06,
          color: 'rgb(217, 217, 217)',
          transformOrigin: '50% 75%',
        })
        gsap.set(layer.summaryWords, {
          '--summary-fill': 0,
          x: (_index, target) => Number(target.dataset.direction) || 0,
          y: 12,
          skewX: -4,
          autoAlpha: 0,
        })
      })
    }

    applyInitialState()

    if (!ready) return undefined

    let cancelled = false
    let ctx = null

    const syncVideoPlayback = (timelineTime) => {
      videos.forEach((video, index) => {
        const sceneStart = SCENES_START + index * SCENE_DURATION
        const localProgress = (timelineTime - sceneStart) / SCENE_DURATION
        const shouldLoad = localProgress > -0.25 && localProgress < 1.08
        const shouldPlay = localProgress > 0.12 && localProgress < 0.98

        if (shouldLoad && !video.getAttribute('src')) {
          video.setAttribute('src', video.dataset.src)
          video.preload = 'auto'
          video.load()
        }

        if (shouldPlay && video.dataset.active !== 'true') {
          video.dataset.active = 'true'
          const playPromise = video.play()
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {})
          }
        } else if (!shouldPlay && video.dataset.active === 'true') {
          video.dataset.active = 'false'
          video.pause()
        }
      })
    }

    const buildAnimation = () => {
      if (cancelled) return

      ctx = gsap.context(() => {
        applyInitialState()

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.15,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              syncVideoPlayback(self.progress * TRANSITION_END)
            },
            onRefresh: (self) => {
              syncVideoPlayback(self.progress * TRANSITION_END)
            },
            onLeaveBack: (self) => {
              self.animation?.progress(0)
              syncVideoPlayback(0)
            },
          },
        })

        // Phase 1 — headline ink fill.
        const headlineStart = 0.01
        const headlineEnd = 0.17
        const letterDuration = 0.035
        const staggerEach =
          letters.length > 1
            ? (headlineEnd - headlineStart - letterDuration) /
              (letters.length - 1)
            : 0

        tl.to(
          letters,
          {
            '--letter-fill': 1,
            duration: letterDuration,
            ease: 'power2.out',
            stagger: { each: staggerEach, from: 'start' },
          },
          headlineStart,
        )

        // Phase 2 — timeline grows upward while the headline holds.
        tl.to(
          axisLine,
          {
            scaleY: 1,
            duration: 0.06,
            ease: 'power2.inOut',
          },
          0.17,
        )

        // Phase 3 — one continuous line accelerates left. Its thickness
        // follows one inverted-U envelope: hairline → broad band → hairline.
        const shiftStart = 0.24
        const shiftDuration = 0.15

        tl.to(
          headline,
          {
            autoAlpha: 0,
            y: -18,
            duration: 0.1,
            ease: 'power2.in',
          },
          shiftStart,
        )
        tl.to(
          axisLine,
          {
            left: '8vw',
            duration: shiftDuration,
            ease: 'power2.inOut',
          },
          shiftStart,
        )
        tl.to(
          axisLine,
          {
            width: 40,
            duration: shiftDuration * 0.5,
            ease: 'power2.in',
          },
          shiftStart,
        )
        tl.to(
          axisLine,
          {
            width: 1,
            duration: shiftDuration * 0.5,
            ease: 'power2.out',
          },
          shiftStart + shiftDuration * 0.5,
        )

        // Phase 4 — three video records.
        scenes.forEach((scene, index) => {
          const sceneStart = SCENES_START + index * SCENE_DURATION
          const marker = markers[index]
          const connector = connectors[index]
          const copy = copies[index]
          const mediaItem = media[index]
          const textLayer = textLayers[index]
          const getMediaBottom = () => {
            const sceneBounds = scene.getBoundingClientRect()
            const mediaBounds = mediaItem.getBoundingClientRect()

            return mediaBounds.bottom - sceneBounds.top
          }

          // The anchor begins below the viewport but remains on the exact
          // x-coordinate of the final timeline for its entire journey.
          tl.to(
            marker,
            {
              autoAlpha: 1,
              duration: SCENE_DURATION * 0.04,
            },
            sceneStart,
          )
          tl.to(
            marker,
            {
              top: getMediaBottom,
              duration: SCENE_DURATION * 0.22,
              ease: 'power2.inOut',
            },
            sceneStart,
          )

          tl.to(
            copy,
            {
              '--copy-y': '0px',
              autoAlpha: 1,
              duration: SCENE_DURATION * 0.04,
              ease: 'none',
            },
            sceneStart + SCENE_DURATION * 0.08,
          )

          tl.to(
            textLayer.meta,
            {
              y: 0,
              autoAlpha: 1,
              duration: SCENE_DURATION * 0.16,
              ease: 'power2.out',
            },
            sceneStart + SCENE_DURATION * 0.1,
          )

          const titleWindow = SCENE_DURATION * 0.22
          const titleDuration = Math.min(
            SCENE_DURATION * 0.045,
            titleWindow * 0.4,
          )
          const titleEach =
            textLayer.titleChars.length > 1
              ? (titleWindow - titleDuration) /
                (textLayer.titleChars.length - 1)
              : 0

          tl.to(
            textLayer.titleChars,
            {
              x: 0,
              skewX: 0,
              scaleX: 1,
              autoAlpha: 1,
              color: 'rgb(10, 10, 10)',
              duration: titleDuration,
              ease: 'power2.out',
              stagger: { each: titleEach, from: 'start' },
            },
            sceneStart + SCENE_DURATION * 0.16,
          )

          const summaryWindow = SCENE_DURATION * 0.2
          const summaryDuration = Math.min(
            SCENE_DURATION * 0.04,
            summaryWindow * 0.35,
          )
          const summaryEach =
            textLayer.summaryWords.length > 1
              ? (summaryWindow - summaryDuration) /
                (textLayer.summaryWords.length - 1)
              : 0

          tl.to(
            textLayer.summaryWords,
            {
              '--summary-fill': 1,
              x: 0,
              y: 0,
              skewX: 0,
              autoAlpha: 1,
              duration: summaryDuration,
              ease: 'power2.out',
              stagger: { each: summaryEach, from: 'start' },
            },
            sceneStart + SCENE_DURATION * 0.42,
          )

          // A horizontal signal is pulled from the anchor. It finishes on
          // the same y-coordinate as the video's lower edge.
          tl.set(
            connector,
            {
              top: getMediaBottom,
              autoAlpha: 1,
            },
            sceneStart + SCENE_DURATION * 0.14,
          )
          tl.to(
            connector,
            {
              scaleX: 1,
              duration: SCENE_DURATION * 0.16,
              ease: 'power2.inOut',
            },
            sceneStart + SCENE_DURATION * 0.14,
          )

          // The complete media container—not just the <video>—is clipped.
          // Its bottom edge stays fixed on the connector while the visible
          // area grows upward.
          tl.to(
            mediaItem,
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: SCENE_DURATION * 0.3,
              ease: 'power2.inOut',
            },
            sceneStart + SCENE_DURATION * 0.18,
          )

          // Hold: no tween touches the media between 48% and 66%.

          // Crop from the bottom upward until the frame disappears.
          tl.to(
            mediaItem,
            {
              clipPath: 'inset(0% 0% 100% 0%)',
              duration: SCENE_DURATION * 0.3,
              ease: 'power2.inOut',
            },
            sceneStart + SCENE_DURATION * 0.66,
          )
          tl.to(
            copy,
            {
              '--copy-y': '-14px',
              autoAlpha: 0,
              duration: SCENE_DURATION * 0.2,
              ease: 'power2.in',
            },
            sceneStart + SCENE_DURATION * 0.74,
          )
          tl.to(
            connector,
            {
              scaleX: 0,
              autoAlpha: 0,
              duration: SCENE_DURATION * 0.16,
              ease: 'power2.in',
              transformOrigin: 'right center',
            },
            sceneStart + SCENE_DURATION * 0.8,
          )

          // The same anchor continues upward on the timeline and leaves
          // through the top edge before the next anchor arrives below.
          tl.to(
            marker,
            {
              top: '-12%',
              duration: SCENE_DURATION * 0.32,
              ease: 'power2.in',
            },
            sceneStart + SCENE_DURATION * 0.68,
          )
          tl.to(
            marker,
            {
              autoAlpha: 0,
              duration: SCENE_DURATION * 0.06,
            },
            sceneStart + SCENE_DURATION * 0.94,
          )
        })

        // Phase 5 — axisLine retracts from bottom to top
        // (bottom disappears first, top disappears last).
        tl.to(
          axisLine,
          {
            clipPath: 'inset(0 0 100% 0)',
            duration: TRANSITION_TEXT_START - SCENES_END,
            ease: 'power2.in',
          },
          SCENES_END,
        )

        // Phase 6 — closing text word-by-word reveal.
        const closingPara = closingTextRef.current
        if (closingPara) {
          const rawText = closingPara.textContent || ''
          const tokens = rawText.split(/(\s+)/)
          closingPara.innerHTML = tokens
            .map((t) =>
              /^\s+$/.test(t)
                ? ' '
                : `<span style="display:inline-block;overflow:hidden;vertical-align:top"><span class="st-closing-word">${t}</span></span>`,
            )
            .join('')
          const wordEls = closingPara.querySelectorAll('.st-closing-word')

          gsap.set(wordEls, {
            yPercent: 100,
            autoAlpha: 0,
            display: 'inline-block',
          })

          gsap.set(closingPara, { autoAlpha: 1 })

          const wordDuration = 0.03
          const wordStagger =
            wordEls.length > 1
              ? (TRANSITION_TEXT_DURATION - wordDuration) /
                (wordEls.length - 1)
              : 0

          tl.to(
            wordEls,
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: wordDuration,
              ease: 'power2.out',
              stagger: {
                each: Math.max(wordStagger, 0),
                from: 'start',
              },
            },
            TRANSITION_TEXT_START,
          )

          tl.to(
            closingPara,
            {
              autoAlpha: 0,
              duration: TRANSITION_EXPAND_DURATION * 0.55,
              ease: 'power1.in',
            },
            TRANSITION_EXPAND_START + TRANSITION_EXPAND_DURATION * 0.2,
          )
        }

        // Phase 7 — mask horizontal sweep: left → right
        // Phase 8 — mask vertical expansion: up + down
        // (Uses CSS custom properties so GSAP interpolates pure numbers,
        //  avoiding clipPath string-parsing jumps.)
        const maskEl = maskRef.current
        if (maskEl) {
          gsap.set(maskEl, {
            '--st-mask-right': 100,
            '--st-mask-top': 50,
            '--st-mask-bottom': 50,
          })
          // Phase 7: right sweeps 100→0 (left→right band). This happens
          // after the closing sentence finishes, while the white background
          // and text remain visually still.
          tl.fromTo(
            maskEl,
            {
              '--st-mask-right': 100,
            },
            {
              '--st-mask-right': 0,
              duration: TRANSITION_LINE_DURATION,
              ease: 'none',
              immediateRender: false,
            },
            TRANSITION_LINE_START,
          )
          // Concurrently: top/bottom form the thin band
          tl.fromTo(
            maskEl,
            {
              '--st-mask-top': 50,
              '--st-mask-bottom': 50,
            },
            {
              '--st-mask-top': 49.2,
              '--st-mask-bottom': 49.2,
              duration: TRANSITION_LINE_DURATION,
              ease: 'none',
              immediateRender: false,
            },
            TRANSITION_LINE_START,
          )
          // Phase 8: top/bottom expand 49.2→0 (vertical fill)
          tl.fromTo(
            maskEl,
            {
              '--st-mask-top': 49.2,
              '--st-mask-bottom': 49.2,
            },
            {
              '--st-mask-top': 0,
              '--st-mask-bottom': 0,
              duration: TRANSITION_EXPAND_DURATION,
              ease: 'power2.inOut',
              immediateRender: false,
            },
            TRANSITION_EXPAND_START,
          )
        }
      }, section)

      ScrollTrigger.refresh()
    }

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
      videos.forEach((video) => {
        video.pause()
        delete video.dataset.active
      })
      if (ctx) {
        ctx.revert()
        ctx = null
      }
    }
  }, [ready])

  return (
    <section
      ref={sectionRef}
      className="systems-timeline-section"
      style={{ '--systems-section-min-height': SYSTEMS_SECTION_MIN_HEIGHT }}
    >
      <div className="systems-timeline-sticky">
        <header className="systems-timeline-header">
          <div className="systems-timeline-header-group">
            <span className="systems-timeline-pulse" aria-hidden="true" />
            <span className="systems-timeline-header-title">
              Starship Manifest
            </span>
            <span className="systems-timeline-header-divider">/</span>
            <span className="systems-timeline-header-count">
              03 field records
            </span>
          </div>
          <div className="systems-timeline-header-group">
            <span className="systems-timeline-header-hint">
              Fabricate → Test → Iterate
            </span>
          </div>
        </header>

        <div className="systems-timeline-headline" ref={headlineRef}>
          <span className="systems-timeline-sr-only">
            {HEADLINE_LINES.join(' ')}
          </span>
          {HEADLINE_LINES.map((line, lineIndex) => (
            <span key={lineIndex} className="systems-timeline-line">
              {Array.from(line).map((character, characterIndex) =>
                character === ' ' ? (
                  <span
                    key={characterIndex}
                    className="systems-timeline-space"
                    aria-hidden="true"
                  >
                    &nbsp;
                  </span>
                ) : (
                  <span
                    key={characterIndex}
                    className="systems-timeline-letter"
                    aria-hidden="true"
                  >
                    {character}
                  </span>
                ),
              )}
            </span>
          ))}
        </div>

        <div className="systems-timeline-axis-wrap" aria-hidden="true">
          <span className="systems-timeline-axis-line" ref={axisLineRef} />
        </div>

        <div className="systems-timeline-scenes-layer">
          {RECORDS.map((record, index) => (
            <div
              key={record.code}
              className="systems-timeline-scene"
              ref={(element) => {
                sceneRefs.current[index] = element
              }}
            >
              <span className="systems-timeline-scene-marker">
                <span className="systems-timeline-marker-index">
                  {record.index}
                </span>
              </span>

              <span
                className="systems-timeline-connector"
                aria-hidden="true"
              />

              <article className="systems-timeline-scene-copy">
                <div className="systems-timeline-panel-meta">
                  <span className="systems-timeline-panel-code">
                    {record.code}
                  </span>
                  <span className="systems-timeline-panel-phase">
                    {record.phase}
                  </span>
                </div>
                <h3
                  className="systems-timeline-panel-title"
                  aria-label={record.title}
                >
                  <TitleReveal lines={record.titleLines} />
                </h3>
                <p className="systems-timeline-panel-summary">
                  <SummaryReveal text={record.summary} />
                </p>
              </article>

              <div className="systems-timeline-media">
                <video
                  ref={(element) => {
                    videoRefs.current[index] = element
                  }}
                  data-src={record.src}
                  muted
                  playsInline
                  loop
                  preload="none"
                  aria-label={`${record.phase}: ${record.title}`}
                />
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 35,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            padding: '2rem',
          }}
        >
          <p
            ref={closingTextRef}
            style={{
              maxWidth: '45rem',
              textAlign: 'center',
              fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
              fontWeight: 300,
              lineHeight: 1.625,
              color: 'var(--systems-ink)',
              letterSpacing: '0.025em',
            }}
          >
            {CLOSING_TEXT}
          </p>
        </div>

        {/* Mask — star field + globe, revealed by clipPath sweep */}
        <div
          ref={maskRef}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 28,
            '--st-mask-top': 50,
            '--st-mask-right': 100,
            '--st-mask-bottom': 50,
            clipPath:
              'inset(calc(var(--st-mask-top, 50) * 1%) calc(var(--st-mask-right, 100) * 1%) calc(var(--st-mask-bottom, 50) * 1%) 0%)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, #050505, #1a1a24)',
            }}
          >
            <div
              className="st-star-a"
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                top: 0,
                left: 0,
                boxShadow: STARS_A,
              }}
            />
            <div
              className="st-star-b"
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                top: 0,
                left: 0,
                boxShadow: STARS_B,
              }}
            />
          </div>
          <SatelliteGlobe theme="dark" />
        </div>

        <style>{`
          .st-star-a {
            animation: st-twinkle-a 4s ease-in-out infinite alternate;
          }
          .st-star-b {
            animation: st-twinkle-b 6s ease-in-out infinite alternate;
          }
          @keyframes st-twinkle-a {
            from { opacity: 0.55; }
            to   { opacity: 1; }
          }
          @keyframes st-twinkle-b {
            from { opacity: 1; }
            to   { opacity: 0.45; }
          }
        `}</style>
      </div>
    </section>
  )
}
