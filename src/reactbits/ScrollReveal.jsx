import { useEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/*
 * ScrollReveal（ReactBits）—— 文字随滚动逐词从「半透明+模糊+微转」→「清晰」。
 * 纯字符串 children；按词拆分，GSAP ScrollTrigger scrub 驱动。
 */
export default function ScrollReveal({
  children,
  as: Tag = 'p',
  className = '',
  baseOpacity = 0.14,
  baseRotation = 1.6,
  blurStrength = 4,
  enableBlur = true,
}) {
  const ref = useRef(null)

  const words = useMemo(() => {
    const text = typeof children === 'string' ? children : ''
    // 按字符拆（中文无空格，逐字显才有效）；空格原样保留
    return Array.from(text).map((ch, i) =>
      ch === ' ' ? ' ' : <span className="sr-word" key={i}>{ch}</span>
    )
  }, [children])

  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const wordEls = el.querySelectorAll('.sr-word')
    const tweens = []

    tweens.push(gsap.fromTo(el,
      { transformOrigin: '0% 50%', rotate: baseRotation },
      { rotate: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom center', scrub: true } }
    ))
    tweens.push(gsap.fromTo(wordEls,
      { opacity: baseOpacity },
      { opacity: 1, ease: 'none', stagger: 0.05, scrollTrigger: { trigger: el, start: 'top bottom-=8%', end: 'bottom center+=8%', scrub: true } }
    ))
    if (enableBlur) {
      tweens.push(gsap.fromTo(wordEls,
        { filter: `blur(${blurStrength}px)` },
        { filter: 'blur(0px)', ease: 'none', stagger: 0.05, scrollTrigger: { trigger: el, start: 'top bottom-=8%', end: 'bottom center+=8%', scrub: true } }
      ))
    }
    return () => tweens.forEach(t => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill() })
  }, [baseOpacity, baseRotation, blurStrength, enableBlur])

  return <Tag ref={ref} className={`sr ${className}`}>{words}</Tag>
}
