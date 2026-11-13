// 第三方账号登录：微信在上、QQ 在下通栏按钮；图标使用原稿 SVG
interface ThirdPartyLoginProps {
  onAction?: (label: string) => void
}

const channels = [
  { key: 'wechat', label: '微信账号登录', icon: '/assets/wechat.svg' },
  { key: 'qq', label: 'QQ账号登录', icon: '/assets/qq.svg' }
]

export default function ThirdPartyLogin({ onAction }: ThirdPartyLoginProps) {
  return (
    <div className="mt-7">
      <p className="text-center text-[13px] text-ink-400">使用第三方账号登录</p>

      <div className="mt-4 flex flex-col gap-3">
        {channels.map(({ key, label, icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onAction?.(label)}
            className="flex items-center justify-center gap-2.5 h-[52px] rounded-2xl bg-white border border-line active:scale-[0.98] transition-transform"
          >
            <img src={icon} alt={label} className="w-6 h-6" />
            <span className="text-[15px] text-ink-700">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
