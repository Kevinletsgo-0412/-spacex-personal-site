import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'

/* ━━━ Globe constants ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const GLOBE_R = 5.5
const GLOBE_Y = -15

/* ━━━ Satellite particles + data tags ━━━━━━━━━━━━ */
const SAT_COUNT = 70
const FLAT_COUNT = 15
const SAT_LABELS = [
  'NODE-001', '1998-040A', 'Signal Active', 'GEO-LINK', 'Tracking…',
  'LEO-47B', 'SYNC-OK', 'TLE-2291', 'ACTIVE', 'RELAY-09',
  'UPLINK-OK', 'FRAME-12B', 'ARCHIVE-SYNC', '2002-009C', 'PING-04',
]

function SatelliteParticles({ labelColor = '#9ca3af', accentColor = '#f59e0b' }) {
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
            <mesh scale={p.scale}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="#111111" toneMapped={false} />
            </mesh>
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
                  className="w-[3px] h-[3px] rounded-full flex-shrink-0"
                  style={{
                    background: accentColor,
                    boxShadow: `0 0 4px ${accentColor}99`,
                  }}
                />
                <span
                  className="w-3 h-px"
                  style={{ background: 'rgba(31,90,153,0.4)' }}
                />
                <span
                  className="text-[8px] font-mono uppercase tracking-widest leading-none"
                  style={{ color: labelColor }}
                >
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

function Globe({ sphereColor, gridColor, gridOpacity, labelColor, accentColor }) {
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
        <meshBasicMaterial color={sphereColor} toneMapped={false} />
      </mesh>
      <lineSegments geometry={gridGeom}>
        <lineBasicMaterial color={gridColor} transparent opacity={gridOpacity} />
      </lineSegments>
      <SatelliteParticles labelColor={labelColor} accentColor={accentColor} />
    </group>
  )
}

const ORBIT_RINGS = [
  { r: 6.5,  tx: 0.06,  tz: 0.03,  opacity: 0.22 },
  { r: 8.0,  tx: -0.04, tz: 0.06,  opacity: 0.18 },
  { r: 10.0, tx: 0.09,  tz: -0.05, opacity: 0.14 },
  { r: 13.0, tx: -0.03, tz: 0.08,  opacity: 0.10 },
  { r: 17.0, tx: 0.05,  tz: -0.02, opacity: 0.06 },
]

function OrbitRings({ ringColor, opacityScale = 1 }) {
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
          <lineBasicMaterial
            color={ringColor}
            transparent
            opacity={opacity * opacityScale}
          />
        </lineSegments>
      ))}
    </group>
  )
}

function SceneSetup() {
  const { camera } = useThree()
  useEffect(() => {
    camera.lookAt(0, -5, 0)
  }, [camera])
  return null
}

/* ━━━ Public component ━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Themed satellite + globe + orbit-ring scene. Defaults to the
   light/archive palette (white sphere on off-white). Pass `theme="dark"`
   for the Page 5 cosmic backdrop (dark sphere on starfield). */
export default function SatelliteGlobe({ theme = 'light', className = '' }) {
  const palette =
    theme === 'dark'
      ? {
          sphereColor: '#0c0c10',
          gridColor: '#4a78b5',
          gridOpacity: 0.55,
          ringColor: '#6da3dd',
          ringOpacityScale: 1.6,
          labelColor: '#cfd6df',
          accentColor: '#f59e0b',
        }
      : {
          sphereColor: '#ffffff',
          gridColor: '#1f5a99',
          gridOpacity: 0.45,
          ringColor: '#1f5a99',
          ringOpacityScale: 1,
          labelColor: '#6b7280',
          accentColor: '#f59e0b',
        }

  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: [0, -2, 2], fov: 32 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <SceneSetup />
        <Globe
          sphereColor={palette.sphereColor}
          gridColor={palette.gridColor}
          gridOpacity={palette.gridOpacity}
          labelColor={palette.labelColor}
          accentColor={palette.accentColor}
        />
        <OrbitRings
          ringColor={palette.ringColor}
          opacityScale={palette.ringOpacityScale}
        />
      </Canvas>
    </div>
  )
}
