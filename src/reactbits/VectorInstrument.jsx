import { useEffect, useRef } from 'react'

/*
 * VectorInstrument —— 首屏矢量锚点装置（参考 oryzo.ai）
 * 贝塞尔圆环路径（虚线）+ 锚点方块 + 控制柄（线+圆点）；
 * 自带呼吸缩放/缓转；鼠标移动→整组做 3D 视差微转（页面不滚动）。
 * 精密克制、单橙点缀，近黑底。
 */
const KAPPA = 0.5523

// 生成一个圆的 4 段三次贝塞尔 path
function circlePath(cx, cy, r) {
  const k = r * KAPPA
  return [
    `M ${cx} ${cy - r}`,
    `C ${cx + k} ${cy - r} ${cx + r} ${cy - k} ${cx + r} ${cy}`,
    `C ${cx + r} ${cy + k} ${cx + k} ${cy + r} ${cx} ${cy + r}`,
    `C ${cx - k} ${cy + r} ${cx - r} ${cy + k} ${cx - r} ${cy}`,
    `C ${cx - r} ${cy - k} ${cx - k} ${cy - r} ${cx} ${cy - r} Z`,
  ].join(' ')
}

// 一个圆环的锚点（方块）+ 控制柄（切向线+圆点）
function Ring({ cx, cy, r, accent, faint }) {
  const k = r * KAPPA
  const anchors = [
    { x: cx, y: cy - r, tx: 1, ty: 0 },   // 上
    { x: cx + r, y: cy, tx: 0, ty: 1 },   // 右
    { x: cx, y: cy + r, tx: -1, ty: 0 },  // 下
    { x: cx - r, y: cy, tx: 0, ty: -1 },  // 左
  ]
  return (
    <g>
      <path d={circlePath(cx, cy, r)} fill="none" stroke={faint} strokeWidth="1.2" strokeDasharray="4 5" />
      {anchors.map((a, i) => (
        <g key={i}>
          {/* 控制柄：切向两侧 */}
          <line x1={a.x - a.tx * k} y1={a.y - a.ty * k} x2={a.x + a.tx * k} y2={a.y + a.ty * k}
            stroke={accent} strokeWidth="1.4" />
          <circle cx={a.x - a.tx * k} cy={a.y - a.ty * k} r="4.5" fill={accent} />
          <circle cx={a.x + a.tx * k} cy={a.y + a.ty * k} r="4.5" fill={accent} />
          {/* 锚点方块 */}
          <rect x={a.x - 5} y={a.y - 5} width="10" height="10" fill={accent} />
        </g>
      ))}
    </g>
  )
}

export default function VectorInstrument({ accent = '#d2702f', faint = 'rgba(255,253,249,0.22)' }) {
  const rootRef = useRef(null)
  const outerRef = useRef(null)
  const innerRef = useRef(null)

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let tx = 0, ty = 0, mx = 0, my = 0, t = 0, raf = 0
    const onMove = e => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2
      ty = (e.clientY / window.innerHeight - 0.5) * 2
    }
    if (!reduce) window.addEventListener('pointermove', onMove, { passive: true })
    const loop = () => {
      raf = requestAnimationFrame(loop)
      t += 0.016
      mx += (tx - mx) * 0.05
      my += (ty - my) * 0.05
      // 呼吸缩放
      const sOut = 1 + Math.sin(t * 0.5) * 0.05
      const sIn = 1 + Math.sin(t * 0.5 + 1.2) * 0.07
      if (outerRef.current) outerRef.current.style.transform = `rotate(${t * 2}deg) scale(${sOut})`
      if (innerRef.current) innerRef.current.style.transform = `rotate(${-t * 3.4}deg) scale(${sIn})`
      // 整组随鼠标做 3D 视差微转（不滚动页面）
      if (rootRef.current) {
        rootRef.current.style.transform =
          `perspective(1100px) rotateY(${mx * 9}deg) rotateX(${-my * 9}deg) translate3d(${mx * 18}px, ${my * 14}px, 0)`
      }
    }
    loop()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', onMove) }
  }, [])

  return (
    <div ref={rootRef} style={{ width: '100%', height: '100%', willChange: 'transform' }}>
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
        {/* 中心点 */}
        <circle cx="500" cy="500" r="3.5" fill={accent} />
        <g ref={outerRef} style={{ transformBox: 'view-box', transformOrigin: '500px 500px' }}>
          <Ring cx={500} cy={500} r={235} accent={accent} faint={faint} />
        </g>
        <g ref={innerRef} style={{ transformBox: 'view-box', transformOrigin: '500px 500px' }}>
          <Ring cx={500} cy={500} r={112} accent={accent} faint={faint} />
        </g>
      </svg>
    </div>
  )
}
