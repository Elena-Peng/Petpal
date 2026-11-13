import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import StatusBar from '../components/login/StatusBar'
import ThirdPartyLogin from '../components/login/ThirdPartyLogin'
import { loginUser, isLoggedIn } from '../utils/userStore'
import {
  ChevronDownIcon,
  EyeIcon,
  EyeOffIcon,
  CloseIcon
} from '../components/login/Icons'

// PetPal 登录页（绿色主题，按设计截图还原）
// 结构：状态栏 → Logo(图标+字标) → 标题「现在登录」→ 副标题 → 账号框 → 密码框(忘了?)
//       → 登录胶囊按钮 → 微信/QQ 通栏 → 注册入口；校验通过后进入首页
export default function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number | undefined>(undefined)

  const showToast = (text: string) => {
    setToast(text)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 1800)
  }

  // 登录成功后的跳转目标：默认回首页，带 redirect 则回来源页
  const redirectTo = params.get('redirect') || '/'

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = loginUser(account, password)
    if (!res.ok) {
      setError(res.error || '登录失败，请重试')
      return
    }
    setError('')
    showToast('登录成功')
    setTimeout(() => navigate(redirectTo, { replace: true }), 350)
  }

  return (
    <div className="home-stage">
    <div className="home-canvas relative flex flex-col overflow-y-auto">
      {/* 右上装饰圆（原稿右上浅绿双圆） */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 -right-14 w-52 h-52 rounded-full bg-brand-200/70" />
        <div className="absolute top-28 right-4 w-32 h-32 rounded-full bg-brand-300/50" />
      </div>

      {/* 关闭按钮（原稿右上角 ×）：未登录时首页受守卫保护，留在登录页并提示，避免被弹回表现为点不动 */}
      <button
        type="button"
        onClick={() => {
          if (isLoggedIn()) navigate('/')
          else showToast('请先登录后再退出')
        }}
        aria-label="关闭"
        className="absolute top-[52px] right-5 z-20 w-9 h-9 rounded-full bg-white/85 flex items-center justify-center text-brand-700 active:scale-95 transition-transform"
      >
        <CloseIcon className="w-4 h-4" />
      </button>

      <StatusBar />

      <div className="relative z-10 flex flex-col flex-1 px-6 pt-2 pb-8">
        {/* Logo 行：圆形图标原图 + PetPal 字标原图，紧挨排列 */}
        <div className="mt-1 flex items-center gap-2">
          <img
            src="/assets/logo.png"
            alt="PetPal 图标"
            className="w-11 h-11 rounded-full object-cover shrink-0"
          />
          <img
            src="/assets/wordmark.png"
            alt="PetPal"
            className="h-7 w-auto object-contain"
          />
        </div>

        {/* 标题区 */}
        <div className="mt-5">
          <h1 className="text-[26px] font-bold text-ink-900 leading-snug">现在登录</h1>
          <p className="mt-1.5 text-[13px] text-ink-400">
            欢迎回来，有好多小伙伴在思念你！
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {/* 账号 */}
          <div>
            <label className="block mb-2 text-[14px] text-ink-700">账号</label>
            <div className="flex items-center h-[52px] px-3 rounded-[18px] bg-field">
              <span className="w-7 h-7 rounded-lg bg-[#E4E8E0] flex items-center justify-center text-ink-400 shrink-0">
                <ChevronDownIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                autoComplete="username"
                value={account}
                onChange={(e) => {
                  setAccount(e.target.value)
                  setError('')
                }}
                placeholder="请输入你的账号"
                className="ml-3 flex-1 bg-transparent outline-none text-[15px] text-ink-900 placeholder:text-ink-400"
              />
            </div>
          </div>

          {/* 密码 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[14px] text-ink-700">密码</label>
              <button
                type="button"
                onClick={() => showToast('忘记密码即将上线')}
                className="text-[13px] text-ink-400 cursor-not-allowed"
                title="即将上线"
              >
                忘了？<span className="ml-1 text-[11px]">即将上线</span>
              </button>
            </div>
            <div className="flex items-center h-[52px] px-3 rounded-[18px] bg-field">
              <span className="w-7 h-7 rounded-lg bg-[#E4E8E0] flex items-center justify-center text-ink-400 shrink-0">
                <ChevronDownIcon className="w-4 h-4" />
              </span>
              <input
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="请输入你的密码"
                className="ml-3 flex-1 bg-transparent outline-none text-[15px] text-ink-900 placeholder:text-ink-400"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label="切换密码可见性"
                className="ml-2 shrink-0 text-ink-400 active:text-ink-700"
              >
                {showPwd ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && <p className="text-[12px] text-red-400 -mt-1">{error}</p>}

          {/* 登录胶囊按钮 */}
          <button
            type="submit"
            className="mt-2 h-[52px] rounded-full bg-brand-400 text-brand-800 text-[16px] font-semibold active:scale-[0.98] transition-transform"
          >
            登录
          </button>
        </form>

        {/* 第三方登录暂未开放：整体置灰并标注即将上线，点击仅提示 */}
        <div style={{ opacity: 0.5 }} aria-disabled="true">
          <ThirdPartyLogin onAction={(label) => showToast(`${label}即将上线`)} />
        </div>
        <p className="mt-2 text-center text-[12px] text-ink-400">第三方登录即将上线</p>

        {/* 注册入口 */}
        <p className="mt-6 text-center text-[13px] text-ink-500">
          还没有账号？
          <button
            type="button"
            onClick={() => navigate(`/login/register?redirect=${encodeURIComponent(redirectTo)}`)}
            className="text-brand-700 font-medium active:opacity-70"
          >
            注册
          </button>
        </p>

        {/* 存储说明：当前账号体系落在本机浏览器，避免用户误以为"注册了却没存" */}
        <p className="mt-2 text-center text-[11px] leading-5 text-ink-300">
          账号暂存于当前浏览器，清除浏览器数据或更换设备后需重新注册
        </p>
      </div>

      {/* 轻提示 */}
      {toast && (
        <div className="absolute left-1/2 bottom-24 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-ink-900/85 text-white text-[13px] whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
    </div>
  )
}
