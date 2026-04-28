import { useState, type ButtonHTMLAttributes, type MouseEvent, type PropsWithChildren } from 'react'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost' | 'danger'
    fullWidth?: boolean
    busy?: boolean
  }
>

export function Button({
  children,
  className,
  variant = 'primary',
  fullWidth = false,
  busy = false,
  disabled,
  ...props
}: ButtonProps) {
  const [rippleStyle, setRippleStyle] = useState<{ left: number; top: number; size: number } | null>(null)

  const handlePointerDown = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 1.2
    const left = event.clientX - rect.left - size / 2
    const top = event.clientY - rect.top - size / 2
    setRippleStyle({ left, top, size })
  }

  const variantClasses = {
    primary:
      'border border-transparent bg-cyan-600 text-white shadow-sm hover:bg-cyan-500 focus-visible:outline-cyan-500',
    ghost:
      'border border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 focus-visible:outline-cyan-500',
    danger:
      'border border-transparent bg-rose-600 text-white shadow-sm hover:bg-rose-500 focus-visible:outline-rose-500',
  }[variant]

  const classes = [
    'relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 cursor-pointer',
    variantClasses,
    fullWidth ? 'w-full' : '',
    busy ? 'cursor-wait' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button {...props} disabled={disabled || busy} onMouseDown={handlePointerDown} className={classes}>
      {rippleStyle ? (
        <span
          key={`${rippleStyle.left}-${rippleStyle.top}-${rippleStyle.size}`}
          className="pointer-events-none absolute rounded-full bg-white/30"
          style={{ left: rippleStyle.left, top: rippleStyle.top, width: rippleStyle.size, height: rippleStyle.size }}
          aria-hidden="true"
        />
      ) : null}
      {busy ? 'Đang xử lý...' : children}
    </button>
  )
}
