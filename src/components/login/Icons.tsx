// 登录页内联 SVG 图标；颜色由 className 中 text-* / currentColor 控制

interface IconProps {
  className?: string
}

export function SignalIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg viewBox="0 0 18 12" fill="currentColor" className={className} aria-hidden="true">
      <rect x="0" y="7" width="3" height="5" rx="1" />
      <rect x="4.5" y="5" width="3" height="7" rx="1" />
      <rect x="9" y="2.5" width="3" height="9.5" rx="1" />
      <rect x="13.5" y="0" width="3" height="12" rx="1" />
    </svg>
  )
}

export function WifiIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg viewBox="0 0 18 13" fill="currentColor" className={className} aria-hidden="true">
      <path d="M9 12.5a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8Z" />
      <path d="M9 8.6c-1.6 0-3.1.6-4.2 1.7l-1.3-1.4A8.4 8.4 0 0 1 9 6.1c2.3 0 4.4.9 5.9 2.8l-1.3 1.4A6.4 6.4 0 0 0 9 8.6Z" />
      <path d="M9 4.4c-2.8 0-5.4 1.1-7.3 3l-1.3-1.5A11.6 11.6 0 0 1 9 2c3.2 0 6.2 1.3 8.6 3.9L16.3 7.4A10 10 0 0 0 9 4.4Z" />
    </svg>
  )
}

export function BatteryIcon({ className = 'w-6 h-3' }: IconProps) {
  return (
    <svg viewBox="0 0 27 13" className={className} aria-hidden="true">
      <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" fill="none" stroke="currentColor" strokeOpacity="0.4" />
      <rect x="2" y="2" width="18" height="9" rx="2" fill="currentColor" />
      <path d="M24.5 4v5a2.5 2.5 0 0 0 0-5Z" fill="currentColor" fillOpacity="0.4" />
    </svg>
  )
}

export function ChevronDownIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function EyeIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function EyeOffIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M4 4l16 16" strokeLinecap="round" />
      <path d="M10.6 6.2A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-3 3.6M6.5 9A17 17 0 0 0 2.5 12S6 18.5 12 18.5c1.1 0 2.1-.2 3-.6" strokeLinecap="round" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" strokeLinecap="round" />
    </svg>
  )
}

export function CloseIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" className={className} aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
    </svg>
  )
}
