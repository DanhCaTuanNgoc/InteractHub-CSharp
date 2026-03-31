type LoadingSkeletonProps = {
  lines?: number
  variant?: 'post' | 'user'
}

export function LoadingSkeleton({ lines = 3, variant = 'post' }: LoadingSkeletonProps) {
  return (
    <div className={`skeleton skeleton--${variant}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <span key={index} className="skeleton__line" />
      ))}
    </div>
  )
}
