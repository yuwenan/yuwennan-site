import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/*
 * ShardCloud —— 首屏聚散装置（干净有序版）
 * 均匀分布在球壳上的圆点，聚合成清爽的中心结构；
 * 鼠标移动→朝光标一侧整齐散开；停止→阻尼回弹聚拢；自带轻呼吸。
 * 去掉随机朝向/随机大小，规整不杂乱；按深度做前后明暗层次。
 */
function makeDotTexture() {
  const s = 64
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.85)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2)
  ctx.fill()
  const tex = new THREE.CanvasTexture(c)
  return tex
}

export default function ShardCloud({ count = 700, color = '#aec1d3', scatter = 1.0 }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

    let W = mount.clientWidth || window.innerWidth
    let H = mount.clientHeight || window.innerHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100)
    camera.position.z = 13

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const group = new THREE.Group()
    scene.add(group)

    const R = 3.6
    const base = new THREE.Color(color)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const homes = []
    const dirs = []
    const phase = new Float32Array(count)
    const vary = new Float32Array(count) // 散开幅度的细微差异，保持有机但不杂乱
    const GA = Math.PI * (3 - Math.sqrt(5))

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const th = GA * i
      const home = new THREE.Vector3(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R)
      homes.push(home)
      dirs.push(home.clone().normalize())
      positions[i * 3] = home.x
      positions[i * 3 + 1] = home.y
      positions[i * 3 + 2] = home.z
      // 深度明暗：靠后更暗 → 前后空间层次
      const depth = (home.z + R) / (2 * R)
      const shade = 0.42 + depth * 0.58
      colors[i * 3] = base.r * shade
      colors[i * 3 + 1] = base.g * shade
      colors[i * 3 + 2] = base.b * shade
      phase[i] = Math.random() * Math.PI * 2
      vary[i] = 0.85 + Math.random() * 0.3
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.16,
      map: makeDotTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.NormalBlending,
    })
    const points = new THREE.Points(geo, mat)
    group.add(points)

    // 交互
    let aim = 0
    const mouse = new THREE.Vector2(0, 0)
    const mouseSmooth = new THREE.Vector2(0, 0)
    const mouseDir = new THREE.Vector3()

    function onMove(e) {
      mouse.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1))
      aim = Math.min(1, aim + 0.16)
    }
    if (!reduce) window.addEventListener('pointermove', onMove, { passive: true })

    function resize() {
      W = mount.clientWidth || window.innerWidth
      H = mount.clientHeight || window.innerHeight
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      renderer.setSize(W, H)
    }
    window.addEventListener('resize', resize)

    const posAttr = geo.attributes.position
    const cur = new THREE.Vector3()
    const tgt = new THREE.Vector3()
    let raf = 0
    let t = 0
    function frame() {
      raf = requestAnimationFrame(frame)
      t += 0.016
      aim *= 0.945
      mouseSmooth.lerp(mouse, 0.06)
      mouseDir.set(mouseSmooth.x, mouseSmooth.y, 0.6).normalize()

      for (let i = 0; i < count; i++) {
        const home = homes[i]
        const dir = dirs[i]
        const facing = 0.5 + 0.5 * Math.max(0, dir.dot(mouseDir))
        const breathe = Math.sin(t * 0.5 + phase[i]) * 0.12
        const expand = aim * vary[i] * facing * scatter * 2.6 + breathe
        tgt.copy(home).addScaledVector(dir, expand)
        cur.set(posAttr.array[i * 3], posAttr.array[i * 3 + 1], posAttr.array[i * 3 + 2])
        cur.lerp(tgt, 0.07)
        posAttr.array[i * 3] = cur.x
        posAttr.array[i * 3 + 1] = cur.y
        posAttr.array[i * 3 + 2] = cur.z
      }
      posAttr.needsUpdate = true

      group.rotation.y += (mouseSmooth.x * 0.3 - group.rotation.y) * 0.05
      group.rotation.x += (-mouseSmooth.y * 0.22 - group.rotation.x) * 0.05

      renderer.render(scene, camera)
    }
    frame()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', resize)
      mat.map?.dispose()
      geo.dispose()
      mat.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [count, color, scatter])

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}
