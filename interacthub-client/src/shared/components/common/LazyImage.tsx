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
    <span className={`lazy-image-wrap ${loaded ? 'lazy-image-wrap--loaded' : ''} ${wrapperClassName ?? ''}`.trim()}>
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
        className={`lazy-image ${loaded ? 'lazy-image--loaded' : ''} ${className ?? ''}`.trim()}
      />
    </span>
  )
}
