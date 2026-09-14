import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ScrollReveal from './reactbits/ScrollReveal.jsx'
import Aurora from './reactbits/Aurora.jsx'
import Masonry from './reactbits/Masonry.jsx'
import CircularGallery from './reactbits/CircularGallery.jsx'
import DecryptedText from './reactbits/DecryptedText.jsx'
import TextType from './reactbits/TextType.jsx'
import SpotlightCard from './reactbits/SpotlightCard.jsx'
import zhinangImg from './assets/zhinang-cover.png'
import jueImg from './assets/jue-cover.png'
import jueHome from './assets/jue-home.png'
import jueBeijing from './assets/jue-beijing.png'
import jueEcom from './assets/jue-ecom.png'
import jueClassroom from './assets/jue-classroom.png'
import jueEmoji from './assets/jue-emoji.png'
import skilllabImg from './assets/skilllab.png'
import memoryGameImg from './assets/memory-game.jpg'
import aigcTyphoonImg from './assets/aigc-typhoon.jpg'
import promptHubImg from './assets/prompthub-cover.png'
import phWeb from './assets/prompthub-web.png'
import phTags from './assets/prompthub-tags.png'
import phVocab from './assets/prompthub-vocab.png'
import zhS1 from './assets/zhinang-s1.png'
import zhS2 from './assets/zhinang-s2.png'
import zhS3 from './assets/zhinang-s3.png'
import slS1 from './assets/skilllab-s1.png'
import slS2 from './assets/skilllab-s2.png'
import slS3 from './assets/skilllab-s3.png'
import slS4 from './assets/skilllab-s4.png'
import slS5 from './assets/skilllab-s5.png'
import mf1 from './assets/mf-1.png'
import mf2 from './assets/mf-2.png'
import mf3 from './assets/mf-3.png'
import mf4 from './assets/mf-4.png'
import mf5 from './assets/mf-5.png'
import mf6 from './assets/mf-6.png'
import mf7 from './assets/mf-7.png'
import zhS4 from './assets/zhinang-s4.png'

/* ---- scroll reveal hook ---- */
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal-on-scroll') ?? []
    const io = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.15 }
    )
    els.forEach(el => io.observe(el))
    // 兜底：1.5s 后仍未触发的也显示，避免内容卡在隐藏态
    const t = setTimeout(() => els.forEach(el => el.classList.add('in')), 1500)
    return () => { io.disconnect(); clearTimeout(t) }
  }, [])
  return ref
}

/* ---- 视差漂移：滚动时给 [data-parallax] 元素一点位移，克制平滑 ---- */
function useParallax() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const nodes = Array.from(document.querySelectorAll('[data-parallax]'))
    if (!nodes.length) return
    let ticking = false
    const update = () => {
      const vh = window.innerHeight
      for (const el of nodes) {
        const speed = parseFloat(el.dataset.parallax) || 0.1
        const r = el.getBoundingClientRect()
        const off = (r.top + r.height / 2 - vh / 2) / vh
        el.style.setProperty('--py', (-off * speed * 160).toFixed(1) + 'px')
      }
      ticking = false
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [])
}

/* ---- 钉住块：外层给滚动距离，内层 sticky 钉住；children 收到本块滚动进度 p(0..1) ---- */
function PinnedSection({ children, id, heightVh = 200, className = '' }) {
  const wrapRef = useRef(null)
  const [p, setP] = useState(0)
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    let raf = 0, pending = false
    const compute = () => {
      pending = false
      const total = wrap.offsetHeight - window.innerHeight
      const scrolled = Math.min(Math.max(-wrap.getBoundingClientRect().top, 0), Math.max(total, 1))
      setP(total > 0 ? scrolled / total : 0)
    }
    const onScroll = () => { if (!pending) { pending = true; raf = requestAnimationFrame(compute) } }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    compute()
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [])
  return (
    <section ref={wrapRef} id={id} className={`pin-wrap ${className}`} style={{ height: `${heightVh}vh` }}>
      <div className="pin-inner">{typeof children === 'function' ? children(p) : children}</div>
    </section>
  )
}

/* ---- 逐字显：随进度 p 在 [start,end] 区间内从左到右逐字「模糊+半透明→清晰」 ---- */
function CharReveal({ text, p, start = 0, end = 1, className = '' }) {
  const chars = Array.from(text)
  const n = Math.max(chars.length, 1)
  const local = (p - start) / (end - start)
  return (
    <span className={className}>
      {chars.map((ch, i) => {
        const o = Math.max(0, Math.min(1, (local - (i / n) * 0.8) * 7))
        return (
          <span key={i} style={{ display: 'inline-block', opacity: o, filter: `blur(${(1 - o) * 5}px)`, transform: `translateY(${(1 - o) * 8}px)` }}>
            {ch === ' ' ? ' ' : ch}
          </span>
        )
      })}
    </span>
  )
}

/* ---- 作品（带图卡）---- */
const WORKS = [
  {
    tag: 'AI · 工具', title: 'Prompt Hub', en: 'Prompt 管理后台', img: promptHubImg,
    shots: [promptHubImg, phWeb, phTags, phVocab],
    desc: '自己做的 Prompt 与素材管理台。词汇库（AI 帮你把「说不清的感觉」总结成准词）、标签体系、按场景分类，Hero 首页库沉淀首屏套路（标好场景 + 只换两张图就出效果）；还逆向拆解优秀网站的 prompt 手法。数据 git 锁定，后端上线 + 小程序壳。',
    caps: [
      { label: '管理', items: ['词汇库', '标签体系', '场景分类', 'Hero 首页库'] },
      { label: '前端', items: ['Vite', 'React 19', 'Ant Design 6'] },
      { label: '工程', items: ['数据 git 锁定', '后端上线', '小程序壳'] },
    ],
  },
  {
    tag: 'AI · 决策', title: '智囊', en: '领域顾问团', img: zhinangImg,
    shots: [zhS1, zhS2, zhS3, zhS4],
    desc: '把外部智慧和自己的积累喂成「领域顾问团」，RAG 问答带出处溯源；本地向量 + sqlite，决策台账防打脸。还内置「第二个我」数字分身：自画像 + 带置信度闸的决策代理 + 周报，能代表本人对外回答。',
    caps: [
      { label: '决策台账', items: ['喂记录', '抽候选', '拍板', 'append-only 台账', '冲突告警', '问答溯源'] },
      { label: '顾问团 RAG', items: ['名人 / 经典书', '可放自己积累', '出处溯源', '本地向量检索'] },
      { label: '数字分身', items: ['多维自画像', '了解我', '替我决定（置信度闸）', '和自己聊', '隐私分级'] },
      { label: '技术', items: ['DeepSeek', 'bge 本地向量', 'sqlite', '会话落库'] },
    ],
  },
  {
    tag: 'AIGC · 视频生成', title: 'Jué 角', en: 'AI 剧组', img: jueImg,
    shots: [jueHome, jueBeijing, jueEcom, jueClassroom, jueEmoji],
    desc: 'AIGC「剧组」协作平台，扒标杆 oii 拆明白再复刻。多角分工跑通整条链：剧本 → 角色 / 场景三视图 → 分镜取帧 → 图生视频 + 配音；配 prompt 调画面调性，摸清模型「生成」与「编辑」之分，一句想法做到出片。FastAPI + sqlite + 公开 API。',
    caps: [
      { label: '生成链', items: ['剧本', '角色三视图', '场景三视图', '分镜', '图生视频'] },
      { label: '剧组协作', items: ['多角色分工', '风格可选', '一站式流水线'] },
      { label: '技术', items: ['FastAPI', 'sqlite', '火山对话', '公开 API'] },
    ],
  },
  {
    tag: 'Web · 密室逃脱', title: '记忆碎片', en: '密室逃脱', img: mf1,
    shots: [mf1, mf2, mf3, mf4, mf5, mf6, mf7],
    desc: '网页密室逃脱解谜游戏：3D 走廊 + 机关谜题，靠找线索、拼记忆碎片逐门推进。研究过 Godot / Unity / UE，最后用大模型 + three.js 做成网页版，已上线可玩。',
    caps: [
      { label: '玩法', items: ['密室逃脱', '找线索 / 碎片', '解谜密码', '多房间推进', '剧情叙事'] },
      { label: '技术', items: ['three.js', '大模型生成', '3D 走廊 / 机关', '氛围特效', '关卡设计'] },
    ],
  },
  {
    tag: 'AI · 工具', title: 'Skill Lab', en: '技能拆解库', img: skilllabImg,
    shots: [slS1, slS2, slS3, slS4, slS5],
    desc: '把优秀 AI skill 发现 → 真拆解 → 收进「我的拆解」→ 综合生成自己领域的 skill。三套发现榜、claude CLI 分析翻译、导入去重、套路库、触发体检测试台。',
    caps: [
      { label: '发现', items: ['ClawHub', 'skills.sh', 'GitHub 榜', 'SWR 加速'] },
      { label: '拆解', items: ['claude CLI 分析', '翻译', '套路提取'] },
      { label: '生成', items: ['多套路综合生成', '领域定制', '套路库'] },
      { label: '工程', items: ['导入去重', '触发体检测试台'] },
    ],
  },
]


const WORKS_ALL = WORKS

/* ---- AIGC 作品（生成内容本身，非工具项目；站上一律标明 AI 生成·虚构场景）---- */
const AIGC_WORKS = [
  {
    tag: 'AIGC · 文生图', title: '超级台风过境上海', en: 'AI 概念图',
    img: aigcTyphoonImg, note: 'AI 生成 · 虚构场景',
    desc: 'AI 文生图的灾难概念创作：超级台风盘踞陆家嘴上空。发到抖音做了一次传播力验证——4 天 94 万+播放、近 7000 次分享，验证了「强视觉 + 热点题材」这套内容打法能跑通。',
    stats: [
      { to: 94.1, decimals: 1, suffix: '万', l: '播放' },
      { to: 8012, l: '点赞' },
      { to: 6824, l: '分享' },
      { to: 594, l: '评论' },
    ],
  },
]

/* ---- 截图轮播（详情弹窗里用，手机竖屏截图可左右滑）---- */
function ShotCarousel({ shots, alt }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = shots.length
  const go = d => setI(v => (v + d + n) % n)
  // 键盘左右
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [n])
  // 自动播放（悬停暂停）
  useEffect(() => {
    if (n < 2 || paused) return
    const t = setInterval(() => setI(v => (v + 1) % n), 4200)
    return () => clearInterval(t)
  }, [n, paused])
  return (
    <div className="shot-carousel">
      <div
        className="shot-viewport"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onClick={() => n > 1 && go(1)}
        style={{ cursor: n > 1 ? 'pointer' : 'default' }}
      >
        <div className="shot-track" style={{ transform: `translateX(-${i * 100}%)` }}>
          {shots.map((s, k) => (
            <div className="shot-slide" key={k}>
              <img src={s} alt={`${alt} 截图 ${k + 1}`} loading={k === 0 ? 'eager' : 'lazy'} />
            </div>
          ))}
        </div>
      </div>
      {n > 1 && (
        <div className="shot-dots">
          {shots.map((_, k) => <button key={k} className={k === i ? 'on' : ''} onClick={e => { e.stopPropagation(); setI(k) }} aria-label={`第 ${k + 1} 张`} />)}
        </div>
      )}
    </div>
  )
}

function WorkDetailModal({ work, onClose }) {
  useEffect(() => {
    if (!work) return
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [work, onClose])
  if (!work) return null
  return (
    <div className="work-modal" onClick={onClose}>
      <div className="work-modal-card" onClick={e => e.stopPropagation()}>
        <button className="work-modal-close" onClick={onClose} aria-label="关闭">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
        </button>
        {(work.shots?.length || work.img) &&
          <ShotCarousel shots={work.shots?.length ? work.shots : [work.img]} alt={work.title} />}
        <div className="work-modal-body">
          <div className="card-tag">{work.tag}</div>
          <h3 className="work-modal-title">{work.title}{work.en && <span> {work.en}</span>}</h3>
          <p className="work-modal-desc">{work.desc}</p>
          {work.caps && (
            <div className="work-feat-caps">
              {work.caps.map(g => (
                <div className="cap-group" key={g.label}>
                  <span className="cap-label">{g.label}</span>
                  <div className="cap-items">{g.items.map(it => <span key={it}>{it}</span>)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---- Magic Bento：光斑跟随鼠标 + 边缘辉光的卡片网格 ---- */
function MagicBento({ items }) {
  const ref = useRef(null)
  const onMove = e => {
    const grid = ref.current
    if (!grid) return
    for (const c of grid.querySelectorAll('.bento-card')) {
      const r = c.getBoundingClientRect()
      c.style.setProperty('--cx', `${e.clientX - r.left}px`)
      c.style.setProperty('--cy', `${e.clientY - r.top}px`)
    }
  }
  return (
    <div className="bento-grid" ref={ref} onMouseMove={onMove}>
      {items.map((m, i) => (
        <div className="bento-card" key={i}>
          <span className="bento-name">{m.name}</span>
          <span className="bento-desc">{m.desc}</span>
        </div>
      ))}
    </div>
  )
}

/* ---- 更多小项目 ---- */
const MORE = [
  { name: 'Prompt 管理后台', desc: 'Prompt 与素材管理台，版本锁定 + 小程序壳' },
  { name: 'ClawD 桌宠', desc: 'ESP32 会说话的桌面小宠物，接 Claude Code 显示状态' },
  { name: '《野生》', desc: '选动物的 3D 生态生存模拟游戏' },
  { name: 'ClaudeWatch', desc: 'Apple Watch 上看 Claude Code 运行状态' },
  { name: 'VoiceLab', desc: '火山 ASR 做的 Mac 全局语音听写' },
  { name: '上下文压缩', desc: '本地压缩长上下文的 Mac 小工具' },
  { name: 'rerank 重排', desc: '检索结果重排序的小工具' },
  { name: 'DeepSeek 仿站', desc: 'DeepSeek 网页版的高仿单页复刻' },
  { name: '飞书遥控 Claude Code', desc: '飞书机器人远程驱动本机 Claude Code' },
]

/* ---- 首屏 AI 终端控制台（「另一个我」活在里面，外壳；真大脑待接 智囊 分身 API）---- */
/* 预设问答：点击立刻出答案（内容取自分身真实回答、人工校订），不占接口 */
const PRESET_QA = [
  {
    q: '做过什么产品？',
    a: '都是一个人从想法做到能跑的独立产品：\n- **智囊**：顾问团 RAG + 决策台账 + 数字分身（你现在聊的「另一个我」就是它）\n- **Prompt Hub**：Prompt 与素材管理台，词汇库 + 标签体系\n- **Jué 角**：AI 剧组视频生成流水线
- **Skill Lab**：AI skill 拆解学习库\n- **记忆碎片**：网页 3D 密室逃脱游戏\n加上桌宠、语音听写这些小工具，10+ 个都能跑。往上翻「作品」区都有截图。',
  },
  {
    q: '为什么转 AI 产品？',
    a: '其实不算「转」，是一直在做的事自然聚焦到了 AI 上。她本来就一个人独立全栈做产品，从技术到设计都自己来；后来发现 AI 能极大放大这件事——资讯雷达、对话引擎、自动发布工具都是这么做出来的。她本质上是自用驱动、动手型的人，AI 产品让「做工具放大自己」能做到极致。与其说转行，不如说找到了最适合的方向。',
  },
  {
    q: '怎么看 AI 的未来？',
    a: '比较务实的看法：AI 的未来不是一个大模型通吃，而是**无数轻量、专用、可组合的智能体**。她自己同时推进十几个产品，每个解决一个具体的小问题——智囊管决策、Jué 管出片、记忆碎片管好玩，未来每个人都会有一套自己的「AI 工具链」。另外她坚持 AI 要**可解释、可控制**：所有评分和判断都必须能摊开依据，不做黑箱。',
  },
]

/* ---- 轻量 markdown 渲染：**加粗** / - 列表 / 段落 ---- */
function renderInline(s, kp) {
  return s.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={kp + i}>{p.slice(2, -2)}</strong>
      : p
  )
}
function RichText({ text }) {
  const blocks = []
  let list = null
  for (const raw of text.split('\n')) {
    const line = raw.trimEnd()
    const m = line.match(/^\s*[-*•]\s+(.*)/)
    if (m) { (list ??= []).push(m[1]); continue }
    if (list) { blocks.push({ t: 'ul', items: list }); list = null }
    if (line.trim()) blocks.push({ t: 'p', text: line })
  }
  if (list) blocks.push({ t: 'ul', items: list })
  return (
    <div className="rich">
      {blocks.map((b, i) => b.t === 'ul'
        ? <ul key={i}>{b.items.map((it, j) => <li key={j}>{renderInline(it, `${i}-${j}-`)}</li>)}</ul>
        : <p key={i}>{renderInline(b.text, `${i}-`)}</p>)}
    </div>
  )
}

/* ---- AI 回答打字机：答案到手后逐字渲染出流式感 ---- */
function TypeOut({ text, onTick }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    let i = 0
    const t = setInterval(() => {
      i += 2
      setN(Math.min(i, text.length))
      onTick?.()
      if (i >= text.length) clearInterval(t)
    }, 14)
    return () => clearInterval(t)
  }, [text])
  return <RichText text={text.slice(0, n)} />
}

function AiConsole() {
  // 展示模式:只开放预设问答浏览,不接实时接口、不可发送
  const [convs, setConvs] = useState({})
  const [active, setActive] = useState(null)
  const bodyRef = useRef(null)
  const lines = (active && convs[active]) || []

  useEffect(() => { openPreset(0) }, [])
  useEffect(() => { bodyRef.current?.scrollTo({ top: 9e9, behavior: 'smooth' }) }, [convs, active])

  const lastAi = lines.map(m => m.who).lastIndexOf('ai')
  const scrollBottom = () => bodyRef.current?.scrollTo({ top: 9e9 })
  // 打开预设会话:首次进入播打字机,再次切换直接静态展示
  function openPreset(i) {
    const id = 'q' + i
    setConvs(c => c[id]
      ? { ...c, [id]: c[id].map(m => ({ ...m, anim: false })) }
      : { ...c, [id]: [{ who: 'me', text: PRESET_QA[i].q }, { who: 'ai', text: PRESET_QA[i].a, anim: true }] })
    setActive(id)
  }
  const title = active ? PRESET_QA[+active.slice(1)].q : ''

  return (
    <div className="twin">
      <aside className="twin-side">
        <span className="console-dots"><i /><i /><i /></span>
        <div className="twin-side-label">大家常问</div>
        <div className="twin-side-list">
          {PRESET_QA.map((p, i) => (
            <button key={p.q} className={active === 'q' + i ? 'on' : ''} onClick={() => openPreset(i)}>{p.q}</button>
          ))}
        </div>
        <div className="twin-side-foot">内容来自她的数字分身的真实回答，人工校订</div>
      </aside>
      <div className="twin-main">
        <div className="twin-top">
          <span className="twin-top-title">{title}</span>
          <span className="console-status"><span className="concierge-dot" />展示</span>
        </div>
        <div className="twin-body" ref={bodyRef}>
          {lines.map((m, i) => (
            m.who === 'me'
              ? <div className="twin-msg me" key={i}><div className="twin-bubble">{m.text}</div></div>
              : <div className="twin-msg ai" key={i}>
                  {m.anim && i === lastAi
                    ? <TypeOut text={m.text} onTick={scrollBottom} />
                    : <RichText text={m.text} />}
                </div>
          ))}
        </div>
        <div className="twin-inputwrap">
          <textarea rows={1} value="" readOnly disabled placeholder="展示模式 · 提问暂未开放" />
          <button className="twin-send" disabled aria-label="发送">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </button>
        </div>
        <div className="twin-note">以上为预设问答展示</div>
      </div>
    </div>
  )
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle} aria-label="切换明暗">
      {theme === 'dark' ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4" /></svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
      )}
    </button>
  )
}

const NAV = [
  { id: 'about', label: '关于' },
  { id: 'work', label: '作品' },
  { id: 'aigc', label: 'AIGC' },
]

/* ---- 数字滚动：进入视口时 0 → target ---- */
function CountUp({ to, suffix = '', dur = 1300, decimals = 0 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const done = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !done.current) {
          done.current = true
          const t0 = performance.now()
          const step = t => {
            const p = Math.min((t - t0) / dur, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setVal((eased * to).toFixed(decimals))
            if (p < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      })
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [to, dur, decimals])
  return <span ref={ref}>{val}{suffix}</span>
}

/* ---- 手机截图小卡簇（几张小卡错落摆放）---- */
function PhoneStack({ images, alt }) {
  return (
    <div className="pstack">
      {images.map((src, i) => (
        <div key={i} className="pstack-card" data-parallax={i === 0 ? 0.1 : 0.28}>
          <img src={src} alt={`${alt} ${i + 1}`} loading="lazy" />
        </div>
      ))}
    </div>
  )
}

/* ---- WebGL 色散玻璃方块：原地旋转漂浮，随滚动汇集 ---- */
function GlassHero() {
  const mountRef = useRef(null)
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let w = mount.clientWidth, h = mount.clientHeight
    const dpr = Math.min(window.devicePixelRatio, 2)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(dpr)
    renderer.setSize(w, h)
    mount.appendChild(renderer.domElement)
    renderer.setClearColor(0x000000, 0)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100)
    camera.position.set(0, 0, 9)

    // 背景彩色光斑：供玻璃折射出彩
    function blob(color, x, y, z, s) {
      const cv = document.createElement('canvas'); cv.width = cv.height = 256
      const c = cv.getContext('2d')
      const g = c.createRadialGradient(128, 128, 0, 128, 128, 128)
      g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)')
      c.fillStyle = g; c.fillRect(0, 0, 256, 256)
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }))
      sp.position.set(x, y, z); sp.scale.set(s, s, 1)
      return sp
    }
    scene.add(blob('rgba(200,214,240,0.55)', 2.3, 0.3, -3.8, 6))
    scene.add(blob('rgba(150,170,205,0.18)', 0.5, -0.5, -6, 11))
    scene.add(blob('rgba(232,196,158,0.2)', 3.6, 1.6, -5, 5))

    const fbo = new THREE.WebGLRenderTarget(Math.floor(w * dpr), Math.floor(h * dpr))
    const glassMat = new THREE.ShaderMaterial({
      uniforms: { uScene: { value: fbo.texture } },
      vertexShader: `
        varying vec3 vN; varying vec3 vView; varying vec4 vScreen;
        void main(){
          vec4 wp = modelMatrix * vec4(position,1.0);
          vN = normalize(mat3(modelMatrix)*normal);
          vView = normalize(wp.xyz - cameraPosition);
          vScreen = projectionMatrix * viewMatrix * wp;
          gl_Position = vScreen;
        }`,
      fragmentShader: `
        uniform sampler2D uScene; varying vec3 vN; varying vec3 vView; varying vec4 vScreen;
        void main(){
          vec2 uv = (vScreen.xy/vScreen.w)*0.5+0.5;
          vec3 n = normalize(vN);
          float s = 0.09;
          vec3 rr = refract(vView,n,1.0/1.12);
          vec3 rg = refract(vView,n,1.0/1.15);
          vec3 rb = refract(vView,n,1.0/1.19);
          float r = texture2D(uScene, uv + rr.xy*s).r;
          float g = texture2D(uScene, uv + rg.xy*(s*1.25)).g;
          float b = texture2D(uScene, uv + rb.xy*(s*1.5)).b;
          vec3 col = vec3(r,g,b) + 0.05;
          float fres = pow(1.0 - max(dot(-vView,n),0.0), 2.0);
          col += fres*vec3(0.95,0.97,1.0)*1.05;
          gl_FragColor = vec4(col, 1.0);
        }`,
    })

    // 玻璃方块拼成品牌符号「Y」：散落 → 滚动组装成字形
    const group = new THREE.Group()
    group.position.set(2.3, 0.1, -0.4)
    group.scale.setScalar(0.92)
    scene.add(group)
    const parts = []
    const facet = (g) => { const n = g.toNonIndexed(); n.computeVertexNormals(); return n }
    const mk = (g) => { const m = new THREE.Mesh(g, glassMat); group.add(m); parts.push(m); return m }

    // 身体：多面水晶椭球
    const body = mk(facet(new THREE.IcosahedronGeometry(1, 1)))
    body.scale.set(1.7, 1.05, 0.78)
    // 尾鳍：三角水晶
    const tail = mk(facet(new THREE.ConeGeometry(0.9, 1.4, 4)))
    tail.scale.set(1, 1, 0.32)
    tail.rotation.z = -Math.PI / 2
    tail.position.set(-1.8, 0, 0)
    // 背鳍
    const fin = mk(facet(new THREE.ConeGeometry(0.45, 0.8, 4)))
    fin.scale.set(1, 1, 0.22)
    fin.position.set(0.1, 0.8, 0)
    const fishGeos = parts.map(m => m.geometry)

    let raf, alive = true
    const clock = new THREE.Clock()
    const tmp = new THREE.Vector3()
    function render() {
      if (!alive) return
      const t = clock.getElapsedTime()
      // 游动
      group.rotation.y = Math.sin(t * 0.4) * 0.28
      group.rotation.z = Math.sin(t * 0.55) * 0.06
      group.position.y = 0.1 + Math.sin(t * 0.7) * 0.13
      tail.rotation.y = Math.sin(t * 3.0) * 0.28
      parts.forEach(m => (m.visible = false))
      renderer.setRenderTarget(fbo); renderer.clear(); renderer.render(scene, camera)
      parts.forEach(m => (m.visible = true))
      glassMat.uniforms.uScene.value = fbo.texture
      renderer.setRenderTarget(null); renderer.clear(); renderer.render(scene, camera)
      raf = requestAnimationFrame(render)
    }
    render()
    function onResize() {
      w = mount.clientWidth; h = mount.clientHeight
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix()
      fbo.setSize(Math.floor(w * dpr), Math.floor(h * dpr))
    }
    window.addEventListener('resize', onResize)
    return () => {
      alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize)
      fishGeos.forEach(g => g.dispose()); glassMat.dispose(); fbo.dispose(); renderer.dispose()
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }, [])
  return <div className="glass-hero" ref={mountRef} />
}

/* ---- 首屏：滚动钉住式（页面被 hold，滚动进度驱动文字在屏幕上变换）---- */
/* ---- 首屏：原来的自动打字版（不钉住），干净底 + 点网格 ---- */
function SpotlightHero() {
  return (
    <header className="hero" id="top">
      <div className="hero-base" />
      <div className="hero-video" aria-hidden="true">
        <video
          autoPlay
          muted
          loop
          playsInline
          src={`${import.meta.env.BASE_URL}videos/deep-sea-fish.mp4`}
        />
      </div>
      <div className="hero-grid" aria-hidden="true" />
      {/* 极光背景已换成深海鱼群视频，如需切回：<div className="hero-glass"><Aurora amplitude={1.1} blend={0.55} /></div> */}
      <div className="hero-copy">
        <h1 className="hero-statement">
          <span className="line1 anim a-reveal" style={{ animationDelay: '0.2s' }}>把想法，</span>
          <TextType
            as="span"
            className="line2-type"
            text={['做成产品。', '做成 Demo。', '做成能跑的工具。', '一个人上线。']}
            typingSpeed={95}
            deletingSpeed={45}
            pauseDuration={1700}
            initialDelay={500}
            cursorCharacter="|"
            cursorClassName="hero-caret"
          />
        </h1>
        <p className="hero-intro anim a-fade" style={{ animationDelay: '0.6s' }}>
          一个人从想法到落地——10+ 个独立产品 / 工具。熟悉 AI Agent、RAG、工作流、长期记忆，擅长把模糊需求拆成产品方案、原型和可运行的 Demo。
        </p>
        <div className="hero-stats anim a-fade" style={{ animationDelay: '0.75s' }}>
          <div><b>2 年</b><span>产品 / 前端</span></div>
          <div><b>5+</b><span>业务线</span></div>
          <div><b>6+</b><span>项目落地</span></div>
          <div><b>10+</b><span>独立产品 / 工具</span></div>
        </div>
      </div>
      <div className="hero-cue"><span /></div>
    </header>
  )
}

export default function App() {
  const [theme, setTheme] = useState('dark')
  const [active, setActive] = useState('top')
  const [detailWork, setDetailWork] = useState(null)
  const revealRef = useReveal()
  useParallax()

  // 惯性平滑滚动 + 与 GSAP ScrollTrigger 同步（文字滚动动效靠它）
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.09 })
    lenis.on('scroll', ScrollTrigger.update)
    let raf
    const loop = time => { lenis.raf(time); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 400)
    return () => { cancelAnimationFrame(raf); clearTimeout(refresh); lenis.destroy() }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // 滚到哪个区块，导航胶囊对应项就高亮
  useEffect(() => {
    const ids = ['top', 'about', 'work', 'contact']
    const io = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  return (
    <div ref={revealRef}>
      {/* NAV */}
      <nav className="nav">
        <a href="#top" className="nav-brand">
          <svg className="brand-fish" viewBox="9 14 50 38" aria-hidden="true">
            <path fill="currentColor" fillRule="evenodd" d="M12 24 L22 27 L28 24 L32 18 L36 23 L51 28 L55 31.5 L52 36 L37 41 L33 47 L29 40 L22 38 L12 42 L21 33 Z M43.2 28.4 h3 v3 h-3 Z" />
          </svg>
          yuwennan
        </a>
        <div className="nav-center">
          <div className="nav-pill">
            {NAV.map(n => (
              <a key={n.id} href={`#${n.id}`} className={active === n.id ? 'active' : ''}>{n.label}</a>
            ))}
          </div>
        </div>
        <div className="nav-right">
          <a href="#contact" className="btn-primary">CONTACT</a>
        </div>
      </nav>

      {/* HERO — 暗底 + 鼠标聚光灯揭示流体 */}
      <SpotlightHero />

      <main>
        {/* ABOUT — 钉住块，内容随本块滚动逐字显 */}
        <PinnedSection id="about" heightVh={200}>
          {p => {
            const statsO = Math.max(0, Math.min(1, (p - 0.66) * 5))
            return (
              <div className="wrap about-wrap">
                <div className="eyebrow" style={{ opacity: Math.min(1, p * 8) }}>关于 / About</div>
                <div className="about-grid">
                  <h2 className="about-lead">
                    <span className="dt-line"><CharReveal text="一个会写前端的" p={p} start={0.02} end={0.4} /></span>
                    <span className="dt-line dt-accent"><CharReveal text="AI 产品经理。" p={p} start={0.18} end={0.52} /></span>
                  </h2>
                  <div className="about-right">
                    <p className="about-body">
                      <CharReveal text="从前端开发、接口联调切入，一路做到需求调研、客户对接、产品设计、研发沟通和上线推进；现在主要做 AI 产品定义、Agent 方案与 Demo 验证。熟悉 AI Agent、RAG、知识库、工作流、Prompt、长期记忆，擅长把模糊需求拆成产品方案、原型和可运行的 Demo。" p={p} start={0.32} end={0.84} />
                    </p>
                    <div className="stat-strip" style={{ opacity: statsO, transform: `translateY(${(1 - statsO) * 16}px)` }}>
                      <div><b><CountUp to={2} suffix=" 年" /></b><span>产品 / 前端经验</span></div>
                      <div><b><CountUp to={10} suffix="+" /></b><span>独立产品 / 工具</span></div>
                      <div><b><CountUp to={5} suffix="+" /></b><span>业务线</span></div>
                      <div><b><CountUp to={6} suffix="+" /></b><span>项目落地</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }}
        </PinnedSection>

        {/* WORK — 正常流动区块（内容多，正常滚+渐显，不钉住）*/}
        <section className="section" id="work">
          <div className="wrap">
            <div className="work-head reveal-on-scroll">
              <div>
                <div className="eyebrow">作品 / Work</div>
                <h2 className="section-title">在做的<span className="accent">东西</span></h2>
              </div>
            </div>

            <div className="work-gallery reveal-on-scroll">
              <CircularGallery
                items={WORKS_ALL.map(w => ({ image: w.img, text: w.title }))}
                bend={1}
                textColor="#fffdf9"
                borderRadius={0.06}
                onItemClick={i => setDetailWork(WORKS_ALL[i])}
              />
            </div>
            <p className="work-gallery-hint reveal-on-scroll">← 拖动浏览 · 点击看详情 →</p>

            <div className="work-more reveal-on-scroll">
              <span className="work-more-label">更多 · More</span>
              <MagicBento items={MORE} />
            </div>
          </div>
        </section>

        {/* AIGC — 生成内容作品（正常流动区块）*/}
        <section className="section" id="aigc">
          <div className="wrap">
            <div className="reveal-on-scroll">
              <div className="eyebrow">生成创作 / AIGC</div>
              <h2 className="section-title">AIGC <span className="accent">作品</span></h2>
            </div>
            {AIGC_WORKS.map((w, i) => (
              <figure className="aigc-item reveal-on-scroll" key={i}>
                <div className="aigc-shot">
                  <img src={w.img} alt={w.title} loading="lazy" />
                  <span className="aigc-badge">{w.note}</span>
                </div>
                <figcaption className="aigc-info">
                  <div className="aigc-text">
                    <div className="card-tag">{w.tag}</div>
                    <h3 className="aigc-title">{w.title}{w.en && <span>{w.en}</span>}</h3>
                    <p className="aigc-desc">{w.desc}</p>
                  </div>
                  <div className="aigc-stats">
                    {w.stats.map((s, j) => (
                      <div key={j}>
                        <b><CountUp to={s.to} decimals={s.decimals || 0} suffix={s.suffix || ''} /></b>
                        <span>{s.l}</span>
                      </div>
                    ))}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section className="section contact" id="contact">
          <div className="wrap">
            <div className="reveal-on-scroll">
              <div className="eyebrow">联系 / Contact</div>
              <h2 className="section-title">想多了解？<span className="accent">直接问「我」</span></h2>
              <p className="contact-sub">背后接的是我的数字分身，由「另一个我」代答。</p>
            </div>
            <div className="contact-console border-glow reveal-on-scroll">
              <AiConsole />
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">© 2026 yuwennan.com</footer>
      <WorkDetailModal work={detailWork} onClose={() => setDetailWork(null)} />
    </div>
  )
}
