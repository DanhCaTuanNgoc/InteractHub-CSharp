import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

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
  const classes = [
    'button',
    `button--${variant}`,
    fullWidth ? 'button--full' : '',
    busy ? 'button--busy' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button {...props} disabled={disabled || busy} className={classes}>
      {busy ? 'Đang xử lý...' : children}
    </button>
  )
}
