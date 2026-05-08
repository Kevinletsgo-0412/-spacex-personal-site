import * as THREE from 'three'
import { useEffect, useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import './OrbitGallery.css'

gsap.registerPlugin(ScrollTrigger)

/* ━━━ Mission archive — six factual SpaceX milestones, dressed as a
       speculative aerospace archive system. Content is real; the framing
       (mission codes, archive header, status flags) is the speculative layer. */
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
  },
]

/* ━━━ Globe constants ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const GLOBE_R = 5.5
const GLOBE_Y = -15

/* ━━━ Three.js — Low-poly satellite particles + data tags ━━━ */
const SAT_COUNT = 70
const FLAT_COUNT = 15
const SAT_LABELS = [
  'NODE-001', '1998-040A', 'Signal Active', 'GEO-LINK', 'Tracking…',
  'LEO-47B', 'SYNC-OK', 'TLE-2291', 'ACTIVE', 'RELAY-09',
  'UPLINK-OK', 'FRAME-12B', 'ARCHIVE-SYNC', '2002-009C', 'PING-04',
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
      const hasLabel = Math.random() < 0.20
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
                <span className="w-3 h-px bg-[#1f5a99]/40" />
                <span className="text-[8px] text-gray-500 font-mono uppercase tracking-widest leading-none">
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

/* ━━━ Three.js — Static orbit rings (refined to orbit-blue) ━━━━━━━━━━━━━ */
const ORBIT_RINGS = [
  { r: 6.5,  tx: 0.06,  tz: 0.03,  opacity: 0.22 },
  { r: 8.0,  tx: -0.04, tz: 0.06,  opacity: 0.18 },
  { r: 10.0, tx: 0.09,  tz: -0.05, opacity: 0.14 },
  { r: 13.0, tx: -0.03, tz: 0.08,  opacity: 0.10 },
  { r: 17.0, tx: 0.05,  tz: -0.02, opacity: 0.06 },
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
      {ORBIT_RINGS.map(({ tx, tz, opacity }, i) => (
        <lineSegments key={i} geometry={geoms[i]} rotation={[tx, 0, tz]}>
          <lineBasicMaterial color="#1f5a99" transparent opacity={opacity} />
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
/* This function intentionally untouched — see DESIGN_SYSTEM.md HARD RULES. */
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

/* ━━━ Archive image with safe placeholder fallback ━━━━━━━━━━━━━━━━━━━━━ */
function ArchiveImage({ src, alt, code }) {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return (
      <div className="orbit-archive-placeholder">
        <div className="orbit-archive-placeholder-frame">
          <div className="orbit-archive-placeholder-row">
            <span className="orbit-archive-placeholder-tag">Signal lock pending</span>
            <span className="orbit-archive-placeholder-code">{code}</span>
          </div>
          <div className="orbit-archive-placeholder-bars" aria-hidden="true">
            <span /><span /><span /><span /><span /><span /><span /><span />
          </div>
          <div className="orbit-archive-placeholder-row">
            <span className="orbit-archive-placeholder-status">Archive · image pending</span>
            <span className="orbit-archive-placeholder-status">∅</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      loading="lazy"
      onError={() => setErrored(true)}
    />
  )
}

/* ━━━ OrbitGallery Component ━━━━━━━━━━━━━━━━━━━━ */
export default function OrbitGallery({ ready = true }) {
  const section = useRef(null)
  const cards = useRef([])

  // Centre readout refs
  const programEl = useRef(null)
  const codeEl = useRef(null)
  const titleEl = useRef(null)
  const dateEl = useRef(null)
  const statusEl = useRef(null)
  const descEl = useRef(null)

  const activeIdx = useRef(0)

  function applyMeta(idx) {
    const s = SLIDES[idx]
    if (!s) return
    if (programEl.current) programEl.current.textContent = s.program
    if (codeEl.current)    codeEl.current.textContent    = s.code
    if (titleEl.current)   titleEl.current.textContent   = s.title
    if (dateEl.current)    dateEl.current.textContent    = s.date
    if (descEl.current)    descEl.current.textContent    = s.summary
    if (statusEl.current) {
      statusEl.current.textContent = s.status
      statusEl.current.dataset.status = s.status
    }
  }

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

      // Active outline + ACTIVE chip — pure CSS class, no transform conflict
      el.classList.toggle('orbit-card-active', Math.abs(slot) < 0.5)
    })

    const newIdx = Math.max(0, Math.min(n - 1, Math.round(progress * (n - 1))))
    if (newIdx !== activeIdx.current) {
      activeIdx.current = newIdx
      const targets = [
        programEl.current,
        codeEl.current,
        titleEl.current,
        dateEl.current,
        statusEl.current,
        descEl.current,
      ].filter(Boolean)
      if (targets.length === 0) return

      const tl = gsap.timeline()
      tl.to(targets, {
        opacity: 0, y: 6, duration: 0.15, ease: 'power2.in',
      })
      tl.call(() => applyMeta(newIdx))
      tl.to(targets, {
        opacity: 1, y: 0, duration: 0.22, ease: 'power2.out',
      })
    }
  }

  useEffect(() => {
    applyMeta(0)
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
      className="orbit-archive-section relative w-full h-screen overflow-hidden"
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
          stroke="rgba(31,90,153,0.18)"
          strokeWidth="0.12"
          strokeDasharray="0.6 0.5"
        />
      </svg>

      {/* Archive header */}
      <header className="orbit-archive-header">
        <div>
          <span className="orbit-archive-header-pulse" aria-hidden="true" />
          <span className="orbit-archive-header-title">Orbital Archive</span>
          <span className="orbit-archive-header-divider">/</span>
          <span className="orbit-archive-header-count">06 records</span>
        </div>
        <div>
          <span className="orbit-archive-header-hint">Scroll to index →</span>
        </div>
      </header>

      {/* Image cards */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {SLIDES.map((item, i) => (
          <div
            key={item.code}
            ref={(el) => { cards.current[i] = el }}
            className="orbit-card"
          >
            <div className="orbit-card-frame">
              <span className="orbit-card-active-chip">Active</span>

              <div className="orbit-card-image">
                <ArchiveImage src={item.src} alt={item.title} code={item.code} />
              </div>

              <div className="orbit-card-meta">
                <span className="orbit-card-meta-code">{item.code}</span>
                <span className="orbit-card-meta-date">{item.date}</span>
                <span
                  className="orbit-card-meta-status"
                  data-status={item.status}
                >
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active slide readout — programme · code, title, date · status, description */}
      <div className="orbit-archive-readout">
        <div className="orbit-archive-readout-eyebrow">
          <span ref={programEl} className="orbit-archive-readout-program" />
          <span className="orbit-archive-readout-divider">·</span>
          <span ref={codeEl} className="orbit-archive-readout-code" />
        </div>
        <h3 ref={titleEl} className="orbit-archive-readout-title" />
        <div className="orbit-archive-readout-tag">
          <span ref={dateEl} className="orbit-archive-readout-date" />
          <span
            ref={statusEl}
            className="orbit-archive-readout-status"
            data-status=""
          />
        </div>
        <p ref={descEl} className="orbit-archive-readout-desc" />
      </div>
    </section>
  )
}
