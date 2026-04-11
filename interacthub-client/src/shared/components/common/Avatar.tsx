import { LazyImage } from './LazyImage'

type AvatarProps = {
  src?: string | null
  alt: string
  size?: 'sm' | 'md' | 'lg'
}

export function Avatar({ src, alt, size = 'md' }: AvatarProps) {
  const classes = `avatar avatar--${size}`

  if (src) {
    return <LazyImage src={src} alt={alt} className="h-full w-full rounded-[inherit] object-cover" wrapperClassName={classes} />
  }

  return (
    <span className={classes} aria-label={alt}>
      {alt.slice(0, 1).toUpperCase()}
    </span>
  )
}
