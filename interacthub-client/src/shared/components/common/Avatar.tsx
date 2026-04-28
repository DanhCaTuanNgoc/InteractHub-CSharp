import { LazyImage } from './LazyImage'

type AvatarProps = {
  src?: string | null
  alt: string
  size?: 'sm' | 'md' | 'lg'
}

export function Avatar({ src, alt, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }[size]
  const classes = `relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 font-semibold text-white ring-2 ring-white/80 shadow-sm ${sizeClasses}`

  if (src) {
    return <LazyImage src={src} alt={alt} className="h-full w-full object-cover" wrapperClassName={classes} />
  }

  return (
    <span className={classes} aria-label={alt}>
      {alt.slice(0, 1).toUpperCase()}
    </span>
  )
}
