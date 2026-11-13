import { SignalIcon, WifiIcon, BatteryIcon } from './Icons'

// 状态栏：9:41 + 信号 / WiFi / 电池
export default function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-4 pb-1 text-ink-900 select-none">
      <span className="text-[15px] font-semibold tracking-wide">9:41</span>
      <div className="flex items-center gap-1.5">
        <SignalIcon className="w-4 h-3.5" />
        <WifiIcon className="w-4 h-3.5" />
        <BatteryIcon className="w-6 h-3" />
      </div>
    </div>
  )
}
