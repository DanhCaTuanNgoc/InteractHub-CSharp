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

  const classes = [
    'button ui-interactive ui-ripple',
    `button--${variant}`,
    fullWidth ? 'button--full' : '',
    busy ? 'button--busy' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button {...props} disabled={disabled || busy} onMouseDown={handlePointerDown} className={classes}>
      {rippleStyle ? (
        <span
          key={`${rippleStyle.left}-${rippleStyle.top}-${rippleStyle.size}`}
          className="ui-ripple__wave"
          style={{ left: rippleStyle.left, top: rippleStyle.top, width: rippleStyle.size, height: rippleStyle.size }}
          aria-hidden="true"
        />
      ) : null}
      {busy ? 'Đang xử lý...' : children}
    </button>
  )
}
