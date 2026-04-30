import { useEffect, useLayoutEffect, useRef } from 'react'
import { animate, splitText, stagger } from 'animejs'
import gsap from 'gsap'
import TiltedCard from './components/TiltedCard'

/* ━━━ Text for Page 4 ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const REVEAL_TEXT =
  'We are building the world\'s most advanced satellite constellation — ' +
  'connecting the unconnected, from the peaks of the Himalayas ' +
  'to the most remote islands of the Pacific.'

const IMAGE = '/SpaceXProjectStarPic.jpg'

const CARDS = [
  {
    bgPos: '0% 0%',
    backClass: 'bg-[#4a0404]',
    textClass: 'text-white',
    title: 'THE CONSTELLATION',
    body: "Starlink is the world's first and largest satellite constellation using a low Earth orbit to deliver high-speed broadband internet, capable of supporting streaming, online gaming, and video calls.",
  },
  {
    bgPos: '50% 0%',
    backClass: 'bg-[#f5f5f7]',
    textClass: 'text-neutral-900',
    title: 'ORBITAL SCALE',
    body: 'Operating at an altitude of ~550km. The network currently consists of over 5,500 active satellites, significantly closer to Earth than traditional satellites, delivering sub-20ms latency globally.',
  },
  {
    bgPos: '100% 0%',
    backClass: 'bg-[#0a0a0a]',
    textClass: 'text-white',
    title: "EARTH'S NEURAL NET",
    body: 'Bridging the digital divide. By bypassing traditional ground infrastructure, Starlink brings high-speed connectivity to the most remote, devastated, or rural locations on the planet.',
  },
]

const GLASS =
  'border border-white/20 shadow-2xl backdrop-blur-md ' +
  '[box-shadow:0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.1)]'

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
   Legacy = word reveal + glow hold + mask transition
   Cards  = 3D card flip / fan                        */
const LEGACY_SCROLL_RATIO = 2 / 3

/*  Legacy progress map (within 0–1 of legacy range):
    0.00 – 0.22  word animation
    0.22 – 0.30  glow fade-in
    0.30 – 0.60  hold  (glow visible, page pinned)
    0.60 – 0.68  glow fade-out
    0.68 – 0.93  horizontal mask sweep
    0.93 – 1.00  vertical mask expansion              */

/* ━━━ Component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function ConstellationReveal() {
  const wrapperRef = useRef(null)
  const textRef = useRef(null)
  const maskRef = useRef(null)
  const glowRef = useRef(null)
  const containerRef = useRef(null)
  const scaleWrapRef = useRef(null)
  const rowRef = useRef(null)
  const cardRefs = [useRef(null), useRef(null), useRef(null)]
  const flipRefs = [useRef(null), useRef(null), useRef(null)]
  const frontRefs = [useRef(null), useRef(null), useRef(null)]
  const backRefs = [useRef(null), useRef(null), useRef(null)]
  const cardsTlRef = useRef(null)

  const FAN_ANGLE = 6

  /* ── GSAP card timeline ── */
  useLayoutEffect(() => {
    const container = containerRef.current
    const scaleWrap = scaleWrapRef.current
    const row = rowRef.current
    const cards = cardRefs.map((r) => r.current).filter(Boolean)
    const flippers = flipRefs.map((r) => r.current).filter(Boolean)
    const fronts = frontRefs.map((r) => r.current).filter(Boolean)
    const backs = backRefs.map((r) => r.current).filter(Boolean)
    const allFaces = [...fronts, ...backs]

    if (
      !container || !scaleWrap || !row ||
      cards.length !== 3 || flippers.length !== 3 ||
      fronts.length !== 3 || backs.length !== 3
    )
      return undefined

    const img = new Image()
    img.src = IMAGE

    function buildTimeline() {
      if (cardsTlRef.current) cardsTlRef.current.kill()

      const ratio =
        img.naturalWidth && img.naturalHeight
          ? img.naturalWidth / img.naturalHeight
          : 16 / 9

      const vw = window.innerWidth / 100
      const imgW = Math.min(60 * vw, 672)
      const imgH = imgW / ratio
      const remPx = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      )
      const gapPx = remPx * 3 // 3 rem

      /* initial state — looks identical to original single image */
      gsap.set(container, {
        width: imgW,
        height: imgH,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(30,58,138,0.2)',
      })
      gsap.set(scaleWrap, {
        transformOrigin: '50% 50%',
        force3D: true,
        scale: 1,
      })
      gsap.set(row, { gap: 0 })
      gsap.set(flippers, { rotationY: 0, force3D: true })
      gsap.set(allFaces, { borderRadius: 0 })
      gsap.set(cards, { rotation: 0, scale: 1 })
      gsap.set(cards[0], { transformOrigin: '50% 100%' })
      gsap.set(cards[2], { transformOrigin: '50% 100%' })

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })

      /* 0.00 – 0.10  hold: image as-is */

      /* 0.10 – 0.32  gap opens → starfield background = split lines */
      tl.to(row, { gap: gapPx, duration: 0.22 }, 0.10)
      tl.to(container, { width: imgW + gapPx * 2, duration: 0.22 }, 0.10)

      /* 0.32 – 0.40  container image-styling fades */
      tl.to(
        container,
        {
          borderRadius: 0,
          boxShadow: '0 0 0 0 rgba(30,58,138,0)',
          duration: 0.08,
        },
        0.32,
      )

      /* 0.40  overflow visible for 3D content */
      tl.set(container, { overflow: 'visible' }, 0.40)

      /* 0.40 – 0.48  rounded corners on individual faces */
      tl.to(allFaces, { borderRadius: 12, duration: 0.08 }, 0.40)

      /* 0.48 – 0.82  3D flip + scale */
      tl.to(
        flippers,
        { rotationY: 180, duration: 0.34, stagger: 0.02 },
        0.48,
      )
      tl.to(
        scaleWrap,
        { scale: 1.08, duration: 0.34, ease: 'power1.out' },
        0.48,
      )

      /* 0.80 – 0.95  fan spread: left CCW, middle up, right CW */
      tl.to(cards[0], { rotation: -FAN_ANGLE, duration: 0.15, ease: 'power2.out' }, 0.80)
      tl.to(cards[1], { y: -18, duration: 0.15, ease: 'power2.out' }, 0.80)
      tl.to(cards[2], { rotation: FAN_ANGLE, duration: 0.15, ease: 'power2.out' }, 0.80)

      /* 0.95 – 1.00  hold final state */

      cardsTlRef.current = tl
    }

    if (img.complete && img.naturalWidth) {
      buildTimeline()
    } else {
      img.onload = buildTimeline
    }

    return () => {
      if (cardsTlRef.current) {
        cardsTlRef.current.kill()
        cardsTlRef.current = null
      }
    }
  }, [])

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
      const cardsTl = cardsTlRef.current
      const glow = glowRef.current

      if (scrolled <= legacyEnd) {
        if (cardsTl) cardsTl.progress(0)

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
        wordAnim.seek(wordAnim.duration)
        if (glow) glow.style.opacity = '0'
        mask.style.clipPath = 'inset(0% 0% 0% 0%)'

        const cardRange = totalScroll - legacyEnd
        const cardP =
          cardRange > 0
            ? Math.min(1, Math.max(0, (scrolled - legacyEnd) / cardRange))
            : 1
        if (cardsTl) cardsTl.progress(cardP)
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
    <div ref={wrapperRef} style={{ height: '1100vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Page 4: 纯白底 + 黑字（彩色光效已移除） */}
        <div className="absolute inset-0 bg-white flex items-center justify-center px-8 md:px-16 lg:px-24">
          <p
            ref={textRef}
            className="max-w-3xl text-2xl md:text-3xl lg:text-4xl leading-relaxed text-center font-light text-gray-900 tracking-wide"
          >
            {REVEAL_TEXT}
          </p>
        </div>

        {/* Mask → Page 5 (stars + card system) */}
        <div
          ref={maskRef}
          className="absolute inset-0 z-10"
          style={{ clipPath: 'inset(50% 100% 50% 0)' }}
        >
          {/* Starfield — visible through card gaps as "split lines" */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] to-[#1a1a24]">
            <div className="cr-star-a absolute w-px h-px top-0 left-0" />
            <div className="cr-star-b absolute w-px h-px top-0 left-0" />
          </div>

          {/* Card system — initially looks like original single image */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div ref={scaleWrapRef}>
              <div ref={containerRef}>
                <div
                  ref={rowRef}
                  className="flex h-full items-stretch"
                  style={{ gap: 0 }}
                >
                  {CARDS.map((card, i) => (
                    /*
                      TiltedCard 作为"新的最外层"：
                      · 只接管 flex-row 里的弹性位置（flex-1 min-w-0 h-full）
                      · rotateAmplitude=10 / scaleOnHover=1.06 → 克制的 3D 倾斜 + 唯一 hover 放大
                      · figure 层负责 onMouseEnter / onMouseMove / onMouseLeave，
                        内层不再各自绑定 hover scale，彻底避免 scale 叠加与边界抖动  */
                    <TiltedCard
                      key={card.title}
                      className="flex-1 min-w-0 h-full"
                      rotateAmplitude={10}
                      scaleOnHover={1.06}
                    >
                      {/*
                        hover 放大的唯一控制源 = TiltedCard 内部 motion scale spring。
                        原本绑定在本层的 onMouseEnter/onMouseLeave + gsap scale 1.06
                        已迁移到上面的 scaleOnHover={1.06}，避免两套 scale 叠加。  */}
                      <div
                        ref={cardRefs[i]}
                        className="flex-1 min-w-0"
                        style={{ perspective: '1000px' }}
                      >
                        <div
                          ref={flipRefs[i]}
                          className="relative h-full w-full"
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          {/* front — image slice */}
                          <div
                            ref={frontRefs[i]}
                            className="absolute inset-0"
                            style={{
                              backgroundImage: `url(${IMAGE})`,
                              backgroundSize: '300% 100%',
                              backgroundPosition: card.bgPos,
                              backgroundRepeat: 'no-repeat',
                              transform: 'translateZ(3px)',
                              WebkitBackfaceVisibility: 'hidden',
                              backfaceVisibility: 'hidden',
                              overflow: 'hidden',
                            }}
                          />

                          {/* back — content card */}
                          <div
                            ref={backRefs[i]}
                            className={`absolute inset-0 flex flex-col justify-end p-5 md:p-6 ${GLASS} ${card.backClass} ${card.textClass}`}
                            style={{
                              transform: 'rotateY(180deg) translateZ(3px)',
                              WebkitBackfaceVisibility: 'hidden',
                              backfaceVisibility: 'hidden',
                              overflow: 'hidden',
                            }}
                          >
                            <h3 className="text-[10px] font-semibold tracking-[0.2em] md:text-xs">
                              {card.title}
                            </h3>
                            <p className="mt-3 text-[11px] font-light leading-relaxed md:text-sm">
                              {card.body}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TiltedCard>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
      `}</style>
    </div>
  )
}
