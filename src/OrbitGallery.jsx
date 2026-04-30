import * as THREE from 'three'
import { useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ━━━ Data — swap images & text here ━━━━━━━━━━━━ */
const SLIDES = [
  { src: '/gallery/P1Elon.png', title: 'Where Dreams Began', desc: "Artistic 2002 vision of Elon Musk and SpaceX's founding dream (rockets to Mars). Milestone: Company launch in May 2002. Complete success; Musk is the central figure." }, 
  { src: '/gallery/p2OnPad.png', title: 'Falcon 1 on the Pad', desc: "Falcon 1 rocket on the launch pad, March 2006 (first orbital attempt). Milestone: SpaceX’s debut launch. Failure due to fuel leak; early team effort." },
  { src: '/gallery/p3.jpg', title: 'Merlin Engine Test', desc: "Merlin engine ground test, mid-2000s. Milestone: First in-house engine validation. Technical success; core to Falcon 1." },
  { src: '/gallery/p4.png', title: 'Turning Point - Falcon 1 in Kwajalein Atoll', desc: "Falcon 1 successful launch, September 28, 2008. Milestone: First privately built orbital rocket. Major success; saved SpaceX." },
  { src: '/gallery/p5Fail.png', title: 'Against All Odds', desc: "Falcon 1’s first three failed launches, 2006–2008. Milestone: Rapid iteration phase. Failures that led to later success." },
  { src: '/gallery/p6Rocket.png', title: 'A New Era Begins', desc: "SpaceX rocket evolution montage (2006 Falcon 1 to later models). Milestone: Full program progression from early days. High-res professional summary." },
]

/* ━━━ Globe constants ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const GLOBE_R = 5.5
const GLOBE_Y = -15

/* ━━━ Three.js — Low-poly satellite particles + data tags ━━━ */
const SAT_COUNT = 70
const FLAT_COUNT = 15
const SAT_LABELS = [
  'NODE-001', '1998-40A', 'Signal Active', 'GEO-LINK', 'Tracking...',
  'LEO-47B', 'SYNC-OK', 'TLE-2291', 'ACTIVE', 'RELAY-09',
]

function SatelliteParticles() {
  const particles = useMemo(() => {
    const arr = []
    const minR = GLOBE_R + 0.4
    const maxR = GLOBE_R + 3.0
    for (let i = 0; i < SAT_COUNT; i++) {
      const phi = Math.acos(1 - Math.random() * 0.8)
      const theta = Math.random() * Math.PI * 2
      const r = minR + Math.random() * (maxR - minR)
      const hasLabel = Math.random() < 0.15
      arr.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.cos(phi),
        z: r * Math.sin(phi) * Math.sin(theta),
        scale: 0.03 + Math.pow(Math.random(), 1.5) * 0.002,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI,
        rz: Math.random() * Math.PI,
        hasLabel,
        label: hasLabel ? SAT_LABELS[Math.floor(Math.random() * SAT_LABELS.length)] : '',
      })
    }
    return arr
  }, [])

  const flatSquares = useMemo(() => {
    const arr = []
    const minR = GLOBE_R + 0.4
    const maxR = GLOBE_R + 3.0
    for (let i = 0; i < FLAT_COUNT; i++) {
      const phi = Math.acos(1 - Math.random() * 0.8)
      const theta = Math.random() * Math.PI * 2
      const r = minR + Math.random() * (maxR - minR)
      arr.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.cos(phi),
        z: r * Math.sin(phi) * Math.sin(theta),
        scale: 0.03 + Math.pow(Math.random(), 1.5) * 0.002,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI,
        rz: Math.random() * Math.PI,
      })
    }
    return arr
  }, [])

  return (
    <group>
      {flatSquares.map((p, i) => (
        <mesh
          key={`flat-${i}`}
          position={[p.x, p.y, p.z]}
          rotation={[p.rx, p.ry, p.rz]}
          scale={p.scale}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#111111" toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {particles.map((p, i) => (
        <group key={i} position={[p.x, p.y, p.z]}>
          <group rotation={[p.rx, p.ry, p.rz]}>
            {/* Satellite body */}
            <mesh scale={p.scale}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="#111111" toneMapped={false} />
            </mesh>
            {/* Solar panel wings */}
            <mesh scale={[p.scale * 3.5, p.scale * 0.15, p.scale * 0.7]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="#222222" toneMapped={false} />
            </mesh>
          </group>
          {p.hasLabel && (
            <Html
              position={[0.15, 0.08, 0]}
              distanceFactor={10}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span
                  className="w-[3px] h-[3px] rounded-full bg-amber-400 flex-shrink-0"
                  style={{ boxShadow: '0 0 4px rgba(245,158,11,0.6)' }}
                />
                <span className="w-3 h-px bg-gray-300/50" />
                <span className="text-[8px] text-gray-400 font-mono uppercase tracking-widest leading-none">
                  {p.label}
                </span>
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  )
}

/* ━━━ Three.js — Rotating white globe + blue lat/lon grid ━━━ */
function Globe() {
  const ref = useRef(null)

  const gridGeom = useMemo(() => {
    const R = GLOBE_R + 0.02
    const segs = 72
    const pos = []

    for (let i = 1; i <= 10; i++) {
      const phi = (Math.PI * i) / 11
      const y = R * Math.cos(phi)
      const r = R * Math.sin(phi)
      for (let j = 0; j < segs; j++) {
        const a1 = (2 * Math.PI * j) / segs
        const a2 = (2 * Math.PI * (j + 1)) / segs
        pos.push(r * Math.cos(a1), y, r * Math.sin(a1))
        pos.push(r * Math.cos(a2), y, r * Math.sin(a2))
      }
    }

    for (let i = 0; i < 12; i++) {
      const theta = (2 * Math.PI * i) / 12
      for (let j = 0; j < segs; j++) {
        const p1 = (Math.PI * j) / segs
        const p2 = (Math.PI * (j + 1)) / segs
        pos.push(
          R * Math.sin(p1) * Math.cos(theta), R * Math.cos(p1), R * Math.sin(p1) * Math.sin(theta),
        )
        pos.push(
          R * Math.sin(p2) * Math.cos(theta), R * Math.cos(p2), R * Math.sin(p2) * Math.sin(theta),
        )
      }
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    return g
  }, [])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y -= delta * 0.1
  })

  return (
    <group ref={ref} position={[0, GLOBE_Y, 0]} rotation={[Math.PI / -7, 0, 0]}>
      <mesh>
        <sphereGeometry args={[GLOBE_R, 64, 48]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <lineSegments geometry={gridGeom}>
        <lineBasicMaterial color="#1f5a99" transparent opacity={0.45} />
      </lineSegments>
      <SatelliteParticles />
    </group>
  )
}

/* ━━━ Three.js — Static orbit rings ━━━━━━━━━━━━━ */
const ORBIT_RINGS = [
  { r: 6.5, tx: 0.06, tz: 0.03 },
  { r: 8.0, tx: -0.04, tz: 0.06 },
  { r: 10.0, tx: 0.09, tz: -0.05 },
  { r: 13.0, tx: -0.03, tz: 0.08 },
  { r: 17.0, tx: 0.05, tz: -0.02 },
]

function OrbitRings() {
  const geoms = useMemo(
    () =>
      ORBIT_RINGS.map(({ r }) => {
        const segs = 128
        const pos = []
        for (let i = 0; i < segs; i++) {
          const a1 = (2 * Math.PI * i) / segs
          const a2 = (2 * Math.PI * (i + 1)) / segs
          pos.push(r * Math.cos(a1), 0, r * Math.sin(a1))
          pos.push(r * Math.cos(a2), 0, r * Math.sin(a2))
        }
        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
        return g
      }),
    [],
  )

  return (
    <group position={[0, GLOBE_Y, 0]}>
      {ORBIT_RINGS.map(({ tx, tz }, i) => (
        <lineSegments key={i} geometry={geoms[i]} rotation={[tx, 0, tz]}>
          <lineBasicMaterial color="#555555" transparent opacity={0.18 - i * 0.025} />
        </lineSegments>
      ))}
    </group>
  )
}

/* ━━━ Camera — 45° oblique view from above ━━━━━━ */
function SceneSetup() {
  const { camera } = useThree()
  useEffect(() => {
    camera.lookAt(0, -5, 0)
  }, [camera])
  return null
}

/* ━━━ 2D orbit path math (inverted-U parabola) ━━ */
function slotToProps(slot) {
  if (slot < -3.5 || slot > 3.5) {
    return { x: slot < 0 ? -15 : 115, y: 68, scale: 0.4, opacity: 0 }
  }
  const t = (slot + 3) / 6
  const x = 5 + t * 90
  const y = 68 - 38 * (1 - (2 * t - 1) ** 2)
  const d = Math.abs(slot)
  return {
    x,
    y,
    scale: Math.max(1.2 - d * 0.13, 0.4),
    opacity: Math.max(1.0 - d * 0.28, 0.05),
  }
}

/* ━━━ OrbitGallery Component ━━━━━━━━━━━━━━━━━━━━ */
export default function OrbitGallery({ ready = true }) {
  const section = useRef(null)
  const cards = useRef([])
  const titleEl = useRef(null)
  const descEl = useRef(null)
  const activeIdx = useRef(0)

  function updateCards(progress) {
    const n = SLIDES.length

    SLIDES.forEach((_, i) => {
      const slot = i - progress * (n - 1)
      const p = slotToProps(slot)
      const el = cards.current[i]
      if (!el) return

      gsap.set(el, {
        left: `${p.x}%`,
        top: `${p.y}%`,
        xPercent: -50,
        yPercent: -50,
        scale: p.scale,
        opacity: p.opacity,
        zIndex: Math.round((1 - Math.abs(slot)) * 10) + 10,
      })
    })

    const newIdx = Math.max(0, Math.min(n - 1, Math.round(progress * (n - 1))))
    if (newIdx !== activeIdx.current && titleEl.current && descEl.current) {
      activeIdx.current = newIdx
      const tl = gsap.timeline()
      tl.to([titleEl.current, descEl.current], {
        opacity: 0, y: 6, duration: 0.15, ease: 'power2.in',
      })
      tl.call(() => {
        if (titleEl.current) titleEl.current.textContent = SLIDES[newIdx].title
        if (descEl.current) descEl.current.textContent = SLIDES[newIdx].desc
      })
      tl.to([titleEl.current, descEl.current], {
        opacity: 1, y: 0, duration: 0.22, ease: 'power2.out',
      })
    }
  }

  useEffect(() => {
    if (titleEl.current) titleEl.current.textContent = SLIDES[0].title
    if (descEl.current) descEl.current.textContent = SLIDES[0].desc
    updateCards(0)
  }, [])

  useEffect(() => {
    if (!ready) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: '+=3500',
        pin: true,
        scrub: 0.6,
        onUpdate: (self) => updateCards(self.progress),
      })
    }, section)

    return () => ctx.revert()
  }, [ready])

  return (
    <section
      ref={section}
      className="relative w-full h-screen bg-white overflow-hidden"
    >
      {/* Three.js canvas — globe + orbit rings */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, -2, 2], fov: 32 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 1.5]}
          style={{ background: 'transparent' }}
        >
          <SceneSetup />
          <Globe />
          <OrbitRings />
        </Canvas>
      </div>

      {/* SVG orbit guide — subtle dashed path matching image trajectory */}
      <svg
        className="absolute inset-0 w-full h-full z-[1] pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M 5,68 Q 50,-8 95,68"
          fill="none"
          stroke="rgba(100,100,100,0.10)"
          strokeWidth="0.12"
          strokeDasharray="0.6 0.5"
        />
      </svg>

      {/* Image cards */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {SLIDES.map((item, i) => (
          <div
            key={i}
            ref={(el) => { cards.current[i] = el }}
            className="absolute will-change-transform"
          >
            <div
              className="w-[200px] md:w-[260px] lg:w-[300px] aspect-[3/2] rounded-lg overflow-hidden bg-gray-100"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
            >
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Active slide text — below center image */}
      <div className="absolute top-[46%] left-1/2 -translate-x-1/2 text-center z-20 pointer-events-none w-[90%] max-w-lg">
        <h3
          ref={titleEl}
          className="text-gray-900 text-base md:text-xl font-semibold tracking-wide mb-1.5"
        />
        <p
          ref={descEl}
          className="text-gray-500 text-[11px] md:text-xs leading-relaxed"
        />
      </div>
    </section>
  )
}
