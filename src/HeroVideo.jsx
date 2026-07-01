import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import ScrollFloat from './components/ScrollFloat'
import './HeroVideo.css'

gsap.registerPlugin(ScrollTrigger, SplitText)

const HERO_GROUP_SCROLL_VH = 180
const HERO_PHASE_B_SCROLL_VH = 160
const HERO_GROUP_TIMELINE_UNITS = 3
const HERO_GROUP_GAP_ENABLED = false
const HERO_GROUP_ENTER_RATIO = 0.34
const HERO_GROUP_EXIT_RATIO = 0.28
const HERO_CHAR_STAGGER_EACH = 0.045
const HERO_CHAR_ENTER_DURATION = 0.24
const HERO_CHAR_FILL_DIRECTION = 'bottom'
const HERO_VIDEO_START_FILTER = 'brightness(1) saturate(1)'
const HERO_VIDEO_END_FILTER = 'brightness(0.35) saturate(0.5)'
const HERO_GROUP_GAP_RATIO = HERO_GROUP_GAP_ENABLED ? 0.08 : 0
const HERO_GROUP_HOLD_RATIO = Math.max(
  0,
  1 - HERO_GROUP_ENTER_RATIO - HERO_GROUP_EXIT_RATIO - HERO_GROUP_GAP_RATIO,
)

const HERO_SCROLL_GROUPS = [
  ['WE CHALLENGE', 'THE IMPOSSIBLE'],
  ['ORBITAL SYSTEMS', 'MACHINE-DIRECTED'],
  ['MOTION', 'HUMAN-CALIBRATED TASTE'],
  ['BUILT THROUGH AI', 'COLLABORATION'],
]
const HERO_GROUPS_SCROLL_VH = HERO_SCROLL_GROUPS.length * HERO_GROUP_SCROLL_VH
const HERO_TOTAL_SCROLL_VH = HERO_GROUPS_SCROLL_VH + HERO_PHASE_B_SCROLL_VH
const HERO_SCROLL_DISTANCE = `+=${HERO_TOTAL_SCROLL_VH}%`
const HERO_CHAR_CLIP_FROM =
  HERO_CHAR_FILL_DIRECTION === 'bottom'
    ? 'inset(100% 0 0 0)'
    : 'inset(0 0 100% 0)'
const HERO_CHAR_CLIP_TO = 'inset(0% 0 0 0)'
const HERO_CHAR_Y_FROM = HERO_CHAR_FILL_DIRECTION === 'bottom' ? 28 : -28
const HERO_GROUPS_TIMELINE_DURATION =
  HERO_SCROLL_GROUPS.length * HERO_GROUP_TIMELINE_UNITS
const HERO_PHASE_B_TIMELINE_UNITS =
  (HERO_PHASE_B_SCROLL_VH / HERO_GROUP_SCROLL_VH) * HERO_GROUP_TIMELINE_UNITS

export default function HeroVideo() {
  const rootRef = useRef(null)
  const videoRef = useRef(null)
  const trackRef = useRef(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const video = videoRef.current
    const track = trackRef.current
    const pinTarget = root?.parentElement
    const archiveSection = document.querySelector('.srg-section')
    const archiveStage = archiveSection?.querySelector('.srg-stage')

    if (!root || !video || !track || !archiveSection || !archiveStage || !pinTarget) {
      return undefined
    }

    let splitInstances = []

    const ctx = gsap.context(() => {
      const groups = gsap.utils.toArray('.hero-scroll-copy-group')
      const groupSetups = groups.map((group) => {
        const split = SplitText.create(group, {
          type: 'chars',
          charsClass: 'hero-scroll-char',
        })

        splitInstances.push(split)

        return {
          group,
          chars: split.chars,
        }
      })
      const chars = groupSetups.flatMap(({ chars }) => chars)

      gsap.set(video, { filter: HERO_VIDEO_START_FILTER })
      gsap.set(archiveSection, {
        marginTop: '-100vh',
        position: 'relative',
        zIndex: 60,
      })
      gsap.set(archiveStage, {
        autoAlpha: 1,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        yPercent: 100,
        force3D: true,
      })
      gsap.set(groups, {
        autoAlpha: 0,
        yPercent: 0,
        force3D: true,
      })
      gsap.set(chars, {
        autoAlpha: 0,
        yPercent: HERO_CHAR_Y_FROM,
        clipPath: HERO_CHAR_CLIP_FROM,
        filter: 'blur(10px)',
        force3D: true,
      })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: pinTarget,
          start: 'top top',
          end: HERO_SCROLL_DISTANCE,
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onLeave: () => {
            gsap.set(archiveStage, {
              clearProps: 'position,top,left,right,zIndex,transform',
            })
          },
          onEnterBack: () => {
            gsap.set(archiveStage, {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 60,
              yPercent: 0,
              force3D: true,
            })
          },
        },
      })

      groupSetups.forEach(({ group, chars }, index) => {
        const cursor = index * HERO_GROUP_TIMELINE_UNITS
        const enterDuration = HERO_GROUP_TIMELINE_UNITS * HERO_GROUP_ENTER_RATIO
        const holdDuration = HERO_GROUP_TIMELINE_UNITS * HERO_GROUP_HOLD_RATIO
        const exitDuration = HERO_GROUP_TIMELINE_UNITS * HERO_GROUP_EXIT_RATIO
        const exitStart = cursor + enterDuration + holdDuration

        tl.to(
          group,
          {
            autoAlpha: 1,
            yPercent: 0,
            duration: 0.01,
          },
          cursor,
        )
          .to(
            chars,
            {
              autoAlpha: 1,
              yPercent: 0,
              clipPath: HERO_CHAR_CLIP_TO,
              filter: 'blur(0px)',
              duration: HERO_CHAR_ENTER_DURATION,
              stagger: {
                each: HERO_CHAR_STAGGER_EACH,
                from: 'start',
              },
              ease: 'power2.out',
            },
            cursor,
          )
          .to({}, { duration: holdDuration }, cursor + enterDuration)
          .to(
            group,
            {
              autoAlpha: 0,
              yPercent: -120,
              duration: exitDuration,
              ease: 'power2.in',
            },
            exitStart,
          )

        if (HERO_GROUP_GAP_ENABLED && index < groups.length - 1) {
          tl.to(
            {},
            { duration: HERO_GROUP_TIMELINE_UNITS * HERO_GROUP_GAP_RATIO },
            cursor + HERO_GROUP_TIMELINE_UNITS -
              HERO_GROUP_TIMELINE_UNITS * HERO_GROUP_GAP_RATIO,
          )
        }
      })

      tl.to(
        video,
        { filter: HERO_VIDEO_END_FILTER, duration: HERO_GROUPS_TIMELINE_DURATION * 0.5 },
        0,
      )
      tl.to(
        archiveStage,
        {
          yPercent: 0,
          duration: HERO_PHASE_B_TIMELINE_UNITS,
          ease: 'none',
        },
        HERO_GROUPS_TIMELINE_DURATION,
      )
      ScrollTrigger.refresh()
    }, root)

    return () => {
      ctx.revert()
      splitInstances.forEach((split) => split.revert())
      splitInstances = []
    }
  }, [])

  return (
    <div ref={rootRef} className="w-full h-full relative bg-black overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        ref={videoRef}
        className="hero-scroll-video absolute inset-0 w-full h-full object-cover"
      >
        <source src="/32秒60%25.mp4" type="video/mp4" />
      </video>

      {/* Scroll-driven hero copy track */}
      <div className="hero-scroll-copy-mask" aria-hidden="true">
        <div ref={trackRef} className="hero-scroll-copy-track">
          {HERO_SCROLL_GROUPS.map((group) => (
            <div key={group.join('-')} className="hero-scroll-copy-group">
              {group.map((line) => (
                <div key={line} className="hero-scroll-copy-line">
                  {line}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex items-center justify-between px-10 pt-8 z-30">
        {/* SpaceX wordmark logo — white */}
        <svg
          viewBox="0 0 400 50"
          fill="white"
          className="h-5 md:h-6"
          xmlns="http://www.w3.org/2000/svg"
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

      </header>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 w-full px-10 pb-20 z-30">
        <ScrollFloat
          as="p"
          animationDuration={1}
          ease="back.inOut(2)"
          scrollStart="top 85%"
          scrollEnd="top 35%"
          stagger={0.02}
          textClassName="font-serif font-bold italic text-white/90 tracking-wide text-[clamp(1rem,2vw,1.35rem)]"
        >
          WE CHALLENGE THE IMPOSSIBLE.
        </ScrollFloat>
        <p
          className="mt-3 font-serif italic text-white/70 tracking-wide"
          style={{ fontSize: 'clamp(0.7rem, 1vw, 0.85rem)' }}
        >
          A speculative SpaceX-inspired interface designed through AI-directed visual systems.
        </p>
      </footer>
    </div>
  )
}
