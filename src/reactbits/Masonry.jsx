import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './Masonry.css'

const useMedia = (queries, values, defaultValue) => {
  const get = () => values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue
  const [value, setValue] = useState(get)
  useEffect(() => {
    const handler = () => setValue(get)
    queries.forEach(q => matchMedia(q).addEventListener('change', handler))
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler))
  }, [queries]) // eslint-disable-line
  return value
}

const useMeasure = () => {
  const ref = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useLayoutEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return [ref, size]
}

const preloadImages = async urls => {
  await Promise.all(urls.map(src => new Promise(resolve => {
    const img = new Image()
    img.src = src
    img.onload = img.onerror = () => resolve()
  })))
}

export default function Masonry({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 1.04,
  blurToFocus = true,
}) {
  const columns = useMedia(
    ['(min-width:1200px)', '(min-width:800px)', '(min-width:500px)'],
    [3, 3, 2], 1
  )
  const [containerRef, { width }] = useMeasure()
  const [imagesReady, setImagesReady] = useState(false)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect() }
    }, { threshold: 0.08 })
    io.observe(el)
    return () => io.disconnect()
  }, []) // eslint-disable-line

  const getInitialPosition = item => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: item.x, y: item.y }
    let dir = animateFrom
    switch (dir) {
      case 'top': return { x: item.x, y: -200 }
      case 'bottom': return { x: item.x, y: window.innerHeight + 200 }
      case 'left': return { x: -200, y: item.y }
      case 'right': return { x: window.innerWidth + 200, y: item.y }
      default: return { x: item.x, y: item.y + 100 }
    }
  }

  useEffect(() => { preloadImages(items.map(i => i.img)).then(() => setImagesReady(true)) }, [items])

  const grid = useMemo(() => {
    if (!width) return []
    const colHeights = new Array(columns).fill(0)
    const gap = 16
    const columnWidth = (width - gap * (columns - 1)) / columns
    return items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights))
      const x = (columnWidth + gap) * col
      const height = child.height / 2
      const y = colHeights[col]
      colHeights[col] += height + gap
      return { ...child, x, y, w: columnWidth, h: height }
    })
  }, [columns, items, width])

  const containerHeight = useMemo(() => grid.reduce((m, g) => Math.max(m, g.y + g.h), 0), [grid])
  const hasMounted = useRef(false)

  useLayoutEffect(() => {
    if (!imagesReady) return
    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`
      const props = { x: item.x, y: item.y, width: item.w, height: item.h }
      if (!hasMounted.current) {
        if (!inView) return // 滚到进入视区才播入场动画
        const init = getInitialPosition(item)
        gsap.fromTo(selector, {
          opacity: 0, x: init.x, y: init.y, width: item.w, height: item.h,
          ...(blurToFocus && { filter: 'blur(12px)' }),
        }, {
          opacity: 1, ...props, ...(blurToFocus && { filter: 'blur(0px)' }),
          duration: 0.85, ease: 'power3.out', delay: index * stagger,
        })
      } else {
        gsap.to(selector, { ...props, duration, ease, overwrite: 'auto' })
      }
    })
    if (inView) hasMounted.current = true
  }, [grid, imagesReady, inView, stagger, animateFrom, blurToFocus, duration, ease]) // eslint-disable-line

  const onEnter = (e, item) => { if (scaleOnHover) gsap.to(`[data-key="${item.id}"]`, { scale: hoverScale, duration: 0.3, ease: 'power2.out' }) }
  const onLeave = (e, item) => { if (scaleOnHover) gsap.to(`[data-key="${item.id}"]`, { scale: 1, duration: 0.3, ease: 'power2.out' }) }

  return (
    <div ref={containerRef} className="masonry-list" style={{ height: containerHeight || undefined }}>
      {grid.map(item => (
        <div
          key={item.id}
          data-key={item.id}
          className="masonry-item"
          onClick={() => item.url && window.open(item.url, '_blank', 'noopener')}
          onMouseEnter={e => onEnter(e, item)}
          onMouseLeave={e => onLeave(e, item)}
        >
          <div className="masonry-img" style={{ backgroundImage: `url(${item.img})` }}>
            {item.label && (
              <div className="masonry-cap">
                <span className="masonry-cap-t">{item.label}</span>
                {item.tag && <span className="masonry-cap-tag">{item.tag}</span>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
