import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router'
import StatusBar from '../components/login/StatusBar'
import { registerUser } from '../utils/userStore'
import { scopedKey } from '../utils/accountScoped'
import {
  ChevronDownIcon,
  EyeIcon,
  EyeOffIcon,
  CloseIcon
} from '../components/login/Icons'

// PetPal 注册页（绿色主题，与登录页同源视觉）
// 结构：状态栏 → Logo → 标题「创建账号」→ 副标题 → 昵称(选填) → 账号 → 密码 → 确认密码
//       → 注册胶囊按钮 → 已有账号去登录
export default function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const [nickname, setNickname] = useState('')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number | undefined>(undefined)

  // 回跳契约：读取 redirect 参数，无则回首页，不硬编码改写目标
  const redirectTo = params.get('redirect') || '/'

  // 返回兜底：有来源页用来源页，无历史记录时固定回登录页
  const goBack = () => {
    const from = (location.state as { from?: string } | null)?.from
    navigate(from || '/login')
  }

  const showToast = (text: string) => {
    setToast(text)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 1800)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!nickname.trim()) {
      setError('请填写用户名')
      return
    }
    if (password !== confirm) {
      setError('两次输入的密码不一致')
      return
    }
    const res = registerUser({ account, password, nickname })
    if (!res.ok) {
      setError(res.error || '注册失败，请重试')
      return
    }
    setError('')
    // 新注册用户尚无宠物档案：清空「该账号自己的」宠物库，首页宠物卡展示"建立宠物档案"引导
    // 注意必须写账号私有 key，否则会误清掉 / 误读到其它账号的宠物
    try {
      localStorage.setItem(scopedKey('petpal-pets'), '[]')
      localStorage.removeItem(scopedKey('petpal-current-pet'))
    } catch { /* ignore */ }
    showToast('注册成功，请先为宠物建立档案')
    // 按 redirect 参数真实回跳；无来源页时回首页
    setTimeout(() => navigate(redirectTo, { replace: true }), 350)
  }

  const fieldCls =
    'flex items-center h-[52px] px-3 rounded-[18px] bg-field'

  return (
    <div className="home-stage">
    <div className="home-canvas relative flex flex-col overflow-y-auto">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 -right-14 w-52 h-52 rounded-full bg-brand-200/70" />
        <div className="absolute top-28 right-4 w-32 h-32 rounded-full bg-brand-300/50" />
      </div>

      <button
        type="button"
        onClick={goBack}
        aria-label="关闭"
        className="absolute top-[52px] right-5 z-20 w-9 h-9 rounded-full bg-white/85 flex items-center justify-center text-brand-700 active:scale-95 transition-transform"
      >
        <CloseIcon className="w-4 h-4" />
      </button>

      <StatusBar />

      <div className="relative z-10 flex flex-col flex-1 px-6 pt-2 pb-8">
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

        <div className="mt-5">
          <h1 className="text-[26px] font-bold text-ink-900 leading-snug">创建账号</h1>
          <p className="mt-1.5 text-[13px] text-ink-400">
            一分钟注册，开启与毛孩子的专属旅程
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="block mb-2 text-[14px] text-ink-700">用户名 *</label>
            <div className={fieldCls}>
              <span className="w-7 h-7 rounded-lg bg-[#E4E8E0] flex items-center justify-center text-ink-400 shrink-0">
                <ChevronDownIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                autoComplete="nickname"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value)
                  setError('')
                }}
                placeholder="给自己起个用户名"
                className="ml-3 flex-1 bg-transparent outline-none text-[15px] text-ink-900 placeholder:text-ink-400"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-[14px] text-ink-700">账号</label>
            <div className={fieldCls}>
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
                placeholder="手机号或自定义账号（至少 4 位）"
                className="ml-3 flex-1 bg-transparent outline-none text-[15px] text-ink-900 placeholder:text-ink-400"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[14px] text-ink-700">密码</label>
              <span className="text-[12px] text-ink-400">至少 6 位</span>
            </div>
            <div className={fieldCls}>
              <span className="w-7 h-7 rounded-lg bg-[#E4E8E0] flex items-center justify-center text-ink-400 shrink-0">
                <ChevronDownIcon className="w-4 h-4" />
              </span>
              <input
                type={showPwd ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="设置登录密码"
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

          <div>
            <label className="block mb-2 text-[14px] text-ink-700">确认密码</label>
            <div className={fieldCls}>
              <span className="w-7 h-7 rounded-lg bg-[#E4E8E0] flex items-center justify-center text-ink-400 shrink-0">
                <ChevronDownIcon className="w-4 h-4" />
              </span>
              <input
                type={showPwd ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value)
                  setError('')
                }}
                placeholder="再次输入密码"
                className="ml-3 flex-1 bg-transparent outline-none text-[15px] text-ink-900 placeholder:text-ink-400"
              />
            </div>
          </div>

          {error && <p className="text-[12px] text-red-400 -mt-1">{error}</p>}

          <button
            type="submit"
            className="mt-2 h-[52px] rounded-full bg-brand-400 text-brand-800 text-[16px] font-semibold active:scale-[0.98] transition-transform"
          >
            注册
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-ink-500">
          已有账号？
          <button
            type="button"
            onClick={() => navigate(`/login?redirect=${encodeURIComponent(redirectTo)}`)}
            className="text-brand-700 font-medium active:opacity-70"
          >
            去登录
          </button>
        </p>
      </div>

      {toast && (
        <div className="absolute left-1/2 bottom-24 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-ink-900/85 text-white text-[13px] whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
    </div>
  )
}
