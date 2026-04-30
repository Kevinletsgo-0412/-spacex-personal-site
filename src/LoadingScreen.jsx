import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const X_PATH_D =
  'M31.937 9.287c-0.011 0-0.016-0.005-0.020-0.005-0.011 0-0.021 0.005-0.032 0.011-20.172 2.031-29.651 10.801-31.885 12.959l0.297 0.468h3.525c9.161-9.213 21.541-12.271 28.089-13.276l0.005 0.005c0.004 0 0.009-0.011 0.015-0.011 0.037-0.005 0.068-0.036 0.068-0.077 0-0.037-0.027-0.063-0.063-0.073zM0.505 14.011l-0.213 0.401 4.328 3.156c0.875-0.511 1.771-0.984 2.683-1.432l-2.901-2.125zM10.125 18.197c-0.719 0.532-1.448 1.095-2.235 1.756l3.803 2.765h3.943l0.167-0.359z'

export default function LoadingScreen({ onComplete }) {
  const overlayRef = useRef(null)
  const containerRef = useRef(null)
  const progressPathRef = useRef(null)

  useEffect(() => {
    const progressPath = progressPathRef.current
    const container = containerRef.current
    const overlay = overlayRef.current
    if (!progressPath || !container || !overlay) return

    const pathLength = progressPath.getTotalLength()
    progressPath.style.strokeDasharray = pathLength
    progressPath.style.strokeDashoffset = pathLength

    const tl = gsap.timeline()

    // Phase 1: 白线沿 X 轮廓跑 4 圈，1.2s/圈
    tl.to(progressPath, {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: 'none',
      repeat: 3,
    })

    // Phase 2: "虫洞"穿梭 — 冲进 X 交叉点的黑洞
    // 急剧放大，镜头穿入 X 中心的纯黑空隙
    tl.to(container, {
      scale: 100,
      duration: 0.85,
      ease: 'power4.in',
    })
    // 遮罩在放大后半段平滑变透明：整个屏幕自然过渡为纯黑
    tl.to(
      overlay,
      {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.in',
        onComplete: () => {
          overlay.style.display = 'none'
          if (typeof onComplete === 'function') onComplete()
        },
      },
      '-=0.55'
    )

    return () => tl.kill()
  }, [onComplete])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#000000' }}
    >
      <div
        ref={containerRef}
        className="flex items-center justify-center"
        style={{
          width: '30vw',
          maxWidth: '400px',
          transformOrigin: '42% 62%',


      
          }}
      >
        <svg
          viewBox="-2 -2 38 24"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible', width: '100%', height: '100%', transform: 'translate(15%, -18%)' }}
        >
          <path
            d={X_PATH_D}
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="0.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            ref={progressPathRef}
            d={X_PATH_D}
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.8))',
            }}
          />
        </svg>
      </div>
    </div>
  )
}
