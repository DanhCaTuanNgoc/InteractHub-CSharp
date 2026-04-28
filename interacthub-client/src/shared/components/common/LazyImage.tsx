import { useState, type ImgHTMLAttributes } from 'react'

type LazyImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string
  wrapperClassName?: string
}

export function LazyImage({
  src,
  alt,
  className,
  wrapperClassName,
  loading = 'lazy',
  decoding = 'async',
  onLoad,
  ...props
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <span
      className={[
        'relative inline-flex overflow-hidden bg-slate-100',
        wrapperClassName ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <img
        {...props}
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        onLoad={(event) => {
          setLoaded(true)
          onLoad?.(event)
        }}
        className={[
          'h-full w-full transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </span>
  )
}
