import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { useNavigate, useLocation } from 'react-router'
import '@/styles/AiFloatButton.css'
import avatar from '@/assets/images/7f6d5c6166c8caaabd61f0b0d91f72333269d9e0.png'
import icMsg from '@/assets/images/side-dock/msg.png'
import icCart from '@/assets/images/side-dock/cart.png'
import { CHAT_UPDATE_EVENT, getChats } from '@/utils/chatStore'
import { getSvcChats } from '@/utils/serviceStore'

// 全局 AI 侧边栏：默认贴边收成一条窄折叠栏（不挡内容），
// 点一下展开成竖排图标栏 —— 最上面是 AI 派派，下面按页面追加消息 / 购物车；
// 展开态可整体拖动，拖到左右边缘松手就收回折叠栏。
const W = 56                 // 单个图标圆钮尺寸 / 展开态栏宽
const SIDE = 10              // 距手机列边缘的间距
const TOP_MIN = 54           // 避开顶部状态栏
const BOTTOM_RESERVE = 108   // 避开底部导航栏
const PHONE_W = 406          // 手机屏逻辑宽
const SNAP = 30              // 距边缘多少像素内松手就收起
const BAR_W = 16             // 折叠栏宽度
const BAR_H = 64             // 折叠栏高度
const AUTO_HIDE_MS = 8000    // 展开后无操作自动收回
const STORE_KEY = 'petpal-ai-ball'

type Side = 'left' | 'right' | null

interface Pos {
  x: number
  y: number
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

// 手机列在视口中的横向起点与宽度
const phoneBounds = () => {
  const cw = Math.min(PHONE_W, window.innerWidth)
  const offX = Math.max(0, (window.innerWidth - cw) / 2)
  return { offX, cw }
}

// 展开态高度：n 个图标 = 内边距 6 + n×44 + (n-1)×6
const railHeight = (n: number) => (n > 1 ? 12 + n * 44 + (n - 1) * 6 : W)

const hiddenX = (side: Exclude<Side, null>) => {
  const { offX, cw } = phoneBounds()
  return side === 'left' ? offX - BAR_W / 2 : offX + cw - BAR_W / 2
}

const shownX = (side: Exclude<Side, null>, width: number) => {
  const { offX, cw } = phoneBounds()
  return side === 'left' ? offX + SIDE : offX + cw - width - SIDE
}

const loadPref = (): { side: Side; y: number | null } => {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return { side: null, y: null }
    const v = JSON.parse(raw) as { side?: Side; y?: number }
    const side = v.side === 'left' || v.side === 'right' ? v.side : null
    const y = typeof v.y === 'number' ? v.y : null
    return { side, y }
  } catch {
    return { side: null, y: null }
  }
}

const savePref = (side: Side, y: number) => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ side, y }))
  } catch {
    /* 忽略配额/隐私模式异常 */
  }
}

export default function AiFloatButton() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [pos, setPos] = useState<Pos | null>(null)
  const [collapsed, setCollapsed] = useState<Exclude<Side, null> | null>(null)
  const [dragging, setDragging] = useState(false)
  const meta = useRef({ active: false, moved: false, sx: 0, sy: 0, bx: 0, by: 0, key: null as string | null })
  const livePos = useRef<Pos | null>(null)
  const lastSide = useRef<Exclude<Side, null>>('right')
  const hideTimer = useRef<number | null>(null)

  // 派派页与登录页整体隐藏，避免自指与干扰
  const hidden = pathname.startsWith('/paipai') || pathname.startsWith('/login')

  // 除隐藏页外，各页面都保留 AI / 消息 / 购物车三个入口，避免不同页面栏形态来回跳
  const showQuick = !hidden

  const items = [
    { key: 'ai' as const, label: 'AI 派派助手' },
    ...(showQuick
      ? [
          { key: 'msg' as const, label: '消息' },
          { key: 'cart' as const, label: '购物车' },
        ]
      : []),
  ]
  const expH = railHeight(items.length)
  const expW = W

  // 未读总数（服务咨询 + 会话），用于展开栏「消息」图标上的红点
  const [unread, setUnread] = useState(0)
  useEffect(() => {
    const compute = () => {
      let n = 0
      try {
        n += getSvcChats().reduce((s, x) => s + (x.unread || 0), 0)
      } catch {
        /* 忽略存储异常 */
      }
      try {
        n += getChats().reduce((s, x) => s + (x.unread || 0), 0)
      } catch {
        /* 忽略存储异常 */
      }
      setUnread(n)
    }
    compute()
    window.addEventListener(CHAT_UPDATE_EVENT, compute)
    window.addEventListener('storage', compute)
    window.addEventListener('focus', compute)
    return () => {
      window.removeEventListener(CHAT_UPDATE_EVENT, compute)
      window.removeEventListener('storage', compute)
      window.removeEventListener('focus', compute)
    }
  }, [pathname])

  const clearHideTimer = () => {
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
  }

  const applyPos = (p: Pos) => {
    livePos.current = p
    setPos(p)
  }

  const collapseTo = (side: Exclude<Side, null>, centerY: number, persist = true) => {
    lastSide.current = side
    const y = clamp(
      centerY - BAR_H / 2,
      TOP_MIN,
      Math.max(TOP_MIN, window.innerHeight - BAR_H - SIDE)
    )
    setCollapsed(side)
    applyPos({ x: hiddenX(side), y })
    if (persist) savePref(side, y)
  }

  const expandTo = (side: Exclude<Side, null>, centerY: number) => {
    const y = clamp(
      centerY - expH / 2,
      TOP_MIN,
      Math.max(TOP_MIN, window.innerHeight - expH - SIDE)
    )
    setCollapsed(null)
    applyPos({ x: shownX(side, expW), y })
    savePref(null, y)
  }

  const armAutoHide = (side: Exclude<Side, null>) => {
    clearHideTimer()
    hideTimer.current = window.setTimeout(() => {
      const cur = livePos.current
      if (!cur) return
      collapseTo(side, cur.y + expH / 2)
    }, AUTO_HIDE_MS)
  }

  useEffect(() => {
    const pref = loadPref()
    const y = clamp(
      pref.y ?? window.innerHeight - BOTTOM_RESERVE - BAR_H,
      TOP_MIN,
      Math.max(TOP_MIN, window.innerHeight - BAR_H - SIDE)
    )
    // 默认就是折叠栏形态（用户可以直接看到可展开的把手）
    collapseTo(pref.side ?? 'right', y + BAR_H / 2, false)
    return clearHideTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    clearHideTimer()
    const cur = livePos.current ?? pos
    // 指针捕获后 pointerup 的 target 会变成容器本身，所以在这里先记下按到的是哪个图标
    const key = (e.target as HTMLElement).closest?.('.ai-rail-item')?.getAttribute('data-key') ?? null
    if (collapsed) {
      // 折叠栏按下即展开，随后的移动直接拖动展开后的图标栏
      const side = collapsed
      const centerY = (cur?.y ?? 0) + BAR_H / 2
      const base = { x: shownX(side, expW), y: clamp(centerY - expH / 2, TOP_MIN, Math.max(TOP_MIN, window.innerHeight - expH - SIDE)) }
      setCollapsed(null)
      applyPos(base)
      meta.current = { active: true, moved: false, sx: e.clientX, sy: e.clientY, bx: base.x, by: base.y, key: null }
    } else {
      meta.current = {
        active: true,
        moved: false,
        sx: e.clientX,
        sy: e.clientY,
        bx: cur?.x ?? 0,
        by: cur?.y ?? 0,
        key,
      }
    }
    setDragging(true)
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* 合成事件/异常 pointerId 不支持捕获时忽略 */
    }
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const m = meta.current
    if (!m.active) return
    const dx = e.clientX - m.sx
    const dy = e.clientY - m.sy
    if (Math.abs(dx) + Math.abs(dy) > 4) m.moved = true
    const { offX, cw } = phoneBounds()
    const x = clamp(m.bx + dx, offX + SIDE, offX + cw - expW - SIDE)
    const y = clamp(m.by + dy, TOP_MIN, Math.max(TOP_MIN, window.innerHeight - expH - SIDE))
    applyPos({ x, y })
  }

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const m = meta.current
    const clicked = !m.moved
    const cur = livePos.current ?? pos
    m.active = false
    setDragging(false)
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    } catch {
      /* 忽略捕获释放异常 */
    }
    if (e.type === 'pointercancel' || !cur) return

    const { offX, cw } = phoneBounds()

    if (clicked) {
      // 轻点某个图标：派派 / 消息 / 购物车
      const key = m.key
      if (key === 'msg') navigate('/mine/messages')
      else if (key === 'cart') navigate('/mall/cart')
      else if (key === 'ai') navigate('/paipai')
      armAutoHide(lastSide.current)
      return
    }

    // 拖到边缘松手：收回折叠栏
    const nearLeft = cur.x - offX <= SNAP
    const nearRight = offX + cw - (cur.x + expW) <= SNAP
    if (nearLeft || nearRight) {
      const side: Exclude<Side, null> = nearLeft ? 'left' : 'right'
      collapseTo(side, cur.y + expH / 2)
    } else {
      savePref(null, cur.y)
      armAutoHide(lastSide.current)
    }
  }

  if (hidden) return null

  const side = collapsed ?? lastSide.current
  const single = items.length === 1

  return (
    <div
      className={
        'ai-rail' +
        (collapsed ? ' is-collapsed' : '') +
        (dragging ? ' is-dragging' : '') +
        (single ? ' is-single' : '') +
        ' side-' + side
      }
      aria-label={collapsed ? '展开侧边栏' : '侧边栏'}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={
        pos
          ? {
              transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
              // 显式给高度：折叠↔展开时 height 从 64 过渡到具体值，
              // 避免因 auto 无法过渡而卡在 64px，导致三个图标挤在一起
              height: collapsed ? BAR_H : single ? W : expH + 3,
            }
          : { opacity: 0 }
      }
    >
      {items.map((it) => (
        <span
          className={'ai-rail-item' + (it.key === 'ai' ? ' is-ai' : ' is-quick')}
          key={it.key}
          data-key={it.key}
          aria-label={it.label}
        >
          <img
            src={it.key === 'ai' ? avatar : it.key === 'msg' ? icMsg : icCart}
            alt={it.label}
            draggable={false}
          />
          {it.key === 'msg' && unread > 0 && (
            <span className="ai-rail-dot" aria-label={`${unread} 条未读消息`}>
              {unread > 99 ? '99+' : ''}
            </span>
          )}
        </span>
      ))}
      {/* 折叠态：竖排三点把手，提示可展开 */}
      <span className="ai-rail-handle" aria-hidden="true">
        <i /><i /><i />
      </span>
    </div>
  )
}
