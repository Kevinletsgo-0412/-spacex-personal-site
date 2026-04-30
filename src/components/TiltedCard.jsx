import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import './TiltedCard.css'

/* ━━━ React Bits TiltedCard —— 容器化改造版 ━━━━━━━━━━━━━━━━━
   改造点（相对于官方原版）：
   1. 删除 imageSrc / altText / imageWidth / imageHeight 等图片专属属性
   2. 删除内部 <motion.img>
   3. 接收 {children} 并直接渲染到 .tilted-card-inner 里
   4. 容器默认尺寸改为 100% / 100%，让外层决定卡片形状
   其余交互（mouse 跟随、spring 回弹、tooltip）保持官方实现原貌。  */

const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 2,
}

export default function TiltedCard({
  children,
  containerHeight = '100%',
  containerWidth = '100%',
  scaleOnHover = 1.05,
  rotateAmplitude = 10,
  showMobileWarning = false,
  showTooltip = false,
  captionText = '',
  overlayContent = null,
  displayOverlayContent = false,
  className = '',
}) {
  const ref = useRef(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useMotionValue(0), springValues)
  const rotateY = useSpring(useMotionValue(0), springValues)
  const scale = useSpring(1, springValues)
  const opacity = useSpring(0)
  const rotateFigcaption = useSpring(0, {
    stiffness: 350,
    damping: 30,
    mass: 1,
  })

  const [lastY, setLastY] = useState(0)

  function handleMouse(e) {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left - rect.width / 2
    const offsetY = e.clientY - rect.top - rect.height / 2

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude

    rotateX.set(rotationX)
    rotateY.set(rotationY)

    x.set(e.clientX - rect.left)
    y.set(e.clientY - rect.top)

    const velocityY = offsetY - lastY
    rotateFigcaption.set(-velocityY * 0.6)
    setLastY(offsetY)
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover)
    opacity.set(1)
  }

  function handleMouseLeave() {
    opacity.set(0)
    scale.set(1)
    rotateX.set(0)
    rotateY.set(0)
    rotateFigcaption.set(0)
  }

  return (
    <figure
      ref={ref}
      className={`tilted-card-figure ${className}`}
      style={{
        height: containerHeight,
        width: containerWidth,
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning && (
        <div className="tilted-card-mobile-alert">
          This effect is not optimized for mobile. Check on desktop.
        </div>
      )}

      {/*
        官方的 <motion.img> 被移除 —— 改为直接渲染 children。
        children 会继承所有 3D/spring 变换，呈现整体倾斜效果。
        width/height 设为 100%，让外层容器决定卡片真实尺寸。     */}
      <motion.div
        className="tilted-card-inner"
        style={{
          rotateX,
          rotateY,
          scale,
        }}
      >
        {children}

        {displayOverlayContent && overlayContent && (
          <motion.div className="tilted-card-overlay">
            {overlayContent}
          </motion.div>
        )}
      </motion.div>

      {showTooltip && (
        <motion.figcaption
          className="tilted-card-caption"
          style={{
            x,
            y,
            opacity,
            rotate: rotateFigcaption,
          }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  )
}
